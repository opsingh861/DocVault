CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hashed TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE credits (
    credit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    current_balance INTEGER NOT NULL DEFAULT 20,
    limit_credit INTEGER NOT NULL DEFAULT 20,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE credit_requests (
    request_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    requested_amount INTEGER NOT NULL,
    full_filled_amount INTEGER,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    response_date DATETIME,
    admin_notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE documents (
    document_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    path TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    file_size INTEGER,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    document_hash TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE document_embeddings (
    embedding_id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    embedding TEXT NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE
);

CREATE TABLE match_results (
    match_id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    matched_document_id INTEGER NOT NULL,
    similarity_score REAL NOT NULL,
    match_type TEXT NOT NULL,
    matched_document_title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(document_id),
    FOREIGN KEY (matched_document_id) REFERENCES documents(document_id),
    UNIQUE (document_id, matched_document_id)
);
