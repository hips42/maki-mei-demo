# マキ＆メイ LINE公開おためし版

GitHub Pages専用の静的ファイル。`index.html` と `assets/nekoda-nekoo.png` を同じ構造で公開する。

## 注意
- FastAPI・SQLite・認証は含まれない。
- 点数・挑戦履歴は使用中ブラウザの localStorage のみに保存。別端末では共有されず、削除で消える。
- マキ・メイ選択は識別・認証ではない。
- 50問テスト・ガチャ券発行は未実装。
- 問題は教科書掲載範囲未確認の試作問題。
- 公開URLを知る人はアクセス可能。個人情報を登録しない。

## 公開
1. 別の Public リポジトリ（例 `maki-mei-demo`）を作る。**本体のPrivateリポジトリは変更しない。**
2. このフォルダの `index.html`, `assets/nekoda-nekoo.png`, `.nojekyll` をアップロードする。
3. Settings > Pages > Build and deployment > Deploy from a branch > main / (root) > Save.
4. 公開URL `https://<username>.github.io/<repo>/` をLINEで開く。

ネット公開前に保護者が閲覧範囲や利用ルールを確認すること。
