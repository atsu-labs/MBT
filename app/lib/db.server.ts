import type { Case, NewCase, UpdateCase } from "./types";

// Cloudflare D1データベースの型定義
export interface Env {
  DB: D1Database;
}

// 全ての事案を取得
export async function getAllCases(db: D1Database): Promise<Case[]> {
  const result = await db
    .prepare("SELECT * FROM cases ORDER BY created_at DESC")
    .all<Case>();
  return result.results || [];
}

// IDで事案を取得
export async function getCaseById(db: D1Database, id: number): Promise<Case | null> {
  const result = await db
    .prepare("SELECT * FROM cases WHERE id = ?")
    .bind(id)
    .first<Case>();
  return result;
}

// 新規事案を作成
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

// 事案を更新
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

// 事案を削除
export async function deleteCase(db: D1Database, id: number): Promise<boolean> {
  const result = await db
    .prepare("DELETE FROM cases WHERE id = ?")
    .bind(id)
    .run();

  return result.success;
}
