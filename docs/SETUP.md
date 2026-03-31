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

### 3. D1データベースのセットアップ

#### Wranglerのログイン

```bash
npx wrangler login
```

#### D1データベースの作成

```bash
npx wrangler d1 create mbt-db
```

#### データベースIDの設定

コマンドの出力からdatabase_idをコピーし、`wrangler.toml`を更新：

```toml
[[d1_databases]]
binding = "DB"
database_name = "mbt-db"
database_id = "your-database-id-here"  # ← ここを更新
```

#### ローカルマイグレーションの実行

```bash
npm run db:migrate:local
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

### 5. 初期データの作成（オプション）

アプリケーションを起動後、管理画面から事案を作成できます：

1. http://localhost:5173/admin にアクセス
2. 「新規事案作成」ボタンをクリック
3. フォームに入力して「作成」をクリック

データは **Cloudflare D1**（ローカルエミュレーション）に保存されます。

## Cloudflare Workersへのデプロイ

### 1. 本番用データベースのマイグレーション

```bash
npm run db:migrate:remote
```

### 2. ビルドとデプロイ

```bash
npm run deploy
```

> **注意**: `npm run deploy` は内部で `npm run build` を実行します。
> `build` コマンドを事前に別途実行する必要はありません。

### 3. D1データベースの確認

```bash
# ローカルで確認
npx wrangler d1 execute mbt-db --local --command="SELECT * FROM cases"

# 本番で確認
npx wrangler d1 execute mbt-db --remote --command="SELECT * FROM cases"
```

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

### D1データベースに接続できない

1. `wrangler.toml`のdatabase_idが正しいか確認
2. D1データベースが作成されているか確認：
   ```bash
   npx wrangler d1 list
   ```
3. マイグレーションが実行されているか確認：
   ```bash
   npm run db:migrate:local
   ```

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
# Cloudflare Workers開発モードで起動（wrangler必要）
npm run start
```

## 次のステップ

- [README.md](../README.md) - プロジェクト概要
- [migrations/](../migrations/) - データベーススキーマ
- [app/lib/db.server.ts](../app/lib/db.server.ts) - データベース操作
