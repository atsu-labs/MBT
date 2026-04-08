import { useEffect, useRef } from "react";
import { Link } from "react-router";
import type { LinksFunction } from "react-router";
import timelineData from "~/data/timeline.json";

// vis-timeline の CSS を CDN から読み込む
export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://unpkg.com/vis-timeline@8.5.0/styles/vis-timeline-graph2d.min.css",
  },
];

// vis-timeline の型定義（CDN 経由で window.vis に注入される）
declare global {
  interface Window {
    vis: {
      Timeline: new (
        container: HTMLElement,
        items: object[],
        groups: object[],
        options: object
      ) => { destroy: () => void };
    };
  }
}

const VIS_TIMELINE_CDN =
  "https://unpkg.com/vis-timeline@8.5.0/standalone/umd/vis-timeline-graph2d.min.js";

export default function MobileTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timelineInstance: { destroy: () => void } | null = null;
    let script: HTMLScriptElement | null = null;

    const initTimeline = () => {
      if (!containerRef.current || !window.vis) return;

      // アイテムに id・title・表示用コンテンツを付与（オリジナルと同じ加工）
      const items = timelineData.items.map((item, index) => {
        const s = new Date(item.start);
        const e = new Date(item.end);
        const sh = s.getHours().toString().padStart(2, "0");
        const sm = s.getMinutes().toString().padStart(2, "0");
        const eh = e.getHours().toString().padStart(2, "0");
        const em = e.getMinutes().toString().padStart(2, "0");
        return {
          ...item,
          id: index + 1,
          start: s,
          end: e,
          title: `${sh}:${sm} ～ ${eh}:${em}`,
          content: `${item.content} ${sh}:${sm}-${eh}:${em}`,
        };
      });

      const options = {
        start: new Date("2026-06-28T09:00:00"),
        end: new Date("2026-06-28T15:00:00"),
        zoomable: true,
        orientation: "top",
        tooltip: { delay: 50 },
        stack: false,
        showMajorLabels: false,
        showCurrentTime: false,
        margin: { item: 2, axis: 20 },
      };

      timelineInstance = new window.vis.Timeline(
        containerRef.current,
        items,
        timelineData.groups,
        options
      );
    };

    if (window.vis) {
      // 既にロード済みの場合はそのまま初期化
      initTimeline();
    } else {
      // vis-timeline スクリプトを動的に読み込む
      script = document.createElement("script");
      script.src = VIS_TIMELINE_CDN;
      script.onload = initTimeline;
      document.head.appendChild(script);
    }

    return () => {
      timelineInstance?.destroy();
      if (script && document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ヘッダー */}
      <header
        style={{
          backgroundColor: "#2c3e50",
          color: "white",
          padding: "0.75rem 1rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <Link
          to="/mobile"
          style={{
            color: "white",
            textDecoration: "none",
            padding: "0.4rem 0.75rem",
            borderRadius: "4px",
            backgroundColor: "rgba(255,255,255,0.15)",
            fontSize: "0.875rem",
            whiteSpace: "nowrap",
          }}
        >
          ← 戻る
        </Link>
        <h1 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>
          活動時間タイムライン
        </h1>
      </header>

      {/* タイムライン本体 */}
      <main style={{ flex: 1, padding: "0.5rem", overflowX: "auto" }}>
        <p style={{ fontSize: "0.75rem", color: "#666", margin: "0 0 0.5rem 0", textAlign: "center" }}>
          2026年6月28日
        </p>
        {/* area カラースタイル */}
        <style>{`
          .area1   { background-color: gray;       color: #000; }
          .area2   { background-color: lightgreen; color: #000; }
          .area3   { background-color: blue;       color: #fff; }
          .area4   { background-color: green;      color: #fff; }
          .area5   { background-color: brown;      color: #fff; }
          .area6   { background-color: orange;     color: #fff; }
          .area7   { background-color: pink;       color: #000; }
          .area8   { background-color: purple;     color: #fff; }
          .area9   { background-color: yellow;     color: #000; }
          .area10  { background-color: skyblue;    color: #000; }
          .area11  { background-color: burlywood;  color: #000; }
          .area12  { background-color: crimson;    color: #fff; }
          .area345 { background-color: whitesmoke; color: #000; }
          .area67  { background-color: papayawhip; color: #000; }
        `}</style>
        <div
          ref={containerRef}
          style={{ width: "100%", minHeight: "400px" }}
        />
        <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.5rem", textAlign: "center" }}>
          グループ行をピンチ・スクロールで拡大縮小できます
        </p>
      </main>
    </div>
  );
}
