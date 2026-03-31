import { useLoaderData, Link } from "react-router";
import Map from "~/components/Map";
import { getAllCases } from "~/lib/db.server";
import "~/lib/context";
import type { Route } from ".react-router/types/app/routes/+types/admin._index";

export async function loader({ context }: Route.LoaderArgs) {
  const cases = await getAllCases(context.cloudflare.env.DB);
  return { cases };
}

export default function AdminDashboard() {
  const { cases } = useLoaderData<typeof loader>();
  const recentCases = [...cases]
    .sort(
      (left, right) =>
        new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    )
    .slice(0, 6);

  const stats = {
    total: cases.length,
    open: cases.filter((c) => c.status === "open").length,
    closed: cases.filter((c) => c.status === "closed").length,
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
            {stats.open}
          </p>
        </div>
        <div className="card dashboard-stat-card">
          <h3 className="dashboard-stat-label">
            完了
          </h3>
          <p className="dashboard-stat-value dashboard-stat-value-closed">
            {stats.closed}
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
            <Map cases={cases} />
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
              事案がまだ登録されていません。
            </p>
          ) : (
            <ul className="case-list dashboard-case-list">
              {recentCases.map((caseItem) => (
                <li key={caseItem.id} className="case-item dashboard-case-item">
                  <Link
                    to={`/admin/cases/${caseItem.id}`}
                    className="dashboard-case-link"
                  >
                    <div className="case-item-header dashboard-case-item-header">
                      <span className="case-item-title dashboard-case-item-title">{caseItem.title}</span>
                      <div className="dashboard-case-badges">
                        <span className={`badge badge-${caseItem.status}`}>
                          {caseItem.status}
                        </span>
                        <span className={`badge badge-${caseItem.priority}`}>
                          {caseItem.priority}
                        </span>
                      </div>
                    </div>
                    {caseItem.description && (
                      <p className="dashboard-case-description">
                        {caseItem.description.length > 80
                          ? `${caseItem.description.slice(0, 80)}...`
                          : caseItem.description}
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
