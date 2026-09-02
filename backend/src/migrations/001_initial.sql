/*
=================================================
MIGRATION 001
INITIAL CRM SCHEMA
=================================================
*/

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    email VARCHAR(255) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('AGENT', 'MANAGER')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


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

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


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

    balance NUMERIC DEFAULT 0,

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

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


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

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

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