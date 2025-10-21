import type { Case, NewCase, UpdateCase } from "./types";

// Cloudflare D1データベースの型定義
export interface Env {
  DB: D1Database;
}

/**
 * すべての事案を取得します。
 * 
 * @param db - Cloudflare D1データベースインスタンス
 * @returns 作成日時の降順でソートされたすべての事案の配列
 * 
 * @example
 * ```typescript
 * const cases = await getAllCases(context.cloudflare.env.DB);
 * ```
 */
export async function getAllCases(db: D1Database): Promise<Case[]> {
  const result = await db
    .prepare("SELECT * FROM cases ORDER BY created_at DESC")
    .all<Case>();
  return result.results || [];
}

/**
 * IDで事案を取得します。
 * 
 * @param db - Cloudflare D1データベースインスタンス
 * @param id - 取得する事案のID
 * @returns 事案が見つかった場合はCaseオブジェクト、見つからない場合はnull
 * 
 * @example
 * ```typescript
 * const caseData = await getCaseById(context.cloudflare.env.DB, 1);
 * if (!caseData) {
 *   throw new Response("Not Found", { status: 404 });
 * }
 * ```
 */
export async function getCaseById(db: D1Database, id: number): Promise<Case | null> {
  const result = await db
    .prepare("SELECT * FROM cases WHERE id = ?")
    .bind(id)
    .first<Case>();
  return result;
}

/**
 * 新規事案を作成します。
 * 
 * @param db - Cloudflare D1データベースインスタンス
 * @param newCase - 新規事案のデータ。title, latitude, longitudeは必須
 * @returns 作成された事案（IDと作成日時が含まれる）
 * @throws {Error} 作成に失敗した場合
 * 
 * @example
 * ```typescript
 * const newCase: NewCase = {
 *   title: "ランナー転倒",
 *   description: "第1関門付近で転倒者発生",
 *   latitude: 41.7869,
 *   longitude: 140.7369,
 *   status: "open",
 *   priority: "high"
 * };
 * const created = await createCase(context.cloudflare.env.DB, newCase);
 * ```
 */
export async function createCase(db: D1Database, newCase: NewCase): Promise<Case> {
  const result = await db
    .prepare(
      `INSERT INTO cases (title, description, latitude, longitude, status, priority)
       VALUES (?, ?, ?, ?, ?, ?)
       RETURNING *`
    )
    .bind(
      newCase.title,
      newCase.description || null,
      newCase.latitude,
      newCase.longitude,
      newCase.status || "open",
      newCase.priority || "medium"
    )
    .first<Case>();

  if (!result) {
    throw new Error("Failed to create case");
  }

  return result;
}

/**
 * 事案を更新します。
 * 指定されたフィールドのみを更新し、updated_atは自動的に更新されます。
 * 
 * @param db - Cloudflare D1データベースインスタンス
 * @param id - 更新する事案のID
 * @param updates - 更新するフィールド（すべてオプション）
 * @returns 更新された事案、見つからない場合はnull
 * 
 * @example
 * ```typescript
 * // ステータスのみ更新
 * const updated = await updateCase(db, 1, { status: "closed" });
 * 
 * // 複数フィールドを更新
 * const updated = await updateCase(db, 1, {
 *   title: "更新されたタイトル",
 *   priority: "low",
 *   status: "closed"
 * });
 * ```
 */
export async function updateCase(
  db: D1Database,
  id: number,
  updates: UpdateCase
): Promise<Case | null> {
  const setClauses: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) {
    setClauses.push("title = ?");
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    setClauses.push("description = ?");
    values.push(updates.description);
  }
  if (updates.latitude !== undefined) {
    setClauses.push("latitude = ?");
    values.push(updates.latitude);
  }
  if (updates.longitude !== undefined) {
    setClauses.push("longitude = ?");
    values.push(updates.longitude);
  }
  if (updates.status !== undefined) {
    setClauses.push("status = ?");
    values.push(updates.status);
  }
  if (updates.priority !== undefined) {
    setClauses.push("priority = ?");
    values.push(updates.priority);
  }

  if (setClauses.length === 0) {
    return getCaseById(db, id);
  }

  setClauses.push("updated_at = CURRENT_TIMESTAMP");

  const result = await db
    .prepare(
      `UPDATE cases SET ${setClauses.join(", ")} WHERE id = ? RETURNING *`
    )
    .bind(...values, id)
    .first<Case>();

  return result;
}

/**
 * 事案を削除します。
 * 
 * @param db - Cloudflare D1データベースインスタンス
 * @param id - 削除する事案のID
 * @returns 削除が成功した場合はtrue、失敗した場合はfalse
 * 
 * @example
 * ```typescript
 * const success = await deleteCase(context.cloudflare.env.DB, 1);
 * if (!success) {
 *   return { error: "Failed to delete case" };
 * }
 * ```
 */
export async function deleteCase(db: D1Database, id: number): Promise<boolean> {
  const result = await db
    .prepare("DELETE FROM cases WHERE id = ?")
    .bind(id)
    .run();

  return result.success;
}
