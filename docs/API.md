# API ドキュメント

このドキュメントでは、MBTシステムで使用されるデータベースAPI関数について説明します。

## データベースAPI

すべてのデータベース操作は `app/lib/db.server.ts` で定義されています。

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
  const caseId = parseInt(params.id);
  const caseData = await getCaseById(context.cloudflare.env.DB, caseId);
  if (!caseData) {
    throw new Response("Not Found", { status: 404 });
  }
  return { case: caseData };
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
  const newCase: NewCase = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    latitude: parseFloat(formData.get("latitude") as string),
    longitude: parseFloat(formData.get("longitude") as string),
    status: (formData.get("status") as CaseStatus) || "open",
    priority: (formData.get("priority") as CasePriority) || "medium",
  };
  
  const createdCase = await createCase(context.cloudflare.env.DB, newCase);
  return redirect(`/admin/cases/${createdCase.id}`);
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
  const caseId = parseInt(params.id);
  const formData = await request.formData();
  
  const updates: UpdateCase = {
    status: formData.get("status") as CaseStatus,
  };
  
  const updatedCase = await updateCase(
    context.cloudflare.env.DB,
    caseId,
    updates
  );
  
  return { success: true, case: updatedCase };
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
  const caseId = parseInt(params.id);
  const success = await deleteCase(context.cloudflare.env.DB, caseId);
  
  if (!success) {
    return { error: "Failed to delete case" };
  }
  
  return redirect("/admin/cases");
}
```

## ルート構造

### 管理画面ルート

- `GET /admin` - ダッシュボード（統計情報と地図）
- `GET /admin/cases` - 事案一覧
- `GET /admin/cases/new` - 新規事案作成フォーム
- `POST /admin/cases/new` - 新規事案作成アクション
- `GET /admin/cases/:id` - 事案詳細
- `GET /admin/cases/:id/edit` - 事案編集フォーム
- `POST /admin/cases/:id/edit` - 事案更新アクション
- `DELETE /admin/cases/:id` - 事案削除アクション

### モバイル閲覧ルート

- `GET /mobile` - モバイル用閲覧画面（地図とリスト表示）

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

すべてのAPI関数は以下のエラーケースを考慮しています：

1. **データベース接続エラー**: D1Database が利用できない場合
2. **存在しないレコード**: `getCaseById`, `updateCase` でIDが見つからない場合
3. **作成失敗**: `createCase` でINSERTが失敗した場合
4. **削除失敗**: `deleteCase` でDELETEが失敗した場合

エラーハンドリングの例：

```typescript
try {
  const caseData = await getCaseById(db, id);
  if (!caseData) {
    return { error: "Case not found" };
  }
  // 処理を続行...
} catch (error) {
  console.error("Database error:", error);
  return { error: "Database error occurred" };
}
```

## ベストプラクティス

1. **トランザクション**: 複数の操作を行う場合はトランザクションを使用
2. **バリデーション**: データベースに保存する前に入力値を検証
3. **エスケープ**: SQLインジェクション対策として、すべての値はバインドパラメータを使用
4. **インデックス**: 頻繁に検索するカラムにはインデックスを作成

## 参考リンク

- [Cloudflare D1ドキュメント](https://developers.cloudflare.com/d1/)
- [React Router v7ドキュメント](https://reactrouter.com/)
