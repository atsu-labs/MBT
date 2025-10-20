import { Link } from "react-router";

export default function Index() {
  return (
    <div className="container">
      <div style={{ textAlign: "center", padding: "4rem 0" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          事案管理システム (MBT)
        </h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem", color: "#666" }}>
          位置情報ベースの事案管理・表示システム
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/admin" className="btn btn-primary" style={{ fontSize: "1.1rem", padding: "0.75rem 2rem" }}>
            管理画面へ
          </Link>
          <Link to="/mobile" className="btn btn-secondary" style={{ fontSize: "1.1rem", padding: "0.75rem 2rem" }}>
            閲覧画面へ
          </Link>
        </div>
        <div style={{ marginTop: "3rem", padding: "2rem", background: "white", borderRadius: "8px", textAlign: "left" }}>
          <h2 style={{ marginBottom: "1rem" }}>主な機能</h2>
          <ul style={{ listStyle: "none" }}>
            <li style={{ marginBottom: "0.5rem" }}>✓ 地図上での事案の位置表示（Leaflet使用）</li>
            <li style={{ marginBottom: "0.5rem" }}>✓ 事案の作成・編集・削除（管理画面）</li>
            <li style={{ marginBottom: "0.5rem" }}>✓ モバイル対応の閲覧画面</li>
            <li style={{ marginBottom: "0.5rem" }}>✓ Cloudflare D1データベースによるデータ永続化</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
