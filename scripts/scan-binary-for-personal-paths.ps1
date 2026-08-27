#Requires -Version 7
<#
.SYNOPSIS
  Scans a built artifact for build-machine paths and identifying strings.

.DESCRIPTION
  A source repository can be perfectly clean while the binary compiled from it
  still embeds the account name and directory layout of the machine that built
  it. This script looks for that, in ASCII and in UTF-16LE.

  The needles are computed at run time from the current environment. Nothing
  machine-specific is ever written to disk by this script, and nothing it
  prints contains a full personal path: matches are reported as counts and as
  redacted fragments.

.PARAMETER Path
  Artifact to scan. Defaults to the release executable.

.PARAMETER Needle
  Extra strings to look for, on top of the computed ones.

.EXAMPLE
  pwsh -File scripts/scan-binary-for-personal-paths.ps1
#>
[CmdletBinding()]
param(
  [string[]] $Path,
  [string[]] $Needle = @()
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot

if (-not $Path -or $Path.Count -eq 0) {
  $Path = @(
    (Join-Path $projectRoot 'src-tauri/target/release/filetopo.exe'),
    (Join-Path $projectRoot 'src-tauri/target/release/bundle/nsis')
  )
}

# Needles derived from the current machine, never hardcoded.
$needles = [System.Collections.Generic.List[object]]::new()

function Add-Needle {
  param([string] $Label, [string] $Value)
  if ([string]::IsNullOrWhiteSpace($Value)) { return }
  if ($needles.Where({ $_.Value -eq $Value }, 'First').Count -gt 0) { return }
  $needles.Add([pscustomobject]@{ Label = $Label; Value = $Value })
}

Add-Needle 'nom de compte' ([Environment]::UserName)
Add-Needle 'profil utilisateur' $env:USERPROFILE
Add-Needle 'racine du dépôt' $projectRoot
Add-Needle 'nom du dossier du dépôt' (Split-Path -Leaf $projectRoot)
Add-Needle 'CARGO_HOME' ($env:CARGO_HOME ? $env:CARGO_HOME : (Join-Path $env:USERPROFILE '.cargo'))
foreach ($extra in $Needle) { Add-Needle 'fourni' $extra }

function Get-Occurrences {
  param([string] $Text, [string] $Pattern)
  $hits = 0
  if ($Pattern.Length -eq 0 -or $Text.Length -lt $Pattern.Length) { return 0 }
  $offset = 0
  while ($offset -lt $Text.Length) {
    $index = $Text.IndexOf($Pattern, $offset, [StringComparison]::OrdinalIgnoreCase)
    if ($index -lt 0) { break }
    $hits++
    $offset = $index + $Pattern.Length
  }
  return $hits
}

$targets = [System.Collections.Generic.List[string]]::new()
foreach ($candidate in $Path) {
  if (-not (Test-Path -LiteralPath $candidate)) {
    Write-Host ("Absent, ignoré : {0}" -f (Resolve-Path -LiteralPath $projectRoot -Relative))
    Write-Host ("  -> {0}" -f (Split-Path -Leaf $candidate))
    continue
  }
  $item = Get-Item -LiteralPath $candidate
  if ($item.PSIsContainer) {
    Get-ChildItem -LiteralPath $candidate -File -Recurse | ForEach-Object { $targets.Add($_.FullName) }
  }
  else {
    $targets.Add($item.FullName)
  }
}

if ($targets.Count -eq 0) {
  throw 'Aucun artefact à scanner. Construisez la release avant de lancer ce script.'
}

$findings = [System.Collections.Generic.List[object]]::new()

foreach ($target in $targets) {
  $name = Split-Path -Leaf $target
  $data = [IO.File]::ReadAllBytes($target)
  Write-Host ("Analyse de {0} ({1:N0} octets)" -f $name, $data.Length)
  $asciiText = [Text.Encoding]::Latin1.GetString($data)
  $utf16Even = [Text.Encoding]::Unicode.GetString($data)
  $utf16Odd = if ($data.Length -gt 1) {
    [Text.Encoding]::Unicode.GetString($data, 1, $data.Length - 1)
  } else { '' }

  foreach ($entry in $needles) {
    $ascii = Get-Occurrences -Text $asciiText -Pattern $entry.Value
    $utf16 = (Get-Occurrences -Text $utf16Even -Pattern $entry.Value) +
      (Get-Occurrences -Text $utf16Odd -Pattern $entry.Value)
    if (($ascii + $utf16) -gt 0) {
      $findings.Add([pscustomobject]@{
          Artefact = $name
          Motif    = $entry.Label
          ASCII    = $ascii
          UTF16LE  = $utf16
        })
    }
  }
}

if ($findings.Count -gt 0) {
  Write-Host ''
  $findings | Format-Table -AutoSize
  throw ("Fuite détectée : {0} motif(s) personnel(s) présent(s) dans les artefacts." -f $findings.Count)
}

Write-Host ''
Write-Host ("Aucune fuite détectée : {0} artefact(s) scanné(s), {1} motif(s) recherché(s) en ASCII et UTF-16LE." -f $targets.Count, $needles.Count)
