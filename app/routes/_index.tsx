import { Link } from "react-router";
import mobileQR from "~/images/mobileQR.png";

export default function Index() {
  return (
    <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1rem" }}>
      <div className="lp-container">
        <h1 className="lp-title">事案管理システム (MBT)</h1>
        <p className="lp-subtitle">
          位置情報を活用したリアルタイムな現場活動支援と事案管理
        </p>

        <div className="lp-actions">
          <Link to="/admin" className="lp-btn lp-btn-primary">
            <span className="material-icons">dashboard</span>
            管理画面へ
          </Link>
          <Link to="/mobile" className="lp-btn lp-btn-secondary">
            <span className="material-icons">stay_current_portrait</span>
            モバイル画面へ
          </Link>
        </div>

        <div className="lp-qr-section">
          <div className="lp-qr-image-container">
            <img src={mobileQR} alt="モバイル用QRコード" className="lp-qr-image" />
          </div>
          <div className="lp-qr-info">
            <h3 className="lp-qr-title">
              <span className="material-icons" style={{ color: "#3498db" }}>qr_code_2</span>
              スマートフォンでのご利用
            </h3>
            <p className="lp-qr-text">
              カメラアプリでこのQRコードを読み取ると、モバイル端末からすぐに現場マップ、位置共有機能、およびタイムラインをご利用いただけます。現場での活動にご活用ください。
            </p>
          </div>
        </div>

        <div className="lp-features">
          <h2 className="lp-features-title">主な機能</h2>
          <div className="lp-features-grid">
            <div className="lp-feature-card">
              <div className="lp-feature-icon-container">
                <span className="material-icons lp-feature-icon">map</span>
              </div>
              <div className="lp-feature-info">
                <h3 className="lp-feature-name">リアルタイムな現場マップ</h3>
                <p className="lp-feature-desc">
                  救護所や関門、コース情報と、現場で発生した事案の位置を地図上に瞬時に表示し、状況を直感的に把握できます。
                </p>
              </div>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon-container">
                <span className="material-icons lp-feature-icon">my_location</span>
              </div>
              <div className="lp-feature-info">
                <h3 className="lp-feature-name">位置情報のリアルタイム共有</h3>
                <p className="lp-feature-desc">
                  GPSを使って自分の現在地をメンバー間でリアルタイム共有。お互いの位置を把握し、連携をスムーズにします。
                </p>
              </div>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon-container">
                <span className="material-icons lp-feature-icon">timeline</span>
              </div>
              <div className="lp-feature-info">
                <h3 className="lp-feature-name">活動状況のタイムライン</h3>
                <p className="lp-feature-desc">
                  メンバーがどのエリアで活動しているかをタイムライン形式で分かりやすく可視化し、全体の活動をサポートします。
                </p>
              </div>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon-container">
                <span className="material-icons lp-feature-icon">stay_current_portrait</span>
              </div>
              <div className="lp-feature-info">
                <h3 className="lp-feature-name">モバイル最適化 UI</h3>
                <p className="lp-feature-desc">
                  屋外や移動中でも片手でスムーズに操作可能。スムーズな事案の確認や報告を強力に支援します。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

