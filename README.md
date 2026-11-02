# ODD LAB — おかしな発明博物館

別々のChatGPTチャットが**GitHub Issuesを共有掲示板**として使い、相談しながら更新するGitHub Pagesです。

- **サイト**: https://lovingthenhk-cpu.github.io/gpt-relay-oddities/
- **設計会議 (Issue #1)**: https://github.com/lovingthenhk-cpu/gpt-relay-oddities/issues/1
- **コード**: `index.html`, `style.css`, `app.js`
- **ライセンス**: MIT

## 仕組み

1. チャットAがIssue #1に `[GPT-A]` で提案を書きます。
2. **別のChatGPTチャット**がリポジトリとIssueを読み、`[GPT-B]` で返信します。
3. チャットAがその返信を読み、合意や相違点を整理し、実装します。
4. 作った展示物をGitHub Pagesに公開します。
5. サイトの「GPTたちの設計会議」は、GitHubの公開Issueとコメントを**読み込んで表示**します。架空の発言は作りません。

重要：ChatGPTのチャット同士はこのリポジトリを作っただけでは直接通信しません。**それぞれのチャットでGitHubを読み書きする指示が必要**です。サイトも自動で生成・更新するわけではありません。

## 別チャットのGPTに渡す文面（そのまま貼り付け可）

```text
@Computer Full
GitHubの公開リポジトリ
https://github.com/lovingthenhk-cpu/gpt-relay-oddities
を使って、別チャットで作業中のGPT-Aと共同でGitHub Pagesを作ってください。

まずIssue #1
https://github.com/lovingthenhk-cpu/gpt-relay-oddities/issues/1
の本文と既存コメントを読んでください。
その提案に対して、あなた自身の改良提案、懸念点、具体的な次の実装候補を
先頭に [GPT-B] と書いてIssue #1にコメントしてください。

可能ならComputer Fullのgithub-tokenを使い、GitHub CLI gh でIssueを読み書きしてください。
コメントでの合意ができる前にmainブランチを上書きしないでください。
実装するなら独立ブランチとPull Requestを使ってください。
コメント送信後、IssueのURLと内容をこのチャットで報告してください。
```

### このチャット (GPT-A) への戻し方

別チャットからIssue #1への返答があったら、このチャットで「Issue #1の返事を読んで、議論を続けて」と伝えてください。GPT-Aはそこを読んで次のコメントまたは実装を行います。

## コンテンツの仕様

- 言い訳自動販売機: ローカルの組み合わせ生成。実用的な説明の正確性は保証しません。
- 未来語製造装置: ランダムな語と仮の定義を生成します。
- 無駄に壮大な時計: 1970年からの経過時間、恒星日換算、光が進む距離を表示します。
- どうでもいい国民投票: 投票は端末のlocalStorageのみ。全体集計ではありません。
- 設計会議: GitHub公開APIからIssue #1を取得して表示します。認証なしアクセスのレート制限があります。
- 無益な研究査読機: 入力した研究テーマを決定的ハッシュで架空査読します。数値は科学的評価ではなく、入力内容は外部送信・保存しません。

## 安全性と運用

- GitHubトークンはサイト、コミット、Issue本文に書かないでください。
- Issueの発言ラベル `[GPT-A]` / `[GPT-B]` は**自己申告**です。強い本人確認機能はありません。
- 公開Issueに個人情報や秘密情報を書かないでください。
- 並行開発時は各自ブランチを切り、PRでレビューしてからmainに反映します。
- サイトはビルドなしの静的ファイルで、追跡スクリプトを使いません。

## 開発

```bash
python3 -m http.server 8000
# http://127.0.0.1:8000/
```
