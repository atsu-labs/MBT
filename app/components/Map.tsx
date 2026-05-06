import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import type { Case, UserLocation } from "../lib/types";
import { firstAid, gate, aid, aed } from "../lib/markers/markers";
import { course } from "../lib/markers/course";
import createCaseIcon from "./CaseMarker";

// Leafletの型定義
type LeafletMap = any;
type LeafletMarker = any;
type LeafletIcon = any;
type LeafletLayerGroup = any;
type LeafletGeoJSON = any;
type LeafletType = any;

/**
 * 親コンポーネントから呼び出せる地図操作 API
 */
export interface MapHandle {
  /** ズームイン */
  zoomIn: () => void;
  /** ズームアウト */
  zoomOut: () => void;
  /** 指定座標へ滑らかに移動 */
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

/**
 * Mapコンポーネントのプロパティ
 */
interface MapProps {
  /** 地図上に表示する事案の配列 */
  cases?: Case[];
  /** 地図の初期中心座標 [緯度, 経度] (デフォルト: 函館) */
  center?: [number, number];
  /** 地図の初期ズームレベル (デフォルト: 10) */
  zoom?: number;
  /** 地図クリック時のコールバック関数 */
  onMapClick?: (lat: number, lng: number) => void;
  /** 選択中の事案ID（選択中の事案は強調表示される） */
  selectedCaseId?: number;
  /** 他ユーザーおよび自分の位置情報の配列 */
  userLocations?: UserLocation[];
  /** 自分のセッションID（自分のマーカーを区別するため） */
  mySessionId?: string | null;
}

/**
 * Leaflet地図コンポーネント（forwardRef 対応）
 * 
 * マラソンイベントの事案管理用の地図を表示します。
 * 以下の機能を提供：
 * - 事案マーカーの表示（優先度別に色分け）
 * - 固定マーカーの表示（救護所、関門、エイド、AED）
 * - コースラインの表示
 * - レイヤーコントロール（表示/非表示の切り替え）
 * - 地図クリックイベント（新規事案作成時の位置選択）
 * - 外部からの zoomIn / zoomOut / flyTo（MapHandle 経由）
 * 
 * @example
 * ```tsx
 * // 基本的な使用
 * <Map cases={cases} />
 * 
 * // forwardRef で外部操作
 * const mapRef = useRef<MapHandle>(null);
 * <Map ref={mapRef} cases={cases} />
 * mapRef.current?.zoomIn();
 * mapRef.current?.flyTo(41.78, 140.74, 15);
 * ```
 */
const Map = forwardRef<MapHandle, MapProps>(function Map({
  cases = [],
  center = [41.786085560648345, 140.7452487945557], // デフォルトは函館
  zoom = 10,
  onMapClick,
  selectedCaseId,
  userLocations = [],
  mySessionId = null,
}: MapProps, ref) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const hasFitBoundsRef = useRef(false);
  // Leafletモジュールへの参照
  const leafletRef = useRef<LeafletType | null>(null);
  // ES6 Mapを使用してマーカーを管理
  const markersRef = useRef<globalThis.Map<number | string, LeafletMarker>>(new globalThis.Map<number | string, LeafletMarker>());
  const [isLoaded, setIsLoaded] = useState(false);

  // 直前の selectedCaseId を保持（選択が実際に変わった時だけポップアップを開くために使用）
  const prevSelectedCaseIdRef = useRef<number | undefined>(undefined);

  // コールバックを ref で保持（再レンダリングによる地図の再初期化を防ぐ）
  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // 親コンポーネントへ公開する操作 API
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      mapInstanceRef.current?.zoomIn();
    },
    zoomOut: () => {
      mapInstanceRef.current?.zoomOut();
    },
    flyTo: (lat: number, lng: number, zoom?: number) => {
      if (!mapInstanceRef.current) return;
      const currentZoom = zoom ?? mapInstanceRef.current.getZoom();
      mapInstanceRef.current.flyTo([lat, lng], currentZoom);
    },
  }), []);

  // Leafletの動的読み込み
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadLeaflet = async () => {
      const leaflet = await import("leaflet");
      leafletRef.current = leaflet.default;
      setIsLoaded(true);
    };

    loadLeaflet();
  }, []);

  // 地図の初期化
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = leafletRef.current;
    if (!L) return;

    // 地図の作成（zoomControl: false でデフォルトズームUIを非表示にし、カスタムボタンと重複しないようにする）
    // center と zoom は初期表示時のみ使用する
    const map = L.map(mapRef.current, { zoomControl: false }).setView(center, zoom);

    // タイルレイヤーの追加（OpenStreetMap）
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // マーカーレイヤーグループの作成
    const firstAidLayer = L.geoJSON(firstAid, {
      pointToLayer: (feature: any, latlng: any) => {
        return L.marker(latlng, {
          icon: L.divIcon({
            className: "custom-marker",
            html: `<div style="
              background-color: #e74c3c;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span class="material-icons" style="color: white; font-size: 20px;">local_hospital</span>
            </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).bindPopup(`<b>${feature.properties.name}</b>`);
      },
    });

    const gateLayer = L.geoJSON(gate, {
      pointToLayer: (feature: any, latlng: any) => {
        return L.marker(latlng, {
          icon: L.divIcon({
            className: "custom-marker",
            html: `<div style="
              background-color: #f39c12;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span class="material-icons" style="color: white; font-size: 20px;">flag</span>
            </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).bindPopup(`<b>${feature.properties.name}</b><br/>${feature.properties.comment || ""}`);
      },
    });

    const aidLayer = L.geoJSON(aid, {
      pointToLayer: (feature: any, latlng: any) => {
        return L.marker(latlng, {
          icon: L.divIcon({
            className: "custom-marker",
            html: `<div style="
              background-color: #27ae60;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span class="material-icons" style="color: white; font-size: 20px;">local_cafe</span>
            </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).bindPopup(`<b>${feature.properties.name}</b>`);
      },
    });

    const aedLayer = L.geoJSON(aed, {
      pointToLayer: (feature: any, latlng: any) => {
        return L.marker(latlng, {
          icon: L.divIcon({
            className: "custom-marker",
            html: `<div style="
              background-color: #3498db;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span class="material-icons" style="color: white; font-size: 20px;">favorite</span>
            </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).bindPopup(`<b>${feature.properties.name}</b>`);
      },
    });

    const courseLayer = L.geoJSON(course, {
      style: (feature: any) => {
        return {
          color: feature.properties._color || "#000000",
          opacity: feature.properties._opacity || 0.7,
          weight: feature.properties._weight || 5,
        };
      },
      onEachFeature: (feature: any, layer: any) => {
        if (feature.properties.name) {
          layer.bindPopup(`<b>${feature.properties.name}</b>`);
        }
      },
    });

    // オーバーレイ用のレイヤーグループ
    const overlayMaps = {
      "救護所": firstAidLayer,
      "関門": gateLayer,
      "エイド": aidLayer,
      "AED": aedLayer,
      "コース": courseLayer,
    };

    // レイヤーコントロールを追加
    L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);

    // 地図クリックイベント
    map.on("click", (e: any) => {
      if (onMapClickRef.current) {
        onMapClickRef.current(e.latlng.lat, e.latlng.lng);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isLoaded]); // center や zoom, onMapClick の変更で再初期化しない

  // マーカーの更新
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const L = leafletRef.current;
    if (!L) return;

    const map = mapInstanceRef.current;
    const markers = markersRef.current;

    // 既存のマーカーをクリア
    markers.forEach((marker) => marker.remove());
    markers.clear();

    // selectedCaseId が今回のレンダリングで実際に変わったかどうかを判定
    const didSelectionChange = selectedCaseId !== prevSelectedCaseIdRef.current;
    prevSelectedCaseIdRef.current = selectedCaseId;

    // 新しいマーカーを追加
    cases.forEach((caseItem) => {
      const isSelected = selectedCaseId === caseItem.id;
      const icon = createCaseIcon(caseItem, isSelected, L);
      if (!icon) return; // SSR や Leaflet 未ロード時はスキップ

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
          { maxWidth: 300, autoPan: false }
        );

      markers.set(caseItem.id, marker);

      // 選択された事案で、かつ今回初めて選択された（selectedCaseId が変わった）場合のみポップアップを開く
      // userLocations 更新などによる再レンダリング時にポップアップの autopan で地図が移動するのを防ぐ
      if (isSelected && didSelectionChange) {
        marker.openPopup();
      }
    });

    // ユーザーの位置情報マーカーを追加
    userLocations.forEach((loc) => {
      const isMe = mySessionId === loc.session_id;
      const markerHtml = isMe
        ? `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`
        : `<div style="background-color: #8b5cf6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`;

      const icon = L.divIcon({
        className: "custom-marker-user",
        html: markerHtml,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const tooltipContent = `<div style="font-weight:bold;">${isMe ? loc.user_name + " (あなた)" : loc.user_name}</div>`;

      const marker = L.marker([loc.latitude, loc.longitude], { icon })
        .addTo(map)
        .bindTooltip(tooltipContent, { permanent: true, direction: "top", offset: [0, -10], className: "user-tooltip", opacity: 0.9 })
        .bindPopup(`<b>${loc.user_name}</b><br>最終更新: ${new Date(loc.updated_at).toLocaleTimeString("ja-JP")}`);

      markers.set(`user_${loc.session_id}`, marker);
    });

    // マーカーが複数存在する場合、全てのマーカーが見えるように調整
    // 1つの場合は、クリックによる位置選択などの可能性があるため勝手に移動させない
    if (cases.length > 1 && !selectedCaseId && !hasFitBoundsRef.current) {
      const bounds = L.latLngBounds(
        cases.map((c) => [c.latitude, c.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
      hasFitBoundsRef.current = true;
    }
  }, [cases, isLoaded, selectedCaseId, userLocations, mySessionId]);

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
});

export default Map;
