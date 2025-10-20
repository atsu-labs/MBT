import { Outlet, Link, useLocation } from "react-router";

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <h1>管理画面</h1>
          <nav className="nav">
            <Link
              to="/admin"
              className={location.pathname === "/admin" ? "active" : ""}
            >
              ダッシュボード
            </Link>
            <Link
              to="/admin/cases"
              className={location.pathname.startsWith("/admin/cases") ? "active" : ""}
            >
              事案管理
            </Link>
            <Link to="/">ホーム</Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
