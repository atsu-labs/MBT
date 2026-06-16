import { useState } from "react";
import { Link } from "react-router";
import screenshotMap from "~/images/screenshot_map.png";
import screenshotShare from "~/images/screenshot_share.png";
import screenshotSheet from "~/images/screenshot_sheet.png";

type TabType = "map" | "share" | "timeline";

export default function MobileHelp() {
  const [activeTab, setActiveTab] = useState<TabType>("map");

  const tabContents = {
    map: {
      title: "地図と事案の確認",
      icon: "map",
      image: screenshotMap,
      steps: [
        "地図上のピンをタップすると、その事案の詳細が確認できます。",
        "画面下の「事案一覧」を押すと、登録されている事案がボトムシートで一覧表示されます。",
        "事案一覧ではステータス（対応中、完了など）でフィルタリングが可能です。",
        "リスト内の事案をタップすると、地図がその場所へ自動でジャンプします。"
      ],
      tip: "マップは指でピンチイン・アウトすることで拡大縮小できます。右側の「＋」「ー」ボタンでも操作可能です。"
    },
    share: {
      title: "現在地と位置情報の共有",
      icon: "my_location",
      image: screenshotShare,
      steps: [
        "画面下の「現在地」ボタンを押すと、あなたの現在地にマップが移動します。",
        "ヘッダー右上の「位置共有」トグルをONにすると、共有設定モーダルが開きます。",
        "表示名（ニックネーム等）と共通のパスコードを入力して「共有開始」を押します。",
        "共有中は、他のメンバーの地図上にもあなたの位置が表示されるようになります。"
      ],
      tip: "位置情報の共有を停止したい場合は、ヘッダー右上のトグルを再度OFFにするだけで、共有データは即座に削除されます。"
    },
    timeline: {
      title: "タイムラインと更新",
      icon: "timeline",
      image: screenshotSheet,
      steps: [
        "画面下の「タイムライン」ボタンを押すと、事案の履歴を時系列（タイムライン形式）で確認できます。",
        "地図画面や事案一覧を最新の状態にするには、画面下の「更新」ボタンをタップします。",
        "タイムライン画面では、過去の対応経緯や完了した事案の流れが視覚的に把握できます。"
      ],
      tip: "現場の状況は刻一刻と変化します。定期的に「更新」ボタンをタップして最新情報を取り込んでください。"
    }
  };

  const currentContent = tabContents[activeTab];

  return (
    <div style={{
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#f4f6f8",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      overflow: "hidden"
    }}>
      {/* ヘッダー */}
      <header style={{
        backgroundColor: "#2c3e50",
        color: "white",
        padding: "0 1rem",
        height: "50px",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        flexShrink: 0,
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%" }}>
          <Link
            to="/mobile"
            style={{
              color: "white",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.1)",
              transition: "background-color 0.2s"
            }}
            aria-label="戻る"
          >
            <span className="material-icons" style={{ fontSize: "1.25rem" }}>arrow_back</span>
          </Link>
          <h1 style={{ fontSize: "1.1rem", fontWeight: "600", margin: 0 }}>使い方ガイド</h1>
        </div>
      </header>

      {/* タブナビゲーション */}
      <nav style={{
        display: "flex",
        backgroundColor: "white",
        borderBottom: "1px solid #e0e0e0",
        flexShrink: 0,
        padding: "4px 8px"
      }}>
        {(Object.keys(tabContents) as TabType[]).map((tabKey) => {
          const tab = tabContents[tabKey];
          const isActive = activeTab === tabKey;
          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              style={{
                flex: 1,
                padding: "8px 4px",
                border: "none",
                background: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                color: isActive ? "#3498db" : "#7f8c8d",
                borderBottom: isActive ? "3px solid #3498db" : "3px solid transparent",
                fontWeight: isActive ? "600" : "500",
                transition: "all 0.2s ease"
              }}
            >
              <span className="material-icons" style={{ fontSize: "1.3rem" }}>{tab.icon}</span>
              <span style={{ fontSize: "0.7rem", whiteSpace: "nowrap" }}>{tab.title.split("と")[0]}</span>
            </button>
          );
        })}
      </nav>

      {/* メインスクロールエリア */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        paddingBottom: "2rem"
      }}>
        {/* タイトルと説明セクション */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "1rem",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
        }}>
          <h2 style={{
            fontSize: "1.1rem",
            color: "#2c3e50",
            fontWeight: "700",
            margin: "0 0 0.75rem 0",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <span className="material-icons" style={{ color: "#3498db", fontSize: "1.4rem" }}>{currentContent.icon}</span>
            {currentContent.title}
          </h2>

          <ol style={{
            margin: 0,
            paddingLeft: "1.25rem",
            color: "#4a5568",
            fontSize: "0.875rem",
            lineHeight: "1.6"
          }}>
            {currentContent.steps.map((step, idx) => (
              <li key={idx} style={{ marginBottom: "0.5rem" }}>
                {step}
              </li>
            ))}
          </ol>

          {/* ヒントブロック */}
          <div style={{
            marginTop: "1rem",
            padding: "0.75rem",
            backgroundColor: "#ebf8ff",
            borderLeft: "4px solid #3182ce",
            borderRadius: "4px",
            fontSize: "0.8rem",
            color: "#2b6cb0",
            lineHeight: "1.5"
          }}>
            <strong style={{ display: "block", marginBottom: "0.25rem" }}>💡 ヒント</strong>
            {currentContent.tip}
          </div>
        </div>

        {/* スマホモックアップ表示 */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0.5rem 0"
        }}>
          <div style={{
            position: "relative",
            width: "250px",
            height: "500px",
            border: "12px solid #2c3e50",
            borderRadius: "36px",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            background: "#000",
          }}>
            {/* ノッチ */}
            <div style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100px",
              height: "16px",
              backgroundColor: "#2c3e50",
              borderBottomLeftRadius: "10px",
              borderBottomRightRadius: "10px",
              zIndex: 2
            }} />
            
            {/* 画面コンテンツ */}
            <div style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#f7fafc",
              position: "relative"
            }}>
              <img
                src={currentContent.image}
                alt={currentContent.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            </div>
          </div>
        </div>

        {/* 画像差し替えに関する注記 */}
        <div style={{
          backgroundColor: "#fffaf0",
          border: "1px dashed #dd6b20",
          borderRadius: "8px",
          padding: "0.75rem",
          fontSize: "0.75rem",
          color: "#dd6b20",
          lineHeight: "1.5",
          textAlign: "center"
        }}>
          ※この画像はプレースホルダー（ダミー画像）です。<br />
          実機のスクリーンショットを <code>app/images/</code> 内の同名PNGファイルに上書き保存することで、実際の画面表示に変更できます。
        </div>
      </div>
    </div>
  );
}
