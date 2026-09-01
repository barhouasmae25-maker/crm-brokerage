import pool from "../models/db.js";


/*
================================================
CREATE PROSPECT
- AGENT لي كينشئ prospect كيتسجل assigned_to ديالو
================================================
*/
export const createProspect = async (
  data: any,
  userId: number
) => {

  const {
    firstName,
    lastName,
    email,
    phone,
    source,
    interest,
    estimatedCapital,
    notes
  } = data;


  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !source ||
    !interest
  ) {
    throw new Error("Missing required fields");
  }


  // Check email duplicate in prospects
  const existProspect = await pool.query(
    "SELECT id FROM prospects WHERE email=$1",
    [email]
  );


  if (existProspect.rows.length > 0) {
    throw new Error(
      "Email already exists in prospects"
    );
  }


  // Check email duplicate in clients (future module)
  const existClient = await pool.query(
    "SELECT id FROM clients WHERE email=$1",
    [email]
  ).catch(()=>({rows:[]}));


  if (existClient.rows.length > 0) {
    throw new Error(
      "Email already exists in clients"
    );
  }



  const result = await pool.query(
    `
    INSERT INTO prospects
    (
      first_name,
      last_name,
      email,
      phone,
      source,
      interest,
      estimated_capital,
      notes,
      assigned_to,
      created_by
    )

    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
    )

    RETURNING *
    `,
    [
      firstName,
      lastName,
      email,
      phone,
      source,
      interest,
      estimatedCapital ?? null,
      notes ?? null,
      userId,
      userId
    ]
  );


  return result.rows[0];

};




/*
================================================
GET ALL PROSPECTS

AGENT:
  يشوف غير ديالو

MANAGER:
  يشوف الجميع

Filters:
 status
 source
================================================
*/

export const getProspects = async (
  user:any,
  filters:any
)=>{


let query =
"SELECT * FROM prospects WHERE 1=1";


const values:any[]=[];



if(user.role==="AGENT"){

 values.push(user.id);

 query +=
 ` AND assigned_to=$${values.length}`;

}



if(filters.status){

 values.push(filters.status);

 query +=
 ` AND status=$${values.length}`;

}



if(filters.source){

 values.push(filters.source);

 query +=
 ` AND source=$${values.length}`;

}




const result =
await pool.query(
 query,
 values
);


return result.rows;

};





/*
================================================
GET ONE PROSPECT
================================================
*/

export const getProspectById = async(
 id:number,
 user:any
)=>{


const result =
await pool.query(
"SELECT * FROM prospects WHERE id=$1",
[id]
);



const prospect =
result.rows[0];



if(!prospect){

 throw new Error(
 "Prospect not found"
 );

}




// Agent permission

if(
 user.role==="AGENT" &&
 prospect.assigned_to !== user.id
){

 throw new Error(
 "Forbidden"
 );

}



return prospect;


};






/*
================================================
UPDATE PROSPECT
================================================
*/

export const updateProspect = async(
 id:number,
 data:any,
 user:any
)=>{


const old =
await getProspectById(
 id,
 user
);



const result =
await pool.query(
`
UPDATE prospects SET

first_name=$1,
last_name=$2,
phone=$3,
source=$4,
interest=$5,
status=$6,
estimated_capital=$7,
notes=$8,
updated_at=CURRENT_TIMESTAMP

WHERE id=$9

RETURNING *

`,
[

data.firstName ?? old.first_name,

data.lastName ?? old.last_name,

data.phone ?? old.phone,

data.source ?? old.source,

data.interest ?? old.interest,

data.status ?? old.status,

data.estimatedCapital ?? old.estimated_capital,

data.notes ?? old.notes,

id

]

);



return result.rows[0];


};






/*
================================================
ASSIGN PROSPECT
MANAGER ONLY
================================================
*/

export const assignProspect = async(
 id:number,
 assignedTo:number
)=>{


const result =
await pool.query(
`
UPDATE prospects

SET assigned_to=$1

WHERE id=$2

RETURNING *
`,
[
assignedTo,
id
]
);



if(result.rows.length===0){

 throw new Error(
 "Prospect not found"
 );

}



return result.rows[0];

};