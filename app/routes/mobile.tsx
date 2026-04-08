import { useState, useEffect, useRef } from "react";
import { useLoaderData, Link, useRevalidator } from "react-router";
import Map from "~/components/Map";
import type { MapHandle } from "~/components/Map";
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
  const { revalidate } = useRevalidator();
  const mapRef = useRef<MapHandle>(null);

  const [selectedCase, setSelectedCase] = useState<(typeof cases)[number] | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed">("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

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
        } catch (e) {
          console.error("Failed to post location:", e);
        }
      }

      try {
        const res = await fetch("/api/locations");
        if (res.ok) {
          const data = (await res.json()) as { locations: UserLocation[] };
          setUserLocations(data.locations || []);
        }
      } catch (e) {
        console.error("Failed to fetch locations:", e);
      }
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
              fetch("/api/locations", { method: "DELETE", body: formData }).catch((e) => {
                console.error("Failed to clear location after permission denied:", e);
              });
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
        await fetch("/api/locations", { method: "DELETE", body: formData }).catch((e) => {
          console.error("Failed to delete location on toggle off:", e);
        });
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

  // 現在地へ移動
  const handleGoToCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("このブラウザは位置情報をサポートしていません。");
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.flyTo(pos.coords.latitude, pos.coords.longitude, 15);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("位置情報の取得が許可されていません。ブラウザの設定をご確認ください。");
        } else {
          setGeoError("現在地の取得に失敗しました。");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 事案一覧タップ時の処理
  const handleCaseSelect = (caseItem: (typeof cases)[number]) => {
    setSelectedCase(caseItem);
    setIsSheetOpen(false);
    mapRef.current?.flyTo(caseItem.latitude, caseItem.longitude, 16);
  };

  // フィルタリング＋新しい順にソート
  const filteredCases = cases
    .filter((c) => {
      if (filterStatus === "all") return true;
      return c.status === filterStatus;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="mobile-root">
      {/* 地図（全画面） */}
      <div className="mobile-map-area">
        <Map
          ref={mapRef}
          cases={filteredCases}
          selectedCaseId={selectedCase?.id}
          userLocations={userLocations}
          mySessionId={sessionId}
        />

        {/* ズームFAB */}
        <div className="mobile-zoom-fab">
          <button
            className="mobile-fab-btn"
            onClick={() => mapRef.current?.zoomIn()}
            aria-label="ズームイン"
          >
            <span className="material-icons">add</span>
          </button>
          <button
            className="mobile-fab-btn"
            onClick={() => mapRef.current?.zoomOut()}
            aria-label="ズームアウト"
          >
            <span className="material-icons">remove</span>
          </button>
        </div>

        {/* 位置共有トグル（右上） */}
        <div className="mobile-share-fab">
          <label className="mobile-share-label" title="位置共有">
            <span className="material-icons" style={{ color: isSharing ? "#27ae60" : "#95a5a6" }}>
              share_location
            </span>
            <input
              type="checkbox"
              checked={isSharing}
              onChange={(e) => handleToggleShare(e.target.checked)}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
            />
          </label>
        </div>

        {/* 位置情報エラー表示 */}
        {geoError && (
          <div className="mobile-geo-error">
            <span>{geoError}</span>
            <button onClick={() => setGeoError(null)} aria-label="閉じる" style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
              <span className="material-icons" style={{ fontSize: "1rem" }}>close</span>
            </button>
          </div>
        )}
      </div>

      {/* 下部ナビ */}
      <nav className="mobile-bottom-nav">
        <button className="mobile-nav-btn" onClick={handleGoToCurrentLocation} aria-label="現在地">
          <span className="material-icons">my_location</span>
          <span className="mobile-nav-label">現在地</span>
        </button>
        <Link to="/mobile/timeline" className="mobile-nav-btn" aria-label="タイムライン">
          <span className="material-icons">timeline</span>
          <span className="mobile-nav-label">タイムライン</span>
        </Link>
        <button className="mobile-nav-btn" onClick={() => revalidate()} aria-label="更新">
          <span className="material-icons">refresh</span>
          <span className="mobile-nav-label">更新</span>
        </button>
        <button className="mobile-nav-btn" onClick={() => setIsSheetOpen(true)} aria-label="事案一覧">
          <span className="material-icons">list</span>
          <span className="mobile-nav-label">事案一覧</span>
        </button>
        <Link to="/mobile/help" className="mobile-nav-btn" aria-label="使い方">
          <span className="material-icons">help_outline</span>
          <span className="mobile-nav-label">使い方</span>
        </Link>
      </nav>

      {/* ボトムシート（事案一覧） */}
      {isSheetOpen && (
        <>
          {/* オーバーレイ */}
          <div className="mobile-sheet-overlay" onClick={() => setIsSheetOpen(false)} />
          {/* シート本体 */}
          <div className="mobile-bottom-sheet">
            {/* シートヘッダー */}
            <div className="mobile-sheet-header">
              <div className="mobile-sheet-drag-handle" />
              <div className="mobile-sheet-header-row">
                <h2 className="mobile-sheet-title">
                  事案一覧（{filteredCases.length}件）
                </h2>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as "all" | "open" | "closed")}
                    className="mobile-sheet-filter"
                    aria-label="フィルタ"
                  >
                    <option value="all">すべて</option>
                    <option value="open">対応中</option>
                    <option value="closed">完了</option>
                  </select>
                  <button className="mobile-sheet-close-btn" onClick={() => setIsSheetOpen(false)} aria-label="閉じる">
                    <span className="material-icons">close</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 事案リスト */}
            <div className="mobile-sheet-list">
              {filteredCases.length === 0 ? (
                <div className="mobile-sheet-empty">表示する事案がありません</div>
              ) : (
                filteredCases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className={`mobile-case-item${selectedCase?.id === caseItem.id ? " mobile-case-item--selected" : ""}`}
                    onClick={() => handleCaseSelect(caseItem)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleCaseSelect(caseItem)}
                  >
                    <div className="mobile-case-item-header">
                      <h3 className="mobile-case-title">{caseItem.title}</h3>
                      <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                        <span className={`badge badge-${caseItem.status}`} style={{ fontSize: "0.75rem" }}>
                          {caseItem.status}
                        </span>
                        <span className={`badge badge-${caseItem.priority}`} style={{ fontSize: "0.75rem" }}>
                          {caseItem.priority}
                        </span>
                      </div>
                    </div>
                    {caseItem.description && (
                      <p className="mobile-case-description">
                        {caseItem.description.length > 80
                          ? `${caseItem.description.slice(0, 80)}...`
                          : caseItem.description}
                      </p>
                    )}
                    <p className="mobile-case-time">
                      {new Date(caseItem.created_at).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* 位置共有モーダル */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.5)",
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

