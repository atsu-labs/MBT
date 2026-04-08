# API ドキュメント

このドキュメントでは、MBTシステムで使用されるデータ操作の関数とルート構造について説明します。

## db.server.ts（D1データベースAPI）

すべてのデータベース操作は `app/lib/db.server.ts` で定義されています。
各ルートの `loader`/`action` から呼び出されます。

### 型定義

```typescript
interface Env {
  DB: D1Database;
}

interface Case {
  id: number;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  status: CaseStatus;        // "open" | "closed"
  priority: CasePriority;    // "high" | "medium" | "low"
  created_at: string;
  updated_at: string;
}

interface UserLocation {
  session_id: string;   // クライアント生成のセッションID
  user_name: string;    // 共有中のユーザー名
  latitude: number;     // 緯度
  longitude: number;    // 経度
  updated_at: string;   // 最終更新日時
}
```

### 関数一覧

#### getAllCases

すべての事案を取得します。作成日時の降順でソートされます。

```typescript
async function getAllCases(db: D1Database): Promise<Case[]>
```

**パラメータ:**
- `db`: D1Database - Cloudflare D1データベースインスタンス

**戻り値:**
- `Promise<Case[]>` - すべての事案の配列

**使用例:**
```typescript
export async function loader({ context }: Route.LoaderArgs) {
  const cases = await getAllCases(context.cloudflare.env.DB);
  return { cases };
}
```

#### getCaseById

IDを指定して特定の事案を取得します。

```typescript
async function getCaseById(db: D1Database, id: number): Promise<Case | null>
```

**パラメータ:**
- `db`: D1Database - Cloudflare D1データベースインスタンス
- `id`: number - 事案のID

**戻り値:**
- `Promise<Case | null>` - 事案が見つかった場合はCaseオブジェクト、見つからない場合はnull

**使用例:**
```typescript
export async function loader({ params, context }: Route.LoaderArgs) {
  const id = parseInt(params.id!);
  const caseItem = await getCaseById(context.cloudflare.env.DB, id);
  if (!caseItem) {
    throw new Response("Not Found", { status: 404 });
  }
  return { caseItem };
}
```

#### createCase

新しい事案を作成します。

```typescript
async function createCase(db: D1Database, newCase: NewCase): Promise<Case>
```

**パラメータ:**
- `db`: D1Database - Cloudflare D1データベースインスタンス
- `newCase`: NewCase - 新規事案のデータ
  ```typescript
  interface NewCase {
    title: string;              // 必須
    description?: string;       // オプション
    latitude: number;           // 必須
    longitude: number;          // 必須
    status?: CaseStatus;        // オプション（デフォルト: "open"）
    priority?: CasePriority;    // オプション（デフォルト: "medium"）
  }
  ```

**戻り値:**
- `Promise<Case>` - 作成された事案（IDと作成日時が含まれる）

**エラー:**
- 作成に失敗した場合は `Error("Failed to create case")` をスロー

**使用例:**
```typescript
export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  await createCase(context.cloudflare.env.DB, {
    title: formData.get("title") as string,
    description: formData.get("description") as string || undefined,
    latitude: parseFloat(formData.get("latitude") as string),
    longitude: parseFloat(formData.get("longitude") as string),
    status: (formData.get("status") as CaseStatus) || "open",
    priority: (formData.get("priority") as CasePriority) || "medium",
  });
  return redirect("/admin/cases");
}
```

#### updateCase

既存の事案を更新します。

```typescript
async function updateCase(
  db: D1Database,
  id: number,
  updates: UpdateCase
): Promise<Case | null>
```

**パラメータ:**
- `db`: D1Database - Cloudflare D1データベースインスタンス
- `id`: number - 更新する事案のID
- `updates`: UpdateCase - 更新するフィールド（すべてオプション）
  ```typescript
  interface UpdateCase {
    title?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    status?: CaseStatus;
    priority?: CasePriority;
  }
  ```

**戻り値:**
- `Promise<Case | null>` - 更新された事案、見つからない場合はnull

**動作:**
- 指定されたフィールドのみを更新します
- `updated_at` は自動的に現在時刻に更新されます
- 更新するフィールドがない場合は、現在の事案をそのまま返します

**使用例:**
```typescript
export async function action({ params, request, context }: Route.ActionArgs) {
  const id = parseInt(params.id!);
  const formData = await request.formData();
  await updateCase(context.cloudflare.env.DB, id, {
    title: formData.get("title") as string,
    status: formData.get("status") as CaseStatus,
    priority: formData.get("priority") as CasePriority,
  });
  return redirect(`/admin/cases/${id}`);
}
```

#### deleteCase

事案を削除します。

```typescript
async function deleteCase(db: D1Database, id: number): Promise<boolean>
```

**パラメータ:**
- `db`: D1Database - Cloudflare D1データベースインスタンス
- `id`: number - 削除する事案のID

**戻り値:**
- `Promise<boolean>` - 削除が成功した場合はtrue、失敗した場合はfalse

**使用例:**
```typescript
export async function action({ params, context }: Route.ActionArgs) {
  const id = parseInt(params.id!);
  await deleteCase(context.cloudflare.env.DB, id);
  return redirect("/admin/cases");
}
```

#### upsertLocation

ユーザーの位置情報を登録または更新します（INSERT OR UPDATE）。

```typescript
async function upsertLocation(
  db: D1Database,
  sessionId: string,
  userName: string,
  latitude: number,
  longitude: number
): Promise<UserLocation>
```

**パラメータ:**
- `db`: D1Database - Cloudflare D1データベースインスタンス
- `sessionId`: string - クライアント側で生成したセッションID（PRIMARY KEY）
- `userName`: string - 表示するユーザー名
- `latitude`: number - 緯度
- `longitude`: number - 経度

**戻り値:**
- `Promise<UserLocation>` - 保存された位置情報

**エラー:**
- 保存に失敗した場合は `Error("Failed to upsert location")` をスロー

#### deleteLocation

ユーザーの位置情報を削除します（共有オフ時に呼び出す）。

```typescript
async function deleteLocation(db: D1Database, sessionId: string): Promise<boolean>
```

**パラメータ:**
- `db`: D1Database - Cloudflare D1データベースインスタンス
- `sessionId`: string - 削除するセッションID

**戻り値:**
- `Promise<boolean>` - 削除が成功した場合はtrue、失敗した場合はfalse

#### getActiveLocations

過去10分以内に更新されたアクティブな位置情報をすべて取得します。

```typescript
async function getActiveLocations(db: D1Database): Promise<UserLocation[]>
```

**パラメータ:**
- `db`: D1Database - Cloudflare D1データベースインスタンス

**戻り値:**
- `Promise<UserLocation[]>` - アクティブな位置情報の配列

## ルート構造

ルートは `app/routes.ts` で明示的に定義されています（config-based routing）。
各ルートはサーバーサイドの `loader`/`action` を持ちます。

### 管理画面ルート

| メソッド | パス | 処理 |
|---------|------|------|
| `GET` | `/admin` | `loader`: `getAllCases` → ダッシュボード表示 |
| `GET` | `/admin/cases` | `loader`: `getAllCases` → 事案一覧表示 |
| `POST` | `/admin/cases` | `action`: `deleteCase` → 事案削除後リダイレクト |
| `GET` | `/admin/cases/new` | 新規事案作成フォーム表示 |
| `POST` | `/admin/cases/new` | `action`: `createCase` → 作成後 `/admin/cases` へリダイレクト |
| `GET` | `/admin/cases/:id` | `loader`: `getCaseById` → 事案詳細表示 |
| `POST` | `/admin/cases/:id` | `action`: `deleteCase` → 削除後 `/admin/cases` へリダイレクト |
| `GET` | `/admin/cases/:id/edit` | `loader`: `getCaseById` → 事案編集フォーム表示 |
| `POST` | `/admin/cases/:id/edit` | `action`: `updateCase` → 更新後 `/admin/cases/:id` へリダイレクト |

### モバイル閲覧ルート

| メソッド | パス | 処理 |
|---------|------|------|
| `GET` | `/mobile` | `loader`: `getAllCases` → モバイル閲覧画面表示 |

### 位置情報 API ルート

`app/routes/api.locations.ts` で定義されています。

| メソッド | パス | 処理 |
|---------|------|------|
| `GET` | `/api/locations` | `loader`: `getActiveLocations` → アクティブな位置情報一覧をJSONで返す |
| `POST` | `/api/locations` | `action`: パスコード認証後に `upsertLocation` → 位置情報を登録・更新 |
| `DELETE` | `/api/locations` | `action`: `deleteLocation` → 指定セッションの位置情報を削除 |

#### POST /api/locations のリクエストパラメータ（FormData）

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `passcode` | ✅ | 環境変数 `LOCATION_SHARE_PASSCODE` と照合するパスコード |
| `sessionId` | ✅ | クライアント側で生成したセッションID |
| `userName` | ✅ | 地図上に表示するユーザー名 |
| `latitude` | ✅ | 緯度（数値文字列） |
| `longitude` | ✅ | 経度（数値文字列） |

#### DELETE /api/locations のリクエストパラメータ（FormData）

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `sessionId` | ✅ | 削除するセッションID |

## データベーススキーマ

### cases テーブル

```sql
CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at);
```

### インデックス（casesテーブル）

- `idx_cases_status` - ステータスでの検索を高速化
- `idx_cases_created_at` - 作成日時でのソートを高速化

### user_locations テーブル

```sql
CREATE TABLE IF NOT EXISTS user_locations (
  session_id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

位置情報の共有を有効にしているユーザーのセッションを保存します。
`getActiveLocations` では `updated_at >= datetime('now', '-10 minutes')` の条件でアクティブなレコードのみを取得します。

## エラーハンドリング

各 `loader`/`action` でサーバーサイドバリデーションを実施しています：

1. **404エラー**: `getCaseById` でIDが見つからない場合 → `throw new Response("Not Found", { status: 404 })`
2. **バリデーションエラー**: タイトル未入力、緯度経度が数値でない場合 → 400レスポンス
3. **ID不正エラー**: 正の整数でないIDが渡された場合 → 400レスポンス
4. **データベース接続エラー**: D1Database が利用できない場合

## ベストプラクティス

1. **トランザクション**: 複数の操作を行う場合はトランザクションを使用
2. **サーバーサイドバリデーション**: `action` で入力値を必ず検証
3. **バインドパラメータ**: SQLインジェクション対策として、すべての値はバインドパラメータを使用
4. **インデックス**: 頻繁に検索するカラムにはインデックスを作成

## 参考リンク

- [Cloudflare D1ドキュメント](https://developers.cloudflare.com/d1/)
- [React Router v7ドキュメント](https://reactrouter.com/)
