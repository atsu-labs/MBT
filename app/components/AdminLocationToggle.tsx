interface AdminLocationToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * 管理画面で利用者の位置情報表示ON/OFFを切り替えるトグルスイッチコンポーネント。
 */
export default function AdminLocationToggle({ checked, onChange }: AdminLocationToggleProps) {
  return (
    <label className="admin-toggle-container">
      <span className="admin-toggle-label">位置情報を表示</span>
      <span className="admin-toggle">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="admin-toggle-slider" />
      </span>
    </label>
  );
}
