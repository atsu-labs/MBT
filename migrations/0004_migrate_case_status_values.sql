-- 旧ステータス値を新ステータス値へ移行
-- 事前確認: SELECT status, COUNT(*) FROM cases WHERE status IN ('open', 'closed') GROUP BY status;
-- 問題発生時の復旧例: BEGIN; UPDATE cases SET status='open' WHERE status='in_progress'; UPDATE cases SET status='closed' WHERE status='completed'; COMMIT;
UPDATE cases SET status = 'in_progress' WHERE status = 'open';
UPDATE cases SET status = 'completed' WHERE status = 'closed';
