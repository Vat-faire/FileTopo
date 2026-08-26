[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$textExtensions = @(
  '.css', '.html', '.json', '.jsonl', '.lock', '.md', '.ps1', '.rs',
  '.toml', '.ts', '.tsx', '.txt', '.yaml', '.yml'
)

$patterns = [ordered]@{
  'chemin Windows personnel' = '[A-Za-z]:' + '\\Users\\[^\\\r\n]+\\'
  'chemin macOS personnel' = '/' + 'Users' + '/[^/\r\n]+/'
  'chemin Linux personnel' = '/' + 'home' + '/[^/\r\n]+/'
  'clé privée' = 'BEGIN ' + '[A-Z ]*PRIVATE KEY'
  'clé AWS' = 'AKIA' + '[0-9A-Z]{16}'
  'jeton GitHub' = 'gh' + '[pousr]_[A-Za-z0-9]{20,}'
  'clé OpenAI' = 'sk' + '-[A-Za-z0-9]{20,}'
  'clé Anthropic' = 'sk' + '-ant-[A-Za-z0-9_-]{20,}'
  'jeton Slack' = 'xox' + '[baprs]-[A-Za-z0-9-]{10,}'
}

Push-Location $projectRoot
try {
  $tracked = @(& git ls-files --cached --others --exclude-standard)
  if ($LASTEXITCODE -ne 0) {
    throw 'Impossible de lire la liste des fichiers versionnés.'
  }

  $findings = @()
  foreach ($relativePath in $tracked) {
    $extension = [IO.Path]::GetExtension($relativePath).ToLowerInvariant()
    if ($textExtensions -notcontains $extension) { continue }

    $fullPath = Join-Path $projectRoot $relativePath
    $content = [IO.File]::ReadAllText($fullPath)
    foreach ($entry in $patterns.GetEnumerator()) {
      if ([regex]::IsMatch($content, $entry.Value)) {
        $findings += "${relativePath}: $($entry.Key)"
      }
    }
  }

  if ($findings.Count -gt 0) {
    $findings | Sort-Object -Unique | ForEach-Object { Write-Error $_ }
    throw 'Audit public: motifs sensibles détectés.'
  }

  $largeFiles = foreach ($relativePath in $tracked) {
    $fullPath = Join-Path $projectRoot $relativePath
    $size = (Get-Item -LiteralPath $fullPath).Length
    if ($size -gt 5MB) {
      [pscustomobject]@{ Path = $relativePath; Bytes = $size }
    }
  }
  if (@($largeFiles).Count -gt 0) {
    $largeFiles | Format-Table -AutoSize
    throw 'Audit public: fichier versionné supérieur à 5 Mio.'
  }

  $remotes = @(& git remote)
  if ($remotes.Count -gt 0) {
    throw "Audit public: dépôt distant configuré ($($remotes -join ', '))."
  }

  Write-Host ("Audit public réussi: {0} fichiers versionnés, aucun motif sensible, aucun fichier > 5 Mio, aucun remote." -f $tracked.Count)
}
finally {
  Pop-Location
}
