import pool from "../models/db.js";

/* =========================================================
   TYPES
========================================================= */

export interface User {
  id: number;
  role: "AGENT" | "MANAGER";
}

/* =========================================================
   AGENT DASHBOARD
========================================================= */

export const getAgentDashboard = async (
  user: User
) => {
  const agentId = Number(user.id);

  /* -------------------------------------------------------
     PROSPECTS BY STATUS
  ------------------------------------------------------- */

  const prospectsResult = await pool.query(
    `
    SELECT
      status,
      COUNT(*)::integer AS count
    FROM prospects
    WHERE assigned_to = $1
    GROUP BY status
    ORDER BY status
    `,
    [agentId]
  );

  /* -------------------------------------------------------
     CLIENTS
  ------------------------------------------------------- */

  const clientsResult = await pool.query(
    `
    SELECT
      COUNT(*)::integer AS total,
      COUNT(*) FILTER (
        WHERE status = 'ACTIVE'
      )::integer AS active,
      COUNT(*) FILTER (
        WHERE status = 'INACTIVE'
      )::integer AS inactive
    FROM clients
    WHERE assigned_to = $1
    `,
    [agentId]
  );

  /* -------------------------------------------------------
     ACCOUNT REQUESTS BY STATUS
  ------------------------------------------------------- */

  const requestsResult = await pool.query(
    `
    SELECT
      ar.status,
      COUNT(*)::integer AS count
    FROM account_requests ar
    INNER JOIN prospects p
      ON p.id = ar.prospect_id
    WHERE p.assigned_to = $1
    GROUP BY ar.status
    ORDER BY ar.status
    `,
    [agentId]
  );

  /* -------------------------------------------------------
     TOTAL PROSPECTS
  ------------------------------------------------------- */

  const totalProspectsResult = await pool.query(
    `
    SELECT COUNT(*)::integer AS total
    FROM prospects
    WHERE assigned_to = $1
    `,
    [agentId]
  );

  /* -------------------------------------------------------
     WON PROSPECTS
  ------------------------------------------------------- */

  const wonProspectsResult = await pool.query(
    `
    SELECT COUNT(*)::integer AS won
    FROM prospects
    WHERE assigned_to = $1
      AND status = 'WON'
    `,
    [agentId]
  );

  const totalProspects =
    Number(
      totalProspectsResult.rows[0].total
    );

  const wonProspects =
    Number(
      wonProspectsResult.rows[0].won
    );

  /* -------------------------------------------------------
     CONVERSION RATE
  ------------------------------------------------------- */

  const conversionRate =
    totalProspects === 0
      ? 0
      : Number(
          (
            (wonProspects /
              totalProspects) *
            100
          ).toFixed(2)
        );

  /* -------------------------------------------------------
     TOTAL BALANCE
  ------------------------------------------------------- */

  const balanceResult = await pool.query(
    `
    SELECT
      COALESCE(
        SUM(balance),
        0
      ) AS total_balance
    FROM clients
    WHERE assigned_to = $1
    `,
    [agentId]
  );

  /* -------------------------------------------------------
     RETURN
  ------------------------------------------------------- */

  return {
    prospects: {
      byStatus:
        prospectsResult.rows,
      total: totalProspects,
      won: wonProspects,
    },

    clients: {
      total:
        Number(
          clientsResult.rows[0].total
        ),
      active:
        Number(
          clientsResult.rows[0].active
        ),
      inactive:
        Number(
          clientsResult.rows[0].inactive
        ),
    },

    accountRequests: {
      byStatus:
        requestsResult.rows,
    },

    conversionRate,

    totalBalance:
      Number(
        balanceResult.rows[0].total_balance
      ),
  };
};

/* =========================================================
   MANAGER DASHBOARD
========================================================= */

export const getManagerDashboard = async (
  user: User
) => {
  /* -------------------------------------------------------
     PROSPECTS BY STATUS
  ------------------------------------------------------- */

  const prospectsResult = await pool.query(
    `
    SELECT
      status,
      COUNT(*)::integer AS count
    FROM prospects
    GROUP BY status
    ORDER BY status
    `
  );

  /* -------------------------------------------------------
     CLIENTS
  ------------------------------------------------------- */

  const clientsResult = await pool.query(
    `
    SELECT
      COUNT(*)::integer AS total,

      COUNT(*) FILTER (
        WHERE status = 'ACTIVE'
      )::integer AS active,

      COUNT(*) FILTER (
        WHERE status = 'INACTIVE'
      )::integer AS inactive
    FROM clients
    `
  );

  /* -------------------------------------------------------
     ACCOUNT REQUESTS BY STATUS
  ------------------------------------------------------- */

  const requestsResult = await pool.query(
    `
    SELECT
      status,
      COUNT(*)::integer AS count
    FROM account_requests
    GROUP BY status
    ORDER BY status
    `
  );

  /* -------------------------------------------------------
     TOTAL PROSPECTS
  ------------------------------------------------------- */

  const totalProspectsResult =
    await pool.query(
      `
      SELECT COUNT(*)::integer AS total
      FROM prospects
      `
    );

  /* -------------------------------------------------------
     WON PROSPECTS
  ------------------------------------------------------- */

  const wonProspectsResult =
    await pool.query(
      `
      SELECT COUNT(*)::integer AS won
      FROM prospects
      WHERE status = 'WON'
      `
    );

  const totalProspects =
    Number(
      totalProspectsResult.rows[0].total
    );

  const wonProspects =
    Number(
      wonProspectsResult.rows[0].won
    );

  /* -------------------------------------------------------
     CONVERSION RATE
  ------------------------------------------------------- */

  const conversionRate =
    totalProspects === 0
      ? 0
      : Number(
          (
            (wonProspects /
              totalProspects) *
            100
          ).toFixed(2)
        );

  /* -------------------------------------------------------
     TOTAL BALANCE
  ------------------------------------------------------- */

  const balanceResult =
    await pool.query(
      `
      SELECT
        COALESCE(
          SUM(balance),
          0
        ) AS total_balance
      FROM clients
      `
    );

  /* -------------------------------------------------------
     RETURN
  ------------------------------------------------------- */

  return {
    prospects: {
      byStatus:
        prospectsResult.rows,
      total: totalProspects,
      won: wonProspects,
    },

    clients: {
      total:
        Number(
          clientsResult.rows[0].total
        ),
      active:
        Number(
          clientsResult.rows[0].active
        ),
      inactive:
        Number(
          clientsResult.rows[0].inactive
        ),
    },

    accountRequests: {
      byStatus:
        requestsResult.rows,
    },

    conversionRate,

    totalBalance:
      Number(
        balanceResult.rows[0].total_balance
      ),
  };
};

/* =========================================================
   TASKS / NEXT ACTIONS
========================================================= */

export const getDashboardTasks = async (
  user: User
) => {
  /*
   * On récupère les interactions qui ont
   * une next_action_date.
   *
   * Si interaction contient prospect_id:
   * on récupère le prospect.
   *
   * Si interaction contient client_id:
   * on récupère le client.
   */

  let query = `
    SELECT
      i.*,

      p.first_name AS prospect_first_name,
      p.last_name AS prospect_last_name,

      c.first_name AS client_first_name,
      c.last_name AS client_last_name

    FROM interactions i

    LEFT JOIN prospects p
      ON p.id = i.prospect_id

    LEFT JOIN clients c
      ON c.id = i.client_id

    WHERE i.next_action_date IS NOT NULL
  `;

  const values: any[] = [];

  /* -------------------------------------------------------
     AGENT → OWN TASKS ONLY
  ------------------------------------------------------- */

  if (user.role === "AGENT") {
    values.push(Number(user.id));

    query += `
      AND (
        p.assigned_to = $1
        OR
        c.assigned_to = $1
      )
    `;
  }

  /* -------------------------------------------------------
     ORDER
  ------------------------------------------------------- */

  query += `
    ORDER BY
      i.next_action_date ASC
  `;

  const result =
    await pool.query(
      query,
      values
    );

  return result.rows;
};