import { useState } from "react";
import { Link } from "react-router";
import ssMain from "~/images/SS-main.png";
import ssPopup from "~/images/SS-popup.png";
import ssCases from "~/images/SS-cases.png";
import ssShare from "~/images/SS-share.png";
import ssShareON from "~/images/SS-shareON.png";
import ssTimeline from "~/images/SS-timeline.png";

type TabType = "map" | "share" | "timeline";

interface HelpStep {
  text: string;
  image: string;
  note?: string;
}

interface TabContent {
  title: string;
  icon: string;
  steps: HelpStep[];
  tip: string;
}

const tabContents: Record<TabType, TabContent> = {
  map: {
    title: "地図と事案の確認",
    icon: "map",
    steps: [
      {
        text: "地図画面には、救護所（赤十字マーク）や関門（数字ピン）、コースラインが表示されます。",
        image: ssMain,
        note: "画面右上のチェックボックスで情報のフィルタリングが可能です。"
      },
      {
        text: "地図上のピンをタップすると、事案の詳細ポップアップが表示されます。",
        image: ssPopup,
        note: "事案の内容（年齢や症状）、対応状況、優先度、対応者を確認できます。"
      },
      {
        text: "画面下の「事案一覧」をタップすると、登録されている事案がボトムシートに一覧表示されます。",
        image: ssCases,
        note: "リスト内の事案をタップすると、地図がその場所へ自動で移動します。"
      }
    ],
    tip: "マップは指でピンチイン・アウトすることで拡大縮小できます。右側の「＋」「ー」ボタンでも操作可能です。"
  },
  share: {
    title: "現在地と位置情報の共有",
    icon: "my_location",
    steps: [
      {
        text: "ヘッダー右上の「位置共有」トグルをONにすると、共有設定ダイアログが表示されます。",
        image: ssShare,
        note: "表示名（あなたのお名前）と共通のパスコードを入力して「共有開始」をタップします。"
      },
      {
        text: "共有が開始されるとトグルが緑色になり、地図上にあなたのピンが表示されます。",
        image: ssShareON,
        note: "「名前（あなた）」として青い丸ピンで地図上に現在地が表示され、他のメンバーとリアルタイムに共有されます。"
      }
    ],
    tip: "位置情報の共有を停止したい場合は、ヘッダー右上のトグルを再度OFFにするだけで、共有データは即座に削除されます。"
  },
  timeline: {
    title: "活動時間タイムライン",
    icon: "timeline",
    steps: [
      {
        text: "画面下の「タイムライン」をタップすると、各メンバーの活動状況がタイムライン表示されます。",
        image: ssTimeline,
        note: "誰が（MBT1〜17）、いつ、どのエリア（area1〜12）で活動しているかがカラーバーで可視化されます。"
      }
    ],
    tip: "グループ行をピンチ・スクロールすることで、表示を拡大縮小できます。"
  }
};

export default function MobileHelp() {
  const [activeTab, setActiveTab] = useState<TabType>("map");
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);

  const currentContent = tabContents[activeTab];
  const currentStepIdx = activeStepIdx < currentContent.steps.length ? activeStepIdx : 0;
  const currentStep = currentContent.steps[currentStepIdx];

  const handleTabChange = (tabKey: TabType) => {
    setActiveTab(tabKey);
    setActiveStepIdx(0);
  };

  return (
    <div style={{
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#f4f6f8",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      overflow: "hidden"
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

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
              onClick={() => handleTabChange(tabKey)}
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
        {/* 操作ステップと説明 */}
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
            margin: "0 0 1rem 0",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <span className="material-icons" style={{ color: "#3498db", fontSize: "1.4rem" }}>{currentContent.icon}</span>
            {currentContent.title}
          </h2>

          {/* ステップのリスト選択 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {currentContent.steps.map((step, idx) => {
              const isStepActive = idx === currentStepIdx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStepIdx(idx)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    border: isStepActive ? "1px solid #3498db" : "1px solid #e2e8f0",
                    borderRadius: "8px",
                    backgroundColor: isStepActive ? "#ebf8ff" : "white",
                    textAlign: "left",
                    cursor: "pointer",
                    width: "100%",
                    transition: "all 0.2s ease",
                    boxShadow: isStepActive ? "0 2px 4px rgba(52, 152, 219, 0.1)" : "none"
                  }}
                >
                  <span style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: isStepActive ? "#3498db" : "#7f8c8d",
                    color: "white",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      color: isStepActive ? "#2b6cb0" : "#4a5568",
                      fontWeight: isStepActive ? "600" : "500",
                      lineHeight: "1.4"
                    }}>
                      {step.text}
                    </p>
                    {step.note && (
                      <p style={{
                        margin: "0.25rem 0 0 0",
                        fontSize: "0.75rem",
                        color: isStepActive ? "#4299e1" : "#718096",
                        lineHeight: "1.3"
                      }}>
                        {step.note}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ヒントブロック */}
          <div style={{
            marginTop: "1.25rem",
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
                key={currentStep.image}
                src={currentStep.image}
                alt={currentContent.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  animation: "fadeIn 0.3s ease-in-out"
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
