# アーキテクチャドキュメント

このドキュメントでは、MBT（マラソン・イベント管理システム）の技術アーキテクチャについて説明します。

## システム概要

MBTは、マラソンやイベントの事案管理、コース情報、救護所・関門・エイド・AED位置などを地図上で管理・表示するWebアプリケーションです。

**現在の実装状態**: React Router v7 の SSR モード（`ssr: true`）で動作しており、データは Cloudflare D1 に保存されます。

### 主要コンポーネント

```
┌─────────────────────────────────────────────────────────┐
│                      ユーザー                             │
└───────────────┬─────────────────┬───────────────────────┘
                │                 │
        ┌───────▼────┐    ┌──────▼──────┐
        │ PC管理画面  │    │ モバイル閲覧 │
        └───────┬────┘    └──────┬──────┘
                │                 │
                └────────┬────────┘
                         │
        ┌────────────────▼───────────────────┐
        │   React Router v7 (SSR モード)     │
        │   Cloudflare Workers               │
        └────────────────┬───────────────────┘
                         │
        ┌────────────────▼───────────────────┐
        │     Cloudflare D1 Database         │
        │     (SQLiteベースのサーバーレスDB)   │
        └────────────────────────────────────┘
```

## 技術スタック

### フロントエンド

- **React 19**: UIライブラリ
- **React Router v7**: フレームワーク（SSR モード、`ssr: true`）
  - `routes.ts` による明示的なルート設定（config-based routing）
  - サーバーサイドレンダリング（SSR）
  - `loader` / `action` によるサーバーサイドデータ操作
- **Leaflet**: 地図表示ライブラリ（SSR対応のため動的インポートで読み込み）
  - OpenStreetMapタイルレイヤー
  - カスタムマーカーとポップアップ
  - GeoJSONサポート

### バックエンド

- **Cloudflare Workers**: サーバーレスエッジ実行環境（`workers/app.ts` がエントリーポイント）
- **Cloudflare D1**: SQLiteベースのサーバーレスデータベース
- **React Router loader/action**: サーバーサイドデータ取得・更新

### 開発ツール

- **TypeScript**: 型安全性
- **Vite**: ビルドツール
- **Wrangler**: Cloudflare開発CLI

## ディレクトリ構造

```
MBT/
├── app/                          # アプリケーションコード
│   ├── components/               # Reactコンポーネント
│   │   ├── Map.tsx              # Leaflet地図コンポーネント（SSR対応）
│   │   └── CaseMarker.tsx       # 事案マーカーアイコン生成
│   ├── lib/                     # ユーティリティとロジック
│   │   ├── context.ts           # AppLoadContext型定義（Cloudflare Workers用、DB・ASSETSバインディング含む）
│   │   ├── db.server.ts         # D1データベース操作
│   │   ├── types.ts             # TypeScript型定義
│   │   └── markers/             # マーカーデータ（GeoJSON）
│   │       ├── markers.ts       # 救護所、関門、エイド、AED
│   │       └── course.ts        # コース情報
│   ├── routes/                  # ルート定義
│   │   ├── _index.tsx           # トップページ
│   │   ├── admin.tsx            # 管理画面レイアウト
│   │   ├── admin._index.tsx     # ダッシュボード
│   │   ├── admin.cases._index.tsx    # 事案一覧
│   │   ├── admin.cases.new.tsx       # 事案作成
│   │   ├── admin.cases.$id.tsx       # 事案詳細
│   │   ├── admin.cases.$id.edit.tsx  # 事案編集
│   │   └── mobile.tsx                # モバイル閲覧画面
│   ├── styles/                  # スタイルシート
│   ├── root.tsx                 # ルートコンポーネント
│   ├── entry.client.tsx         # クライアントエントリーポイント
│   ├── entry.server.tsx         # サーバーエントリーポイント
│   └── routes.ts                # ルート設定（config-based routing）
├── workers/                     # Cloudflare Workersエントリーポイント
│   └── app.ts                   # Workers ESMエントリーポイント
├── migrations/                  # D1データベースマイグレーション
│   └── 0001_initial_schema.sql
├── docs/                        # ドキュメント
├── wrangler.toml               # Cloudflare Workers設定
├── vite.config.ts              # Vite設定
├── tsconfig.json               # TypeScript設定
└── react-router.config.ts      # React Router設定（ssr: true）
```

## データフロー

### 読み取り操作（loader）

```
1. ユーザーがページにアクセス
   ↓
2. Cloudflare Workers が React Router の loader を実行
   ↓
3. loader が db.server.ts の関数（例: getAllCases）を呼び出し
   ↓
4. D1 データベースからデータ取得
   ↓
5. React Router が SSR でHTMLを生成し、データをクライアントに送信
   ↓
6. クライアント側で useLoaderData() によりデータを利用
```

### 書き込み操作（action）

```
1. ユーザーがフォームを送信
   ↓
2. <Form method="post"> が HTTP POST リクエストを送信
   ↓
3. Cloudflare Workers が React Router の action を実行
   ↓
4. action が db.server.ts の関数（例: createCase）を呼び出し
   ↓
5. D1 データベースにデータ保存
   ↓
6. redirect() でページ遷移
```

## コンポーネント設計

### Map.tsx（地図コンポーネント）

**責務:**
- Leaflet地図の初期化と管理
- 事案マーカーの表示
- 固定マーカー（救護所、関門、エイド、AED）の表示
- コースラインの表示
- 地図クリックイベントの処理

**主要機能:**
1. **動的Leaflet読み込み**: SSR対応のため、`useEffect` 内でのみLeafletを動的インポート
2. **Leafletモジュール保持**: `useRef` で Leafletモジュールを保持し、`window.L` への依存を排除
3. **マーカー管理**: ES6 Mapを使用してマーカーを効率的に管理
4. **レイヤーコントロール**: 各種マーカーとコースの表示/非表示を切り替え
5. **カスタムアイコン**: 優先度に応じた色分けとサイズ調整
6. **ポップアップ**: 事案詳細情報の表示

**Props:**
```typescript
interface MapProps {
  cases?: Case[];                    // 表示する事案の配列
  center?: [number, number];         // 地図の中心座標
  zoom?: number;                     // ズームレベル
  onMapClick?: (lat: number, lng: number) => void;  // 地図クリック時のコールバック
  selectedCaseId?: number;           // 選択中の事案ID
}
```

### ルートコンポーネント

各ルートコンポーネントは以下のパターンに従います（SSR + D1 パターン）：

```typescript
// loader でサーバーサイドからデータを取得
export async function loader({ context }: Route.LoaderArgs) {
  const cases = await getAllCases(context.cloudflare.env.DB);
  return { cases };
}

// action でサーバーサイドにデータを書き込み
export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  await createCase(context.cloudflare.env.DB, {
    title: formData.get("title") as string,
    // ...
  });
  return redirect("/admin/cases");
}

// コンポーネントは useLoaderData でデータを利用
export default function Component() {
  const { cases } = useLoaderData<typeof loader>();
  return <div>{/* UI */}</div>;
}
```

## データベース設計

### casesテーブル

マラソンイベント中の事案（トラブル、救護要請など）を管理します。
`migrations/0001_initial_schema.sql` に定義されています。

**カラム:**
- `id`: 主キー（自動採番）
- `title`: 事案タイトル（必須）
- `description`: 詳細説明（オプション）
- `latitude`: 緯度（必須）
- `longitude`: 経度（必須）
- `status`: ステータス（"open" | "closed"）
- `priority`: 優先度（"high" | "medium" | "low"）
- `created_at`: 作成日時
- `updated_at`: 更新日時

**インデックス:**
- `idx_cases_status`: ステータスでの検索最適化
- `idx_cases_created_at`: 時系列でのソート最適化

## マーカーデータ（GeoJSON）

### markers.ts

以下の固定マーカーデータを定義：
- **救護所（firstAid）**: 赤色マーカー
- **関門（gate）**: オレンジ色マーカー
- **エイド（aid）**: 緑色マーカー
- **AED**: 青色マーカー

各マーカーは以下の情報を持ちます：
```json
{
  "type": "Feature",
  "properties": {
    "name": "表示名",
    "comment": "コメント（オプション）"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [経度, 緯度]
  }
}
```

### course.ts

マラソンコースを線で表示します：
```json
{
  "type": "Feature",
  "properties": {
    "name": "区間名",
    "_color": "#000000",
    "_opacity": 0.7,
    "_weight": 10
  },
  "geometry": {
    "type": "LineString",
    "coordinates": [[経度, 緯度], ...]
  }
}
```

## パフォーマンス最適化

### クライアントサイド

1. **動的インポート**: Leafletはクライアントサイドのみで読み込み（SSR対応）
2. **useRef でLeafletを保持**: `window.L` グローバル依存を排除し安定性向上
3. **マーカー管理**: ES6 Mapでマーカーを管理し、効率的な追加・削除を実現
4. **条件付きレンダリング**: ローディング状態を表示し、UX向上

### サーバーサイド

1. **SSRによる初期表示高速化**: サーバーでHTMLを生成して送信
2. **データベースインデックス**: 頻繁に検索するカラムにインデックスを作成
3. **最小限のデータ転送**: 必要なデータのみをクエリ
4. **エッジコンピューティング**: Cloudflare Workersで世界中のエッジから処理

## セキュリティ

1. **SQLインジェクション対策**: すべてのクエリでバインドパラメータを使用
2. **型安全性**: TypeScriptで実装し、実行時エラーを最小化
3. **サーバーサイドバリデーション**: `loader`/`action` で入力値を検証（タイトル必須、緯度経度NaN検証など）
4. **環境変数**: 機密情報は環境変数で管理
5. **HTTPS**: Cloudflare Workersは自動的にHTTPSを提供

## スケーラビリティ

1. **サーバーレス**: Cloudflare Workersは自動スケーリング
2. **エッジキャッシング**: 静的アセットはエッジでキャッシュ
3. **D1データベース**: 自動的にレプリケーション
4. **グローバル配信**: Cloudflareのグローバルネットワークを活用

## デプロイメント

### ビルドプロセス

```bash
npm run build
# ↓
# Viteがアプリケーションをビルド
# ↓
# build/client/ に静的ファイル生成
# build/server/ にサーバーコード生成
```

### デプロイ先

- **サーバーサイド処理**: Cloudflare Workers（`workers/app.ts` → ビルド後は `build/server/`）
- **静的アセット**: Cloudflare Workers Assets（`build/client/`）
- **データストレージ**: Cloudflare D1

### CI/CD

GitHub連携により、mainブランチへのプッシュで自動デプロイが可能です。

## 開発環境

### ローカル開発

```bash
npm run dev
# ↓
# React Router Dev サーバー起動（SSRモード）
# Cloudflare D1 ローカルエミュレーション
# ↓
# http://localhost:5173 でアクセス
```

開発サーバーは以下の機能を提供：
- ホットモジュールリプレースメント（HMR）
- 自動リロード
- TypeScript型チェック
- エラーオーバーレイ
- D1ローカルエミュレーション（`wrangler` 経由）

### データストレージ

Cloudflare D1 ローカルエミュレーションを使用してデータを保存します。
`npm run db:migrate:local` でローカルDBにスキーマを適用してください。

## トラブルシューティング

### よくある問題

1. **Leafletが表示されない**
   - SSRとの互換性問題: `useEffect`内で動的読み込みを確認
   - CSS読み込み: Leaflet CSSが正しく読み込まれているか確認

2. **D1接続エラー**
   - `wrangler.toml`のdatabase_idを確認
   - マイグレーションが実行されているか確認（`npm run db:migrate:local`）

3. **ビルドエラー**
   - `node_modules`と`.react-router`を削除して再インストール
   - TypeScript型エラーを確認

## 今後の拡張可能性

1. **リアルタイム更新**: WebSocketsまたはServer-Sent Eventsで事案の即時更新
2. **認証・認可**: 管理画面へのアクセス制御
3. **通知機能**: 新規事案や優先度の高い事案の通知
4. **データエクスポート**: CSV/JSON形式でのデータエクスポート
5. **モバイルアプリ**: Progressive Web App（PWA）化

## 参考リンク

- [React Router v7ドキュメント](https://reactrouter.com/)
- [Cloudflare Workersドキュメント](https://developers.cloudflare.com/workers/)
- [Cloudflare D1ドキュメント](https://developers.cloudflare.com/d1/)
- [Leafletドキュメント](https://leafletjs.com/)
