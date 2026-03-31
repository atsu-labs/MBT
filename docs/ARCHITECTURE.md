# アーキテクチャドキュメント

このドキュメントでは、MBT（マラソン・イベント管理システム）の技術アーキテクチャについて説明します。

## システム概要

MBTは、マラソンやイベントの事案管理、コース情報、救護所・関門・エイド・AED位置などを地図上で管理・表示するWebアプリケーションです。

**現在の実装状態**: React Router v7 の SPA モード（`ssr: false`）で動作しており、データはブラウザの LocalStorage に保存されます。`db.server.ts` は将来の Cloudflare D1 移行に備えた実装として用意されています。

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
        │     React Router v7 (SPA モード)   │
        │    + React 19 フロントエンド        │
        └────────────────┬───────────────────┘
                         │
        ┌────────────────▼───────────────────┐
        │     ブラウザ LocalStorage          │
        │       (現在のデータストア)          │
        └────────────────────────────────────┘

        ※ 将来: Cloudflare Pages + D1 Database へ移行予定
```

## 技術スタック

### フロントエンド

- **React 19**: UIライブラリ
- **React Router v7**: フレームワーク（SPA モード、`ssr: false`）
  - `routes.ts` による明示的なルート設定（config-based routing）
  - クライアントサイドルーティング
  - データは `useState` + `useEffect` + LocalStorage で管理
- **Leaflet**: 地図表示ライブラリ（パフォーマンス最適化のためブラウザ側でのみ読み込み）
  - OpenStreetMapタイルレイヤー
  - カスタムマーカーとポップアップ
  - GeoJSONサポート

### バックエンド（将来予定）

現在は SPA モードのため、本格的なサーバーサイド処理はありません。
将来の移行に備えた実装として以下が用意されています：

- **Cloudflare Pages**: ホスティングプラットフォーム
- **Cloudflare D1**: SQLiteベースのサーバーレスデータベース（`db.server.ts` 実装済み）
- **Cloudflare Functions**: サーバーサイド処理（React Routerのaction/loader）

### 開発ツール

- **TypeScript**: 型安全性
- **Vite**: ビルドツール
- **Wrangler**: Cloudflare開発CLI

## ディレクトリ構造

```
MBT/
├── app/                          # アプリケーションコード
│   ├── components/               # Reactコンポーネント
│   │   ├── Map.tsx              # Leaflet地図コンポーネント
│   │   └── CaseMarker.tsx       # 事案マーカーアイコン生成
│   ├── lib/                     # ユーティリティとロジック
│   │   ├── db.server.ts         # D1データベース操作（将来用）
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
├── migrations/                  # D1データベースマイグレーション（将来用）
│   └── 0001_initial_schema.sql
├── docs/                        # ドキュメント
├── wrangler.toml               # Cloudflare設定
├── vite.config.ts              # Vite設定
├── tsconfig.json               # TypeScript設定
└── react-router.config.ts      # React Router設定（ssr: false）
```

## データフロー

**現在の実装（SPA + LocalStorage）**

### 読み取り操作

```
1. ユーザーがページにアクセス
   ↓
2. React Routerがクライアントでルートをマッチング
   ↓
3. コンポーネントがマウント（useEffect実行）
   ↓
4. localStorage.getItem("cases") でデータ取得
   ↓
5. setState でReactの状態を更新
   ↓
6. Reactコンポーネントが再レンダリング
```

### 書き込み操作

```
1. ユーザーがフォームを送信
   ↓
2. onSubmit ハンドラが実行（クライアントサイド）
   ↓
3. フォームデータを検証
   ↓
4. localStorage.setItem("cases", JSON.stringify(cases)) でデータ保存
   ↓
5. useNavigate でページ遷移
```

**将来の実装（Cloudflare Pages + D1）**

`db.server.ts` に D1 向けの CRUD 関数が実装済みです。
SSR モードへ移行する際は、各ルートに `loader`/`action` 関数を追加し、
localStorage の代わりに D1 API を使用します。

## コンポーネント設計

### Map.tsx（地図コンポーネント）

**責務:**
- Leaflet地図の初期化と管理
- 事案マーカーの表示
- 固定マーカー（救護所、関門、エイド、AED）の表示
- コースラインの表示
- 地図クリックイベントの処理

**主要機能:**
1. **動的Leaflet読み込み**: SSR対応のため、ブラウザ側でのみLeafletを読み込み
2. **マーカー管理**: ES6 Mapを使用してマーカーを効率的に管理
3. **レイヤーコントロール**: 各種マーカーとコースの表示/非表示を切り替え
4. **カスタムアイコン**: 優先度に応じた色分けとサイズ調整
5. **ポップアップ**: 事案詳細情報の表示

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

各ルートコンポーネントは以下のパターンに従います（SPA モード）：

```typescript
// useState / useEffect でデータ管理（SPAパターン）
export default function Component() {
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    // LocalStorage からデータを読み込み
    const stored = localStorage.getItem("cases");
    if (stored) {
      setCases(JSON.parse(stored));
    }
  }, []);

  const handleCreate = (newCase: NewCase) => {
    const updated = [...cases, newCase];
    localStorage.setItem("cases", JSON.stringify(updated));
    setCases(updated);
  };

  return <div>{/* UI */}</div>;
}
```

> **将来の移行計画**: Cloudflare D1 + SSR モードへ移行する際は、
> 上記パターンを以下のような `loader`/`action` パターンに置き換えます：
>
> ```typescript
> export async function loader({ context }: Route.LoaderArgs) {
>   const db = context.cloudflare.env.DB;
>   const cases = await getAllCases(db);
>   return { cases };
> }
>
> export async function action({ request, context }: Route.ActionArgs) {
>   const formData = await request.formData();
>   const db = context.cloudflare.env.DB;
>   // db.server.ts の関数を使用
>   return redirect("/success");
> }
> ```

## データベース設計

### casesテーブル

マラソンイベント中の事案（トラブル、救護要請など）を管理します。
`migrations/0001_initial_schema.sql` に定義済みで、D1 移行時に使用します。

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
2. **マーカー管理**: ES6 Mapでマーカーを管理し、効率的な追加・削除を実現
3. **条件付きレンダリング**: ローディング状態を表示し、UX向上

### サーバーサイド

1. **データベースインデックス**: 頻繁に検索するカラムにインデックスを作成
2. **最小限のデータ転送**: 必要なデータのみをクエリ
3. **エッジコンピューティング**: Cloudflare Pagesで世界中のエッジから配信

## セキュリティ

1. **SQLインジェクション対策**: すべてのクエリでバインドパラメータを使用
2. **型安全性**: TypeScriptで実装し、実行時エラーを最小化
3. **環境変数**: 機密情報は環境変数で管理
4. **HTTPS**: Cloudflare Pagesは自動的にHTTPSを提供

## スケーラビリティ

1. **サーバーレス**: Cloudflare Pagesは自動スケーリング
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

- **静的ファイル**: Cloudflare Pages
- **データストレージ**: ブラウザ LocalStorage（本番環境でも各ユーザーのブラウザに保存）
- **将来**: Cloudflare D1 + サーバーサイド処理へ移行予定

### CI/CD

GitHub連携により、mainブランチへのプッシュで自動デプロイが可能です。

## 開発環境

### ローカル開発

```bash
npm run dev
# ↓
# React Router Dev サーバー起動（SPAモード）
# ↓
# http://localhost:5173 でアクセス
```

開発サーバーは以下の機能を提供：
- ホットモジュールリプレースメント（HMR）
- 自動リロード
- TypeScript型チェック
- エラーオーバーレイ

### データストレージ

現在はブラウザの **LocalStorage** を使用してデータを保存しています。
データはブラウザごとに独立しており、サーバーへの送受信は行いません。

将来的には Cloudflare D1 + SSR への移行が計画されています。
`app/lib/db.server.ts` に移行用の CRUD 実装が既に用意されています。

## トラブルシューティング

### よくある問題

1. **Leafletが表示されない**
   - SSRとの互換性問題: `useEffect`内で動的読み込みを確認
   - CSS読み込み: Leaflet CSSが正しく読み込まれているか確認

2. **D1接続エラー**
   - `wrangler.toml`のdatabase_idを確認
   - マイグレーションが実行されているか確認

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
- [Cloudflare Pagesドキュメント](https://developers.cloudflare.com/pages/)
- [Cloudflare D1ドキュメント](https://developers.cloudflare.com/d1/)
- [Leafletドキュメント](https://leafletjs.com/)
