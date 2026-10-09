# Lean Paper Project Template

TeX論文とLean形式化を同じVS Codeワークスペースで管理し、PDF内の見出しから
対応するLean宣言へ移動するための実用テンプレートです。
Lean Paper Viewer Step 8（0.7.0）のReview操作に対応しています。

`lean_codex_project_template`のCodex向け証明方針、Lean設定、コンパイルテスト、
Makefileを統合しています。Leanの公開ライブラリ名は`PaperProject`、
ツールチェーンは`lean-toolchain`に固定されたv4.34.0です。

## 1. 一度だけ行う準備

WSL側のVS Codeへ次をインストールします。

- 公式Lean 4 Extension (`leanprover.lean4`)
- `lean-paper-viewer-step8-0.7.0.vsix`

VSIXは、WSLウィンドウのExtensionsビューから
`Extensions: Install from VSIX...`を実行して選択します。インストール後に
`Developer: Reload Window`を実行してください。

CLIで更新する場合は、VSIXがあるディレクトリで次を実行します。

```bash
code --install-extension ./lean-paper-viewer-step8-0.7.0.vsix --force
```

Step 8でも拡張IDは`local-development.lean-paper-viewer-step1`です。
既存の拡張を更新するため、Step 8という別の拡張IDを追加する必要はありません。
`.vscode/extensions.json`にもこのIDを推奨として登録しています。

通常利用ではExtension Development Hostを起動する必要はありません。

## 2. テンプレートを複製する

フォルダ名を論文名に変え、WSLの通常のVS Codeウィンドウで開きます。

```bash
cp -r lean-paper-project-template MyPaper
cd MyPaper
code .
```

現在のViewerは、最初のワークスペースフォルダ直下にある
`lean-paper-viewer.json`を読みます。まずはmulti-root workspaceを使わず、
このフォルダ自体を開いてください。

## 3. サンプルを確認する

### 全チェックをまとめて実行

```bash
make check
```

Leanのビルド、`Tests/Basic.lean`のコンパイル、PDF再生成、リンク検証を
順番に実行します。`make test`はLeanビルドとテストのみ、`make paper`は
PDF再生成とリンク検証のみを実行します。VS Codeの既定ビルドタスク
`Lean Paper: Check All`でも同じチェックを実行できます。
Lean/ Lake、GNU Make、Node.js、`pdflatex`が必要です。

### Leanをビルド

```bash
lake build
```

### PDFを再生成

```bash
npm run build:pdf
```

### PDF・manifest・Leanファイルヒントを検証

```bash
npm run validate:links
```

`npm install`は不要です。CLI Validator用のPDF.jsは`media/pdfjs/`に同梱されています。
Node.js 22.13以降（Node 24 LTS推奨）を使用してください。

より完全なLean名前解決は、VS Codeのコマンドパレットから
`Lean Paper Viewer: Validate Paper and Lean Links`を実行して確認します。
ショートカットは`Ctrl+Alt+Shift+L`（macOSは`Cmd+Alt+Shift+L`）です。

### Viewerを開く

コマンドパレットから
`Lean Paper Viewer: Open Paper and Lean Links`を実行します。
ショートカットは`Ctrl+Alt+L`（macOSは`Cmd+Alt+L`）です。
キー割り当てが競合する場合はVS CodeのKeyboard Shortcutsで変更できます。

PDF内の青い見出しをクリックすると、右側のエディタで対応するLean宣言が開きます。

### Step 8のReview操作

PDFリンクを選択すると、Viewer上部に次の状態が別々に表示されます。

| 表示 | 意味 |
| --- | --- |
| `Review` | manifestに保存された`proposed` / `resolved` / `reviewed` |
| `Lean` | 現在のセッションの検証結果（未検証、解決済み、file hint、未解決、複数候補） |

`Review操作...`から、次の操作ができます。

- `宣言を解決`: Language Serverで宣言を一意に解決し、未reviewedなら`resolved`へ更新。
- `確認済みにする`: 人間が数学的対応を確認し、確認ダイアログを経て`reviewed`へ更新。
- `再確認が必要`: `proposed`へ戻す。
- `noteを編集`: noteを追加・変更。空欄なら削除。

Viewerを開いていないときは、コマンドパレットの
`Lean Paper Viewer: Update Link Review Status`から同じ操作を開始できます。
状態・noteの更新だけならPDF再生成は不要です。TeXのリンクを変更した場合は
PDFを再生成してから検証してください。

更新はmanifestの対象フィールドだけに適用され、ほかの記述や整形は保たれます。
外部エディタやCodexが保存したmanifest変更も、開いているViewerへ自動反映されます。
Leanの一時的な解決失敗やfile fallbackは、保存済みの`reviewed`を自動降格しません。
manifestはコメントや末尾カンマのない通常のJSONで保存してください。

サンプル3件の既存の`reviewed`は維持しています。自分の論文へ置き換えて対応を
作成・意味変更した場合は`proposed`に戻し、人間の確認後にReview操作で更新します。

## 4. 自分の論文へ置き換える

1. `paper/main.tex`を自分の原稿へ置き換える。
2. 生成PDFの場所を`lean-paper-viewer.json`の`paper.pdf`へ記入する。
3. Leanソースを配置し、`lakefile.toml`と`PaperProject.lean`を調整する。
4. TeXの対応箇所を`\leanlink{ID}{...}`で囲む。
5. 同じIDを`lean-paper-viewer.json`で完全修飾Lean宣言名へ対応させる。
6. PDFを再生成し、Validatorを実行する。

Leanライブラリ名も変更する場合は、`lakefile.toml`の`paper_project`と
`PaperProject`、公開ルートファイル、ソースディレクトリ、名前空間、import、
`Tests/Basic.lean`、manifestの宣言名・ファイルパス、`AGENTS.md`を
整合させて変更してください。公開モジュールはルートファイルからimportし、
新しいテストファイルを追加した場合はMakefileとVS Codeタスクにも追加します。

TeX側の基本形は次です。

```tex
\newcommand{\leanlink}[2]{%
  \href{lean-paper:#1}{#2}%
}

\leanlink{thm:main-result}{\textbf{Theorem 1.1 (Main theorem).}}
```

manifest側の基本形は次です。

```json
{
  "id": "thm:main-result",
  "label": "Theorem 1.1 (Main theorem)",
  "lean": {
    "declaration": "MyPaper.main_result",
    "file": "MyPaper/MainTheorem.lean"
  },
  "review": {
    "status": "proposed",
    "note": "Correspondence proposed for human review."
  }
}
```

`file`はワークスペース相対パス、`declaration`は名前空間を含む完全修飾名です。
行番号は保存しません。

## 5. Codexと使う

`AGENTS.md`には、Codexが対応を追加するときの判断境界と検証手順があります。
実際のファイル名やビルドコマンドへ変更した場合は、同ファイルも更新してください。
証明には`sorry`や`admit`を残さず、完了前に`make check`を実行します。
チェック成功後は、Gitリポジトリと`origin`が設定されていれば、今回の変更だけを
コミットして現在のブランチをpushする方針です。アップロードが不要な場合は
Codexへの依頼時にその旨を指定してください。

依頼例:

> `paper/main.tex`と`PaperProject/**/*.lean`を読み、主張の対応候補を追加してください。
> 曖昧な候補は自動決定せず報告し、追加・変更した対応は`proposed`にしてください。
> 最後にLean、PDF、リンクを検証してください。

Codexは`reviewed`を設定しません。数学的な対応を人間が確認した後にだけ
`review.status`を`reviewed`へ変更します。
Step 8の`Lean`表示が解決済みでも、それだけでは数学的対応の確認にはなりません。
既存の対応を意味変更した場合は`proposed`へ戻し、無関係な対応のreview状態やnote、
manifestの整形は維持してください。詳細は`docs/linking-conventions.md`にあります。

## ファイル構成

```text
.
├── AGENTS.md
├── README.md
├── Makefile
├── lean-paper-viewer.json
├── lean-paper-viewer.schema.json
├── lakefile.toml
├── lean-toolchain
├── PaperProject.lean
├── PaperProject/
│   ├── Definitions.lean
│   └── MainTheorems.lean
├── Tests/
│   └── Basic.lean
├── paper/
│   ├── main.tex
│   └── main.pdf
├── docs/linking-conventions.md
├── tools/
├── media/pdfjs/
└── .vscode/
```

`tools/`と`media/pdfjs/`はCLI Validator用です。Viewer本体はインストール済みVSIXから
動作します。
