# MBT - 事案管理システム

Cloudflare Pages + D1データベース + Remix（React Router v7）を使用した、位置情報ベースの事案管理システムです。

## 主な機能

- 📍 Leafletを使用した地図上での事案表示
- 💼 PC向け管理画面（CRUD操作対応）
- 📱 モバイル向け閲覧画面
- 🗄️ Cloudflare D1データベースによるデータ永続化
- 🚀 Cloudflare Pagesへのデプロイ対応

## 技術スタック

- **フレームワーク**: React Router v7 (旧 Remix)
- **UI**: React 19
- **地図**: Leaflet + React-Leaflet
- **データベース**: Cloudflare D1 (SQLite)
- **ホスティング**: Cloudflare Pages
- **開発言語**: TypeScript

## セットアップ

### 前提条件

- Node.js 20以上
- npm または yarn
- Cloudflareアカウント

### インストール

1. リポジトリのクローン
```bash
git clone <repository-url>
cd MBT
```

2. 依存関係のインストール
```bash
npm install
```

### Cloudflare D1データベースの設定

1. Wranglerにログイン
```bash
npx wrangler login
```

2. D1データベースの作成
```bash
npx wrangler d1 create mbt-db
```

3. 出力されたdatabase_idをコピーし、`wrangler.toml`の`database_id`を更新

4. マイグレーションの実行
```bash
npx wrangler d1 execute mbt-db --file=./migrations/0001_initial_schema.sql
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

## 使用方法

### 管理画面（PC）

1. トップページから「管理画面へ」をクリック
2. ダッシュボードで統計情報と地図を確認
3. 「事案管理」から事案の作成・編集・削除が可能
4. 地図上をクリックして位置を設定

### 閲覧画面（モバイル）

1. トップページから「閲覧画面へ」をクリック
2. 地図上で全ての事案を確認
3. フィルターでステータス別に絞り込み
4. リストから事案を選択して詳細を確認

## デプロイ

### Cloudflare Pagesへのデプロイ

1. ビルド
```bash
npm run build
```

2. 本番環境用D1データベースの作成とマイグレーション
```bash
npx wrangler d1 create mbt-db-production
npx wrangler d1 execute mbt-db-production --file=./migrations/0001_initial_schema.sql
```

3. デプロイ
```bash
npm run deploy
```

または、GitHub連携を使用して自動デプロイ設定も可能です。

### Cloudflare Pagesのプロジェクト設定

1. Cloudflare Dashboardでプロジェクトを作成
2. ビルド設定:
   - ビルドコマンド: `npm run build`
   - ビルド出力ディレクトリ: `build/client`
   - ノードバージョン: 20
3. 環境変数とD1バインディングを設定

## プロジェクト構成

```
MBT/
├── app/
│   ├── components/       # Reactコンポーネント
│   │   └── Map.tsx      # Leaflet地図コンポーネント
│   ├── lib/             # ユーティリティ
│   │   ├── types.ts     # TypeScript型定義
│   │   └── db.server.ts # D1データベース操作
│   ├── routes/          # ルート定義
│   │   ├── _index.tsx   # トップページ
│   │   ├── admin.tsx    # 管理画面レイアウト
│   │   ├── admin._index.tsx           # ダッシュボード
│   │   ├── admin.cases._index.tsx     # 事案一覧
│   │   ├── admin.cases.new.tsx        # 事案作成
│   │   ├── admin.cases.$id.tsx        # 事案詳細
│   │   ├── admin.cases.$id.edit.tsx   # 事案編集
│   │   └── mobile.tsx                 # モバイル閲覧画面
│   ├── styles/          # スタイルシート
│   ├── root.tsx         # ルートコンポーネント
│   ├── entry.client.tsx # クライアントエントリーポイント
│   └── entry.server.tsx # サーバーエントリーポイント
├── migrations/          # D1データベースマイグレーション
├── public/             # 静的ファイル
├── wrangler.toml       # Cloudflare設定
├── vite.config.ts      # Vite設定
├── tsconfig.json       # TypeScript設定
└── react-router.config.ts # React Router設定
```

## データベーススキーマ

### cases テーブル

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | INTEGER | 主キー |
| title | TEXT | 事案タイトル |
| description | TEXT | 事案の説明 |
| latitude | REAL | 緯度 |
| longitude | REAL | 経度 |
| status | TEXT | ステータス (open/closed) |
| priority | TEXT | 優先度 (high/medium/low) |
| created_at | DATETIME | 作成日時 |
| updated_at | DATETIME | 更新日時 |

## 開発

### 型チェック

```bash
npm run typecheck
```

### ローカルでのD1データベーステスト

```bash
npx wrangler d1 execute mbt-db --local --command="SELECT * FROM cases"
```

## ライセンス

ISC

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。