# セットアップガイド

このドキュメントでは、MBT事案管理システムのセットアップ手順を詳しく説明します。

## 前提条件

- Node.js 20以上
- npm または yarn
- Cloudflareアカウント（デプロイ時に必要）

## ローカル開発環境のセットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd MBT
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

### 4. 初期データの作成（オプション）

アプリケーションを起動後、管理画面から事案を作成できます：

1. http://localhost:5173/admin にアクセス
2. 「新規事案作成」ボタンをクリック
3. フォームに入力して「作成」をクリック

データはブラウザの **LocalStorage** に保存されます。

## Cloudflare D1データベースのセットアップ（将来の移行用）

> **現在の状態**: MBT は SPA モードで動作しており、データは LocalStorage に保存されます。
> D1 への移行を計画している場合のみ、以下の手順を実施してください。

### 1. Wranglerのインストールとログイン

```bash
npx wrangler login
```

### 2. D1データベースの作成

```bash
# 開発用データベース
npx wrangler d1 create mbt-db

# 本番用データベース
npx wrangler d1 create mbt-db-production
```

### 3. データベースIDの設定

コマンドの出力からdatabase_idをコピーし、`wrangler.toml`を更新：

```toml
[[d1_databases]]
binding = "DB"
database_name = "mbt-db"
database_id = "your-database-id-here"  # ← ここを更新
```

### 4. マイグレーションの実行

```bash
# 開発用
npx wrangler d1 execute mbt-db --local --file=./migrations/0001_initial_schema.sql

# 本番用
npx wrangler d1 execute mbt-db-production --remote --file=./migrations/0001_initial_schema.sql
```

### 5. D1データベースの確認

```bash
# ローカルで確認
npx wrangler d1 execute mbt-db --local --command="SELECT * FROM cases"

# 本番で確認
npx wrangler d1 execute mbt-db-production --remote --command="SELECT * FROM cases"
```

## Cloudflare Pagesへのデプロイ

### 方法1: CLIでのデプロイ

```bash
# ビルドとデプロイを一括実行
npm run deploy
```

> **注意**: `npm run deploy` は内部で `npm run build` を実行します。
> `build` コマンドを事前に別途実行する必要はありません。

### 方法2: GitHub連携での自動デプロイ

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)にアクセス
2. "Workers & Pages" > "Create application" > "Pages" > "Connect to Git"
3. GitHubリポジトリを選択
4. ビルド設定：
   - **ビルドコマンド**: `npm run build`
   - **ビルド出力ディレクトリ**: `build/client`
   - **Node.jsバージョン**: `20`
5. 環境変数を設定（必要な場合）
6. D1データベースバインディングを設定：
   - Settings > Functions > D1 database bindings
   - Variable name: `DB`
   - D1 database: 作成したデータベースを選択

## トラブルシューティング

### ビルドエラーが発生する

```bash
# node_modulesとキャッシュをクリア
rm -rf node_modules build
rm -rf .react-router 2>/dev/null || true
npm install
npm run build
```

### 地図が表示されない

- ブラウザの開発者コンソールでエラーを確認
- Leaflet CSSが正しく読み込まれているか確認
- ネットワークタブでOpenStreetMapタイルのリクエストを確認

### LocalStorageのデータをクリアしたい

ブラウザの開発者ツールを開き：

```javascript
localStorage.removeItem('cases');
```

または、Application タブ > Storage > Local Storage からも削除できます。

### D1データベースに接続できない

1. `wrangler.toml`のdatabase_idが正しいか確認
2. D1データベースが作成されているか確認：
   ```bash
   npx wrangler d1 list
   ```
3. マイグレーションが実行されているか確認

## 開発時のヒント

### ホットリロード

開発サーバーは自動的にファイルの変更を検出し、ページをリロードします。

### TypeScript型チェック

```bash
npm run typecheck
```

### 本番ビルドのテスト

```bash
npm run build
# Cloudflare Pages開発モードで起動（wrangler必要）
npm run start
```

または、シンプルなHTTPサーバーで確認：

```bash
npm run build
npx serve build/client
```

## 次のステップ

- [README.md](../README.md) - プロジェクト概要
- [migrations/](../migrations/) - データベーススキーマ
- [app/lib/db.server.ts](../app/lib/db.server.ts) - データベース操作
