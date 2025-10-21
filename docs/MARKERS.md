# マーカーデータドキュメント

このドキュメントでは、地図上に表示される各種マーカーデータとコース情報について説明します。

## 概要

MBTシステムでは、マラソン・イベント運営に必要な以下の情報を地図上に表示します：

- **救護所（First Aid）**: 医療スタッフが待機する救護所
- **関門（Gate）**: 時間制限のある通過ポイント
- **エイド（Aid）**: 給水・給食ポイント
- **AED**: 自動体外式除細動器の設置場所
- **コース（Course）**: マラソンコース・ルート
- **事案（Cases）**: 動的に管理される事案・トラブル報告

## データ形式

すべてのマーカーデータは**GeoJSON**形式で定義されています。

### GeoJSONとは

GeoJSONは、地理的データを表現するためのJSON形式の標準仕様です。

**基本構造:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { /* メタデータ */ },
      "geometry": {
        "type": "Point",  // または "LineString", "Polygon"など
        "coordinates": [経度, 緯度]
      }
    }
  ]
}
```

## マーカーの種類

### 1. 救護所（First Aid）

**ファイル**: `app/lib/markers/markers.ts` - `firstAid`

**表示**: 赤色の円形マーカー

**用途**: 
- 医療スタッフが常駐する救護所の位置
- ランナーが体調不良時に向かう場所

**データ例:**
```json
{
  "type": "Feature",
  "properties": {
    "name": "第１救護所",
    "_markerType": "Icon",
    "_iconSize": [20, 20],
    "_iconAnchor": [10, 10]
  },
  "geometry": {
    "type": "Point",
    "coordinates": [140.772275, 41.775792]
  }
}
```

**表示スタイル:**
- 背景色: `#e74c3c` (赤)
- サイズ: 20px × 20px
- 形状: 円形
- 枠線: 3px 白色
- 影: `0 2px 5px rgba(0,0,0,0.3)`

### 2. 関門（Gate）

**ファイル**: `app/lib/markers/markers.ts` - `gate`

**表示**: オレンジ色の円形マーカー

**用途**:
- 制限時間が設定されたチェックポイント
- 時間内に通過できなかったランナーは収容される

**データ例:**
```json
{
  "type": "Feature",
  "properties": {
    "name": "第１関門",
    "comment": "10:00までに通過",
    "_markerType": "Icon",
    "_iconSize": [20, 20],
    "_iconAnchor": [10, 10]
  },
  "geometry": {
    "type": "Point",
    "coordinates": [140.739965, 41.769923]
  }
}
```

**表示スタイル:**
- 背景色: `#f39c12` (オレンジ)
- サイズ: 20px × 20px
- 形状: 円形
- 枠線: 3px 白色
- 影: `0 2px 5px rgba(0,0,0,0.3)`

**プロパティ:**
- `name`: 関門名（必須）
- `comment`: 通過時間などの追加情報（オプション）

### 3. エイド（Aid）

**ファイル**: `app/lib/markers/markers.ts` - `aid`

**表示**: 緑色の円形マーカー

**用途**:
- 給水・給食ポイント
- ランナーが補給を受けられる場所

**データ例:**
```json
{
  "type": "Feature",
  "properties": {
    "name": "エイドステーション1",
    "_markerType": "Icon",
    "_iconSize": [20, 20],
    "_iconAnchor": [10, 10]
  },
  "geometry": {
    "type": "Point",
    "coordinates": [140.745517, 41.781641]
  }
}
```

**表示スタイル:**
- 背景色: `#27ae60` (緑)
- サイズ: 20px × 20px
- 形状: 円形
- 枠線: 3px 白色
- 影: `0 2px 5px rgba(0,0,0,0.3)`

### 4. AED

**ファイル**: `app/lib/markers/markers.ts` - `aed`

**表示**: 青色の円形マーカー

**用途**:
- 自動体外式除細動器の設置場所
- 緊急時の救命処置に使用

**データ例:**
```json
{
  "type": "Feature",
  "properties": {
    "name": "AED設置場所1",
    "_markerType": "Icon",
    "_iconSize": [20, 20],
    "_iconAnchor": [10, 10]
  },
  "geometry": {
    "type": "Point",
    "coordinates": [140.74483, 41.785237]
  }
}
```

**表示スタイル:**
- 背景色: `#3498db` (青)
- サイズ: 20px × 20px
- 形状: 円形
- 枠線: 3px 白色
- 影: `0 2px 5px rgba(0,0,0,0.3)`

## コース情報

### コース（Course）

**ファイル**: `app/lib/markers/course.ts` - `course`

**表示**: ライン（線）

**用途**:
- マラソンコースの経路表示
- ランナーが走行するルート

**データ例:**
```json
{
  "type": "Feature",
  "properties": {
    "name": "区間1-前半",
    "_color": "#000000",
    "_opacity": 0.7,
    "_weight": 10
  },
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [140.74483, 41.785237],
      [140.74387, 41.785305],
      [140.743414, 41.789393]
    ]
  }
}
```

**プロパティ:**
- `name`: 区間名（必須）
- `_color`: ライン色（デフォルト: `#000000`）
- `_opacity`: 不透明度（0.0〜1.0、デフォルト: 0.7）
- `_weight`: ライン幅（ピクセル、デフォルト: 10）

**表示スタイル:**
- 太い線でコースを表現
- 複数の区間に分けて定義可能
- ポップアップで区間名を表示

## 動的マーカー（事案）

### 事案マーカー

**データソース**: Cloudflare D1データベース

**表示**: 優先度に応じた色の円形マーカー

**用途**:
- リアルタイムに発生する事案・トラブルの報告
- ランナーの怪我、転倒、迷子など

**優先度別の色:**
- **高（High）**: 赤色 - 緊急対応が必要
- **中（Medium）**: オレンジ色 - 通常対応
- **低（Low）**: 緑色 - 参考情報

**サイズ:**
- 通常: 20px × 20px
- 選択中: 30px × 30px（強調表示）

**ポップアップ:**
```html
<div style="min-width: 200px;">
  <h3>事案タイトル</h3>
  <p>事案の説明</p>
  <div>
    <span class="badge badge-open">open</span>
    <span class="badge badge-high">high</span>
  </div>
</div>
```

## レイヤーコントロール

地図上には、マーカーの表示/非表示を切り替えるレイヤーコントロールがあります。

**レイヤー一覧:**
- ☐ 救護所
- ☐ 関門
- ☐ エイド
- ☐ AED
- ☐ コース

ユーザーはチェックボックスで各レイヤーの表示を制御できます。

## マーカーデータの編集

### 固定マーカー（救護所、関門、エイド、AED、コース）

これらのデータはファイルベースで管理されています。

**編集手順:**

1. 該当ファイルを開く
   - マーカー: `app/lib/markers/markers.ts`
   - コース: `app/lib/markers/course.ts`

2. GeoJSON形式でデータを追加・編集
   ```json
   {
     "type": "Feature",
     "properties": {
       "name": "新しい救護所",
       "_markerType": "Icon",
       "_iconSize": [20, 20],
       "_iconAnchor": [10, 10]
     },
     "geometry": {
       "type": "Point",
       "coordinates": [経度, 緯度]  // ← 地図から座標を取得
     }
   }
   ```

3. アプリケーションを再ビルド
   ```bash
   npm run build
   ```

### 座標の取得方法

1. **Googleマップから**:
   - 目的地を右クリック
   - 座標をコピー
   - 形式: `緯度, 経度` → `[経度, 緯度]` に並び替え

2. **OpenStreetMapから**:
   - 目的地を右クリック → "Show address"
   - 座標が表示される（経度, 緯度の順）

3. **Leafletの地図上から**:
   - 開発者コンソールで地図クリックイベントを確認
   - `onMapClick`イベントで取得

### 動的マーカー（事案）

事案マーカーは管理画面から追加・編集できます：

1. 管理画面（`/admin`）にアクセス
2. 「事案管理」→「新規事案作成」
3. フォームに入力
4. 地図上をクリックして位置を設定
5. 「作成」ボタンをクリック

## データ変換ツール

### KMLからGeoJSONへの変換

Googleマイマップなどから出力したKMLファイルをGeoJSONに変換：

```bash
# オンラインツールを使用
https://mygeodata.cloud/converter/kml-to-geojson

# またはコマンドラインツール（ogr2ogr）
ogr2ogr -f GeoJSON output.json input.kml
```

### GPXからGeoJSONへの変換

GPSログをGeoJSONに変換：

```bash
# オンラインツール
https://mygeodata.cloud/converter/gpx-to-geojson

# またはJavaScriptライブラリ
npm install @mapbox/togeojson
```

## マーカーデータのバリデーション

GeoJSONの妥当性を確認：

```bash
# オンラインバリデーター
http://geojsonlint.com/

# Node.jsでのバリデーション
npm install @mapbox/geojsonhint
node -e "console.log(require('@mapbox/geojsonhint').hint(require('./markers.ts')))"
```

## パフォーマンス最適化

大量のマーカーを表示する場合の最適化：

1. **クラスタリング**: 近接するマーカーをグループ化
2. **ビューポート内のみ表示**: 表示範囲外のマーカーは非表示
3. **データの圧縮**: GeoJSONを最小化
4. **遅延読み込み**: 必要になったときにデータを読み込む

## トラブルシューティング

### マーカーが表示されない

- **座標の順序を確認**: GeoJSONは `[経度, 緯度]` の順
- **JSON構文エラー**: カンマやカッコの不足をチェック
- **レイヤーが非表示**: レイヤーコントロールで表示を確認

### マーカーの位置がずれる

- **座標系の違い**: WGS84（緯度・経度）を使用していることを確認
- **経度・緯度の逆転**: 座標の順序を確認

### コースが表示されない

- **LineStringの座標**: 少なくとも2点以上の座標が必要
- **座標の形式**: `[[経度, 緯度], [経度, 緯度], ...]`

## 今後の拡張

1. **アイコン画像**: カスタムアイコン画像の使用
2. **マーカーアニメーション**: 新規事案の強調表示
3. **ヒートマップ**: 事案発生頻度の可視化
4. **ルート案内**: 救護所までの経路表示
5. **リアルタイム更新**: 事案の即時反映

## 参考リンク

- [GeoJSON仕様](https://geojson.org/)
- [Leaflet GeoJSONドキュメント](https://leafletjs.com/reference.html#geojson)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [GeoJSON.io](http://geojson.io/) - GeoJSONエディタ
