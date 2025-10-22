import { useMemo } from "react";
import type { Case } from "../lib/types";

/**
 * CaseMarkerのプロパティ
 */
interface CaseMarkerProps {
  /** 表示する事案データ */
  caseItem: Case;
  /** 選択状態（選択時はサイズが大きくなる） */
  selected?: boolean;
  /** クリック時のコールバック関数 */
  onClick?: () => void;
}

/**
 * 優先度に応じたマーカーカラーを取得
 * @param priority 優先度
 * @returns カラーコード
 */
const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "high":
      return "#e74c3c"; // 赤
    case "medium":
      return "#f39c12"; // オレンジ
    case "low":
      return "#27ae60"; // 緑
    default:
      return "#3498db"; // 青（デフォルト）
  }
};

/**
 * ケースマーカーコンポーネント
 * 
 * Leaflet地図上に事案IDを表示する数値マーカーを生成します。
 * 優先度に応じて色分けされ、選択状態でサイズが変化します。
 * 
 * @example
 * ```tsx
 * <CaseMarker 
 *   caseItem={caseData}
 *   selected={selectedId === caseData.id}
 *   onClick={() => handleSelect(caseData.id)}
 * />
 * ```
 */
export default function CaseMarker({
  caseItem,
  selected = false,
  onClick,
}: CaseMarkerProps) {
  // アイコンの生成（再レンダリング時の無駄な再生成を防ぐ）
  const icon = useMemo(() => {
    // サーバーサイドレンダリングでは処理しない
    if (typeof window === "undefined") return null;
    
    const L = (window as any).L;
    if (!L) return null;

    const color = getPriorityColor(caseItem.priority);
    const size = selected ? 30 : 20;
    const anchor = size / 2;
    const fontSize = selected ? 14 : 12;

    return L.divIcon({
      className: "case-marker",
      html: `
        <div class="case-marker-outer ${selected ? 'selected' : ''}" style="
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
  }, [caseItem.id, caseItem.priority, selected]);

  return icon;
}
