import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import Map from "~/components/Map";
import type { Case } from "~/lib/types";

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseItem, setCaseItem] = useState<Case | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cases");
    if (stored) {
      const cases: Case[] = JSON.parse(stored);
      const found = cases.find((c) => c.id === parseInt(id || "0"));
      if (found) {
        setCaseItem(found);
      } else {
        navigate("/admin/cases");
      }
    } else {
      navigate("/admin/cases");
    }
  }, [id, navigate]);

  const handleDelete = () => {
    if (!confirm("この事案を削除してもよろしいですか？")) {
      return;
    }

    const stored = localStorage.getItem("cases");
    if (stored) {
      const cases: Case[] = JSON.parse(stored);
      const updated = cases.filter((c) => c.id !== parseInt(id || "0"));
      localStorage.setItem("cases", JSON.stringify(updated));
    }

    navigate("/admin/cases");
  };

  if (!caseItem) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: "1.5rem" }}>
        <Link to="/admin/cases" style={{ color: "#3498db", textDecoration: "none" }}>
          ← 一覧に戻る
        </Link>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
              {caseItem.title}
            </h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span className={`badge badge-${caseItem.status}`}>
                {caseItem.status}
              </span>
              <span className={`badge badge-${caseItem.priority}`}>
                {caseItem.priority}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link
              to={`/admin/cases/${caseItem.id}/edit`}
              className="btn btn-primary"
            >
              編集
            </Link>
            <button onClick={handleDelete} className="btn btn-danger">
              削除
            </button>
          </div>
        </div>

        {caseItem.description && (
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>説明</h3>
            <p style={{ color: "#666", lineHeight: "1.6" }}>
              {caseItem.description}
            </p>
          </div>
        )}

        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>位置情報</h3>
          <p style={{ color: "#666" }}>
            緯度: {caseItem.latitude.toFixed(6)}, 経度:{" "}
            {caseItem.longitude.toFixed(6)}
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>日時</h3>
          <p style={{ color: "#666" }}>
            作成日: {new Date(caseItem.created_at).toLocaleString("ja-JP")}
          </p>
          <p style={{ color: "#666" }}>
            更新日: {new Date(caseItem.updated_at).toLocaleString("ja-JP")}
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>地図</h3>
          <Map
            cases={[caseItem]}
            center={[caseItem.latitude, caseItem.longitude]}
            zoom={15}
            selectedCaseId={caseItem.id}
          />
        </div>
      </div>
    </div>
  );
}
