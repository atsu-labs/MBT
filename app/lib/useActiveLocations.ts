import { useState, useEffect } from "react";
import type { UserLocation } from "~/lib/types";

/**
 * 管理画面で利用者の位置情報を取得・管理するためのカスタムフック。
 * ローカルストレージに表示切り替え状態を保存し、表示オンの時は15秒ごとに位置情報を自動取得します。
 */
export function useActiveLocations() {
  const [showUserLocations, setShowUserLocations] = useState(true);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);

  // マウント時に localStorage から表示状態を読み込む
  useEffect(() => {
    const stored = localStorage.getItem("mbt_admin_showUserLocations");
    if (stored !== null) {
      setShowUserLocations(stored === "true");
    }
  }, []);

  // 表示切替時の処理
  const handleToggleUserLocations = (checked: boolean) => {
    setShowUserLocations(checked);
    localStorage.setItem("mbt_admin_showUserLocations", String(checked));
  };

  useEffect(() => {
    if (!showUserLocations) {
      setUserLocations([]);
      return;
    }

    const fetchLocations = async () => {
      try {
        const res = await fetch("/api/locations");
        if (res.ok) {
          const data = (await res.json()) as { locations: UserLocation[] };
          setUserLocations(data.locations || []);
        }
      } catch (e) {
        console.error("Failed to fetch user locations:", e);
      }
    };

    fetchLocations();
    // 管理画面のリアルタイム性を考慮し、15秒間隔でポーリングする
    const interval = setInterval(fetchLocations, 15000);

    return () => clearInterval(interval);
  }, [showUserLocations]);

  return {
    showUserLocations,
    userLocations,
    toggleUserLocations: handleToggleUserLocations,
  };
}
