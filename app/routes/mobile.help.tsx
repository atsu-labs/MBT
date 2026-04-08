import { Link } from "react-router";

export default function MobileHelp() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f5f5f5" }}>
      {/* ヘッダー */}
      <header style={{ backgroundColor: "#2c3e50", color: "white", padding: "1rem", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link
            to="/mobile"
            style={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center" }}
            aria-label="戻る"
          >
            <span className="material-icons">arrow_back</span>
          </Link>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "600" }}>使い方</h1>
        </div>
      </header>

      {/* コンテンツ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
        <span className="material-icons" style={{ fontSize: "4rem", color: "#95a5a6", marginBottom: "1rem" }}>construction</span>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#2c3e50", marginBottom: "0.75rem" }}>準備中</h2>
        <p style={{ color: "#666", fontSize: "1rem", lineHeight: "1.6", maxWidth: "320px" }}>
          使い方ページは現在準備中です。<br />しばらくお待ちください。
        </p>
        <Link
          to="/mobile"
          style={{
            marginTop: "2rem",
            display: "inline-block",
            padding: "0.75rem 2rem",
            backgroundColor: "#3498db",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "600",
          }}
        >
          地図に戻る
        </Link>
      </div>
    </div>
  );
}
