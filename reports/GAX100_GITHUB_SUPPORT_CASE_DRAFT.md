# GitHub Support – ärendeutkast, EJ SKICKAT

Detta är en förberedelse för behörig ägare. Skicka inte från offentlig PR,
och bifoga aldrig transkriptionen, deltagarnamn, resultat-ID eller känsliga
patchrader. Eventuell sanering kräver separat uttryckligt godkännande.

**Subject:** Guidance on historical sensitive-data exposure in public repository and pull-request refs

**Repository:** `Stayinhealthyrunning/gax100-analys` (public)

**Summary:** A previously committed, identifying 2025 source transcription
was removed from current development trees but remains publicly addressable
through commit `7757cf18608002859745c66d6a016eaa6d8bcdce` and GitHub-owned
pull-request refs #2, #3, #4, #5 and #7. Metadata-only HTTP HEAD checks
returned 200 for their head and merge refs. Public PR file metadata for #2
and #5 also indicates an available addition patch. Current `main`, PR #6
and PR #8 heads do not contain the file. We have not reproduced its content
in this ticket draft.

**Request after owner-approved remediation plan:** Please advise the safe
sequence for coordinated branch/history cleanup, removal of GitHub-owned PR
references and cached diff views, and verification of GitHub-hosted copies.
We also need guidance on any retained Actions/Pages copies that could remain
after repository cleanup. We will provide the exact affected path and any
`git-filter-repo` first-changed-commit/changed-ref output **privately** if
and when the repository owner authorizes a rewrite. No rewrite or ref deletion
has yet occurred; do not treat this draft as a purge request.

**Known scope:** The repo currently lists 215 unexpired Actions artefacts,
199 predating the private-source migration. Two sampled old ZIPs contained
screenshots and HTML reports but no direct raw-source path. Existing Pages
still serves the older tracked `web/data.json` snapshot. These are separate
review tracks; the archive contents have not been fully audited.

**Questions for Support:**

1. Which GitHub-owned PR refs/cached patch views remain after an authorized
   coordinated rewrite, and what evidence is needed for Support to purge them?
2. Can Support identify any retained Pages build/deployment assets for this
   repo that are not visible through the anonymous Pages API?
3. Are there additional GitHub-managed caches for the affected commits/PRs
   not covered by the repository Actions-cache API?

**Owner to complete privately before sending:** legal/sensitivity
classification; exact file path; approved remediation scope; backup and
collaborator plan; whether the affected PRs may be disrupted; rewrite output
(`First Changed Commit(s)` and affected refs) if a rewrite is later approved.

Source for sequencing: [GitHub Docs – Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).
