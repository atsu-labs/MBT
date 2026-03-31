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

  const stats = {
    total: cases.length,
    open: cases.filter((c) => c.status === "open").length,
    closed: cases.filter((c) => c.status === "closed").length,
    high: cases.filter((c) => c.priority === "high").length,
  };

  return (
    <div className="container">
      <h2 style={{ marginBottom: "1.5rem", fontSize: "1.8rem" }}>
        ダッシュボード
      </h2>

      {/* 統計カード */}
      <div className="grid" style={{ marginBottom: "2rem" }}>
        <div className="card">
          <h3 style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.5rem" }}>
            総事案数
          </h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#2c3e50" }}>
            {stats.total}
          </p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.5rem" }}>
            対応中
          </h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#3498db" }}>
            {stats.open}
          </p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.5rem" }}>
            完了
          </h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#95a5a6" }}>
            {stats.closed}
          </p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.5rem" }}>
            高優先度
          </h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#e74c3c" }}>
            {stats.high}
          </p>
        </div>
      </div>

      {/* 地図 */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">事案マップ</h3>
          <Link to="/admin/cases/new" className="btn btn-primary">
            新規事案作成
          </Link>
        </div>
        <Map cases={cases} />
      </div>

      {/* 最近の事案 */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">最近の事案</h3>
          <Link to="/admin/cases">すべて表示</Link>
        </div>
        {cases.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", padding: "2rem" }}>
            事案がまだ登録されていません。
          </p>
        ) : (
          <ul className="case-list">
            {cases.slice(0, 5).map((caseItem) => (
              <li key={caseItem.id} className="case-item">
                <Link
                  to={`/admin/cases/${caseItem.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="case-item-header">
                    <span className="case-item-title">{caseItem.title}</span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <span className={`badge badge-${caseItem.status}`}>
                        {caseItem.status}
                      </span>
                      <span className={`badge badge-${caseItem.priority}`}>
                        {caseItem.priority}
                      </span>
                    </div>
                  </div>
                  {caseItem.description && (
                    <p style={{ color: "#666", fontSize: "0.9rem" }}>
                      {caseItem.description.length > 100
                        ? `${caseItem.description.slice(0, 100)}...`
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
  );
}
