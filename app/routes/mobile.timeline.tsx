import { useEffect, useRef } from "react";
import { Link } from "react-router";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import timelineData from "~/data/timeline.json";

// タイムラインの表示日付をデータの最初のアイテムから導出する
const timelineDate = new Date(timelineData.items[0].start);
const displayDate = timelineDate.toLocaleDateString("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function MobileTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timelineInstance: { destroy: () => void } | null = null;

    // vis-timeline はブラウザ API に依存するため、クライアント側で動的にインポートする
    import("vis-timeline").then(({ Timeline }) => {
      if (!containerRef.current) return;

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

      // タイムライン軸の範囲をデータの日付から算出する
      const axisDate = timelineDate.toISOString().slice(0, 10);
      const options = {
        start: new Date(`${axisDate}T09:00:00`),
        end: new Date(`${axisDate}T15:00:00`),
        zoomable: true,
        orientation: "top",
        tooltip: { delay: 50 },
        stack: false,
        showMajorLabels: false,
        showCurrentTime: false,
        margin: { item: 2, axis: 20 },
      };

      timelineInstance = new Timeline(
        containerRef.current,
        items,
        timelineData.groups,
        options
      );
    });

    return () => {
      timelineInstance?.destroy();
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
          {displayDate}
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
