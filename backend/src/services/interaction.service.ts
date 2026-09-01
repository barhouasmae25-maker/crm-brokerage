import pool from "../models/db.js";


/*
================================================
CREATE PROSPECT INTERACTION

AGENT:
  يقدر ينشئ interaction غير للـ prospects ديالو

MANAGER:
  يقدر ينشئ interaction لأي prospect
================================================
*/

export const createProspectInteraction = async (
  data: any,
  user: any
) => {

  const {
    prospectId,
    type,
    notes,
    outcome,
    nextAction,
    nextActionDate
  } = data;


  /*
  ----------------------------------------------
  CHECK REQUIRED FIELDS
  ----------------------------------------------
  */

  if (!prospectId || !type) {
    throw new Error(
      "Prospect and interaction type are required"
    );
  }


  /*
  ----------------------------------------------
  CHECK PROSPECT
  ----------------------------------------------
  */

  const prospectResult = await pool.query(
    `
    SELECT *
    FROM prospects
    WHERE id=$1
    `,
    [prospectId]
  );


  const prospect = prospectResult.rows[0];


  if (!prospect) {
    throw new Error(
      "Prospect not found"
    );
  }


  /*
  ----------------------------------------------
  AGENT PERMISSION
  ----------------------------------------------
  */

  if (
    user.role === "AGENT" &&
    prospect.assigned_to !== user.id
  ) {

    throw new Error(
      "Forbidden"
    );

  }


  /*
  ----------------------------------------------
  VALIDATE TYPE
  ----------------------------------------------
  */

  const allowedTypes = [
    "CALL",
    "EMAIL",
    "MEETING",
    "SMS",
    "NOTE"
  ];


  if (!allowedTypes.includes(type)) {

    throw new Error(
      "Invalid interaction type"
    );

  }


  /*
  ----------------------------------------------
  VALIDATE OUTCOME
  ----------------------------------------------
  */

  const allowedOutcomes = [
    "POSITIVE",
    "NEUTRAL",
    "NEGATIVE",
    "NO ANSWER"
  ];


  if (
    outcome &&
    !allowedOutcomes.includes(outcome)
  ) {

    throw new Error(
      "Invalid interaction outcome"
    );

  }


  /*
  ----------------------------------------------
  CREATE INTERACTION
  ----------------------------------------------
  */

  const result = await pool.query(
    `
    INSERT INTO interactions
    (
      prospect_id,
      user_id,
      type,
      notes,
      outcome,
      next_action,
      next_action_date
    )

    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7
    )

    RETURNING *
    `,
    [
      prospectId,
      user.id,
      type,
      notes ?? null,
      outcome ?? null,
      nextAction ?? null,
      nextActionDate ?? null
    ]
  );


  /*
  ----------------------------------------------
  UPDATE LAST CONTACT DATE
  ----------------------------------------------
  */

  await pool.query(
    `
    UPDATE prospects

    SET last_contact_date=CURRENT_TIMESTAMP

    WHERE id=$1
    `,
    [prospectId]
  );


  return result.rows[0];

};




/*
================================================
GET PROSPECT INTERACTIONS

AGENT:
  يشوف interactions ديال prospects ديالو

MANAGER:
  يشوف interactions ديال الجميع
================================================
*/

export const getProspectInteractions = async (
  prospectId: number,
  user: any
) => {


  /*
  ----------------------------------------------
  CHECK PROSPECT
  ----------------------------------------------
  */

  const prospectResult = await pool.query(
    `
    SELECT *
    FROM prospects
    WHERE id=$1
    `,
    [prospectId]
  );


  const prospect = prospectResult.rows[0];


  if (!prospect) {

    throw new Error(
      "Prospect not found"
    );

  }


  /*
  ----------------------------------------------
  AGENT PERMISSION
  ----------------------------------------------
  */

  if (
    user.role === "AGENT" &&
    prospect.assigned_to !== user.id
  ) {

    throw new Error(
      "Forbidden"
    );

  }


  /*
  ----------------------------------------------
  GET INTERACTIONS
  ----------------------------------------------
  */

  const result = await pool.query(
    `
    SELECT
      i.*,
      u.email AS user_email

    FROM interactions i

    LEFT JOIN users u
      ON i.user_id=u.id

    WHERE i.prospect_id=$1

    ORDER BY i.created_at DESC
    `,
    [prospectId]
  );


  return result.rows;

};




/*
================================================
CREATE CLIENT INTERACTION

AGENT:
  يقدر ينشئ interaction غير للـ clients ديالو

MANAGER:
  يقدر ينشئ لأي client
================================================
*/

export const createClientInteraction = async (
  data: any,
  user: any
) => {


  const {
    clientId,
    type,
    notes,
    outcome,
    nextAction,
    nextActionDate
  } = data;


  /*
  ----------------------------------------------
  CHECK REQUIRED FIELDS
  ----------------------------------------------
  */

  if (!clientId || !type) {

    throw new Error(
      "Client and interaction type are required"
    );

  }


  /*
  ----------------------------------------------
  CHECK CLIENT
  ----------------------------------------------
  */

  const clientResult = await pool.query(
    `
    SELECT *
    FROM clients
    WHERE id=$1
    `,
    [clientId]
  );


  const client = clientResult.rows[0];


  if (!client) {

    throw new Error(
      "Client not found"
    );

  }


  /*
  ----------------------------------------------
  AGENT PERMISSION
  ----------------------------------------------
  */

  if (
    user.role === "AGENT" &&
    client.assigned_to !== user.id
  ) {

    throw new Error(
      "Forbidden"
    );

  }


  /*
  ----------------------------------------------
  VALIDATE TYPE
  ----------------------------------------------
  */

  const allowedTypes = [
    "CALL",
    "EMAIL",
    "MEETING",
    "SMS",
    "NOTE"
  ];


  if (!allowedTypes.includes(type)) {

    throw new Error(
      "Invalid interaction type"
    );

  }


  /*
  ----------------------------------------------
  VALIDATE OUTCOME
  ----------------------------------------------
  */

  const allowedOutcomes = [
    "POSITIVE",
    "NEUTRAL",
    "NEGATIVE",
    "NO ANSWER"
  ];


  if (
    outcome &&
    !allowedOutcomes.includes(outcome)
  ) {

    throw new Error(
      "Invalid interaction outcome"
    );

  }


  /*
  ----------------------------------------------
  CREATE CLIENT INTERACTION
  ----------------------------------------------
  */

  const result = await pool.query(
    `
    INSERT INTO interactions
    (
      client_id,
      user_id,
      type,
      notes,
      outcome,
      next_action,
      next_action_date
    )

    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7
    )

    RETURNING *
    `,
    [
      clientId,
      user.id,
      type,
      notes ?? null,
      outcome ?? null,
      nextAction ?? null,
      nextActionDate ?? null
    ]
  );


  return result.rows[0];

};