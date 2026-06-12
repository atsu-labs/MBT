import { useLoaderData, Link } from "react-router";
import Map from "~/components/Map";
import { getAllCases } from "~/lib/db.server";
import { getCasePriorityLabel, getCaseStatusBadgeClass, getCaseStatusLabel, getCaseTeamLabel } from "~/lib/case-display";
import "~/lib/context";
import type { Route } from ".react-router/types/app/routes/+types/admin._index";

export async function loader({ context }: Route.LoaderArgs) {
  const cases = await getAllCases(context.cloudflare.env.DB);
  return { cases };
}

export default function AdminDashboard() {
  const { cases } = useLoaderData<typeof loader>();
  
  // 進行中・未完了の事案（completed 以外）
  const activeCases = cases.filter((c) => c.status !== "completed");
  
  // 完了した事案
  const completedCases = cases.filter((c) => c.status === "completed");

  // 最近の事案（未完了事案のみ）
  const recentCases = activeCases.slice(0, 6);

  // 最近の完了事案
  const recentCompletedCases = [...completedCases]
    .sort(
      (left, right) =>
        new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
    )
    .slice(0, 6);

  const stats = {
    total: cases.length,
    inProgress: cases.filter((c) => c.status === "in_progress").length,
    completed: cases.filter((c) => c.status === "completed").length,
    high: cases.filter((c) => c.priority === "high").length,
  };

  return (
    <div className="container dashboard-container">
      {/* 統計カード */}
      <div className="dashboard-stats">
        <div className="card dashboard-stat-card">
          <h3 className="dashboard-stat-label">
            総事案数
          </h3>
          <p className="dashboard-stat-value dashboard-stat-value-total">
            {stats.total}
          </p>
        </div>
        <div className="card dashboard-stat-card">
          <h3 className="dashboard-stat-label">
            対応中
          </h3>
          <p className="dashboard-stat-value dashboard-stat-value-open">
            {stats.inProgress}
          </p>
        </div>
        <div className="card dashboard-stat-card">
          <h3 className="dashboard-stat-label">
            完了
          </h3>
          <p className="dashboard-stat-value dashboard-stat-value-closed">
            {stats.completed}
          </p>
        </div>
        <div className="card dashboard-stat-card">
          <h3 className="dashboard-stat-label">
            高優先度
          </h3>
          <p className="dashboard-stat-value dashboard-stat-value-high">
            {stats.high}
          </p>
        </div>
      </div>

      <div className="dashboard-main">
        {/* 地図 */}
        <div className="card dashboard-panel dashboard-map-panel">
          <div className="card-header dashboard-panel-header">
            <h3 className="card-title">事案マップ</h3>
            <Link to="/admin/cases/new" className="btn btn-primary">
              新規事案作成
            </Link>
          </div>
          <div className="dashboard-map-wrapper">
            <Map cases={activeCases} />
          </div>
        </div>

        {/* 最近の事案 */}
        <div className="card dashboard-panel dashboard-cases-panel">
          <div className="card-header dashboard-panel-header">
            <h3 className="card-title">最近の事案</h3>
            <Link to="/admin/cases">すべて表示</Link>
          </div>
          {recentCases.length === 0 ? (
            <p className="dashboard-empty-state">
              アクティブな事案はありません。
            </p>
          ) : (
            <ul className="case-list dashboard-case-list">
              {recentCases.map((caseItem) => (
                <li key={caseItem.id} className="case-item dashboard-case-item">
                  <Link
                    to={`/admin/cases/${caseItem.id}`}
                    className="dashboard-case-link"
                  >
                    <div className="case-item-header dashboard-case-item-header" style={{ justifyContent: "flex-start", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span className={`badge badge-${caseItem.priority}`}>
                        No.{caseItem.id}
                      </span>
                      <span className="badge">{getCaseTeamLabel(caseItem.assigned_team)}</span>
                      <span className={`badge ${getCaseStatusBadgeClass(caseItem.status)}`}>
                        {getCaseStatusLabel(caseItem.status)}
                      </span>
                    </div>
                    <div className="case-item-title dashboard-case-item-title" style={{ marginTop: "0.5rem", fontWeight: "600", fontSize: "1rem", color: "#2c3e50" }}>
                      {caseItem.title}
                    </div>
                    {caseItem.description && (
                      <p className="dashboard-case-description" style={{ marginTop: "0.25rem" }}>
                        {caseItem.description.length > 80
                          ? `${caseItem.description.slice(0, 80)}...`
                          : caseItem.description}
                      </p>
                    )}
                    {caseItem.result && (
                      <p className="dashboard-case-result" style={{ marginTop: "0.25rem", fontSize: "0.9rem", color: "#27ae60", fontWeight: "500" }}>
                        結果: {caseItem.result.length > 80
                          ? `${caseItem.result.slice(0, 80)}...`
                          : caseItem.result}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 完了事案 */}
        <div className="card dashboard-panel dashboard-cases-panel">
          <div className="card-header dashboard-panel-header">
            <h3 className="card-title">完了事案</h3>
            <Link to="/admin/cases?status=completed">すべて表示</Link>
          </div>
          {recentCompletedCases.length === 0 ? (
            <p className="dashboard-empty-state">
              完了した事案はありません。
            </p>
          ) : (
            <ul className="case-list dashboard-case-list">
              {recentCompletedCases.map((caseItem) => (
                <li key={caseItem.id} className="case-item dashboard-case-item">
                  <Link
                    to={`/admin/cases/${caseItem.id}`}
                    className="dashboard-case-link"
                  >
                    <div className="case-item-header dashboard-case-item-header" style={{ justifyContent: "flex-start", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span className={`badge badge-${caseItem.priority}`}>
                        No.{caseItem.id}
                      </span>
                      <span className="badge">{getCaseTeamLabel(caseItem.assigned_team)}</span>
                      <span className={`badge ${getCaseStatusBadgeClass(caseItem.status)}`}>
                        {getCaseStatusLabel(caseItem.status)}
                      </span>
                    </div>
                    <div className="case-item-title dashboard-case-item-title" style={{ marginTop: "0.5rem", fontWeight: "600", fontSize: "1rem", color: "#2c3e50" }}>
                      {caseItem.title}
                    </div>
                    {caseItem.description && (
                      <p className="dashboard-case-description" style={{ marginTop: "0.25rem" }}>
                        {caseItem.description.length > 80
                          ? `${caseItem.description.slice(0, 80)}...`
                          : caseItem.description}
                      </p>
                    )}
                    {caseItem.result && (
                      <p className="dashboard-case-result" style={{ marginTop: "0.25rem", fontSize: "0.9rem", color: "#27ae60", fontWeight: "500" }}>
                        結果: {caseItem.result.length > 80
                          ? `${caseItem.result.slice(0, 80)}...`
                          : caseItem.result}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
