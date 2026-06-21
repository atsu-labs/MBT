import { useLoaderData, redirect, Link, Form } from "react-router";
import Map from "~/components/Map";
import AdminLocationToggle from "~/components/AdminLocationToggle";
import { useActiveLocations } from "~/lib/useActiveLocations";
import { getCaseById, deleteCase } from "~/lib/db.server";
import { getCasePriorityLabel, getCaseStatusBadgeClass, getCaseStatusLabel, getCaseTeamLabel } from "~/lib/case-display";
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
  const { showUserLocations, userLocations, toggleUserLocations } = useActiveLocations();

  return (
    <div className="container case-layout-container">
      <div className="case-layout-grid">
        {/* 地図 */}
        <div className="card case-layout-panel case-layout-map-panel">
          <div className="case-layout-map-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 className="card-title">位置情報</h3>
              <p className="case-layout-map-hint">
                緯度: {caseItem.latitude.toFixed(6)}, 経度: {caseItem.longitude.toFixed(6)}
              </p>
            </div>
            <AdminLocationToggle
              checked={showUserLocations}
              onChange={toggleUserLocations}
            />
          </div>
          <div className="case-layout-map-wrapper">
            <Map
              cases={[caseItem]}
              center={[caseItem.latitude, caseItem.longitude]}
              zoom={15}
              selectedCaseId={caseItem.id}
              userLocations={userLocations}
            />
          </div>
        </div>

        {/* 詳細情報 */}
        <div className="card case-layout-panel case-layout-form-panel">
          <div style={{ marginBottom: "1rem", flexShrink: 0 }}>
            <Link to="/admin/cases" style={{ color: "#3498db", textDecoration: "none", fontSize: "0.9rem" }}>
              ← 一覧に戻る
            </Link>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.25rem", flexShrink: 0 }}>
            <div>
              <h2 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>
                No.{caseItem.id}: {caseItem.title}
              </h2>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <span className={`badge ${getCaseStatusBadgeClass(caseItem.status)}`}>
                  {getCaseStatusLabel(caseItem.status)}
                </span>
                <span className={`badge badge-${caseItem.priority}`}>
                  {getCasePriorityLabel(caseItem.priority)}
                </span>
                <span className="badge">{getCaseTeamLabel(caseItem.assigned_team)}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
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

          <div className="case-layout-form">
            {caseItem.description && (
              <div className="form-group">
                <label>説明</label>
                <p style={{ color: "#333", lineHeight: "1.6", background: "#f8f9fa", padding: "0.75rem", borderRadius: "4px", whiteSpace: "pre-wrap", margin: 0 }}>
                  {caseItem.description}
                </p>
              </div>
            )}

            <div className="form-group">
              <label>担当チーム</label>
              <p style={{ color: "#333", background: "#f8f9fa", padding: "0.75rem", borderRadius: "4px", margin: 0 }}>
                {getCaseTeamLabel(caseItem.assigned_team)}
              </p>
            </div>

            {caseItem.result && (
              <div className="form-group">
                <label>結果</label>
                <p style={{ color: "#333", lineHeight: "1.6", whiteSpace: "pre-wrap", background: "#f8f9fa", padding: "0.75rem", borderRadius: "4px", margin: 0 }}>
                  {caseItem.result}
                </p>
              </div>
            )}

            <div className="form-group">
              <label>日時</label>
              <div style={{ color: "#555", background: "#f8f9fa", padding: "0.75rem", borderRadius: "4px", fontSize: "0.9rem" }}>
                <p style={{ marginBottom: "0.25rem" }}>
                  作成日: {new Date(caseItem.created_at).toLocaleString("ja-JP")}
                </p>
                <p style={{ margin: 0 }}>
                  更新日: {new Date(caseItem.updated_at).toLocaleString("ja-JP")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
