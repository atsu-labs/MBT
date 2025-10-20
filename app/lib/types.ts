// 事案のステータス
export type CaseStatus = "open" | "closed";

// 事案の優先度
export type CasePriority = "high" | "medium" | "low";

// 事案の型定義
export interface Case {
  id: number;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  status: CaseStatus;
  priority: CasePriority;
  created_at: string;
  updated_at: string;
}

// 新規事案作成用の型
export interface NewCase {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  status?: CaseStatus;
  priority?: CasePriority;
}

// 事案更新用の型
export interface UpdateCase {
  title?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  status?: CaseStatus;
  priority?: CasePriority;
}
