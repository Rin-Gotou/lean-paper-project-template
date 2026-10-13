# Codex instructions for this Lean-paper project

This repository contains a TeX paper, its generated PDF, and a Lean 4
formalization. The installed VS Code extension is deterministic and does not
call an LLM. Codex edits repository files and follows the contract below.

## Link-editing contract

When adding or changing a paper-to-Lean link:

1. Read the complete TeX statement and the complete Lean declaration. Never
   infer correspondence from names alone.
2. Wrap the smallest useful TeX heading, term, or formula with
   `\leanlink{ID}{...}`. Do not wrap text likely to break across pages.
3. Use a stable semantic ID such as `def:canonical-measure`,
   `lem:orbit-bound`, or `thm:main-result`. Never encode page or line numbers.
4. Add exactly one manifest entry for the ID to `lean-paper-viewer.json`.
5. Store the fully qualified Lean declaration and a workspace-relative `.lean`
   file hint. Never store a source line number.
6. Set `review.status` to `proposed` whenever Codex creates or semantically
   changes a mapping. Only a human may set `reviewed`.
   A note-only edit may preserve the existing status when it does not change
   the claimed paper-to-Lean correspondence.
7. If several Lean declarations are plausible, do not choose silently. Report
   candidates and their differences, and leave the mapping unchanged.
8. Symbol resolution establishes existence and uniqueness, not mathematical
   equivalence.

Do not edit vendored files under `media/pdfjs/`.

The Viewer may be open while Codex edits `lean-paper-viewer.json`. Keep edits
local to the requested mapping and preserve unrelated formatting and fields.
If the user reports an unsaved Viewer draft or a conflict prompt, do not assume
that overwriting the manifest is acceptable; reconcile the two versions with
the user.

## Required checks after link edits

Run these from the repository root:

```bash
lake build
npm run build:pdf
npm run validate:links
```

The PDF must be rebuilt before link validation so that the latest TeX source
has emitted its `lean-paper:` annotations. When interactive VS Code access is
available, also run `Lean Paper Viewer: Validate Paper and Lean Links` for Lean
Language Server resolution.

If a command is unavailable or fails, report the exact uncompleted check. Do
not claim that validation succeeded.

See `docs/linking-conventions.md` for the shared human/agent specification.
