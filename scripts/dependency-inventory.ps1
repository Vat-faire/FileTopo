[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$cargo = Join-Path $env:USERPROFILE '.cargo\bin\cargo.exe'

if (-not (Test-Path -LiteralPath $cargo)) {
  throw 'Cargo est introuvable dans le profil utilisateur.'
}

Push-Location $projectRoot
try {
  Write-Host '=== JavaScript — dépendances de production ==='
  $jsProd = pnpm licenses list --prod --json | ConvertFrom-Json
  foreach ($property in $jsProd.PSObject.Properties | Sort-Object Name) {
    $packages = @($property.Value)
    Write-Host ("{0}: {1}" -f $property.Name, $packages.Count)
    foreach ($package in $packages | Sort-Object name) {
      Write-Host ("  {0} {1}" -f $package.name, (@($package.versions) -join ','))
    }
  }

  Write-Host ''
  Write-Host '=== JavaScript — graphe verrouillé complet ==='
  $jsAll = pnpm licenses list --json | ConvertFrom-Json
  $jsCount = 0
  foreach ($property in $jsAll.PSObject.Properties | Sort-Object Name) {
    $count = @($property.Value).Count
    $jsCount += $count
    Write-Host ("{0}: {1}" -f $property.Name, $count)
  }
  Write-Host ("Total des entrées JS: {0}" -f $jsCount)

  Write-Host ''
  Write-Host '=== Rust — dépendances directes résolues ==='
  $metadata = & $cargo metadata --manifest-path src-tauri/Cargo.toml --locked --format-version 1 |
    ConvertFrom-Json
  $rootPackage = $metadata.packages |
    Where-Object { $_.name -eq 'filetopo' -and $_.version -eq '0.1.0' }
  $rootNode = $metadata.resolve.nodes | Where-Object { $_.id -eq $rootPackage.id }

  foreach ($dependency in $rootNode.deps | Sort-Object name) {
    $package = $metadata.packages | Where-Object { $_.id -eq $dependency.pkg }
    $kinds = @($dependency.dep_kinds | ForEach-Object {
      if ($_.kind) { $_.kind } else { 'runtime' }
    }) -join ','
    Write-Host ("{0}`t{1}`t{2}`t{3}" -f $kinds, $package.name, $package.version, $package.license)
  }

  Write-Host ''
  Write-Host '=== Rust — graphe verrouillé conservateur, toutes cibles ==='
  $missing = @($metadata.packages | Where-Object { [string]::IsNullOrWhiteSpace($_.license) })
  if ($missing.Count -gt 0) {
    throw "Licence absente pour $($missing.Count) paquet(s) Rust."
  }

  $metadata.packages |
    Group-Object license |
    Sort-Object Name |
    ForEach-Object { Write-Host ("{0}: {1}" -f $_.Name, $_.Count) }
  Write-Host ("Total des paquets Rust: {0}" -f $metadata.packages.Count)
  Write-Host 'Licences Rust manquantes: 0'
}
finally {
  Pop-Location
}
