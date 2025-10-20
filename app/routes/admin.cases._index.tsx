import { useState, useEffect } from "react";
import { Link } from "react-router";
import type { Case } from "~/lib/types";

export default function CasesList() {
  const [cases, setCases] = useState<Case[]>([]);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
  const [sortBy, setSortBy] = useState<"created" | "priority">("created");

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = () => {
    const stored = localStorage.getItem("cases");
    if (stored) {
      setCases(JSON.parse(stored));
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("この事案を削除してもよろしいですか？")) {
      return;
    }

    const updated = cases.filter((c) => c.id !== id);
    localStorage.setItem("cases", JSON.stringify(updated));
    setCases(updated);
  };

  // フィルタリングとソート
  const filteredCases = cases
    .filter((c) => {
      if (filter === "all") return true;
      return c.status === filter;
    })
    .sort((a, b) => {
      if (sortBy === "created") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
    });

  return (
    <div className="container">
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.8rem" }}>事案一覧</h2>
          <Link to="/admin/cases/new" className="btn btn-primary">
            新規作成
          </Link>
        </div>

        {/* フィルターとソート */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <label style={{ marginRight: "0.5rem" }}>ステータス:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
            >
              <option value="all">すべて</option>
              <option value="open">対応中</option>
              <option value="closed">完了</option>
            </select>
          </div>
          <div>
            <label style={{ marginRight: "0.5rem" }}>並び順:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
            >
              <option value="created">作成日時</option>
              <option value="priority">優先度</option>
            </select>
          </div>
        </div>
      </div>

      {filteredCases.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: "center", color: "#666", padding: "2rem" }}>
            {filter === "all"
              ? "事案がまだ登録されていません。"
              : `${filter === "open" ? "対応中" : "完了"}の事案がありません。`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredCases.map((caseItem) => (
            <div key={caseItem.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Link
                      to={`/admin/cases/${caseItem.id}`}
                      style={{ fontSize: "1.2rem", fontWeight: "600", textDecoration: "none", color: "#2c3e50" }}
                    >
                      {caseItem.title}
                    </Link>
                    <span className={`badge badge-${caseItem.status}`}>
                      {caseItem.status}
                    </span>
                    <span className={`badge badge-${caseItem.priority}`}>
                      {caseItem.priority}
                    </span>
                  </div>
                  {caseItem.description && (
                    <p style={{ color: "#666", marginBottom: "0.5rem" }}>
                      {caseItem.description}
                    </p>
                  )}
                  <p style={{ fontSize: "0.875rem", color: "#999" }}>
                    位置: {caseItem.latitude.toFixed(4)}, {caseItem.longitude.toFixed(4)}
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "#999" }}>
                    作成日: {new Date(caseItem.created_at).toLocaleString("ja-JP")}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link
                    to={`/admin/cases/${caseItem.id}/edit`}
                    className="btn btn-secondary"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(caseItem.id)}
                    className="btn btn-danger"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
