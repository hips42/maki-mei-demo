# マキ＆メイ 学期別学習チャレンジ

2026年度・貝塚市立第四中学校の中学1年生向け。NEW CROWN English Series 1（三省堂）、国語1（光村図書出版）の出版社年間指導計画を参考にした補充問題。

- 学校の実際の進度は未確認。教科書本文・問題集の文章は転載しない。
- 既存220問は保持。学習用語との対応を確認した16問を参考分類し、104問を独自追加。残る204問は未分類として出題しない。
- 1〜3学期それぞれ、読み・書き取り・英単語／語形・英熟語／表現が各10問。漢字混合は各20問から10問出題。
- おためしは選択不可。10問完走後に結果保存。1日最大3回、全問正解で当日達成。
- 記録は従来のlocalStorage形式を維持。端末間共有・正式ガチャ券は未実装。
- [調査根拠・分類方針](docs/term-classification.md)、[全問の分類結果](docs/classification-results.json)。

配置時は `index.html`、`extra_questions.js`、`curriculum_questions.js`、`assets/nekoda-nekoo.png` を同じ相対配置で使用する。既存の `.nojekyll` がある配信先では維持する。今回はpushや公開環境への反映は行っていない。

テスト：`node --test tests/quiz.test.cjs`

実ブラウザテスト：`npm ci` 後に `npm run test:browser`（Windows PowerShellで実行ポリシーの制約がある場合は `npm.cmd`）。インストール済みのChromeを使用し、Edgeは `BROWSER_CHANNEL=msedge` で指定できる。毎回一時ブラウザコンテキストとローカルの空きポートを使い、普段のブラウザや公開先の記録には触れない。スクリーンショットはGit管理外の `test-results/` に保存する。

調査一覧の再生成：`node scripts/audit-questions.cjs --write`
