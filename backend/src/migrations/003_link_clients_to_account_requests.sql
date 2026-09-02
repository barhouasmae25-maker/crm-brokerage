/*
=================================================
MIGRATION 003
LINK CLIENTS TO ACCOUNT REQUESTS
=================================================
*/


/*
=================================================
ADD ACCOUNT REQUEST ID
=================================================
*/

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS account_request_id INTEGER;


/*
=================================================
FOREIGN KEY
=================================================
*/

ALTER TABLE clients
DROP CONSTRAINT IF EXISTS clients_account_request_id_fkey;

ALTER TABLE clients
ADD CONSTRAINT clients_account_request_id_fkey
FOREIGN KEY (account_request_id)
REFERENCES account_requests(id)
ON DELETE RESTRICT;


/*
=================================================
UPDATE CLIENT STATUS
=================================================
*/

ALTER TABLE clients
DROP CONSTRAINT IF EXISTS clients_status_check;

ALTER TABLE clients
ADD CONSTRAINT clients_status_check
CHECK (
    status IN (
        'ACTIVE',
        'INACTIVE',
        'SUSPENDED',
        'CLOSED'
    )
);


/*
=================================================
INDEXES
=================================================
*/

CREATE INDEX IF NOT EXISTS idx_clients_account_request_id
ON clients(account_request_id);

CREATE INDEX IF NOT EXISTS idx_clients_assigned_to
ON clients(assigned_to);

CREATE INDEX IF NOT EXISTS idx_clients_status
ON clients(status);