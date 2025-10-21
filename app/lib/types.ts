/**
 * 事案のステータス
 * - open: 対応中
 * - closed: 対応完了
 */
export type CaseStatus = "open" | "closed";

/**
 * 事案の優先度
 * - high: 高（緊急対応が必要）
 * - medium: 中（通常対応）
 * - low: 低（参考情報）
 */
export type CasePriority = "high" | "medium" | "low";

/**
 * 事案の型定義
 * マラソンイベント中に発生するトラブルや事案を表します
 */
export interface Case {
  /** 事案ID（主キー） */
  id: number;
  /** 事案タイトル */
  title: string;
  /** 事案の詳細説明（オプション） */
  description: string | null;
  /** 緯度（-90〜90） */
  latitude: number;
  /** 経度（-180〜180） */
  longitude: number;
  /** ステータス（対応中/完了） */
  status: CaseStatus;
  /** 優先度（高/中/低） */
  priority: CasePriority;
  /** 作成日時（ISO 8601形式） */
  created_at: string;
  /** 更新日時（ISO 8601形式） */
  updated_at: string;
}

/**
 * 新規事案作成用の型
 * 事案作成時に必要なフィールドを定義します
 */
export interface NewCase {
  /** 事案タイトル（必須） */
  title: string;
  /** 事案の詳細説明（オプション） */
  description?: string;
  /** 緯度（必須） */
  latitude: number;
  /** 経度（必須） */
  longitude: number;
  /** ステータス（オプション、デフォルト: "open"） */
  status?: CaseStatus;
  /** 優先度（オプション、デフォルト: "medium"） */
  priority?: CasePriority;
}

/**
 * 事案更新用の型
 * 更新したいフィールドのみを指定します
 */
export interface UpdateCase {
  /** 事案タイトル */
  title?: string;
  /** 事案の詳細説明 */
  description?: string;
  /** 緯度 */
  latitude?: number;
  /** 経度 */
  longitude?: number;
  /** ステータス */
  status?: CaseStatus;
  /** 優先度 */
  priority?: CasePriority;
}
