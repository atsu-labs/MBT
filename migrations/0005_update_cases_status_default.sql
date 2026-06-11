-- 既存DBのcasesテーブルのstatusデフォルト値をpendingへ更新
-- SQLite(D1)では既存カラムのDEFAULTをALTER TABLEで変更できないため、テーブル再作成で反映する
-- 本番適用前に必ずバックアップと検証を行うこと

CREATE TABLE cases_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  assigned_team TEXT,
  result TEXT
);

INSERT INTO cases_new (
  id,
  title,
  description,
  latitude,
  longitude,
  status,
  priority,
  created_at,
  updated_at,
  assigned_team,
  result
)
SELECT
  id,
  title,
  description,
  latitude,
  longitude,
  status,
  priority,
  created_at,
  updated_at,
  assigned_team,
  result
FROM cases;

DROP TABLE cases;
ALTER TABLE cases_new RENAME TO cases;

CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at);

