ALTER TABLE clients
ADD COLUMN IF NOT EXISTS account_request_id INTEGER;

ALTER TABLE clients
DROP CONSTRAINT IF EXISTS clients_account_request_id_fkey;

ALTER TABLE clients
ADD CONSTRAINT clients_account_request_id_fkey
FOREIGN KEY (account_request_id)
REFERENCES account_requests(id)
ON DELETE RESTRICT;

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

CREATE INDEX IF NOT EXISTS idx_clients_account_request_id
ON clients(account_request_id);

CREATE INDEX IF NOT EXISTS idx_clients_assigned_to
ON clients(assigned_to);

CREATE INDEX IF NOT EXISTS idx_clients_status
ON clients(status);