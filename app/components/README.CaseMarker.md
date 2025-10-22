# CaseMarker

## 概要

`CaseMarker` は、地図上に事案マーカーを表示するための Leaflet アイコンを生成する関数です。

## 使用方法

```tsx
import createCaseIcon from "./CaseMarker";
import type { Case } from "../lib/types";

// マーカーアイコンの生成
const caseItem: Case = {
  id: 1,
  priority: "high",
  // ... その他のプロパティ
};

const icon = createCaseIcon(caseItem, false);

// Leaflet マーカーに適用
if (icon) {
  const marker = L.marker([lat, lng], { icon });
}
```

## 関数シグネチャ

```tsx
function createCaseIcon(caseItem: Case, selected?: boolean): any | null
```

### パラメータ

- `caseItem` (Case): 事案オブジェクト
  - `id`: 事案ID（マーカー内に表示される）
  - `priority`: 優先度（"high", "medium", "low"）- マーカーの色を決定
- `selected` (boolean, optional): マーカーが選択されているかどうか（デフォルト: false）
  - true の場合、マーカーのサイズが大きくなり、太い枠線が表示される

### 戻り値

- `L.DivIcon` または `null`
  - SSR環境またはLeafletが未ロードの場合は `null` を返す
  - それ以外の場合は、Leaflet の `divIcon` オブジェクトを返す

## 優先度による色分け

- `high`: 赤 (#e74c3c) - 緊急対応が必要
- `medium`: オレンジ (#f39c12) - 通常対応
- `low`: 緑 (#27ae60) - 参考情報
- その他: 青 (#3498db) - デフォルト

## スタイル

マーカーのスタイルは `app/styles/case-marker.css` で定義されています。

### クラス

- `.case-marker`: 基本クラス
- `.case-marker-outer`: 外側の円（枠線と影を持つ）
- `.case-marker-outer.selected`: 選択状態のスタイル
- `.case-marker-inner`: 内側の円（背景色とテキストを持つ）

## SSR 対応

この関数は SSR（サーバーサイドレンダリング）に対応しています。

```tsx
if (typeof window === "undefined") return null;
```

サーバー側では `null` を返すため、クライアント側でのみアイコンが生成されます。

## 注意事項

- この関数は React フックを使用していないため、Reactコンポーネント内でも安全に呼び出せます
- Leaflet が未ロードの場合は `null` を返すため、呼び出し側で null チェックが必要です
- `window.L` を直接参照しているため、Leaflet のグローバル変数が必要です

## 変更履歴

- 2025-10-22: 初版作成（React フックを使わない純粋関数として実装）
