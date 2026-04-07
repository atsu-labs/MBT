import { useState, useEffect, useRef } from "react";
import { useLoaderData, Link } from "react-router";
import Map from "~/components/Map";
import { getAllCases } from "~/lib/db.server";
import "~/lib/context";
import type { Route } from ".react-router/types/app/routes/+types/mobile";
import type { UserLocation } from "~/lib/types";

export async function loader({ context }: Route.LoaderArgs) {
  const cases = await getAllCases(context.cloudflare.env.DB);
  return { cases };
}

export default function MobileView() {
  const { cases } = useLoaderData<typeof loader>();
  const [selectedCase, setSelectedCase] = useState<(typeof cases)[number] | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed">("all");

  const [isSharing, setIsSharing] = useState(false);
  const [userName, setUserName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);

  const latestRefs = useRef({ userName: "", passcode: "" });
  useEffect(() => {
    latestRefs.current = { userName, passcode };
  }, [userName, passcode]);

  useEffect(() => {
    const storedSharing = localStorage.getItem("mbt_isSharing") === "true";
    const storedName = localStorage.getItem("mbt_userName") || "";
    const storedPasscode = localStorage.getItem("mbt_passcode") || "";
    let storedSessionId = localStorage.getItem("mbt_sessionId");

    if (!storedSessionId) {
      storedSessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("mbt_sessionId", storedSessionId);
    }

    setSessionId(storedSessionId);
    setUserName(storedName);
    setPasscode(storedPasscode);
    setIsSharing(storedSharing);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    let watchId: number;
    let lastLat: number | undefined;
    let lastLng: number | undefined;

    const performSync = async (lat?: number, lng?: number) => {
      if (lat) lastLat = lat;
      if (lng) lastLng = lng;

      const currentUserName = latestRefs.current.userName;
      const currentPasscode = latestRefs.current.passcode;

      if (isSharing && currentPasscode && currentUserName && lastLat !== undefined && lastLng !== undefined) {
        const formData = new FormData();
        formData.append("passcode", currentPasscode);
        formData.append("sessionId", sessionId);
        formData.append("userName", currentUserName);
        formData.append("latitude", String(lastLat));
        formData.append("longitude", String(lastLng));

        try {
          const res = await fetch("/api/locations", { method: "POST", body: formData });
          if (res.status === 401) {
            alert("パスコードが間違っています。位置情報の共有を停止しました。");
            setIsSharing(false);
            localStorage.setItem("mbt_isSharing", "false");
          }
        } catch (e) { }
      }

      try {
        const res = await fetch("/api/locations");
        if (res.ok) {
          const data: any = await res.json();
          setUserLocations(data.locations || []);
        }
      } catch (e) { }
    };

    const syncLocation = () => {
      if (isSharing) {
        navigator.geolocation.getCurrentPosition(
          (pos) => performSync(pos.coords.latitude, pos.coords.longitude),
          (err) => {
            console.error("Geo error", err);
            if (err.code === err.PERMISSION_DENIED) {
              alert("位置情報の取得が許可されていません。ブラウザの設定で位置情報を許可してください。");
              setIsSharing(false);
              localStorage.setItem("mbt_isSharing", "false");
              const formData = new FormData();
              formData.append("sessionId", sessionId);
              fetch("/api/locations", { method: "DELETE", body: formData }).catch(() => { });
            } else {
              performSync();
            }
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      } else {
        performSync();
      }
    };

    const interval = setInterval(() => syncLocation(), 60000);
    syncLocation();

    return () => {
      clearInterval(interval);
    };
  }, [sessionId, isSharing]);

  const handleToggleShare = async (checked: boolean) => {
    if (checked) {
      setShowModal(true);
    } else {
      setIsSharing(false);
      localStorage.setItem("mbt_isSharing", "false");
      if (sessionId) {
        const formData = new FormData();
        formData.append("sessionId", sessionId);
        await fetch("/api/locations", { method: "DELETE", body: formData });
      }
    }
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("mbt_userName", userName);
    localStorage.setItem("mbt_passcode", passcode);
    localStorage.setItem("mbt_isSharing", "true");
    setIsSharing(true);
    setShowModal(false);
  };

  // フィルタリング
  const filteredCases = cases.filter((c) => {
    if (filterStatus === "all") return true;
    return c.status === filterStatus;
  });

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* モバイルヘッダー */}
      <header
        style={{
          backgroundColor: "#2c3e50",
          color: "white",
          padding: "1rem",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "600" }}>事案閲覧</h1>
          <Link
            to="/"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            ホーム
          </Link>
        </div>
      </header>

      {/* フィルターと位置共有トグル */}
      <div
        style={{
          backgroundColor: "white",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid #eee",
          display: "flex",
          gap: "1rem",
          alignItems: "center"
        }}
      >
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontSize: "1rem",
          }}
        >
          <option value="all">すべての事案</option>
          <option value="open">対応中のみ</option>
          <option value="closed">完了のみ</option>
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: "bold" }}>
          <span>位置共有</span>
          <input
            type="checkbox"
            checked={isSharing}
            onChange={(e) => handleToggleShare(e.target.checked)}
            style={{ width: "1.25rem", height: "1.25rem" }}
          />
        </label>
      </div>

      {/* 地図 */}
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <Map
            cases={filteredCases}
            selectedCaseId={selectedCase?.id}
            userLocations={userLocations}
            mySessionId={sessionId}
          />
        </div>
      </div>

      {/* 事案リスト（スライドアップ可能） */}
      <div
        style={{
          backgroundColor: "white",
          maxHeight: "40vh",
          overflowY: "auto",
          borderTop: "2px solid #3498db",
          boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {filteredCases.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
            表示する事案がありません
          </div>
        ) : (
          <div>
            {filteredCases.map((caseItem) => (
              <div
                key={caseItem.id}
                onClick={() => setSelectedCase(caseItem)}
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  backgroundColor:
                    selectedCase?.id === caseItem.id ? "#f0f8ff" : "white",
                  transition: "background-color 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "0.5rem",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "#2c3e50",
                      margin: 0,
                    }}
                  >
                    {caseItem.title}
                  </h3>
                  <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                    <span
                      className={`badge badge-${caseItem.status}`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {caseItem.status}
                    </span>
                    <span
                      className={`badge badge-${caseItem.priority}`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {caseItem.priority}
                    </span>
                  </div>
                </div>
                {caseItem.description && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#666",
                      margin: "0 0 0.5rem 0",
                      lineHeight: "1.4",
                    }}
                  >
                    {caseItem.description.length > 80
                      ? `${caseItem.description.slice(0, 80)}...`
                      : caseItem.description}
                  </p>
                )}
                <p style={{ fontSize: "0.75rem", color: "#999", margin: 0 }}>
                  {new Date(caseItem.created_at).toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* モーダル */}
      {showModal && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
        }}>
          <form onSubmit={handleModalSubmit} style={{
            backgroundColor: "white", padding: "1.5rem", borderRadius: "8px", width: "100%", maxWidth: "400px"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>位置情報の共有</h3>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>表示名</label>
              <input
                type="text" required value={userName} onChange={(e) => setUserName(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                placeholder="あなたのお名前"
              />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>パスコード</label>
              <input
                type="password" required value={passcode} onChange={(e) => setPasscode(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowModal(false)} style={{
                padding: "0.5rem 1rem", border: "1px solid #ccc", backgroundColor: "white", borderRadius: "4px"
              }}>キャンセル</button>
              <button type="submit" style={{
                padding: "0.5rem 1rem", border: "none", backgroundColor: "#3498db", color: "white", borderRadius: "4px"
              }}>共有開始</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
