# MBT - マラソン・イベント管理システム

Cloudflare Pages + D1データベース + React Router v7を使用した、マラソンやスポーツイベントの運営支援システムです。
地図上でコース情報、救護所、関門、エイドステーション、AED設置場所を管理し、リアルタイムで発生する事案を追跡できます。

## 主な機能

- 🗺️ **地図表示**: Leafletを使用した高機能な地図インターフェース
  - マラソンコースの表示
  - 救護所・関門・エイド・AED位置の可視化
  - レイヤー切り替えで表示内容をカスタマイズ
- 📋 **事案管理**: リアルタイムでトラブル・事案を記録
  - 優先度別の色分け表示（高/中/低）
  - ステータス管理（対応中/完了）
  - 地図上で位置を特定
- 💼 **PC向け管理画面**: 
  - ダッシュボードで統計情報を確認
  - 事案のCRUD操作（作成・読取・更新・削除）
  - 地図上での直感的な位置設定
- 📱 **モバイル向け閲覧画面**: 
  - 現場スタッフ向けの簡潔なUI
  - フィルター機能でステータス別に絞り込み
  - リスト表示と地図表示の切り替え
- 🗄️ **データ永続化**: Cloudflare D1データベース（SQLite互換）
- 🚀 **高速デプロイ**: Cloudflare Pagesで世界中にエッジ配信

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
│   ├── components/          # Reactコンポーネント
│   │   └── Map.tsx         # Leaflet地図コンポーネント
│   ├── lib/                # ユーティリティとビジネスロジック
│   │   ├── types.ts        # TypeScript型定義
│   │   ├── db.server.ts    # D1データベース操作
│   │   └── markers/        # マーカーデータ（GeoJSON）
│   │       ├── markers.ts  # 救護所、関門、エイド、AED
│   │       └── course.ts   # マラソンコース情報
│   ├── routes/             # ルート定義（ファイルベースルーティング）
│   │   ├── _index.tsx      # トップページ
│   │   ├── admin.tsx       # 管理画面レイアウト
│   │   ├── admin._index.tsx           # ダッシュボード
│   │   ├── admin.cases._index.tsx     # 事案一覧
│   │   ├── admin.cases.new.tsx        # 事案作成
│   │   ├── admin.cases.$id.tsx        # 事案詳細
│   │   ├── admin.cases.$id.edit.tsx   # 事案編集
│   │   └── mobile.tsx                 # モバイル閲覧画面
│   ├── styles/             # スタイルシート
│   ├── root.tsx            # ルートコンポーネント
│   ├── entry.client.tsx    # クライアントエントリーポイント
│   └── entry.server.tsx    # サーバーエントリーポイント
├── docs/                   # ドキュメント
│   ├── SETUP.md           # セットアップガイド
│   ├── API.md             # API・データベース操作ドキュメント
│   ├── ARCHITECTURE.md    # システムアーキテクチャ
│   └── MARKERS.md         # マーカーデータの説明
├── migrations/             # D1データベースマイグレーション
│   └── 0001_initial_schema.sql
├── public/                 # 静的ファイル
├── wrangler.toml          # Cloudflare設定
├── vite.config.ts         # Vite設定
├── tsconfig.json          # TypeScript設定
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

## ドキュメント

詳細なドキュメントは `docs/` ディレクトリに用意されています：

- **[SETUP.md](docs/SETUP.md)** - セットアップガイド（環境構築からデプロイまで）
- **[API.md](docs/API.md)** - データベースAPI・ルート定義の詳細
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - システムアーキテクチャと技術スタック
- **[MARKERS.md](docs/MARKERS.md)** - マーカーデータ（GeoJSON）の説明と編集方法

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。