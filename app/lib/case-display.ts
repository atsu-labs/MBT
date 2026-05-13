import type { CasePriority, CaseStatus } from "./types";

type LegacyCaseStatus = "open" | "closed";
type DisplayableCaseStatus = CaseStatus | LegacyCaseStatus;

export const CASE_STATUS_OPTIONS: Array<{ value: CaseStatus; label: string }> = [
  { value: "pending", label: "未対応" },
  { value: "en_route", label: "移動中" },
  { value: "in_progress", label: "対応中" },
  { value: "completed", label: "完了" },
];

const CASE_STATUS_LABELS: Record<DisplayableCaseStatus, string> = {
  pending: "未対応",
  en_route: "移動中",
  in_progress: "対応中",
  completed: "完了",
  // 旧データ互換（マイグレーション後は通常発生しない想定）
  open: "対応中",
  closed: "完了",
};

const CASE_PRIORITY_LABELS: Record<CasePriority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const CASE_STATUS_BADGE_CLASS: Record<DisplayableCaseStatus, string> = {
  pending: "badge-pending",
  en_route: "badge-en_route",
  in_progress: "badge-in_progress",
  completed: "badge-completed",
  // 旧データ互換（マイグレーション後は通常発生しない想定）
  open: "badge-in_progress",
  closed: "badge-completed",
};

export function getCaseStatusLabel(status: string): string {
  return CASE_STATUS_LABELS[status as DisplayableCaseStatus] ?? status;
}

export function getCasePriorityLabel(priority: CasePriority): string {
  return CASE_PRIORITY_LABELS[priority];
}

export function getCaseStatusBadgeClass(status: string): string {
  return CASE_STATUS_BADGE_CLASS[status as DisplayableCaseStatus] ?? "badge";
}

export function getCaseTeamLabel(team: string | null): string {
  return team ?? "未定";
}
