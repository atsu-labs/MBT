# CaseMarker Component

事案の位置を地図上に数値マーカーで表示するReactコンポーネント。

## 概要

CaseMarkerは、Leaflet地図上に事案IDを数値で表示する円形バッジマーカーを生成します。優先度に応じた色分けと、選択状態でのサイズ変更に対応しています。

## 使用方法

### 基本的な使用例

```tsx
import CaseMarker from "~/components/CaseMarker";

// Map コンポーネント内で使用
const icon = CaseMarker({
  caseItem: caseData,
  selected: selectedId === caseData.id,
});

const marker = L.marker([lat, lng], { icon }).addTo(map);
```

## Props

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `caseItem` | `Case` | ✅ | 表示する事案データ |
| `selected` | `boolean` | ❌ | 選択状態（デフォルト: false） |
| `onClick` | `() => void` | ❌ | クリック時のコールバック関数 |

## 優先度カラーマッピング

| 優先度 | カラーコード | 色 |
|--------|-------------|-----|
| `high` | `#e74c3c` | 赤 |
| `medium` | `#f39c12` | オレンジ |
| `low` | `#27ae60` | 緑 |
| その他 | `#3498db` | 青 |

## サイズ仕様

| 状態 | マーカーサイズ | フォントサイズ |
|------|---------------|---------------|
| 通常 | 20x20px | 12px |
| 選択中 | 30x30px | 14px |

## 主な機能

- ✅ **数値表示**: 事案IDを円形バッジ内に表示
- ✅ **色分け**: 優先度に応じた自動的な色付け
- ✅ **選択状態**: サイズ変更で選択状態を視覚的に表現
- ✅ **SSR対応**: サーバーサイドレンダリングでも安全に動作
- ✅ **パフォーマンス**: React.useMemoで不要な再生成を防止
- ✅ **アニメーション**: スムーズな状態遷移とホバー効果

## スタイル

CSSは `app/styles/case-marker.css` で定義されています。

主なクラス:
- `.case-marker-outer`: マーカーの外側コンテナ（ボーダーとシャドウ）
- `.case-marker-inner`: マーカーの内側（色付き背景と数値）
- `.case-marker-outer.selected`: 選択状態のスタイル

## 技術的な詳細

### パフォーマンス最適化

```tsx
const icon = useMemo(() => {
  // アイコン生成ロジック
}, [caseItem.id, caseItem.priority, selected]);
```

`useMemo`により、以下の場合のみアイコンが再生成されます：
- 事案IDが変更された時
- 優先度が変更された時
- 選択状態が変更された時

### SSR（サーバーサイドレンダリング）対応

```tsx
if (typeof window === "undefined") return null;
```

サーバーサイドでの実行時は`null`を返し、クライアントサイドでのみLeafletアイコンを生成します。

## 依存関係

- React (useMemo)
- Leaflet (L.divIcon)
- Case型定義 (`~/lib/types`)

## 関連ファイル

- コンポーネント: `app/components/CaseMarker.tsx`
- スタイル: `app/styles/case-marker.css`
- 型定義: `app/lib/types.ts`
- 使用例: `app/components/Map.tsx`
