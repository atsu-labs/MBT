import type { Case } from "../types";

/**
 * マーカーアイコンのHTMLキャッシュ
 * 同じパラメータのアイコンを再生成しないためのシンプルなキャッシュ
 */
const iconCache = new Map<string, string>();

/**
 * 優先度に応じたマーカーの色を取得
 * @param priority - 事案の優先度 (high/medium/low)
 * @returns マーカーの背景色
 */
function getMarkerColor(priority: string): string {
  switch (priority) {
    case "high":
      return "red";
    case "medium":
      return "orange";
    case "low":
      return "green";
    default:
      return "blue";
  }
}

/**
 * 優先度に応じたマーカーアイコン名を取得
 * @param priority - 事案の優先度 (high/medium/low)
 * @returns Material Iconsのアイコン名
 */
function getMarkerIcon(priority: string): string {
  switch (priority) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "place";
  }
}

/**
 * マーカーアイコンのHTMLを生成（キャッシュ付き）
 * @param priority - 事案の優先度
 * @param isSelected - 選択状態かどうか
 * @returns マーカーアイコンのHTML文字列
 */
function createMarkerIconHTML(priority: string, isSelected: boolean): string {
  const cacheKey = `${priority}-${isSelected}`;
  
  // キャッシュにある場合は再利用
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!;
  }

  const color = getMarkerColor(priority);
  const iconName = getMarkerIcon(priority);
  const size = isSelected ? 40 : 32;
  const iconSize = isSelected ? 26 : 20;

  const html = `
    <div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span class="material-icons" style="color: white; font-size: ${iconSize}px;">${iconName}</span>
    </div>
  `;

  // キャッシュに保存
  iconCache.set(cacheKey, html);
  
  return html;
}

/**
 * 事案用のマーカーアイコンオプションを生成する純粋関数
 * React hookを使用せず、再利用可能なアイコンHTMLをキャッシュする
 * 
 * @param caseItem - 事案データ
 * @param isSelected - 選択状態かどうか
 * @param L - Leafletライブラリのインスタンス
 * @returns Leaflet divIconオブジェクト
 */
export function createCaseMarkerIcon(
  caseItem: Case,
  isSelected: boolean,
  L: any
): any {
  const size = isSelected ? 40 : 32;
  const anchor = isSelected ? 20 : 16;
  
  const html = createMarkerIconHTML(caseItem.priority, isSelected);

  return L.divIcon({
    className: "custom-marker",
    html,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
  });
}

/**
 * 事案用のポップアップHTMLを生成する純粋関数
 * @param caseItem - 事案データ
 * @returns ポップアップのHTML文字列
 */
export function createCasePopupHTML(caseItem: Case): string {
  return `
    <div style="min-width: 200px;">
      <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem;">${caseItem.title}</h3>
      ${caseItem.description ? `<p style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">${caseItem.description}</p>` : ""}
      <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
        <span class="badge badge-${caseItem.status}">${caseItem.status}</span>
        <span class="badge badge-${caseItem.priority}">${caseItem.priority}</span>
      </div>
    </div>
  `;
}

/**
 * アイコンキャッシュをクリア（テスト用）
 */
export function clearIconCache(): void {
  iconCache.clear();
}

/**
 * キャッシュのサイズを取得（デバッグ用）
 */
export function getIconCacheSize(): number {
  return iconCache.size;
}
