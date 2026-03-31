import { useState } from "react";
import { useLoaderData, redirect, Link, Form } from "react-router";
import Map from "~/components/Map";
import { getCaseById, updateCase } from "~/lib/db.server";
import "~/lib/context";
import type { Case, CaseStatus, CasePriority } from "~/lib/types";
import type { Route } from ".react-router/types/app/routes/+types/admin.cases.$id.edit";

export async function loader({ params, context }: Route.LoaderArgs) {
  const id = parseInt(params.id!);
  if (isNaN(id) || id <= 0) throw new Response("Not Found", { status: 404 });
  const caseItem = await getCaseById(context.cloudflare.env.DB, id);
  if (!caseItem) throw new Response("Not Found", { status: 404 });
  return { caseItem };
}

export async function action({ params, request, context }: Route.ActionArgs) {
  const id = parseInt(params.id!);
  if (isNaN(id) || id <= 0) throw new Response("Not Found", { status: 404 });
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

  await updateCase(context.cloudflare.env.DB, id, {
    title: title.trim(),
    description: (formData.get("description") as string) || undefined,
    latitude,
    longitude,
    status: formData.get("status") as CaseStatus,
    priority: formData.get("priority") as CasePriority,
  });
  return redirect(`/admin/cases/${id}`);
}

export default function EditCase() {
  const { caseItem } = useLoaderData<typeof loader>();
  const [formData, setFormData] = useState<Case>({ ...caseItem });

  const handleMapClick = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
    });
  };

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
          <Form method="post">
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

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button type="submit" className="btn btn-primary">
                更新
              </button>
              <a
                href={`/admin/cases/${formData.id}`}
                className="btn btn-secondary"
              >
                キャンセル
              </a>
            </div>
          </Form>
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
