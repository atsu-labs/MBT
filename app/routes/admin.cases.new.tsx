import { useState } from "react";
import { useNavigate } from "react-router";
import Map from "~/components/Map";
import type { NewCase, CaseStatus, CasePriority } from "~/lib/types";

export default function NewCase() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<NewCase>({
    title: "",
    description: "",
    latitude: 35.6762,
    longitude: 139.6503,
    status: "open",
    priority: "medium",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!formData.title.trim()) {
      alert("タイトルを入力してください");
      return;
    }

    // 既存のケースを取得
    const stored = localStorage.getItem("cases");
    const cases = stored ? JSON.parse(stored) : [];

    // 新しいIDを生成
    const newId = cases.length > 0 ? Math.max(...cases.map((c: any) => c.id)) + 1 : 1;

    // 新しいケースを作成
    const newCase = {
      ...formData,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 保存
    cases.push(newCase);
    localStorage.setItem("cases", JSON.stringify(cases));

    // リダイレクト
    navigate("/admin/cases");
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
    });
  };

  return (
    <div className="container">
      <h2 style={{ marginBottom: "1.5rem", fontSize: "1.8rem" }}>
        新規事案作成
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
                value={formData.description}
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
                作成
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/cases")}
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
            地図をクリックして位置を設定できます
          </p>
          <Map
            cases={[]}
            center={[formData.latitude, formData.longitude]}
            zoom={13}
            onMapClick={handleMapClick}
          />
        </div>
      </div>
    </div>
  );
}
