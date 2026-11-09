# GitHub Support – slutligt saneringsunderlag, EJ SKICKAT

Detta är ett **personuppgiftsfritt utkast** för repositoryägaren. Skicka endast
via privat Support-kanal. Bifoga inte originalfil, deltagaruppgifter,
identifierare, råa patchar eller skärmbilder med resultat. Exakt skyddad sökväg
och utföranderapport finns i det privata ägarärendet #7 och ska endast lämnas
direkt till Support vid behov.

**Subject:** Purge residual PR refs and cached views after approved GAX100 sensitive-data rewrite

**Repository:** `Stayinhealthyrunning/gax100-analys` (public)

**Situation:** The owner approved a coordinated GDPR remediation on 2026-10-14.
An identifying historical 2025 source transcription had been committed in
`7757cf18608002859745c66d6a016eaa6d8bcdce`. Its current development-tree
copy had already been moved into a private, hash-verified 17-file archive.
The public repository has no listed forks, but external clones are unknown.

**Completed remediation and proof:**

1. All 17 private originals passed manifest byte/SHA-256 checks and a real
   restore/readback. A full pre-rewrite Git bundle (nine branches, 15 PR refs)
   was verified and locally DPAPI-encrypted; SHA-256:
   `79EB64F9574A1912C86555CBFBA19DCE7449C7416D5F7C9B55B1212E4F1B5A74`.
   This is a local recovery copy, **not** a verified independent/offsite backup.
2. Only the GAX100 Pages workflow (ID `379338869`) was disabled and the
   GAX100 repository's Pages site deleted. API GET and the old HTML root,
   `/index.html` and `/data.json` returned HTTP 404 after cache expiry.
   The shared Loppanalys.se homepage remained HTTP 200. No replacement release
   was deployed.
3. Official `git-filter-repo` v2.47.0 was run in an isolated mirror with
   `--sensitive-data-removal`, `--invert-paths` and the one exact protected
   path. Revision ranges kept clean signed base commits intact. **First
   Changed Commit:** `7757cf18608002859745c66d6a016eaa6d8bcdce`.
   Its changed-ref report contains **21 refs**: seven branch heads plus
   `refs/pull/{2,3,4,5,6,7,8}/{head,merge}`. No tags were present.
4. Only the seven affected ordinary branches were atomically updated using
   exact `force-with-lease` expectations. A fresh fetch then verified **9/9**
   public branch/tag histories have no path history for the file and cannot
   reach its historical Git blob. `main` and PR #1 kept their original SHA.
   PR #8's clean tree and merge-base with `main` were preserved; PR #8 remains
   open, Draft and unmerged on `8b9a8880b0d8b038ebebfe6457c82bd85baf2598`.
   Full QA, snapshot QA and privacy guard passed on that exact SHA.

**Residual GitHub-hosted exposure:** The platform automatically updated most
PR head/merge refs after branch rewrites. On the post-push audit,
`refs/pull/3/merge` still resolved to the old unsanitized merge commit
`c5b562092fd0b4ec8d5eeb3396faa5aa59e6fefb`, with the protected path in
its history. Metadata-only Contents HEAD returned 200 for both that ref and
the original introduction commit; it returned 404 for PR #8's current branch.
Cached PR file additions/diffs for #2 and #5 were identified before rewrite
and may remain accessible. We have **not** fetched or attached their content.
All affected PRs #2–8 remain open Draft. We have not attempted to mutate
GitHub-owned `refs/pull/*` ourselves.

**Please help:**

- Dereference/remove any residual PR refs or other GitHub-owned refs retaining
  the old objects, especially PR #3's merge ref, and purge affected cached PR
  diffs/patches and direct commit/blob views. Please advise which open-PR views
  will be lost and coordinate before changing PR #8's Draft state.
- Run or arrange server-side garbage collection for the old objects once all
  ordinary refs and platform refs are clean, and provide a way to verify the
  result without retrieving the protected content.
- Confirm whether historical Pages deployments/build assets or other GitHub
  caches remain after the repo-scoped Pages deletion and whether Support can
  assist with their removal. External search-engine/client caches are a
  separate owner task.
- Advise how to assess retained Actions artifacts. The pre-sanering baseline
  was 215; a metadata audit at 2026-10-14 16:43 UTC counted 223 after new QA
  runs. Only two old ZIP structures were inspected, not full screenshot/HTML
  contents. No artifacts were bulk-deleted; retention and any selective
  deletion await an owner-approved preservation plan.

**Owner's private attachment checklist:** Exact affected path; private issue
#7 approval and 17-file manifest proof; `git-filter-repo` first-changed-commit
and changed-ref list; pre-rewrite backup/recovery procedure; timestamped
post-push `ls-remote`, 9/9 history check, HEAD-only residual checks and QA run
IDs. Do **not** attach participant rows or sensitive removal diffs.

**Status:** Prepared, **not submitted**. Technical GDPR filtering is distinct
from legal decisions about unknown age, lawful basis, publication rights and
artifact retention. PR #8 stays Draft; no merge, Pages release or catalog link.

Method: [GitHub Docs – Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).
