import pool from "../models/db.js";

/* =========================================================
   TYPES
========================================================= */

export type ClientStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "CLOSED";

export interface User {
  id: number;
  role: "AGENT" | "MANAGER";
}

export interface UpdateClientData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: ClientStatus;
  accountType?: string;
  tradingExperience?: string;
}

/* =========================================================
   ACCOUNT NUMBER
   ACC-YYYY-NNNNNN
========================================================= */

const generateAccountNumber = async (
  dbClient: any
): Promise<string> => {
  const year = new Date().getFullYear();

  const result = await dbClient.query(
    `
    SELECT
      COALESCE(
        MAX(
          CAST(
            SUBSTRING(
              account_number
              FROM '[0-9]{6}$'
            ) AS INTEGER
          )
        ),
        0
      ) + 1 AS next_number
    FROM clients
    WHERE account_number LIKE $1
    `,
    [`ACC-${year}-%`]
  );

  const nextNumber =
    Number(result.rows[0].next_number);

  return `ACC-${year}-${String(nextNumber).padStart(6, "0")}`;
};

/* =========================================================
   CREATE CLIENT
   MANUAL / POST /api/clients

   Client can only be created from:
   - approved account request
   - corresponding prospect
========================================================= */

export const createClient = async (
  prospectId: number,
  accountRequestId: number,
  user: User
) => {
  const dbClient = await pool.connect();

  try {
    await dbClient.query("BEGIN");

    /* =====================================================
       ACCOUNT REQUEST
    ===================================================== */

    const requestResult = await dbClient.query(
      `
      SELECT *
      FROM account_requests
      WHERE id = $1
      `,
      [accountRequestId]
    );

    if (requestResult.rows.length === 0) {
      throw new Error(
        "Account request not found"
      );
    }

    const request =
      requestResult.rows[0];

    if (
      Number(request.prospect_id) !==
      Number(prospectId)
    ) {
      throw new Error(
        "Account request does not belong to this prospect"
      );
    }

    if (request.status !== "APPROVED") {
      throw new Error(
        "Only approved account requests can create clients"
      );
    }

    /* =====================================================
       PROSPECT
    ===================================================== */

    const prospectResult =
      await dbClient.query(
        `
        SELECT *
        FROM prospects
        WHERE id = $1
        `,
        [prospectId]
      );

    if (prospectResult.rows.length === 0) {
      throw new Error(
        "Prospect not found"
      );
    }

    const prospect =
      prospectResult.rows[0];

    /* =====================================================
       AGENT PERMISSION
    ===================================================== */

    if (
      user.role === "AGENT" &&
      Number(prospect.assigned_to) !==
        Number(user.id)
    ) {
      throw new Error("Forbidden");
    }

    /* =====================================================
       CHECK EXISTING CLIENT
    ===================================================== */

    const existingResult =
      await dbClient.query(
        `
        SELECT *
        FROM clients
        WHERE account_request_id = $1
           OR prospect_id = $2
        LIMIT 1
        `,
        [
          accountRequestId,
          prospectId,
        ]
      );

    if (existingResult.rows.length > 0) {
      await dbClient.query("COMMIT");

      return existingResult.rows[0];
    }

    /* =====================================================
       ACCOUNT NUMBER
    ===================================================== */

    const accountNumber =
      await generateAccountNumber(
        dbClient
      );

    /* =====================================================
       CREATE CLIENT
    ===================================================== */

    const result =
      await dbClient.query(
        `
        INSERT INTO clients
        (
          prospect_id,
          account_request_id,
          first_name,
          last_name,
          email,
          phone,
          account_number,
          account_type,
          trading_experience,
          initial_deposit,
          balance,
          status,
          assigned_to
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $10,
          'ACTIVE',
          $11
        )
        RETURNING *
        `,
        [
          prospect.id,
          request.id,
          prospect.first_name,
          prospect.last_name,
          prospect.email,
          prospect.phone,
          accountNumber,
          request.account_type,
          request.trading_experience,
          Number(request.initial_deposit),
          prospect.assigned_to,
        ]
      );

    await dbClient.query("COMMIT");

    return result.rows[0];

  } catch (error) {

    try {
      await dbClient.query("ROLLBACK");
    } catch {
      // ignore rollback error
    }

    throw error;

  } finally {
    dbClient.release();
  }
};

/* =========================================================
   GET ALL CLIENTS

   MANAGER:
      sees all

   AGENT:
      sees only assigned clients
========================================================= */

export const getClients = async (
  user: User,
  status?: string,
  assignedTo?: number
) => {

  let query = `
    SELECT
      c.id,
      c.prospect_id,
      c.first_name,
      c.last_name,
      c.email,
      c.phone,
      c.account_number,
      c.account_type,
      c.trading_experience,
      c.initial_deposit,
      c.balance,
      c.status,
      c.assigned_to,
      c.created_at,
      c.updated_at,
      c.account_request_id,

      p.status AS prospect_status

    FROM clients c

    LEFT JOIN prospects p
      ON p.id = c.prospect_id
  `;

  const conditions: string[] = [];
  const values: any[] = [];

  /* =====================================================
     AGENT
  ===================================================== */

  if (user.role === "AGENT") {

    values.push(
      Number(user.id)
    );

    conditions.push(
      `c.assigned_to = $${values.length}`
    );
  }

  /* =====================================================
     STATUS FILTER
  ===================================================== */

  if (status !== undefined) {

    const normalizedStatus =
      String(status)
        .trim()
        .toUpperCase();

    const allowedStatuses = [
      "ACTIVE",
      "INACTIVE",
      "SUSPENDED",
      "CLOSED",
    ];

    if (
      !allowedStatuses.includes(
        normalizedStatus
      )
    ) {
      throw new Error(
        "Invalid client status"
      );
    }

    values.push(
      normalizedStatus
    );

    conditions.push(
      `c.status = $${values.length}`
    );
  }

  /* =====================================================
     ASSIGNED TO
  ===================================================== */

  if (
    assignedTo !== undefined &&
    assignedTo !== null
  ) {

    const assignedId =
      Number(assignedTo);

    if (
      !Number.isInteger(
        assignedId
      ) ||
      assignedId <= 0
    ) {
      throw new Error(
        "Invalid assignedTo"
      );
    }

    if (
      user.role === "AGENT" &&
      assignedId !== Number(user.id)
    ) {
      throw new Error(
        "Forbidden"
      );
    }

    values.push(
      assignedId
    );

    conditions.push(
      `c.assigned_to = $${values.length}`
    );
  }

  /* =====================================================
     WHERE
  ===================================================== */

  if (conditions.length > 0) {

    query += `
      WHERE ${conditions.join(" AND ")}
    `;
  }

  query += `
    ORDER BY c.created_at DESC
  `;

  const result =
    await pool.query(
      query,
      values
    );

  return result.rows;
};

/* =========================================================
   GET ONE CLIENT
========================================================= */

export const getClientById = async (
  clientId: number,
  user: User
) => {

  const result =
    await pool.query(
      `
      SELECT
        c.*,

        p.status AS prospect_status,
        p.source AS prospect_source,
        p.interest AS prospect_interest,
        p.estimated_capital,
        p.notes

      FROM clients c

      LEFT JOIN prospects p
        ON p.id = c.prospect_id

      WHERE c.id = $1
      `,
      [clientId]
    );

  if (result.rows.length === 0) {
    throw new Error(
      "Client not found"
    );
  }

  const client =
    result.rows[0];

  /* =====================================================
     AGENT PERMISSION
  ===================================================== */

  if (
    user.role === "AGENT" &&
    Number(client.assigned_to) !==
      Number(user.id)
  ) {
    throw new Error(
      "Forbidden"
    );
  }

  return client;
};

/* =========================================================
   UPDATE CLIENT
========================================================= */

export const updateClient = async (
  clientId: number,
  data: UpdateClientData,
  user: User
) => {

  const existing =
    await getClientById(
      clientId,
      user
    );

  const fields: string[] = [];
  const values: any[] = [];

  /* =====================================================
     FIRST NAME
  ===================================================== */

  if (
    data.firstName !== undefined
  ) {

    fields.push(
      `first_name = $${values.length + 1}`
    );

    values.push(
      data.firstName.trim()
    );
  }

  /* =====================================================
     LAST NAME
  ===================================================== */

  if (
    data.lastName !== undefined
  ) {

    fields.push(
      `last_name = $${values.length + 1}`
    );

    values.push(
      data.lastName.trim()
    );
  }

  /* =====================================================
     EMAIL
  ===================================================== */

  if (
    data.email !== undefined
  ) {

    fields.push(
      `email = $${values.length + 1}`
    );

    values.push(
      data.email.trim()
    );
  }

  /* =====================================================
     PHONE
  ===================================================== */

  if (
    data.phone !== undefined
  ) {

    fields.push(
      `phone = $${values.length + 1}`
    );

    values.push(
      data.phone.trim()
    );
  }

  /* =====================================================
     ACCOUNT TYPE
  ===================================================== */

  if (
    data.accountType !== undefined
  ) {

    fields.push(
      `account_type = $${values.length + 1}`
    );

    values.push(
      data.accountType
    );
  }

  /* =====================================================
     TRADING EXPERIENCE
  ===================================================== */

  if (
    data.tradingExperience !== undefined
  ) {

    fields.push(
      `trading_experience = $${values.length + 1}`
    );

    values.push(
      data.tradingExperience
    );
  }

  /* =====================================================
     STATUS
  ===================================================== */

  if (
    data.status !== undefined
  ) {

    const allowedStatuses: ClientStatus[] = [
      "ACTIVE",
      "INACTIVE",
      "SUSPENDED",
      "CLOSED",
    ];

    if (
      !allowedStatuses.includes(
        data.status
      )
    ) {
      throw new Error(
        "Invalid client status"
      );
    }

    fields.push(
      `status = $${values.length + 1}`
    );

    values.push(
      data.status
    );
  }

  /* =====================================================
     NOTHING TO UPDATE
  ===================================================== */

  if (fields.length === 0) {
    return existing;
  }

  fields.push(
    `updated_at = CURRENT_TIMESTAMP`
  );

  values.push(
    clientId
  );

  const result =
    await pool.query(
      `
      UPDATE clients
      SET
        ${fields.join(", ")}
      WHERE id = $${values.length}
      RETURNING *
      `,
      values
    );

  return result.rows[0];
};