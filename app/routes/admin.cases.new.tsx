import { useState, useCallback } from "react";
import { Form, redirect } from "react-router";
import Map from "~/components/Map";
import { createCase } from "~/lib/db.server";
import "~/lib/context";
import type { NewCase, CaseStatus, CasePriority } from "~/lib/types";
import type { Route } from ".react-router/types/app/routes/+types/admin.cases.new";

const HAKODATE_CENTER: [number, number] = [41.786085560648345, 140.7452487945557];

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const latitude = parseFloat(formData.get("latitude") as string);
  const longitude = parseFloat(formData.get("longitude") as string);

  if (!title || !title.trim()) {
    throw new Response("タイトルは必須です", { status: 400 });
  }
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Response("緯度・経度が無効です", { status: 400 });
  }

  await createCase(context.cloudflare.env.DB, {
    title: title.trim(),
    description: (formData.get("description") as string) || undefined,
    latitude,
    longitude,
    status: (formData.get("status") as CaseStatus) || "open",
    priority: (formData.get("priority") as CasePriority) || "medium",
  });
  return redirect("/admin/cases");
}

export default function NewCase() {
  const [formData, setFormData] = useState<NewCase>({
    title: "",
    description: "",
    latitude: HAKODATE_CENTER[0],
    longitude: HAKODATE_CENTER[1],
    status: "open",
    priority: "medium",
  });

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  }, []);

  // プレビュー用のマーカーを表示するための擬似的な事案データ
  const previewCase: any = {
    id: 0,
    title: formData.title || "新規事案（位置選択中）",
    description: formData.description || "",
    latitude: formData.latitude,
    longitude: formData.longitude,
    status: formData.status || "open",
    priority: formData.priority || "medium",
  };

  return (
    <div className="container case-new-container">
      <div className="case-new-layout">
        {/* 地図 */}
        <div className="card case-new-panel case-new-map-panel">
          <div className="case-new-map-header">
            <h3 className="card-title">位置を選択</h3>
            <p className="case-new-map-hint">地図をクリックして位置を設定できます</p>
          </div>
          <div className="case-new-map-wrapper">
            <Map
              cases={[previewCase]}
              center={HAKODATE_CENTER}
              zoom={13}
              onMapClick={handleMapClick}
            />
          </div>
        </div>

        {/* フォーム */}
        <div className="card case-new-panel case-new-form-panel">
          <Form method="post" className="case-new-form">
            <div className="form-group">
              <label htmlFor="title">タイトル *</label>
              <input
                type="text"
                id="title"
                name="title"
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
                name="description"
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
                name="latitude"
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
                name="longitude"
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
                name="status"
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
                name="priority"
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

            <div className="case-new-actions">
              <button type="submit" className="btn btn-primary">
                作成
              </button>
              <a href="/admin/cases" className="btn btn-secondary">
                キャンセル
              </a>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
