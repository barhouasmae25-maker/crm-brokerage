import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

/*
================================================
USER CONTROLLER
================================================
*/

import {
  getAgents
} from "./controllers/user.controller.js";

/*
================================================
AUTH CONTROLLER
================================================
*/

import {
  register,
  login
} from "./controllers/auth.controller.js";

/*
================================================
PROSPECT CONTROLLER
================================================
*/

import {
  create,
  getAll,
  getOne,
  update,
  assign
} from "./controllers/prospect.controller.js";

/*
================================================
INTERACTION CONTROLLER
================================================
*/

import {
  createProspectInteractionController,
  getProspectInteractionsController,
  createClientInteractionController
} from "./controllers/interaction.controller.js";

/*
================================================
ACCOUNT REQUEST CONTROLLER
================================================
*/

import {
  createAccountRequestController,
  getAccountRequestsController,
  getAccountRequestByIdController,
  updateAccountRequestStatusController,
  verifyDocumentController
} from "./controllers/accountRequest.controller.js";

/*
================================================
CLIENT CONTROLLER
================================================
*/

import {
  getClientsController,
  getClientByIdController,
  createClientController,
  updateClientController
} from "./controllers/client.controller.js";

/*
================================================
DASHBOARD CONTROLLER
================================================
*/

import {
  getAgentDashboardController,
  getManagerDashboardController,
  getDashboardTasksController
} from "./controllers/dashboard.controller.js";

/*
================================================
MIDDLEWARES
================================================
*/

import {
  authMiddleware
} from "./middlewares/auth.middleware.js";

import {
  isManager
} from "./middlewares/role.middleware.js";

import {
  uploadAccountDocuments
} from "./middlewares/upload.middleware.js";

/*
================================================
DOTENV
================================================
*/

dotenv.config();

/*
================================================
APP
================================================
*/

const app = express();

/*
================================================
CORS
================================================
*/

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

/*
================================================
BODY PARSER
================================================
*/

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true
  })
);

/*
================================================
UPLOADED FILES
================================================

Files are physically stored in:

backend/uploads/account-requests/

And accessible through:

http://localhost:5000/uploads/account-requests/filename.pdf

================================================
*/

app.use(
  "/uploads",
  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);

/*
================================================
AUTH
================================================
*/

/*
------------------------------------------------
POST /api/auth/register
------------------------------------------------
*/

app.post(
  "/api/auth/register",
  register
);

/*
------------------------------------------------
POST /api/auth/login
------------------------------------------------
*/

app.post(
  "/api/auth/login",
  login
);

/*
================================================
PROSPECTS
================================================
*/

/*
------------------------------------------------
POST /api/prospects
------------------------------------------------
*/

app.post(
  "/api/prospects",
  authMiddleware,
  create
);

/*
------------------------------------------------
GET /api/prospects
------------------------------------------------
*/

app.get(
  "/api/prospects",
  authMiddleware,
  getAll
);

/*
------------------------------------------------
GET /api/prospects/:prospectId
------------------------------------------------
*/

app.get(
  "/api/prospects/:prospectId",
  authMiddleware,
  getOne
);

/*
------------------------------------------------
PUT /api/prospects/:prospectId
------------------------------------------------
*/

app.put(
  "/api/prospects/:prospectId",
  authMiddleware,
  update
);

/*
------------------------------------------------
PUT /api/prospects/:prospectId/assign
MANAGER ONLY
------------------------------------------------
*/

app.put(
  "/api/prospects/:prospectId/assign",
  authMiddleware,
  isManager,
  assign
);

/*
================================================
USERS
================================================
*/

/*
------------------------------------------------
GET /api/admin/users
MANAGER ONLY
------------------------------------------------
*/

app.get(
  "/api/admin/users",
  authMiddleware,
  isManager,
  getAgents
);

/*
================================================
INTERACTIONS
================================================
*/

/*
------------------------------------------------
POST /api/prospects/:prospectId/interactions
------------------------------------------------
*/

app.post(
  "/api/prospects/:prospectId/interactions",
  authMiddleware,
  createProspectInteractionController
);

/*
------------------------------------------------
GET /api/prospects/:prospectId/interactions
------------------------------------------------
*/

app.get(
  "/api/prospects/:prospectId/interactions",
  authMiddleware,
  getProspectInteractionsController
);

/*
------------------------------------------------
POST /api/clients/:clientId/interactions
------------------------------------------------
*/

app.post(
  "/api/clients/:clientId/interactions",
  authMiddleware,
  createClientInteractionController
);

/*
================================================
MODULE 4
ACCOUNT REQUESTS
================================================
*/

/*
------------------------------------------------
CREATE ACCOUNT REQUEST
------------------------------------------------

POST /api/account-requests

Multipart fields:

passport
idCard
proofOfAddress
*/

app.post(
  "/api/account-requests",

  authMiddleware,

  uploadAccountDocuments.fields([
    {
      name: "passport",
      maxCount: 1
    },
    {
      name: "idCard",
      maxCount: 1
    },
    {
      name: "proofOfAddress",
      maxCount: 1
    }
  ]),

  createAccountRequestController
);

/*
------------------------------------------------
GET ALL ACCOUNT REQUESTS
------------------------------------------------

GET /api/account-requests
*/

app.get(
  "/api/account-requests",
  authMiddleware,
  getAccountRequestsController
);

/*
------------------------------------------------
GET ONE ACCOUNT REQUEST
------------------------------------------------

GET /api/account-requests/:requestId
*/

app.get(
  "/api/account-requests/:requestId",
  authMiddleware,
  getAccountRequestByIdController
);

/*
------------------------------------------------
UPDATE ACCOUNT REQUEST STATUS
------------------------------------------------

PUT /api/account-requests/:requestId/status

MANAGER ONLY
*/

app.put(
  "/api/account-requests/:requestId/status",
  authMiddleware,
  isManager,
  updateAccountRequestStatusController
);

/*
------------------------------------------------
VERIFY ACCOUNT REQUEST DOCUMENT
------------------------------------------------

PUT /api/account-requests/:requestId/documents/:docId/verify

MANAGER ONLY
*/

app.put(
  "/api/account-requests/:requestId/documents/:docId/verify",
  authMiddleware,
  isManager,
  verifyDocumentController
);

/*
================================================
MODULE 5
CLIENTS
================================================
*/

/*
------------------------------------------------
GET ALL CLIENTS
------------------------------------------------

GET /api/clients

Examples:

GET /api/clients

GET /api/clients?status=ACTIVE

GET /api/clients?assignedTo=1

GET /api/clients?status=ACTIVE&assignedTo=1

Rules:

AGENT   -> sees only his clients

MANAGER -> sees all clients
*/

app.get(
  "/api/clients",
  authMiddleware,
  getClientsController
);

/*
------------------------------------------------
GET ONE CLIENT
------------------------------------------------

GET /api/clients/:clientId

AGENT:
only his own client

MANAGER:
any client
*/

app.get(
  "/api/clients/:clientId",
  authMiddleware,
  getClientByIdController
);

/*
------------------------------------------------
CREATE CLIENT
------------------------------------------------

POST /api/clients

Normally the client is created automatically
after an account request is APPROVED.

This endpoint is nevertheless required
by the Module 5 specification.
*/

app.post(
  "/api/clients",
  authMiddleware,
  createClientController
);

/*
------------------------------------------------
UPDATE CLIENT
------------------------------------------------

PUT /api/clients/:clientId

AGENT:
can update his own client

MANAGER:
can update any client
*/

app.put(
  "/api/clients/:clientId",
  authMiddleware,
  updateClientController
);

/*
================================================
MODULE 6
DASHBOARD
================================================
*/

/*
------------------------------------------------
AGENT DASHBOARD
------------------------------------------------

GET /api/dashboard/agent

Returns dashboard statistics
for the authenticated agent.

Examples of returned data:

- Prospects by status
- Total prospects
- Won prospects
- Clients
- Active clients
- Inactive clients
- Account requests by status
- Conversion rate
- Total balance
*/

app.get(
  "/api/dashboard/agent",
  authMiddleware,
  getAgentDashboardController
);

/*
------------------------------------------------
MANAGER DASHBOARD
------------------------------------------------

GET /api/dashboard/manager

MANAGER ONLY

Returns global CRM statistics:

- Prospects by status
- Total prospects
- Won prospects
- Clients
- Active clients
- Inactive clients
- Account requests by status
- Conversion rate
- Total balance
*/

app.get(
  "/api/dashboard/manager",
  authMiddleware,
  isManager,
  getManagerDashboardController
);

/*
------------------------------------------------
DASHBOARD TASKS
------------------------------------------------

GET /api/dashboard/tasks

AGENT:
sees tasks related to his prospects/clients.

MANAGER:
sees all tasks.

Tasks are based on interactions
having a next_action_date.
*/

app.get(
  "/api/dashboard/tasks",
  authMiddleware,
  getDashboardTasksController
);

/*
================================================
TEST
================================================
*/

/*
------------------------------------------------
GET /
------------------------------------------------
*/

app.get(
  "/",
  (req, res) => {
    res.json({
      message: "CRM API Running 🚀"
    });
  }
);

/*
================================================
SERVER
================================================
*/

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  }
);