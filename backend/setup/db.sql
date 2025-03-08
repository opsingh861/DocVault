-- Users Table - Stores user authentication and role information
CREATE TABLE
    users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hashed VARCHAR(128) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'user' or 'admin'
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Credits Table - Tracks user credit balance and resets
CREATE TABLE
    credits (
        credit_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        current_balance INTEGER NOT NULL DEFAULT 20,
        limit_credit INTEGER NOT NULL DEFAULT 20,
        FOREIGN KEY (user_id) REFERENCES users (user_id)
    );

-- Credit Requests Table - For requesting additional credits
CREATE TABLE
    credit_requests (
        request_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        requested_amount INTEGER NOT NULL,
        full_filled_amount INTEGER,
        reason TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'denied'
        request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        response_date TIMESTAMP,
        admin_id INTEGER NOT NULL,
        admin_notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users (user_id),
        FOREIGN KEY (admin_id) REFERENCES users (user_id)
    );

-- Documents Table - Stores uploaded documents
CREATE TABLE
    documents (
        document_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        file_size INTEGER,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        document_hash VARCHAR(64) NOT NULL, -- For quick duplicate checking
        FOREIGN KEY (user_id) REFERENCES users (user_id)
    );

-- Document Metadata Table - Stores extracted metadata and keywords
CREATE TABLE
    document_metadata (
        metadata_id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        keyword VARCHAR(50) NOT NULL,
        frequency INTEGER NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents (document_id)
    );

-- Scan History Table - Tracks document scans and credit usage
CREATE TABLE
    scan_history (
        scan_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        document_id INTEGER NOT NULL,
        scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (user_id),
        FOREIGN KEY (document_id) REFERENCES documents (document_id)
    );

-- Match Results Table - Stores scan results and matching documents
CREATE TABLE
    match_results (
        match_id INTEGER PRIMARY KEY AUTOINCREMENT,
        scan_id INTEGER NOT NULL,
        matched_document_id INTEGER NOT NULL,
        FOREIGN KEY (scan_id) REFERENCES scan_history (scan_id),
        FOREIGN KEY (matched_document_id) REFERENCES documents (document_id)
    );

-- Create indexes for better performance
-- Users table indexes
CREATE INDEX idx_users_username ON users (username);

CREATE INDEX idx_users_role ON users (role);

-- Credits table indexes
CREATE INDEX idx_credits_user ON credits (user_id);

CREATE INDEX idx_credits_balance ON credits (current_balance);

-- Credit requests table indexes
CREATE INDEX idx_credit_requests_user ON credit_requests (user_id);

CREATE INDEX idx_credit_requests_status ON credit_requests (status);

CREATE INDEX idx_credit_requests_admin ON credit_requests (admin_id);

CREATE INDEX idx_credit_requests_date ON credit_requests (request_date);

-- Documents table indexes
CREATE INDEX idx_documents_user ON documents (user_id);

CREATE INDEX idx_documents_hash ON documents (document_hash);

CREATE INDEX idx_documents_upload_date ON documents (upload_date);

-- Document metadata table indexes
CREATE INDEX idx_document_metadata_document ON document_metadata (document_id);

CREATE INDEX idx_document_metadata_keyword ON document_metadata (keyword);

CREATE INDEX idx_document_metadata_frequency ON document_metadata (frequency);

-- Scan history table indexes
CREATE INDEX idx_scan_history_user ON scan_history (user_id);

CREATE INDEX idx_scan_history_document ON scan_history (document_id);

CREATE INDEX idx_scan_history_date ON scan_history (scan_date);

-- Match results table indexes
CREATE INDEX idx_match_results_scan ON match_results (scan_id);

CREATE INDEX idx_match_results_matched_document ON match_results (matched_document_id);

-- Create views for easy analytics queries
-- View to track daily scans per user
CREATE VIEW
    user_daily_scans AS
SELECT
    user_id,
    DATE (scan_date) as scan_day,
    COUNT(*) as scan_count
FROM
    scan_history
GROUP BY
    user_id,
    DATE (scan_date);

-- View to track document popularity (how often documents are matched)
CREATE VIEW
    document_popularity AS
SELECT
    d.document_id,
    d.title,
    d.user_id,
    COUNT(mr.match_id) as match_count
FROM
    documents d
    LEFT JOIN match_results mr ON d.document_id = mr.matched_document_id
GROUP BY
    d.document_id;

-- View for user statistics including scans and credit information
CREATE VIEW
    user_statistics AS
SELECT
    u.user_id,
    u.username,
    u.role,
    c.current_balance as credit_balance,
    c.limit_credit as credit_limit,
    COUNT(DISTINCT s.scan_id) as total_scans,
    COUNT(DISTINCT d.document_id) as total_documents,
    MAX(s.scan_date) as last_scan_date
FROM
    users u
    LEFT JOIN credits c ON u.user_id = c.user_id
    LEFT JOIN scan_history s ON u.user_id = s.user_id
    LEFT JOIN documents d ON u.user_id = d.user_id
GROUP BY
    u.user_id;

-- View for credit request analytics
CREATE VIEW
    credit_request_analytics AS
SELECT
    u.username as user,
    COUNT(cr.request_id) as total_requests,
    SUM(
        CASE
            WHEN cr.status = 'approved' THEN 1
            ELSE 0
        END
    ) as approved_requests,
    SUM(
        CASE
            WHEN cr.status = 'denied' THEN 1
            ELSE 0
        END
    ) as denied_requests,
    SUM(
        CASE
            WHEN cr.status = 'pending' THEN 1
            ELSE 0
        END
    ) as pending_requests,
    SUM(cr.requested_amount) as total_requested,
    SUM(
        CASE
            WHEN cr.status = 'approved' THEN cr.full_filled_amount
            ELSE 0
        END
    ) as total_approved
FROM
    credit_requests cr
    JOIN users u ON cr.user_id = u.user_id
GROUP BY
    cr.user_id;

-- View for document keyword analytics
CREATE VIEW
    document_keyword_analytics AS
SELECT
    dm.keyword,
    COUNT(DISTINCT dm.document_id) as document_count,
    SUM(dm.frequency) as total_occurrences,
    AVG(dm.frequency) as avg_frequency_per_document
FROM
    document_metadata dm
GROUP BY
    dm.keyword
ORDER BY
    total_occurrences DESC;

-- View for admin dashboard summary
CREATE VIEW
    admin_dashboard_summary AS
SELECT
    (
        SELECT
            COUNT(*)
        FROM
            users
    ) as total_users,
    (
        SELECT
            COUNT(*)
        FROM
            documents
    ) as total_documents,
    (
        SELECT
            COUNT(*)
        FROM
            scan_history
    ) as total_scans,
    (
        SELECT
            COUNT(*)
        FROM
            credit_requests
        WHERE
            status = 'pending'
    ) as pending_requests,
    (
        SELECT
            COUNT(*)
        FROM
            users
        WHERE
            role = 'admin'
    ) as admin_count,
    (
        SELECT
            AVG(current_balance)
        FROM
            credits
    ) as avg_user_balance,
    (
        SELECT
            COUNT(*)
        FROM
            scan_history
        WHERE
            DATE (scan_date) = DATE('now')
    ) as scans_today;

-- View for today's user activity
CREATE VIEW
    today_user_activity AS
SELECT
    u.username,
    COUNT(s.scan_id) as scans_today,
    c.current_balance as remaining_credits
FROM
    users u
    JOIN credits c ON u.user_id = c.user_id
    LEFT JOIN scan_history s ON u.user_id = s.user_id
    AND DATE (s.scan_date) = DATE ('now')
GROUP BY
    u.user_id
ORDER BY
    scans_today DESC;