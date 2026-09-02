/*
=================================================
MIGRATION 002
ACCOUNT REQUESTS
=================================================
*/

CREATE TABLE IF NOT EXISTS account_requests (
    id SERIAL PRIMARY KEY,

    prospect_id INTEGER NOT NULL
        REFERENCES prospects(id)
        ON DELETE CASCADE,

    account_type VARCHAR(20) NOT NULL
        CHECK (
            account_type IN (
                'INDIVIDUAL',
                'JOINT',
                'CORPORATE',
                'IRA'
            )
        ),

    trading_experience VARCHAR(20) NOT NULL
        CHECK (
            trading_experience IN (
                'BEGINNER',
                'INTERMEDIATE',
                'ADVANCED',
                'PROFESSIONAL'
            )
        ),

    initial_deposit NUMERIC(12,2) NOT NULL
        CHECK (initial_deposit >= 1000.00),

    status VARCHAR(30) NOT NULL
        DEFAULT 'PENDING REVIEW'
        CHECK (
            status IN (
                'PENDING REVIEW',
                'UNDER REVIEW',
                'APPROVED',
                'REJECTED'
            )
        ),

    created_by INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS account_request_documents (
    id SERIAL PRIMARY KEY,

    request_id INTEGER NOT NULL
        REFERENCES account_requests(id)
        ON DELETE CASCADE,

    document_type VARCHAR(50) NOT NULL,

    document_url TEXT,

    verified BOOLEAN NOT NULL DEFAULT FALSE,

    verified_by INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,

    verified_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX IF NOT EXISTS idx_account_requests_prospect_id
ON account_requests(prospect_id);

CREATE INDEX IF NOT EXISTS idx_account_requests_status
ON account_requests(status);

CREATE INDEX IF NOT EXISTS idx_account_request_documents_request_id
ON account_request_documents(request_id);