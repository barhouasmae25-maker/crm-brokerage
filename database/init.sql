/*
================================================
CRM DATABASE
================================================
*/


/*
================================================
USERS
================================================
*/

CREATE TABLE IF NOT EXISTS users (

    id SERIAL PRIMARY KEY,

    email VARCHAR(255) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (
            role IN ('AGENT', 'MANAGER')
        ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);


/*
================================================
PROSPECTS
================================================
*/

CREATE TABLE IF NOT EXISTS prospects (

    id SERIAL PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    phone VARCHAR(30) NOT NULL,

    source VARCHAR(30) NOT NULL
        CHECK (
            source IN (
                'WEBSITE',
                'REFERRAL',
                'COLD CALL',
                'SOCIAL MEDIA',
                'EVENT',
                'OTHER'
            )
        ),

    interest VARCHAR(30) NOT NULL
        CHECK (
            interest IN (
                'STOCKS TRADING',
                'FOREX',
                'CRYPTO',
                'COMMODITIES',
                'OPTIONS',
                'MIXED'
            )
        ),

    estimated_capital NUMERIC,

    notes TEXT,

    status VARCHAR(30) DEFAULT 'NEW'
        CHECK (
            status IN (
                'NEW',
                'CONTACTED',
                'QUALIFIED',
                'PROPOSAL SENT',
                'NEGOTIATION',
                'WON',
                'LOST'
            )
        ),

    assigned_to INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_by INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,

    last_contact_date TIMESTAMP,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP

);


/*
================================================
CLIENTS
================================================
*/

CREATE TABLE IF NOT EXISTS clients (

    id SERIAL PRIMARY KEY,

    prospect_id INTEGER
        REFERENCES prospects(id)
        ON DELETE SET NULL,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    phone VARCHAR(30),

    account_number VARCHAR(30) UNIQUE,

    account_type VARCHAR(30),

    trading_experience VARCHAR(30),

    initial_deposit NUMERIC
        CHECK (initial_deposit >= 0),

    balance NUMERIC
        DEFAULT 0,

    status VARCHAR(20)
        DEFAULT 'ACTIVE'
        CHECK (
            status IN (
                'ACTIVE',
                'INACTIVE',
                'SUSPENDED'
            )
        ),

    assigned_to INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP

);


/*
================================================
INTERACTIONS
================================================
*/

CREATE TABLE IF NOT EXISTS interactions (

    id SERIAL PRIMARY KEY,

    prospect_id INTEGER
        REFERENCES prospects(id)
        ON DELETE CASCADE,

    client_id INTEGER
        REFERENCES clients(id)
        ON DELETE CASCADE,

    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    type VARCHAR(20) NOT NULL
        CHECK (
            type IN (
                'CALL',
                'EMAIL',
                'MEETING',
                'SMS',
                'NOTE'
            )
        ),

    notes TEXT,

    outcome VARCHAR(20)
        CHECK (
            outcome IS NULL
            OR outcome IN (
                'POSITIVE',
                'NEUTRAL',
                'NEGATIVE',
                'NO ANSWER'
            )
        ),

    next_action TEXT,

    next_action_date DATE,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT interaction_target_check
        CHECK (
            (
                prospect_id IS NOT NULL
                AND client_id IS NULL
            )
            OR
            (
                prospect_id IS NULL
                AND client_id IS NOT NULL
            )
        )

);


/*
================================================
INDEXES
================================================
*/

CREATE INDEX IF NOT EXISTS idx_prospects_assigned_to
ON prospects(assigned_to);

CREATE INDEX IF NOT EXISTS idx_prospects_status
ON prospects(status);

CREATE INDEX IF NOT EXISTS idx_prospects_source
ON prospects(source);

CREATE INDEX IF NOT EXISTS idx_interactions_prospect_id
ON interactions(prospect_id);

CREATE INDEX IF NOT EXISTS idx_interactions_client_id
ON interactions(client_id);

CREATE INDEX IF NOT EXISTS idx_interactions_user_id
ON interactions(user_id);

-- =========================================================
-- ACCOUNT REQUESTS
-- =========================================================

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


-- =========================================================
-- ACCOUNT REQUEST DOCUMENTS
-- =========================================================

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
/*
================================================
END
================================================
*/