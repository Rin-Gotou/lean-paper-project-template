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

`review.status` and the current Lean validation result are intentionally
separate. A transient Language Server failure does not automatically demote a
human-reviewed mapping. Conversely, successful symbol resolution does not
establish mathematical equivalence.

## Updating notes in the Viewer

After selecting a PDF link, use the Viewer toolbar's `コメント` action (or
`Review操作...` → `noteを編集`) to open the multiline editor at the bottom of
the Viewer. Save with `Ctrl+Enter` (`Cmd+Enter` on macOS), cancel with `Esc`, or
save an empty value to remove the note.

The Viewer detects when the same note has changed on disk since editing began.
In that case, choose explicitly between reloading the manifest version and
overwriting it with the draft. Drafts are retained per link while navigating
between PDF links.

An agent may update a note without changing the current review state if the
underlying mapping is unchanged. Creating or semantically changing a mapping
always resets the state to `proposed`.

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
