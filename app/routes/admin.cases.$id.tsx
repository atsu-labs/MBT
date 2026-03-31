import { useLoaderData, redirect, Link, Form } from "react-router";
import Map from "~/components/Map";
import { getCaseById, deleteCase } from "~/lib/db.server";
import "~/lib/context";
import type { Route } from ".react-router/types/app/routes/+types/admin.cases.$id";

export async function loader({ params, context }: Route.LoaderArgs) {
  const id = parseInt(params.id!);
  if (isNaN(id) || id <= 0) throw new Response("Not Found", { status: 404 });
  const caseItem = await getCaseById(context.cloudflare.env.DB, id);
  if (!caseItem) throw new Response("Not Found", { status: 404 });
  return { caseItem };
}

export async function action({ params, context }: Route.ActionArgs) {
  const id = parseInt(params.id!);
  if (isNaN(id) || id <= 0) throw new Response("Not Found", { status: 404 });
  await deleteCase(context.cloudflare.env.DB, id);
  return redirect("/admin/cases");
}

export default function CaseDetail() {
  const { caseItem } = useLoaderData<typeof loader>();

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
            <Form method="post" onSubmit={(e) => { if (!confirm("この事案を削除してもよろしいですか？")) e.preventDefault(); }}>
              <button type="submit" className="btn btn-danger">
                削除
              </button>
            </Form>
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
