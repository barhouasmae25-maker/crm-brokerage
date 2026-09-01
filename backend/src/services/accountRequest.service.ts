import pool from "../models/db.js";

/* =========================================================
   TYPES
========================================================= */

interface AccountRequestDocument {
  documentType: string;
  documentUrl: string;
}

interface AccountRequestData {
  prospectId: number;
  accountType: string;
  tradingExperience: string;
  initialDeposit: number;
  documents: AccountRequestDocument[];
}

export interface User {
  id: number;
  role: "AGENT" | "MANAGER";
}

/* =========================================================
   CREATE ACCOUNT REQUEST
========================================================= */

export const createAccountRequest = async (
  data: AccountRequestData,
  user: User
) => {
  const {
    prospectId,
    accountType,
    tradingExperience,
    initialDeposit,
    documents,
  } = data;

  /* =======================================================
     VALIDATION
  ======================================================= */

  if (
    !prospectId ||
    !accountType ||
    !tradingExperience ||
    initialDeposit === undefined ||
    initialDeposit === null
  ) {
    throw new Error("Missing required fields");
  }

  /* =======================================================
     INITIAL DEPOSIT
  ======================================================= */

  const deposit = Number(initialDeposit);

  if (Number.isNaN(deposit)) {
    throw new Error(
      "Initial deposit must be a valid number"
    );
  }

  if (deposit < 1000) {
    throw new Error(
      "Initial deposit must be at least 1000"
    );
  }

  /* =======================================================
     DOCUMENTS
  ======================================================= */

  if (!Array.isArray(documents)) {
    throw new Error("Documents are required");
  }

  if (documents.length < 2) {
    throw new Error(
      "At least 2 documents are required"
    );
  }

  const documentTypes = documents.map(
    (document) =>
      String(document.documentType)
        .trim()
        .toUpperCase()
  );

  const hasIdentity =
    documentTypes.includes("ID CARD") ||
    documentTypes.includes("PASSPORT");

  const hasAddress =
    documentTypes.includes("PROOF OF ADDRESS");

  if (!hasIdentity || !hasAddress) {
    throw new Error(
      "ID CARD or PASSPORT and PROOF OF ADDRESS are required"
    );
  }

  for (const document of documents) {
    if (
      !document.documentType ||
      !document.documentUrl
    ) {
      throw new Error(
        "Each document must contain documentType and documentUrl"
      );
    }
  }

  /* =======================================================
     CHECK PROSPECT
  ======================================================= */

  const prospectResult = await pool.query(
    `
    SELECT *
    FROM prospects
    WHERE id = $1
    `,
    [prospectId]
  );

  if (prospectResult.rows.length === 0) {
    throw new Error("Prospect not found");
  }

  const prospect = prospectResult.rows[0];

  /* =======================================================
     ONLY QUALIFIED PROSPECTS
  ======================================================= */

  if (prospect.status !== "QUALIFIED") {
    throw new Error(
      "Only qualified prospects can create an account request"
    );
  }

  /* =======================================================
     AGENT PERMISSION
  ======================================================= */

  if (
    user.role === "AGENT" &&
    Number(prospect.assigned_to) !== Number(user.id)
  ) {
    throw new Error("Forbidden");
  }

  /* =======================================================
     CHECK DUPLICATE REQUEST
  ======================================================= */

  const existingRequest = await pool.query(
    `
    SELECT id
    FROM account_requests
    WHERE prospect_id = $1
    LIMIT 1
    `,
    [prospectId]
  );

  if (existingRequest.rows.length > 0) {
    throw new Error(
      "This prospect already has an account request"
    );
  }

  /* =======================================================
     TRANSACTION
  ======================================================= */

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* =====================================================
       DOUBLE CHECK DUPLICATE
    ===================================================== */

    const duplicateCheck = await client.query(
      `
      SELECT id
      FROM account_requests
      WHERE prospect_id = $1
      LIMIT 1
      `,
      [prospectId]
    );

    if (duplicateCheck.rows.length > 0) {
      throw new Error(
        "This prospect already has an account request"
      );
    }

    /* =====================================================
       CREATE ACCOUNT REQUEST
    ===================================================== */

    const requestResult = await client.query(
      `
      INSERT INTO account_requests
      (
        prospect_id,
        account_type,
        trading_experience,
        initial_deposit,
        status,
        created_by
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        'PENDING REVIEW',
        $5
      )
      RETURNING *
      `,
      [
        prospectId,
        accountType,
        tradingExperience,
        deposit,
        user.id,
      ]
    );

    const request = requestResult.rows[0];

    /* =====================================================
       CREATE DOCUMENTS
    ===================================================== */

    for (const document of documents) {
      await client.query(
        `
        INSERT INTO account_request_documents
        (
          request_id,
          document_type,
          document_url
        )
        VALUES
        (
          $1,
          $2,
          $3
        )
        `,
        [
          request.id,
          document.documentType,
          document.documentUrl,
        ]
      );
    }

    await client.query("COMMIT");

    return await getAccountRequestById(
      Number(request.id),
      user
    );

  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Ignore rollback error
    }

    throw error;

  } finally {
    client.release();
  }
};

/* =========================================================
   GET ALL ACCOUNT REQUESTS
========================================================= */

export const getAccountRequests = async (
  user: User
) => {

  let query = `
    SELECT
      ar.*,

      p.first_name,
      p.last_name,
      p.email,
      p.phone,
      p.status AS prospect_status,
      p.assigned_to

    FROM account_requests ar

    INNER JOIN prospects p
      ON p.id = ar.prospect_id
  `;

  const values: number[] = [];

  if (user.role === "AGENT") {

    values.push(Number(user.id));

    query += `
      WHERE p.assigned_to = $1
    `;
  }

  query += `
    ORDER BY ar.created_at DESC
  `;

  const result = await pool.query(
    query,
    values
  );

  return result.rows;
};

/* =========================================================
   GET ACCOUNT REQUEST BY ID
========================================================= */

export const getAccountRequestById = async (
  requestId: number,
  user: User
) => {

  const requestResult = await pool.query(
    `
    SELECT
      ar.*,

      p.first_name,
      p.last_name,
      p.email,
      p.phone,
      p.assigned_to,
      p.status AS prospect_status,
      p.source AS prospect_source,
      p.interest AS prospect_interest

    FROM account_requests ar

    INNER JOIN prospects p
      ON p.id = ar.prospect_id

    WHERE ar.id = $1
    `,
    [requestId]
  );

  if (requestResult.rows.length === 0) {
    throw new Error(
      "Account request not found"
    );
  }

  const request = requestResult.rows[0];

  /* =======================================================
     AGENT PERMISSION
  ======================================================= */

  if (
    user.role === "AGENT" &&
    Number(request.assigned_to) !== Number(user.id)
  ) {
    throw new Error("Forbidden");
  }

  /* =======================================================
     DOCUMENTS
  ======================================================= */

  const documentsResult = await pool.query(
    `
    SELECT
      id,
      request_id,
      document_type,
      document_url,
      verified,
      verified_by,
      verified_at,
      created_at

    FROM account_request_documents

    WHERE request_id = $1

    ORDER BY created_at ASC
    `,
    [requestId]
  );

  return {
    ...request,
    documents: documentsResult.rows,
  };
};

/* =========================================================
   GENERATE ACCOUNT NUMBER
   ACC-YYYY-NNNNNN
========================================================= */

const generateAccountNumber = async (
  client: any
): Promise<string> => {

  const year = new Date()
    .getFullYear();

  const result = await client.query(
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

  const nextNumber = Number(
    result.rows[0].next_number
  );

  return `ACC-${year}-${String(
    nextNumber
  ).padStart(6, "0")}`;
};

/* =========================================================
   UPDATE ACCOUNT REQUEST STATUS
   MANAGER ONLY
========================================================= */

export const updateAccountRequestStatus = async (
  requestId: number,
  status: string
) => {

  const normalizedStatus =
    String(status)
      .trim()
      .toUpperCase();

  const allowedStatuses = [
    "PENDING REVIEW",
    "UNDER REVIEW",
    "APPROVED",
    "REJECTED",
  ];

  if (
    !allowedStatuses.includes(
      normalizedStatus
    )
  ) {
    throw new Error(
      "Invalid status"
    );
  }

  /* =======================================================
     GET REQUEST
  ======================================================= */

  const requestResult = await pool.query(
    `
    SELECT *
    FROM account_requests
    WHERE id = $1
    `,
    [requestId]
  );

  if (requestResult.rows.length === 0) {
    throw new Error(
      "Account request not found"
    );
  }

  const request = requestResult.rows[0];

  /* =======================================================
     TRANSACTION
  ======================================================= */

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    /* =====================================================
       UPDATE REQUEST STATUS
    ===================================================== */

    const updateResult = await client.query(
      `
      UPDATE account_requests

      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $2

      RETURNING *
      `,
      [
        normalizedStatus,
        requestId,
      ]
    );

    /* =====================================================
       APPROVED
    ===================================================== */

    if (
      normalizedStatus === "APPROVED"
    ) {

      /* ===================================================
         GET PROSPECT
      =================================================== */

      const prospectResult =
        await client.query(
          `
          SELECT *
          FROM prospects
          WHERE id = $1
          `,
          [request.prospect_id]
        );

      if (
        prospectResult.rows.length === 0
      ) {
        throw new Error(
          "Prospect not found"
        );
      }

      const prospect =
        prospectResult.rows[0];

      /* ===================================================
         PROSPECT → WON
      =================================================== */

      await client.query(
        `
        UPDATE prospects

        SET
          status = 'WON',
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $1
        `,
        [request.prospect_id]
      );

      /* ===================================================
         CHECK EXISTING CLIENT
      =================================================== */

      const existingClient =
        await client.query(
          `
          SELECT *
          FROM clients

          WHERE
            account_request_id = $1

          LIMIT 1
          `,
          [request.id]
        );

      /* ===================================================
         CREATE CLIENT ONLY IF NOT EXISTS
      =================================================== */

      if (
        existingClient.rows.length === 0
      ) {

        /* ================================================
           EXTRA CHECK BY PROSPECT
        ================================================ */

        const existingByProspect =
          await client.query(
            `
            SELECT *
            FROM clients

            WHERE prospect_id = $1

            LIMIT 1
            `,
            [request.prospect_id]
          );

        if (
          existingByProspect.rows.length > 0
        ) {

          /*
           * Client already exists.
           *
           * We update missing information instead
           * of creating a duplicate.
           */

          await client.query(
            `
            UPDATE clients

            SET
              account_request_id = $1,
              account_type = $2,
              trading_experience = $3,
              initial_deposit = $4,
              balance = $4,
              status = 'ACTIVE',
              assigned_to = $5,
              updated_at = CURRENT_TIMESTAMP

            WHERE id = $6
            `,
            [
              request.id,
              request.account_type,
              request.trading_experience,
              request.initial_deposit,
              prospect.assigned_to,
              existingByProspect.rows[0].id,
            ]
          );

        } else {

          /* ==============================================
             GENERATE ACCOUNT NUMBER
          ============================================== */

          const accountNumber =
            await generateAccountNumber(
              client
            );

          /* ==============================================
             CREATE CLIENT
          ============================================== */

          await client.query(
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

              request.initial_deposit,

              prospect.assigned_to,
            ]
          );
        }
      }
    }

    /* =====================================================
       REJECTED
    ===================================================== */

    if (
      normalizedStatus === "REJECTED"
    ) {

      await client.query(
        `
        UPDATE prospects

        SET
          status = 'LOST',
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $1
        `,
        [request.prospect_id]
      );

      /*
       * IMPORTANT:
       *
       * If a client already exists for this request,
       * it must not remain ACTIVE.
       */

      await client.query(
        `
        UPDATE clients

        SET
          status = 'CLOSED',
          updated_at = CURRENT_TIMESTAMP

        WHERE account_request_id = $1
        `,
        [request.id]
      );
    }

    /* =====================================================
       COMMIT
    ===================================================== */

    await client.query("COMMIT");

    return updateResult.rows[0];

  } catch (error) {

    try {
      await client.query(
        "ROLLBACK"
      );
    } catch {
      // Ignore rollback error
    }

    throw error;

  } finally {

    client.release();
  }
};

/* =========================================================
   VERIFY DOCUMENT
   MANAGER ONLY
========================================================= */

export const verifyDocument = async (
  requestId: number,
  documentId: number,
  managerId: number
) => {

  /* =======================================================
     CHECK REQUEST
  ======================================================= */

  const requestResult =
    await pool.query(
      `
      SELECT id
      FROM account_requests
      WHERE id = $1
      `,
      [requestId]
    );

  if (
    requestResult.rows.length === 0
  ) {
    throw new Error(
      "Account request not found"
    );
  }

  /* =======================================================
     CHECK DOCUMENT
  ======================================================= */

  const documentResult =
    await pool.query(
      `
      SELECT *
      FROM account_request_documents

      WHERE
        id = $1
        AND request_id = $2
      `,
      [
        documentId,
        requestId,
      ]
    );

  if (
    documentResult.rows.length === 0
  ) {
    throw new Error(
      "Document not found"
    );
  }

  /* =======================================================
     VERIFY
  ======================================================= */

  const result =
    await pool.query(
      `
      UPDATE account_request_documents

      SET
        verified = TRUE,
        verified_at = CURRENT_TIMESTAMP,
        verified_by = $1

      WHERE
        id = $2
        AND request_id = $3

      RETURNING *
      `,
      [
        managerId,
        documentId,
        requestId,
      ]
    );

  return result.rows[0];
};