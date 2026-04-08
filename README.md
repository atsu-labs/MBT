# MBT - マラソン・イベント管理システム

Cloudflare Workers + D1データベース + React Router v7（SSRモード）を使用した、マラソンやスポーツイベントの運営支援システムです。
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
  - 地図最大化レイアウト（地図が画面の大部分を占有）
  - 下部ナビバー（現在地 / タイムライン / 更新 / 事案一覧 / 使い方）
  - **事案一覧**: ボトムシート（90vh）で表示。新しい順にソート
  - **事案タップ**: 地図が対象事案へ自動フォーカス（`flyTo`）
  - **現在地ボタン**: GPS取得して地図を移動（権限拒否時はエラー表示）
  - **更新ボタン**: ページリロードなしでデータを再取得（revalidate）
  - **ズームFAB**: ＋/－ボタンで地図ズーム
  - 位置情報共有機能（パスコード認証付き）
    - 自身の位置を青色マーカー、他者の位置を紫色マーカーで表示
    - 1分間隔でのGPS取得によりバッテリー消費を最小化
    - `localStorage` によりバックグラウンド復帰後も自動再開
- ⏱️ **活動タイムライン**:
  - MBT1〜MBT17 の全スタッフの活動エリア・時間帯を時系列で表示
  - `/mobile/timeline` でモバイルからアクセス可能
  - データは `app/data/timeline.json` で JSON 管理（年1回程度更新）
  - vis-timeline ライブラリで滑らかなズーム・スクロールに対応
- 🗄️ **データ永続化**: Cloudflare D1（SQLiteベースのサーバーレスデータベース）
- 🚀 **高速デプロイ**: Cloudflare Workersで世界中のエッジから配信

## 技術スタック

- **フレームワーク**: React Router v7 (SSR モード)
- **UI**: React 19
- **地図**: Leaflet（動的インポート、SSR対応）
- **タイムライン**: vis-timeline（動的インポート、SSR対応）
- **データストレージ**: Cloudflare D1（SQLiteベースのサーバーレスデータベース）
- **ホスティング**: Cloudflare Workers
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
npm run db:migrate:local
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
2. 地図が画面全体に表示される
3. 下部ナビの「事案一覧」をタップするとボトムシートで一覧を表示（新しい順）
4. 一覧から事案をタップすると地図が自動的にその位置へ移動・強調表示
5. 右のズームFAB（＋/－）で地図をズームイン/アウト
6. 下部ナビの「現在地」をタップすると現在地へ地図が移動
7. 下部ナビの「更新」をタップするとデータを再取得（画面リロードなし）
8. 右上の位置共有アイコンをタップし、パスコードを入力すると自分の位置情報が地図に表示される
   - 自身の位置は青色マーカー、他者の位置は紫色マーカーで表示
   - 再度アイコンをタップすると共有を停止

### 活動タイムライン（モバイル）

1. モバイル閲覧画面の下部ナビにある「タイムライン」をタップ
2. MBT1〜MBT17 の全スタッフの活動エリアと時間帯がタイムライン形式で表示される
3. ピンチ操作またはスクロールで時間軸を拡大縮小
4. 各バーをタップするとツールチップで時間帯を確認できる
5. 「← 戻る」ボタンで閲覧画面に戻る（位置共有の状態は保持される）

## デプロイ

### Cloudflare Workersへのデプロイ

1. 本番環境用D1データベースのマイグレーション
```bash
npm run db:migrate:remote
```

2. ビルドとデプロイ（1コマンドで両方実行）
```bash
npm run deploy
```

> **注意**: `npm run deploy` は内部で `npm run build` を実行してからデプロイします。
> 事前に `npm run build` を単独で実行する必要はありません。

3. 位置情報共有のパスコードを環境変数に設定
```bash
npx wrangler secret put LOCATION_SHARE_PASSCODE
```
> `LOCATION_SHARE_PASSCODE` は、モバイル画面の「位置共有」機能を使用するために必要なパスコードです。
> 設定しない場合はデフォルト値 `dummy` が使用されます（本番環境では必ず設定してください）。

## プロジェクト構成

```
MBT/
├── app/
│   ├── components/          # Reactコンポーネント
│   │   ├── Map.tsx         # Leaflet地図コンポーネント（SSR対応）
│   │   └── CaseMarker.tsx  # 事案マーカーアイコン生成
│   ├── data/               # 静的データファイル
│   │   └── timeline.json   # タイムラインデータ（グループ・アイテム）
│   ├── lib/                # ユーティリティとビジネスロジック
│   │   ├── types.ts        # TypeScript型定義
│   │   ├── context.ts      # AppLoadContext型定義（Cloudflare Workers用）
│   │   ├── db.server.ts    # D1データベース操作
│   │   └── markers/        # マーカーデータ（GeoJSON）
│   │       ├── markers.ts  # 救護所、関門、エイド、AED
│   │       └── course.ts   # マラソンコース情報
│   ├── routes/             # ルート定義
│   │   ├── _index.tsx      # トップページ
│   │   ├── admin.tsx       # 管理画面レイアウト
│   │   ├── admin._index.tsx           # ダッシュボード
│   │   ├── admin.cases._index.tsx     # 事案一覧
│   │   ├── admin.cases.new.tsx        # 事案作成
│   │   ├── admin.cases.$id.tsx        # 事案詳細
│   │   ├── admin.cases.$id.edit.tsx   # 事案編集
│   │   ├── mobile.tsx                 # モバイル閲覧画面（地図最大化・ボトムシート・下部ナビ）
│   │   ├── mobile.help.tsx            # 使い方ページ（準備中）
│   │   ├── mobile.timeline.tsx        # 活動タイムライン画面
│   │   └── api.locations.ts           # 位置情報共有 REST API
│   ├── styles/             # スタイルシート
│   ├── root.tsx            # ルートコンポーネント
│   ├── entry.client.tsx    # クライアントエントリーポイント
│   ├── entry.server.tsx    # サーバーエントリーポイント
│   └── routes.ts           # ルート設定
├── docs/                   # ドキュメント
│   ├── SETUP.md           # セットアップガイド
│   ├── API.md             # API・データベース操作ドキュメント
│   ├── ARCHITECTURE.md    # システムアーキテクチャ
│   └── MARKERS.md         # マーカーデータの説明
├── workers/            # Cloudflare Workersエントリーポイント
│   └── app.ts         # Workers ESMエントリーポイント
├── migrations/             # D1データベースマイグレーション
│   ├── 0001_initial_schema.sql
│   └── 0002_add_user_locations.sql
├── wrangler.toml          # Cloudflare Workers設定
├── vite.config.ts         # Vite設定
├── tsconfig.json          # TypeScript設定
└── react-router.config.ts # React Router設定（SSRモード）
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

### user_locations テーブル

| カラム名 | 型 | 説明 |
|---------|-----|------|
| session_id | TEXT | 主キー（クライアント生成のセッションID） |
| user_name | TEXT | 共有中のユーザー名 |
| latitude | REAL | 緯度 |
| longitude | REAL | 経度 |
| updated_at | TIMESTAMP | 最終更新日時 |

## 開発

### 型チェック

```bash
npm run typecheck
```

### ローカルでのD1データベーステスト

```bash
# ローカルD1にマイグレーションを適用
npm run db:migrate:local

# データを確認
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
- **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** - コントリビューションガイド

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

詳細は [CONTRIBUTING.md](docs/CONTRIBUTING.md) をご覧ください。