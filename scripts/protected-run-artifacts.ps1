<#
.SYNOPSIS
    Reserve X5, held OUTSIDE the application: the canonical evidence of a
    VERIFIED task, and the guard that refuses to delete it.

.DESCRIPTION
    The application refuses to WRITE a verified task's evidence, at the gate in
    `write_run_artifact`. The run scripts do not write artefacts — they DELETE
    stale ones before a pass, which is the same destruction by another route,
    and a gate the application holds says nothing about a script that reaches
    around it.

    This file exists because the list was previously copied into every script.
    Two spellings of one list eventually disagree, and the disagreement is
    discovered the day a proof goes missing. There is now ONE list, dot-sourced:

        . (Join-Path $PSScriptRoot 'protected-run-artifacts.ps1')
        Assert-NotProtectedRunArtifact -Path $stale

    The list grows the moment a task becomes VERIFIED, never before:

      * TASK-0016, TASK-0017 — verified by ACTION-0026 and ACTION-0027
      * TASK-0018 — verified by ACTION-0029, four proofs
      * TASK-0019 — verified by ACTION-0031, SIX proofs, four of which are
        themselves regression replays. Being a replay does not make evidence
        less canonical once the task that published it has been controlled.

    Fourteen names. Nothing here deletes, renames or moves anything: this file
    only refuses.
#>

$script:ProtectedRunArtifacts = @(
    'TASK-0016-H1-H7-verification.json',
    'TASK-0016-H9-webview2.json',
    'TASK-0017-J11-isolation.json',
    'TASK-0017-J12-webview2.json',
    'TASK-0018-K11-readonly-and-isolation.json',
    'TASK-0018-K12-webview2-pass1.json',
    'TASK-0018-K12-webview2-pass2.json',
    'TASK-0018-J12-relations-regression-webview2.json',
    'TASK-0019-J12-relations-regression-webview2.json',
    'TASK-0019-K11-readonly-regression-webview2.json',
    'TASK-0019-K12-foundation-regression-webview2-pass1.json',
    'TASK-0019-K12-foundation-regression-webview2-pass2.json',
    'TASK-0019-L12-composed-view-webview2-pass1.json',
    'TASK-0019-L12-composed-view-webview2-pass2.json'
)

function Get-ProtectedRunArtifact {
    <# The fourteen names, for a caller that wants to report them. #>
    return $script:ProtectedRunArtifacts
}

function Assert-NotProtectedRunArtifact {
    <#
    .SYNOPSIS
        Throws if the path names canonical evidence of a VERIFIED task.

    .DESCRIPTION
        Called before every deletion. A run script deletes only its OWN previous
        output for the pass it is about to run, so a stale file cannot be
        mistaken for a fresh result — and this refuses the moment a rename or a
        copied constant points that deletion at somebody else's proof.
    #>
    param([Parameter(Mandatory = $true)][string]$Path)

    $name = Split-Path -Leaf $Path
    if ($script:ProtectedRunArtifacts -contains $name) {
        throw "X5: $name est la preuve canonique d'une tache VERIFIED — ce script ne la touche pas"
    }
}
