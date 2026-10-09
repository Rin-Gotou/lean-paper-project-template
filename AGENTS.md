# Codex instructions for this Lean-paper project

This repository contains a TeX paper, its generated PDF, and a Lean 4
formalization. The installed VS Code extension is deterministic and does not
call an LLM. Codex edits repository files and follows the contract below.
The template targets Lean Paper Viewer Step 8 (0.7.0), whose extension ID
remains `local-development.lean-paper-viewer-step1`.

## Lean project layout and workflow

- `PaperProject.lean`: public import root
- `PaperProject/`: definitions and proofs
- `Tests/`: compile-time tests and examples
- `lakefile.toml`: Lake project configuration
- `lean-toolchain`: pinned Lean version
- `paper/`: TeX source and generated PDF

When adding a public source module, import it from `PaperProject.lean`.
Mirror important behavior with a file under `Tests/` and add its check to the
Makefile and VS Code tasks when adding a test module.

1. Read relevant definitions and nearby proofs before editing.
2. Make the smallest coherent change.
3. Do not leave `sorry`, `admit`, or disabled checks in finished work.
4. Run `make check` before reporting completion. It builds Lean, compiles the
   sample tests, rebuilds the PDF, and validates links, in that order.
5. If a proof fails, fix the first Lean error before reacting to cascading errors.
6. After all checks pass, commit only files changed for the current task and push
   the current branch to GitHub, unless the user explicitly says not to upload.

## Commands

- `lake build` or `make build`: build the public library
- `make test`: build the library and compile `Tests/Basic.lean`
- `make paper`: rebuild the PDF and validate links
- `make check`: run all checks
- `lake env lean path/to/File.lean`: check one file while iterating
- `make clean`: clean Lake build outputs

## GitHub upload

After completing a task and successfully running `make check`:

1. Run `git status --short --branch` and inspect changes.
2. Stage only files belonging to this task; never include unrelated user changes.
3. Create a concise commit describing the completed change.
4. Determine the branch with `git branch --show-current`, then run
   `git push origin HEAD`.
5. Report the commit ID and pushed branch.

No additional confirmation is needed unless the user has asked not to push.
Never force-push, rewrite history, discard changes, or bypass protections.
If the directory is not a Git repository, `origin` is missing, authentication
fails, or the branch has diverged, report the blocker without destructive action.

## Proof style

- Prefer clear direct proofs (`rfl`, `exact`, `apply`, `constructor`, `simp`).
- Use explicit theorem and variable types; relaxed auto-implicit variables are
  disabled in `lakefile.toml`.
- Keep broad automation local and avoid fragile unrelated rewrites.
- Add brief doc comments to public definitions and non-obvious theorems.
- Claim a proof is complete only after Lean has compiled it successfully.

## Adding mathlib (optional)

The Lean library has no external dependencies. If mathlib is needed, add a
`[[require]]` block to `lakefile.toml` with name `mathlib`, scope
`leanprover-community`, and a revision compatible with the pinned version in
`lean-toolchain`, then run `lake update`. This step needs network access.
Import only the mathlib modules each source file needs.

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
7. If several Lean declarations are plausible, do not choose silently. Report
   candidates and their differences, and leave the mapping unchanged.
8. Symbol resolution establishes existence and uniqueness, not mathematical
   equivalence.
9. Preserve unrelated manifest fields, formatting, review states, and notes.
   Keep the manifest valid strict JSON; the extension uses JSONC editing for
   targeted changes, but the Viewer and CLI parse ordinary JSON.

## Step 8 review workflow

The Viewer shows persistent `Review` state separately from current-session
`Lean` validation. Humans can use `Review操作...` or
`Lean Paper Viewer: Update Link Review Status` to resolve a declaration,
mark a mapping reviewed after mathematical review and confirmation, return it
to proposed, or edit its note. Resolving an already reviewed link preserves
its reviewed state. A failed live Lean check or file fallback never automatically
downgrades persistent review state.

Codex-created or semantically changed mappings must be proposed, including
changes to previously reviewed mappings. Do not treat the sample's reviewed
states as approval for replacement statements. Preserve reviewed states for
unchanged mappings. Status/note-only edits do not require rebuilding the PDF;
TeX link changes do. External manifest saves refresh the open Viewer.

The default open/validate shortcuts are `Ctrl+Alt+L` and `Ctrl+Alt+Shift+L`
(macOS uses `Cmd` instead of `Ctrl`). Do not add workspace overrides unless
requested.

Do not edit vendored files under `media/pdfjs/`.

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
