-- casesテーブルに担当チームカラムを追加
ALTER TABLE cases ADD COLUMN assigned_team TEXT;

-- casesテーブルに結果カラムを追加
ALTER TABLE cases ADD COLUMN result TEXT;
