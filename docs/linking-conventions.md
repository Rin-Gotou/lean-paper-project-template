# Lean-paper linking conventions

## Data flow

The TeX source embeds a semantic URI in the generated PDF:

```tex
\leanlink{thm:main-result}{\textbf{Theorem 1.1 (Main theorem).}}
```

This produces a PDF annotation whose URI is:

```text
lean-paper:thm:main-result
```

`lean-paper-viewer.json` maps that stable ID to a Lean declaration:

```json
{
  "id": "thm:main-result",
  "label": "Theorem 1.1 (Main theorem)",
  "lean": {
    "declaration": "PaperProject.main_result",
    "file": "PaperProject/MainTheorems.lean"
  },
  "review": {
    "status": "proposed"
  }
}
```

`lean.declaration` is authoritative. `lean.file` is a workspace-relative hint
used to start Lean Language Server and as a fallback. Source line numbers are
intentionally absent because they become stale after edits.

## Stable IDs

Use `kind:stable-name`. Recommended kinds are:

- `def` for definitions
- `thm` for theorems
- `lem` for lemmas
- `prop` for propositions
- `cor` for corollaries
- `eq` for especially important displayed equations

Do not encode page numbers, section numbers, TeX line numbers, or Lean line
numbers. Multiple appearances in the PDF may use the same ID; the manifest
must contain one entry for that ID.

## Review states

- `proposed`: an agent has proposed or changed the mathematical mapping.
- `resolved`: the Lean declaration has been resolved uniquely, but the
  mathematical correspondence has not yet been human-reviewed.
- `reviewed`: a human has compared both statements and accepted the mapping.

Codex must never set `reviewed`.

## Step 8 review actions

Lean Paper Viewer Step 8 (0.7.0) keeps the existing manifest format and command
IDs. Its extension ID remains `local-development.lean-paper-viewer-step1`.
Select a PDF link to see two independent indicators in the Viewer toolbar:

- `Review`: the manifest's persistent proposed/resolved/reviewed state.
- `Lean`: this session's unchecked/resolved/file-hint/unresolved/ambiguous result.

Use `Review操作...` or `Lean Paper Viewer: Update Link Review Status` to:

- Resolve the declaration through Lean Language Server. A successful unique
  resolution sets resolved unless the mapping is already reviewed.
- Mark a mapping reviewed after human mathematical review and confirmation.
- Return a mapping to proposed when it needs another review.
- Edit the note; submitting an empty note removes it.

Status/note edits update only the relevant manifest fields, preserving other
content and formatting. Keep the file ordinary JSON without comments or
trailing commas: targeted editing uses JSONC utilities, but the Viewer and CLI
read strict JSON. External manifest saves are reflected in the open Viewer.
Neither failed live validation nor file fallback automatically downgrades
reviewed. Codex must still return a semantically changed mapping to proposed.

Review status is not embedded in the PDF. A status/note-only change does not
require PDF rebuilding; a TeX link change does. Unchanged human-reviewed sample
mappings keep their states; replacement statements require a new review.

Open the Viewer with `Ctrl+Alt+L`, validate with `Ctrl+Alt+Shift+L` (macOS uses
`Cmd` instead of `Ctrl`). VS Code Keyboard Shortcuts can resolve key conflicts.

## Validation boundary

`npm run validate:links` checks:

- manifest structure, IDs, review states, and duplicate entries;
- agreement between PDF `lean-paper:` annotations and manifest IDs;
- workspace-relative PDF and Lean file paths;
- occurrence of the named declaration in the hinted Lean file.

The VS Code validator additionally asks the official Lean Extension to resolve
each fully qualified declaration through Lean Language Server.

Neither validator proves that the natural-language statement and Lean type are
mathematically equivalent. That remains a human review step.
