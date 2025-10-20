import { useEffect, useRef, useState } from "react";
import type { Case } from "../lib/types";

// Leafletの型定義
type LeafletMap = any;
type LeafletMarker = any;
type LeafletIcon = any;

interface MapProps {
  cases?: Case[];
  center?: [number, number];
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  selectedCaseId?: number;
}

export default function Map({
  cases = [],
  center = [41.786085560648345, 140.7452487945557], // デフォルトは函館
  zoom = 10,
  onMapClick,
  selectedCaseId,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  // ES6 Mapを使用してマーカーを管理
  const markersRef = useRef<globalThis.Map<number, LeafletMarker>>(new globalThis.Map<number, LeafletMarker>());
  const [isLoaded, setIsLoaded] = useState(false);

  // Leafletの動的読み込み
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadLeaflet = async () => {
      if (!(window as any).L) {
        await import("leaflet");
      }
      setIsLoaded(true);
    };

    loadLeaflet();
  }, []);

  // 地図の初期化
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // 地図の作成
    const map = L.map(mapRef.current).setView(center, zoom);

    // タイルレイヤーの追加（OpenStreetMap）
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // 地図クリックイベント
    if (onMapClick) {
      map.on("click", (e: any) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isLoaded, center, zoom, onMapClick]);

  // マーカーの更新
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const L = (window as any).L;
    if (!L) return;

    const map = mapInstanceRef.current;
    const markers = markersRef.current;

    // 既存のマーカーをクリア
    markers.forEach((marker) => marker.remove());
    markers.clear();

    // 優先度に応じたアイコンカラー
    const getMarkerColor = (priority: string): string => {
      switch (priority) {
        case "high":
          return "red";
        case "medium":
          return "orange";
        case "low":
          return "green";
        default:
          return "blue";
      }
    };

    // 新しいマーカーを追加
    cases.forEach((caseItem) => {
      const color = getMarkerColor(caseItem.priority);
      const isSelected = selectedCaseId === caseItem.id;

      // カスタムアイコンの作成
      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: ${color};
            width: ${isSelected ? "30px" : "20px"};
            height: ${isSelected ? "30px" : "20px"};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            transition: all 0.2s;
          "></div>
        `,
        iconSize: [isSelected ? 30 : 20, isSelected ? 30 : 20],
        iconAnchor: [isSelected ? 15 : 10, isSelected ? 15 : 10],
      });

      const marker = L.marker([caseItem.latitude, caseItem.longitude], { icon })
        .addTo(map)
        .bindPopup(
          `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem;">${caseItem.title}</h3>
            ${caseItem.description ? `<p style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">${caseItem.description}</p>` : ""}
            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
              <span class="badge badge-${caseItem.status}">${caseItem.status}</span>
              <span class="badge badge-${caseItem.priority}">${caseItem.priority}</span>
            </div>
          </div>
        `,
          { maxWidth: 300 }
        );

      markers.set(caseItem.id, marker);

      // 選択された事案の場合はポップアップを開く
      if (isSelected) {
        marker.openPopup();
      }
    });

    // マーカーが存在する場合、全てのマーカーが見えるように調整
    if (cases.length > 0 && !selectedCaseId) {
      const bounds = L.latLngBounds(
        cases.map((c) => [c.latitude, c.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [cases, isLoaded, selectedCaseId]);

  if (!isLoaded) {
    return (
      <div className="map-container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="map-container" />;
}
