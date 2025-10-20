import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import Map from "~/components/Map";
import type { Case, CaseStatus, CasePriority } from "~/lib/types";

export default function EditCase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Case | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cases");
    if (stored) {
      const cases: Case[] = JSON.parse(stored);
      const found = cases.find((c) => c.id === parseInt(id || "0"));
      if (found) {
        setFormData(found);
      } else {
        navigate("/admin/cases");
      }
    } else {
      navigate("/admin/cases");
    }
  }, [id, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) return;

    // バリデーション
    if (!formData.title.trim()) {
      alert("タイトルを入力してください");
      return;
    }

    // 既存のケースを取得
    const stored = localStorage.getItem("cases");
    if (stored) {
      const cases: Case[] = JSON.parse(stored);
      const index = cases.findIndex((c) => c.id === formData.id);

      if (index !== -1) {
        // 更新
        cases[index] = {
          ...formData,
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem("cases", JSON.stringify(cases));

        // リダイレクト
        navigate(`/admin/cases/${formData.id}`);
      }
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (formData) {
      setFormData({
        ...formData,
        latitude: lat,
        longitude: lng,
      });
    }
  };

  if (!formData) {
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
        <Link
          to={`/admin/cases/${formData.id}`}
          style={{ color: "#3498db", textDecoration: "none" }}
        >
          ← 詳細に戻る
        </Link>
      </div>

      <h2 style={{ marginBottom: "1.5rem", fontSize: "1.8rem" }}>
        事案編集
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* フォーム */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">タイトル *</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">説明</label>
              <textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="latitude">緯度 *</label>
              <input
                type="number"
                id="latitude"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    latitude: parseFloat(e.target.value),
                  })
                }
                step="0.000001"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">経度 *</label>
              <input
                type="number"
                id="longitude"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    longitude: parseFloat(e.target.value),
                  })
                }
                step="0.000001"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">ステータス</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as CaseStatus,
                  })
                }
              >
                <option value="open">対応中</option>
                <option value="closed">完了</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">優先度</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as CasePriority,
                  })
                }
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button type="submit" className="btn btn-primary">
                更新
              </button>
              <button
                type="button"
                onClick={() => navigate(`/admin/cases/${formData.id}`)}
                className="btn btn-secondary"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>

        {/* 地図 */}
        <div className="card">
          <h3 style={{ marginBottom: "1rem" }}>位置を選択</h3>
          <p style={{ color: "#666", marginBottom: "1rem", fontSize: "0.9rem" }}>
            地図をクリックして位置を変更できます
          </p>
          <Map
            cases={[formData]}
            center={[formData.latitude, formData.longitude]}
            zoom={15}
            onMapClick={handleMapClick}
            selectedCaseId={formData.id}
          />
        </div>
      </div>
    </div>
  );
}
