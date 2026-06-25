import { useState } from "react";
import { useLoaderData, useFetcher, Link, useSearchParams } from "react-router";
import { getAllCases, deleteCase } from "~/lib/db.server";
import { CASE_STATUS_OPTIONS, getCasePriorityLabel, getCaseStatusBadgeClass, getCaseStatusLabel, getCaseTeamLabel } from "~/lib/case-display";
import "~/lib/context";
import type { Route } from ".react-router/types/app/routes/+types/admin.cases._index";

export async function loader({ context }: Route.LoaderArgs) {
  const cases = await getAllCases(context.cloudflare.env.DB);
  return { cases };
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const id = parseInt(formData.get("id") as string);
  if (isNaN(id) || id <= 0) {
    throw new Response("IDが無効です", { status: 400 });
  }
  await deleteCase(context.cloudflare.env.DB, id);
  return { success: true };
}

export default function CasesList() {
  const { cases } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const filter = (statusParam && CASE_STATUS_OPTIONS.some((opt) => opt.value === statusParam))
    ? (statusParam as (typeof CASE_STATUS_OPTIONS)[number]["value"])
    : "all";
  const [sortBy, setSortBy] = useState<"created" | "priority">("created");
  const selectedFilterLabel =
    CASE_STATUS_OPTIONS.find((status) => status.value === filter)?.label ?? "該当ステータス";

  const handleDelete = (id: number) => {
    if (!confirm("この事案を削除してもよろしいですか？")) {
      return;
    }
    fetcher.submit({ id: String(id) }, { method: "post" });
  };

  // フィルタリングとソート
  const filteredCases = cases
    .filter((c) => {
      if (filter === "all") return true;
      return c.status === filter;
    })
    .sort((a, b) => {
      if (sortBy === "created") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
    });

  const handleDownloadCSV = () => {
    // 1. ヘッダー定義
    const headers = [
      "ID",
      "タイトル",
      "詳細",
      "ステータス",
      "優先度",
      "担当チーム",
      "対応結果",
      "緯度",
      "経度",
      "作成日時",
      "更新日時"
    ];

    // 2. CSV値のエスケープ処理
    const escapeCSV = (val: string | null | number) => {
      if (val === null || val === undefined) {
        return "";
      }
      const str = String(val);
      if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // 3. データ行の構築
    const rows = filteredCases.map((c) => {
      const statusLabel = getCaseStatusLabel(c.status);
      const priorityLabel = getCasePriorityLabel(c.priority);
      const teamLabel = getCaseTeamLabel(c.assigned_team);
      const createdAtJST = new Date(c.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
      const updatedAtJST = new Date(c.updated_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

      return [
        c.id,
        c.title,
        c.description || "",
        statusLabel,
        priorityLabel,
        teamLabel,
        c.result || "",
        c.latitude,
        c.longitude,
        createdAtJST,
        updatedAtJST
      ].map(escapeCSV).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");

    // 4. BOM付きUTF-8の作成
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });

    // 5. ダウンロード実行
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    link.setAttribute("download", `cases_${timestamp}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.8rem" }}>事案一覧</h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={handleDownloadCSV} className="btn btn-secondary">
              CSV出力
            </button>
            <Link to="/admin/cases/new" className="btn btn-primary">
              新規作成
            </Link>
          </div>
        </div>

        {/* フィルターとソート */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <label style={{ marginRight: "0.5rem" }}>ステータス:</label>
              <select
                value={filter}
                onChange={(e) => {
                  const val = e.target.value;
                  const newParams = new URLSearchParams(searchParams);
                  if (val === "all") {
                    newParams.delete("status");
                  } else {
                    newParams.set("status", val);
                  }
                  setSearchParams(newParams);
                }}
                style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
              >
                <option value="all">すべて</option>
                {CASE_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          <div>
            <label style={{ marginRight: "0.5rem" }}>並び順:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
            >
              <option value="created">作成日時</option>
              <option value="priority">優先度</option>
            </select>
          </div>
        </div>
      </div>

      {filteredCases.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: "center", color: "#666", padding: "2rem" }}>
            {filter === "all"
              ? "事案がまだ登録されていません。"
              : `${selectedFilterLabel}の事案がありません。`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredCases.map((caseItem) => (
            <div key={caseItem.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                    <span className={`badge badge-${caseItem.priority}`}>
                      No.{caseItem.id}
                    </span>
                    <span className="badge">{getCaseTeamLabel(caseItem.assigned_team)}</span>
                    <span className={`badge ${getCaseStatusBadgeClass(caseItem.status)}`}>
                      {getCaseStatusLabel(caseItem.status)}
                    </span>
                  </div>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <Link
                      to={`/admin/cases/${caseItem.id}`}
                      style={{ fontSize: "1.2rem", fontWeight: "600", textDecoration: "none", color: "#2c3e50" }}
                    >
                      {caseItem.title}
                    </Link>
                  </div>
                  {caseItem.description && (
                    <p style={{ color: "#666", marginBottom: "0.5rem" }}>
                      {caseItem.description}
                    </p>
                  )}
                  {caseItem.result && (
                    <p style={{ color: "#27ae60", fontWeight: "500", fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                      結果: {caseItem.result}
                    </p>
                  )}
                  <p style={{ fontSize: "0.875rem", color: "#999" }}>
                    位置: {caseItem.latitude.toFixed(4)}, {caseItem.longitude.toFixed(4)}
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "#999" }}>
                    作成日: {new Date(caseItem.created_at).toLocaleString("ja-JP")}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link
                    to={`/admin/cases/${caseItem.id}/edit`}
                    className="btn btn-secondary"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(caseItem.id)}
                    className="btn btn-danger"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
