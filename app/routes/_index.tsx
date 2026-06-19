import { Link } from "react-router";
import mobileQR from "~/images/mobileQR.png";

export default function Index() {
  return (
    <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1rem" }}>
      <style>{`
        .lp-container {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafd 100%);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          padding: 3rem 2rem;
          text-align: center;
          margin-top: 1rem;
          border: 1px solid rgba(226, 232, 240, 0.8);
        }
        .lp-title {
          font-size: 2.75rem;
          font-weight: 800;
          background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }
        .lp-subtitle {
          font-size: 1.15rem;
          color: #64748b;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }
        .lp-actions {
          display: flex;
          gap: 1.25rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }
        .lp-btn {
          font-size: 1.05rem;
          font-weight: 600;
          padding: 0.875rem 2.25rem;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .lp-btn-primary {
          background-color: #3498db;
          color: white;
        }
        .lp-btn-primary:hover {
          background-color: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(52, 152, 219, 0.3), 0 4px 6px -2px rgba(52, 152, 219, 0.15);
        }
        .lp-btn-secondary {
          background-color: #ffffff;
          color: #2c3e50;
          border: 2px solid #e2e8f0;
        }
        .lp-btn-secondary:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
        }
        
        .lp-qr-section {
          background-color: #ffffff;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 3rem;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          text-align: left;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
        }
        .lp-qr-image-container {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 140px;
          height: 140px;
          flex-shrink: 0;
        }
        .lp-qr-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .lp-qr-info {
          flex: 1;
        }
        .lp-qr-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .lp-qr-text {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.5;
        }

        .lp-features {
          text-align: left;
        }
        .lp-features-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1.5rem;
          text-align: center;
          position: relative;
        }
        .lp-features-title::after {
          content: '';
          display: block;
          width: 40px;
          height: 3px;
          background: #3498db;
          margin: 0.5rem auto 0;
          border-radius: 2px;
        }
        .lp-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .lp-feature-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.25s ease;
          display: flex;
          gap: 1rem;
        }
        .lp-feature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.03);
          border-color: #cbd5e1;
        }
        .lp-feature-icon-container {
          background-color: #ebf5ff;
          color: #3498db;
          border-radius: 10px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .lp-feature-icon {
          font-size: 1.5rem;
        }
        .lp-feature-info {
          flex: 1;
        }
        .lp-feature-name {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.35rem;
        }
        .lp-feature-desc {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.5;
        }

        @media (max-width: 640px) {
          .lp-container {
            padding: 2rem 1rem;
          }
          .lp-title {
            font-size: 2rem;
          }
          .lp-qr-section {
            flex-direction: column;
            text-align: center;
            gap: 1.25rem;
            padding: 1.5rem;
          }
          .lp-qr-image-container {
            width: 160px;
            height: 160px;
          }
        }
      `}</style>

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

