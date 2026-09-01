<#
.SYNOPSIS
    Runs the two passes of K12 (TASK-0018) against the real host, with a real
    close and a real restart between them.

.DESCRIPTION
    K12 step 11 says « la redémarrer ». A restart cannot be faked from inside
    the page, so the criterion needs a driver outside it:

      pass 1  FILETOPO_AUTO_BRAINS=1  steps K12.1 to K12.9
      close   the window is really closed, and the process really exits
      pass 2  FILETOPO_AUTO_BRAINS=2  steps K12.10 to K12.12

    Each pass writes its own artefact under docs/performance/runs/, and the
    two stand on their own: the second one proves nothing about the first
    except that the catalogue survived it.

    K10 also needs a REAL Windows keystroke. This script therefore starts
    scripts/j12-send-real-key.ps1 alongside pass 1 — the same watcher, on the
    same marker convention, so there is one implementation of « a real key »
    and not two.

    Nothing here touches the analysed trees, the repository beyond the run
    artefacts the application itself writes, or any user data. The only
    process it stops is the one it started.

.PARAMETER Executable
    The FileTopo binary to run. Defaults to the release build in the checkout.

.PARAMETER LogDirectory
    Where the two run logs go. Defaults to the system temporary directory, so
    no log lands in the repository.

.PARAMETER TimeoutSeconds
    How long each pass may take before this script gives up and says so.
#>
[CmdletBinding()]
param(
    [string]$Executable,
    [string]$LogDirectory = $env:TEMP,
    [int]$TimeoutSeconds = 900
)

$ErrorActionPreference = 'Stop'

$repository = Split-Path -Parent $PSScriptRoot
if (-not $Executable) {
    $Executable = Join-Path $repository 'src-tauri/target/release/filetopo.exe'
}
if (-not (Test-Path -LiteralPath $Executable)) {
    throw "binaire introuvable: $Executable — construire d'abord la version release"
}

$runs = Join-Path $repository 'docs/performance/runs'
$watcher = Join-Path $PSScriptRoot 'j12-send-real-key.ps1'

function Wait-ForArtifact {
    param([string]$Path, [int]$Seconds)
    $deadline = (Get-Date).AddSeconds($Seconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-Path -LiteralPath $Path) { return $true }
        Start-Sleep -Milliseconds 500
    }
    return $false
}

function Invoke-Pass {
    param([int]$Pass, [switch]$WithKeyWatcher)

    $log = Join-Path $LogDirectory "filetopo-k12-pass$Pass.log"
    if (Test-Path -LiteralPath $log) { Remove-Item -LiteralPath $log -Force }

    $artifact = Join-Path $runs "TASK-0018-K12-webview2-pass$Pass.json"
    $abandoned = Join-Path $runs "TASK-0018-K12-webview2-pass$Pass-abandon.json"
    foreach ($stale in @($artifact, $abandoned)) {
        # Only this script's own previous output for THIS pass, and only so a
        # stale file cannot be mistaken for a fresh result.
        if (Test-Path -LiteralPath $stale) { Remove-Item -LiteralPath $stale -Force }
    }

    Write-Output "K12: passe $Pass — demarrage, journal $log"
    $env:FILETOPO_AUTO_BRAINS = "$Pass"
    $application = Start-Process -FilePath $Executable -PassThru `
        -RedirectStandardOutput $log -RedirectStandardError "$log.err"

    $keys = $null
    if ($WithKeyWatcher) {
        # The page focuses a control and prints a marker; this sends the key
        # through the ordinary Windows input path. Without it, K10 fails —
        # and that is deliberate: it never falls back to a synthetic click.
        $keys = Start-Process -FilePath 'pwsh' -PassThru -WindowStyle Hidden `
            -ArgumentList @('-NoProfile', '-File', $watcher,
                            '-LogPath', $log,
                            '-TimeoutSeconds', "$TimeoutSeconds")
    }

    $produced = Wait-ForArtifact -Path $artifact -Seconds $TimeoutSeconds
    if (-not $produced -and (Test-Path -LiteralPath $abandoned)) {
        Write-Output "K12: passe $Pass ABANDONNEE — voir $abandoned"
    }

    # Step 10 asks for the application to be really closed. The window is asked
    # to close first; the process is only stopped if it refuses, and it is the
    # process this script started.
    if (-not $application.HasExited) {
        $null = $application.CloseMainWindow()
        if (-not $application.WaitForExit(15000)) {
            Write-Output "K12: la fenetre n'a pas repondu, arret du processus demarre ici"
            Stop-Process -Id $application.Id -ErrorAction SilentlyContinue
        }
    }
    $application.WaitForExit()
    if ($null -ne $keys -and -not $keys.HasExited) {
        Stop-Process -Id $keys.Id -ErrorAction SilentlyContinue
    }
    Remove-Item Env:\FILETOPO_AUTO_BRAINS -ErrorAction SilentlyContinue

    Write-Output "K12: passe $Pass terminee, sortie $($application.ExitCode), artefact=$produced"
    return $produced
}

$first = Invoke-Pass -Pass 1 -WithKeyWatcher
if (-not $first) {
    throw 'K12: la passe 1 n a pas produit son artefact — rien n est prouve, et cela se publie tel quel'
}

# The restart is real: the first process has exited before this line.
Start-Sleep -Seconds 2
$second = Invoke-Pass -Pass 2
if (-not $second) {
    throw 'K12: la passe 2 n a pas produit son artefact apres le redemarrage'
}

Write-Output 'K12: les deux passes ont ecrit leur artefact sous docs/performance/runs/'
