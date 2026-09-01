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

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING REVIEW'
        CHECK (
            status IN (
                'PENDING REVIEW',
                'UNDER REVIEW',
                'APPROVED',
                'REJECTED'
            )
        ),

    created_by INTEGER
        REFERENCES users(id),

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
        REFERENCES users(id),

    verified_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,

    account_number VARCHAR(20) NOT NULL UNIQUE,

    prospect_id INTEGER NOT NULL UNIQUE,

    account_request_id INTEGER NOT NULL UNIQUE,

    assigned_to INTEGER NOT NULL,

    balance NUMERIC(15, 2) NOT NULL DEFAULT 0,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_clients_prospect
        FOREIGN KEY (prospect_id)
        REFERENCES prospects(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_clients_account_request
        FOREIGN KEY (account_request_id)
        REFERENCES account_requests(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_clients_assigned_to
        FOREIGN KEY (assigned_to)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT clients_status_check
        CHECK (
            status IN (
                'ACTIVE',
                'INACTIVE',
                'SUSPENDED',
                'CLOSED'
            )
        )
);