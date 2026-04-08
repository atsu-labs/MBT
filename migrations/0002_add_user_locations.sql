CREATE TABLE IF NOT EXISTS user_locations (
    session_id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
