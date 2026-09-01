<#
.SYNOPSIS
    Sends a REAL Windows keystroke to the FileTopo window when the running
    J12 scenario asks for one. Reserve X4 of the independent control.

.DESCRIPTION
    The J12 scenario cannot prove a genuine key activation from inside the
    page: a script can only dispatch a synthetic event, and a synthetic event
    carries `isTrusted === false`. So the page focuses the control, prints a
    marker on the host's standard output, and waits.

    This watcher reads that output, brings the FileTopo window to the
    foreground and sends the requested key through WScript.Shell, which goes
    through the ordinary Windows input path. The page then observes a click
    whose `isTrusted` is true, and records it.

    No new dependency: WScript.Shell ships with Windows.

    Nothing here touches the analysed tree, the repository, or any user data.
    It reads one log file and sends one keystroke per marker.

.PARAMETER LogPath
    File the application's standard output is redirected to.

.PARAMETER TimeoutSeconds
    How long to keep watching. The watcher exits on its own afterwards.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$LogPath,
    [int]$TimeoutSeconds = 600
)

$ErrorActionPreference = 'Stop'
$marker = 'J12-KEY-READY'
$shell = New-Object -ComObject WScript.Shell
$handled = 0
$deadline = (Get-Date).AddSeconds($TimeoutSeconds)

Write-Output "watcher: en attente de '$marker' dans $LogPath"

while ((Get-Date) -lt $deadline) {
    if (Test-Path -LiteralPath $LogPath) {
        $lines = @(Select-String -LiteralPath $LogPath -SimpleMatch $marker -ErrorAction SilentlyContinue)
        while ($handled -lt $lines.Count) {
            $line = $lines[$handled].Line
            # The marker names the key it wants, so the page decides and the
            # watcher never guesses.
            $key = if ($line -match 'key=(\S+)') { $Matches[1] } else { '{ENTER}' }

            # Let the page finish focusing before the window changes.
            Start-Sleep -Milliseconds 500
            $process = Get-Process -Name 'filetopo' -ErrorAction SilentlyContinue |
                Sort-Object -Property StartTime -Descending |
                Select-Object -First 1
            if ($null -ne $process) {
                $null = $shell.AppActivate($process.Id)
                Start-Sleep -Milliseconds 400
            }
            $shell.SendKeys($key)
            Write-Output "watcher: frappe reelle $key envoyee (marqueur $($handled + 1))"
            $handled++
        }
    }
    Start-Sleep -Milliseconds 200
}

Write-Output "watcher: termine, $handled frappe(s) envoyee(s)"
