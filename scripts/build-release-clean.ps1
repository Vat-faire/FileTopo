#Requires -Version 7
<#
.SYNOPSIS
  Builds the Windows release with build-machine paths remapped away.

.DESCRIPTION
  Cargo's `trim-paths` profile option is not stabilized in Cargo 1.98, so it
  cannot be declared in `Cargo.toml` without making the manifest unparsable on
  stable. The stable equivalent is rustc's `--remap-path-prefix`, which takes
  absolute paths as arguments — paths that must never be committed.

  This script therefore computes those prefixes at run time, from the current
  environment, and passes them through `RUSTFLAGS`. Nothing machine-specific is
  written to disk, and the resulting binary refers to `/cargo` and `/filetopo`
  instead of the developer's directories.

  The artifact is scanned afterwards by `scan-binary-for-personal-paths.ps1`.

.PARAMETER Bundles
  Tauri bundle targets. Use `none` to build only the executable.

.PARAMETER SkipScan
  Builds without running the leak scan. Not recommended.

.EXAMPLE
  pwsh -File scripts/build-release-clean.ps1
#>
[CmdletBinding()]
param(
  [string] $Bundles = 'nsis',
  [switch] $SkipScan
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot

Push-Location $projectRoot
try {
  $cargoHome = $env:CARGO_HOME ? $env:CARGO_HOME : (Join-Path $env:USERPROFILE '.cargo')

  # `tauri build` shells out to `cargo`. Make sure it is reachable even when the
  # shell was started without the rustup entries on PATH.
  if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    $cargoBin = Join-Path $cargoHome 'bin'
    if (Test-Path -LiteralPath $cargoBin) {
      $env:Path = "$cargoBin$([IO.Path]::PathSeparator)$env:Path"
    }
  }
  if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    throw 'cargo est introuvable. Ouvrez une console où Rust est dans PATH.'
  }
  $rustSrc = $env:RUSTUP_HOME ? $env:RUSTUP_HOME : (Join-Path $env:USERPROFILE '.rustup')

  # Longest prefixes first: rustc applies the first matching remap.
  $remaps = @(
    @{ From = $cargoHome; To = '/cargo' },
    @{ From = $rustSrc; To = '/rustup' },
    @{ From = $projectRoot; To = '/filetopo' },
    @{ From = $env:USERPROFILE; To = '/user' }
  ) | Sort-Object { $_.From.Length } -Descending

  $flags = foreach ($remap in $remaps) {
    if (Test-Path -LiteralPath $remap.From) {
      "--remap-path-prefix=$($remap.From)=$($remap.To)"
    }
  }

  if (-not $flags) { throw 'Aucun préfixe à remapper : environnement inattendu.' }

  Write-Host ("Remappage de {0} préfixe(s) de chemin vers des racines neutres." -f @($flags).Count)

  # A path change invalidates every cached artifact; incremental caching is off
  # anyway, as documented in CONTRIBUTING.md.
  # Cargo's encoded form preserves paths containing spaces. A plain RUSTFLAGS
  # string would split such a Windows path into multiple invalid arguments.
  $env:CARGO_ENCODED_RUSTFLAGS = ($flags -join [char]0x1f)
  $env:CARGO_INCREMENTAL = '0'

  $arguments = @('tauri', 'build')
  if ($Bundles -eq 'none') {
    $arguments += '--no-bundle'
  }
  else {
    $arguments += @('--bundles', $Bundles)
  }

  Write-Host ("Construction : pnpm {0}" -f ($arguments -join ' '))
  & pnpm @arguments
  if ($LASTEXITCODE -ne 0) { throw "La construction a échoué (code $LASTEXITCODE)." }

  if ($SkipScan) {
    Write-Warning 'Scan de fuite ignoré à la demande. L artefact n est pas vérifié.'
    return
  }

  Write-Host ''
  & pwsh -NoProfile -File (Join-Path $PSScriptRoot 'scan-binary-for-personal-paths.ps1')
  if ($LASTEXITCODE -ne 0) { throw 'Le scan a détecté une fuite dans les artefacts construits.' }
}
finally {
  Remove-Item Env:CARGO_ENCODED_RUSTFLAGS -ErrorAction SilentlyContinue
  Pop-Location
}
