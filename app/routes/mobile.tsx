import { useState, useEffect } from "react";
import { Link } from "react-router";
import Map from "~/components/Map";
import type { Case } from "~/lib/types";

export default function MobileView() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed">("all");

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = () => {
    const stored = localStorage.getItem("cases");
    if (stored) {
      setCases(JSON.parse(stored));
    }
  };

  // フィルタリング
  const filteredCases = cases.filter((c) => {
    if (filterStatus === "all") return true;
    return c.status === filterStatus;
  });

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* モバイルヘッダー */}
      <header
        style={{
          backgroundColor: "#2c3e50",
          color: "white",
          padding: "1rem",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "600" }}>事案閲覧</h1>
          <Link
            to="/"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            ホーム
          </Link>
        </div>
      </header>

      {/* フィルター */}
      <div
        style={{
          backgroundColor: "white",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid #eee",
        }}
      >
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontSize: "1rem",
          }}
        >
          <option value="all">すべての事案</option>
          <option value="open">対応中のみ</option>
          <option value="closed">完了のみ</option>
        </select>
      </div>

      {/* 地図 */}
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <Map
            cases={filteredCases}
            selectedCaseId={selectedCase?.id}
          />
        </div>
      </div>

      {/* 事案リスト（スライドアップ可能） */}
      <div
        style={{
          backgroundColor: "white",
          maxHeight: "40vh",
          overflowY: "auto",
          borderTop: "2px solid #3498db",
          boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {filteredCases.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
            表示する事案がありません
          </div>
        ) : (
          <div>
            {filteredCases.map((caseItem) => (
              <div
                key={caseItem.id}
                onClick={() => setSelectedCase(caseItem)}
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  backgroundColor:
                    selectedCase?.id === caseItem.id ? "#f0f8ff" : "white",
                  transition: "background-color 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "0.5rem",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "#2c3e50",
                      margin: 0,
                    }}
                  >
                    {caseItem.title}
                  </h3>
                  <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                    <span
                      className={`badge badge-${caseItem.status}`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {caseItem.status}
                    </span>
                    <span
                      className={`badge badge-${caseItem.priority}`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {caseItem.priority}
                    </span>
                  </div>
                </div>
                {caseItem.description && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#666",
                      margin: "0 0 0.5rem 0",
                      lineHeight: "1.4",
                    }}
                  >
                    {caseItem.description.length > 80
                      ? `${caseItem.description.slice(0, 80)}...`
                      : caseItem.description}
                  </p>
                )}
                <p style={{ fontSize: "0.75rem", color: "#999", margin: 0 }}>
                  {new Date(caseItem.created_at).toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
