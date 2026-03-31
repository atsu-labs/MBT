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

### インデックス

- `idx_cases_status` - ステータスでの検索を高速化
- `idx_cases_created_at` - 作成日時でのソートを高速化

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
