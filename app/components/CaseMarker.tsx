import type { Case } from "../lib/types";

/**
 * CaseMarker のプロパティ
 */
interface CaseMarkerProps {
  /** 表示する事案データ */
  caseItem: Case;
  /** 選択状態（選択時はサイズが大きくなる） */
  selected?: boolean;
  /** クリック時のコールバック（将来の拡張） */
  onClick?: () => void;
}

/**
 * 優先度に応じたマーカーカラーを取得
 */
const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "high":
      return "#e74c3c";
    case "medium":
      return "#f39c12";
    case "low":
      return "#27ae60";
    default:
      return "#3498db";
  }
};

// 簡易キャッシュ：同じ入力での divIcon 再生成を抑制
const iconCache = new Map<string, any>();

/**
 * CaseMarker：React のフックを使わない純粋関数としてアイコン（Leaflet の divIcon）を返す
 *
 * Map 側はこれを直接呼び出してアイコンオブジェクトを受け取る想定です。
 * SSR 時は null を返します（サーバ上では Leaflet が無いため）。
 */
export default function CaseMarker({
  caseItem,
  selected = false,
}: CaseMarkerProps) {
  if (typeof window === "undefined") return null;

  const L = (window as any).L;
  if (!L) return null;

  const cacheKey = `${caseItem.id}:${caseItem.priority}:${selected ? 1 : 0}`;
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey);
  }

  const color = getPriorityColor(caseItem.priority);
  const size = selected ? 30 : 20;
  const anchor = size / 2;
  const fontSize = selected ? 14 : 12;

  const icon = L.divIcon({
    className: "case-marker",
    html: `
      <div class="case-marker-outer ${selected ? "selected" : ""}" style="
        width: ${size}px;
        height: ${size}px;
      ">
        <div class="case-marker-inner" style="
          background-color: ${color};
          font-size: ${fontSize}px;
        ">
          ${caseItem.id}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
  });

  iconCache.set(cacheKey, icon);
  return icon;
}