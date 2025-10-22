import type { Case } from "../lib/types";

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

export default function createCaseIcon(caseItem: Case, selected = false) {
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
}
