-- 旧ステータス値を新ステータス値へ移行
UPDATE cases SET status = 'in_progress' WHERE status = 'open';
UPDATE cases SET status = 'completed' WHERE status = 'closed';
