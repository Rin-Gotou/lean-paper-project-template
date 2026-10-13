# Lean Paper Project Template for Viewer v0.8.0

TeX論文、そのPDF、Lean 4形式化、両者の対応表を同じVS Codeワークスペースで
管理するための実用テンプレートです。

[準備（第1節）](#1-テンプレートとviewerをまとめて入手する)、
[インストール（第2節）](#2-同梱viewerをインストールする)後に、VS Codeで以下のショートカット・機能が使えます。

| 操作 | ショートカット |
| --- | --- |
| Viewerを開く | `Ctrl+Alt+L` |
| 対応を検証 | `Ctrl+Alt+Shift+L` |
| コメントを保存 | `Ctrl+Enter` |
| コメント編集をキャンセル | `Esc` |

macOSでは`Ctrl`の代わりに`Cmd`です。

- PDFリンクから対応するLean宣言へ移動（[第3節](#3-サンプルを確認する)）
- Lean宣言の名前解決とリンク対応を検証（[第3節](#3-サンプルを確認する)）
- Review状態の更新：宣言を解決・確認済みにする・再確認が必要（[第4節](#4-review-statusとコメントを更新する)）
- コメントの編集・保存・削除（[第4節](#4-review-statusとコメントを更新する)）
- コメント編集の競合確認と未保存入力の保持（[第4節](#4-review-statusとコメントを更新する)）

## 1. テンプレートとViewerをまとめて入手する

このリポジトリには、論文プロジェクトのテンプレートと
[Lean Paper Viewer v0.8.0のVSIX](dist/lean-paper-viewer-0.8.0.vsix)を同梱しています。
テンプレートのZIPをダウンロードすれば、両方をまとめて入手できます。

[GitHubのリポジトリ](https://github.com/Rin-Gotou/lean-paper-project-template)で
`Code → Download ZIP`を選び、展開したフォルダを論文名（例: `MyPaper`）に変更してください。
バージョン別の配布は[Releases](https://github.com/Rin-Gotou/lean-paper-project-template/releases)から確認できます。
Releaseの`Source code (zip)`にも、そのタグ時点で同梱されたVSIXが含まれます。

Windows・macOS・Linuxの通常のVS Codeで利用できます。WSLは任意です。
必要な環境は次のとおりです。

| ツール | 準備 |
| --- | --- |
| VS Code | 1.96以降。公式Lean 4 Extensionと同梱VSIXをインストール（[手順は第2節](#2-同梱viewerをインストールする)） |
| Lean 4 / Lake | [Leanの公式手順](https://lean-lang.org/install/manual/)でelanを導入。Leanの版は`lean-toolchain`に従います |
| Node.js | 22.13以降。`node`と`npm`をターミナルから実行できること |
| TeX | WindowsならMiKTeXやTeX Live、macOSならMacTeXやTeX Liveなど。`pdflatex`をPATHへ追加 |

PDFビルドはNode.jsでディレクトリ作成・ファイルコピー・`pdflatex`起動を行い、
Unixシェルの`mkdir -p`や`cp`を必要としません。TeXの不足パッケージは利用する
TeX環境で追加してください。MiKTeXで自動インストールの確認が表示される場合は、
先に必要なパッケージをインストールしてください。

## 2. 同梱Viewerをインストールする

展開した`MyPaper`フォルダ自体をVS Codeで開きます。WSLを使う場合は、
WSLのターミナルから開いてください。

```sh
cd MyPaper
code .
```

VS Codeへ次をインストールします。WSLの場合は両方をWSL側へインストールしてください。

1. 公式Lean 4 Extension (`leanprover.lean4`)
2. 同梱の`dist/lean-paper-viewer-0.8.0.vsix`

VSIXは、コマンドパレットの`Extensions: Install from VSIX...`を実行して選択します。
インストール後に`Developer: Reload Window`を実行してください。
ターミナルからインストールする場合は、プロジェクト直下で次を実行します。
WindowsのPowerShell・コマンドプロンプト、macOS・Linuxのターミナルで同じコマンドを使えます。

```sh
code --install-extension leanprover.lean4
code --install-extension ./dist/lean-paper-viewer-0.8.0.vsix --force
```

`code`が見つからない場合も、VS CodeのGUIからフォルダを開き、VSIXをインストールできます。
WindowsではVS CodeのインストーラーでPATHへの追加を選択します。
macOSではコマンドパレットから`Shell Command: Install 'code' command in PATH`を実行します。
詳しくは[VS Codeの公式CLI説明](https://code.visualstudio.com/docs/configure/command-line)を参照してください。
WindowsのPowerShellで`npm.ps1`の実行がブロックされた場合は、以下の`npm`を`npm.cmd`に置き換えて実行できます。

同梱VSIXのインストール後は、Viewerをビルドする作業は不要です。
Viewerは最初のワークスペースフォルダ直下にある`lean-paper-viewer.json`を読みます。
まずはmulti-root workspaceを使わず、このフォルダ自体を開いてください。

## 3. サンプルを確認する

Leanをビルドします。

```sh
lake build
```

TeXを再コンパイルし、PDF・manifest・Leanファイルヒントをまとめて検証します。

```sh
npm run check:paper
```

PDFを変更せずリンクだけ再検査するときは、次を使えます。

```sh
npm run validate:links
```

このテンプレート自体には`npm install`は不要です。CLI Validator用のPDF.jsは
`media/pdfjs/`に同梱されています。Node.js 22.13以降（Node 24 LTS推奨）を
使用してください。

VS Codeで完全なLean名前解決まで確認するには、次のコマンドまたはショートカットを使います。

| 操作 | コマンド | ショートカット |
|---|---|---|
| Viewerを開く | `Lean Paper Viewer: Open Paper and Lean Links` | `Ctrl+Alt+L` |
| 対応を検証 | `Lean Paper Viewer: Validate Paper and Lean Links` | `Ctrl+Alt+Shift+L` |

macOSでは`Ctrl`の代わりに`Cmd`です。PDF内の青い見出しをクリックすると、右側の
エディタで対応するLean宣言が開きます。同一ファイル内と異なるLeanファイル間の移動を
3つのサンプルで確認できます。

## 4. Review statusとコメントを更新する

PDFリンクを選ぶと、Viewer上部に選択中の対応が表示されます。`Review`はmanifestへ
保存される状態、`Lean`は現在のVS Codeセッションで得た検証結果です。

`Review操作...`から次を実行できます。

- `宣言を解決`: Lean Language Serverで宣言を一意に解決し、必要なら`resolved`へ更新
- `確認済みにする`: 人間が数学的対応を確認してから`reviewed`へ更新
- `再確認が必要`: 対応を`proposed`へ戻す

上部の`コメント`、または`Review操作...`内の`noteを編集`を選ぶと、Viewer下部に
複数行の入力欄が開きます。別のEditor tabやPanelは増えません。

- 保存: `Ctrl+Enter`（macOSは`Cmd+Enter`）
- キャンセル: `Esc`
- 空欄で保存: noteを削除

編集中にCodexや別エディタが同じnoteを変更した場合は、自動上書きせず
`manifestを再読込`または`自分の内容で上書き`を選べます。未保存の入力は、別のPDFリンクへ
移動しても元のリンクに紐づけて保持されます。

Viewerを開かずに状態を変える場合は、コマンドパレットの
`Lean Paper Viewer: Update Link Review Status`を使えます。

## 5. 自分の論文へ置き換える

1. `paper/main.tex`を自分の原稿へ置き換える。
2. 生成PDFの場所を`lean-paper-viewer.json`の`paper.pdf`へ記入する。
3. Leanソースを配置し、`lakefile.toml`と`PaperProject.lean`を調整する。
4. TeXの対応箇所を`\leanlink{ID}{...}`で囲む。
5. 同じIDを`lean-paper-viewer.json`で完全修飾Lean宣言名へ対応させる。
6. `lake build`と`npm run check:paper`を実行する。
7. ViewerのValidatorでもLean Language Serverによる名前解決を確認する。

TeX側の基本形は次です。

```tex
\newcommand{\leanlink}[2]{%
  \href{lean-paper:#1}{#2}%
}

\leanlink{thm:main-result}{\textbf{Theorem 1.1 (Main theorem).}}
```

改ページしうる本文全体ではなく、見出し・用語・式など局所的な範囲を囲みます。
TeXコンパイル時に通常のPDFリンク注釈として埋め込まれるため、紙面上の位置をmanifestへ
保存する必要はありません。

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

## 6. Codexと使う

`AGENTS.md`には、Codexが対応を追加・変更するときの判断境界と検証手順があります。
実際のファイル名やビルドコマンドへ変更した場合は、同ファイルも更新してください。

依頼例:

> `paper/main.tex`と`PaperProject/**/*.lean`を読み、主張の対応候補を追加してください。
> 曖昧な候補は自動決定せず報告し、追加・変更した対応は`proposed`にしてください。
> 最後にLean、PDF、リンクを検証してください。

Codexは`reviewed`を設定しません。数学的な対応を人間が確認した後にだけ
`review.status`を`reviewed`へ変更します。コメントだけを更新する場合は、対応そのものを
変更しない限り現在のstatusを維持します。

## ファイル構成

```text
.
├── AGENTS.md
├── README.md
├── lean-paper-viewer.json
├── lean-paper-viewer.schema.json
├── lakefile.toml
├── lean-toolchain
├── PaperProject.lean
├── PaperProject/
│   ├── Definitions.lean
│   └── MainTheorems.lean
├── paper/
│   ├── main.tex
│   └── main.pdf
├── dist/
│   └── lean-paper-viewer-0.8.0.vsix
├── docs/linking-conventions.md
├── tools/
├── media/pdfjs/
└── .vscode/
```

`tools/`はPDFビルドとCLI Validator用、`media/pdfjs/`はCLI Validator用です。Viewer本体はインストール済みVSIXから
動作します。
