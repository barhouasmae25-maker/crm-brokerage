import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Link,
  MenuItem,
  Paper,
  TextField,
} from "@mui/material";

import Layout from "../../components/layout/Layout";

import {
  getAccountRequest,
  updateAccountRequestStatus,
  verifyAccountRequestDocument,
} from "../../services/accountRequest.service";

import type {
  AccountRequest,
  AccountRequestStatus,
} from "../../services/accountRequest.service";

/* =========================================================
   BACKEND URL
========================================================= */

const BACKEND_URL =
  "http://localhost:5000";

/* =========================================================
   DOCUMENT TYPE
========================================================= */

interface DocumentFromBackend {
  id: number;

  request_id?: number;

  document_type?: string;

  document_url?: string | null;

  file_path?: string | null;

  document_path?: string | null;

  url?: string | null;

  path?: string | null;

  fileUrl?: string | null;

  file_url?: string | null;

  documentUrl?: string | null;

  filename?: string | null;

  file_name?: string | null;

  verified?: boolean;

  verified_at?: string | null;

  verified_by?: number | null;

  created_at?: string;
}

/* =========================================================
   GET DOCUMENT PATH
========================================================= */

const getDocumentPath = (
  document: DocumentFromBackend
): string => {

  /*
   * Try all possible names that
   * backend can return.
   */

  const possiblePaths = [
    document.document_url,
    document.file_path,
    document.document_path,
    document.url,
    document.path,
    document.fileUrl,
    document.file_url,
    document.documentUrl,
    document.filename,
    document.file_name,
  ];

  for (const value of possiblePaths) {

    if (
      typeof value === "string" &&
      value.trim() !== ""
    ) {
      return value.trim();
    }
  }

  return "";
};

/* =========================================================
   GET DOCUMENT URL
========================================================= */

const getDocumentUrl = (
  documentPath: string
): string => {

  if (!documentPath) {
    return "";
  }

  const path =
    documentPath.trim();

  if (!path) {
    return "";
  }

  /*
   * Already complete URL
   */

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  /*
   * Backend returns:
   *
   * /uploads/account-requests/file.pdf
   */

  if (path.startsWith("/")) {

    return `${BACKEND_URL}${path}`;
  }

  /*
   * Backend returns:
   *
   * uploads/account-requests/file.pdf
   */

  return `${BACKEND_URL}/${path}`;
};

/* =========================================================
   GET ROLE
========================================================= */

const getUserRole = (): string | null => {

  try {

    const token =
      localStorage.getItem("token");

    if (!token) {
      return null;
    }

    const parts =
      token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64 =
      parts[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const payload =
      JSON.parse(
        atob(base64)
      );

    return payload.role || null;

  } catch {

    return null;

  }
};

/* =========================================================
   STATUS COLOR
========================================================= */

const getStatusColor = (
  status: AccountRequestStatus
):
  | "success"
  | "error"
  | "warning"
  | "info" => {

  switch (status) {

    case "APPROVED":
      return "success";

    case "REJECTED":
      return "error";

    case "UNDER REVIEW":
      return "warning";

    case "PENDING REVIEW":
    default:
      return "info";
  }
};

/* =========================================================
   PAGE
========================================================= */

export default function AccountRequestDetails() {

  const { id } =
    useParams<{ id: string }>();

  const navigate =
    useNavigate();

  const isManager =
    getUserRole() === "MANAGER";

  /* =======================================================
     STATE
  ======================================================= */

  const [request, setRequest] =
    useState<AccountRequest | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [status, setStatus] =
    useState<AccountRequestStatus>(
      "PENDING REVIEW"
    );

  /* =======================================================
     LOAD REQUEST
  ======================================================= */

  const loadRequest =
    async () => {

      try {

        setLoading(true);

        setError("");

        if (!id) {

          throw new Error(
            "Account request ID not found."
          );
        }

        const requestId =
          Number(id);

        if (
          !Number.isInteger(
            requestId
          ) ||
          requestId <= 0
        ) {

          throw new Error(
            "Invalid account request ID."
          );
        }

        const data =
          await getAccountRequest(
            requestId
          );

        console.log(
          "========== ACCOUNT REQUEST =========="
        );

        console.log(
          data
        );

        console.log(
          "========== DOCUMENTS =========="
        );

        console.log(
          data.documents
        );

        /*
         * Show every document object
         * in console.
         */

        if (
          Array.isArray(
            data.documents
          )
        ) {

          data.documents.forEach(
            (document, index) => {

              console.log(
                `DOCUMENT ${index + 1}:`
              );

              console.log(
                JSON.stringify(
                  document,
                  null,
                  2
                )
              );

            }
          );
        }

        setRequest(data);

        setStatus(
          data.status
        );

      } catch (error) {

        console.error(
          "LOAD ACCOUNT REQUEST ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Cannot load account request."
        );

        setRequest(null);

      } finally {

        setLoading(false);

      }
    };

  /* =======================================================
     EFFECT
  ======================================================= */

  useEffect(() => {

    loadRequest();

  }, [id]);

  /* =======================================================
     VERIFY DOCUMENT
  ======================================================= */

  const handleVerifyDocument =
    async (
      documentId: number
    ) => {

      try {

        if (!id) {
          return;
        }

        setActionLoading(true);

        setError("");

        await verifyAccountRequestDocument(
          Number(id),
          documentId
        );

        await loadRequest();

      } catch (error) {

        console.error(
          "VERIFY DOCUMENT ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Cannot verify document."
        );

      } finally {

        setActionLoading(false);

      }
    };

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const handleUpdateStatus =
    async () => {

      if (!request) {
        return;
      }

      try {

        setActionLoading(true);

        setError("");

        await updateAccountRequestStatus(
          request.id,
          status
        );

        await loadRequest();

      } catch (error) {

        console.error(
          "UPDATE STATUS ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Cannot update status."
        );

      } finally {

        setActionLoading(false);

      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <Layout>

        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >

          <CircularProgress />

        </Box>

      </Layout>

    );
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!request) {

    return (

      <Layout>

        <Box sx={{ p: 3 }}>

          <Alert severity="error">

            {error ||
              "Account request not found."}

          </Alert>

          <Button
            sx={{ mt: 2 }}
            variant="outlined"
            onClick={() =>
              navigate(
                "/account-requests"
              )
            }
          >
            Back to Requests
          </Button>

        </Box>

      </Layout>

    );
  }

  /* =======================================================
     DOCUMENTS
  ======================================================= */

  const documents =
    Array.isArray(
      request.documents
    )
      ? request.documents
      : [];

  /* =======================================================
     PAGE
  ======================================================= */

  return (

    <Layout>

      <Box
        sx={{
          p: 3,
          maxWidth: 1100,
          mx: "auto",
        }}
      >

        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
          }}
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <Box
            sx={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap: 2,
              mb: 3,
              flexWrap: "wrap",
            }}
          >

            <Box>

              <Box
                sx={{
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                Account Request #
                {request.id}
              </Box>

              <Box
                sx={{
                  mt: 1,
                  color:
                    "text.secondary",
                }}
              >
                Created:{" "}

                {request.created_at
                  ? new Date(
                      request.created_at
                    ).toLocaleString()
                  : "-"}
              </Box>

            </Box>

            <Chip
              label={
                request.status
              }
              color={
                getStatusColor(
                  request.status
                )
              }
            />

          </Box>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <Alert
              severity="error"
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>

          )}

          <Divider
            sx={{ mb: 3 }}
          />

          {/* =================================================
              PROSPECT INFORMATION
          ================================================= */}

          <Box
            sx={{
              fontSize: 21,
              fontWeight: 700,
              mb: 2,
            }}
          >
            Prospect Information
          </Box>

          <Card
            variant="outlined"
            sx={{ mb: 3 }}
          >

            <CardContent>

              <Box sx={{ mb: 1 }}>
                <b>Prospect ID:</b>{" "}
                {request.prospect_id}
              </Box>

              <Box sx={{ mb: 1 }}>
                <b>Name:</b>{" "}

                {request.first_name ||
                  "-"}

                {" "}

                {request.last_name ||
                  ""}
              </Box>

              <Box sx={{ mb: 1 }}>
                <b>Email:</b>{" "}
                {request.email ||
                  "-"}
              </Box>

              <Box sx={{ mb: 1 }}>
                <b>Phone:</b>{" "}
                {request.phone ||
                  "-"}
              </Box>

              <Box>
                <b>Assigned To:</b>{" "}
                {request.assigned_to ??
                  "-"}
              </Box>

            </CardContent>

          </Card>

          {/* =================================================
              REQUEST INFORMATION
          ================================================= */}

          <Box
            sx={{
              fontSize: 21,
              fontWeight: 700,
              mb: 2,
            }}
          >
            Request Information
          </Box>

          <Card
            variant="outlined"
            sx={{ mb: 3 }}
          >

            <CardContent>

              <Box sx={{ mb: 1 }}>
                <b>
                  Account Type:
                </b>{" "}
                {request.account_type}
              </Box>

              <Box sx={{ mb: 1 }}>
                <b>
                  Trading Experience:
                </b>{" "}
                {request.trading_experience}
              </Box>

              <Box sx={{ mb: 1 }}>
                <b>
                  Initial Deposit:
                </b>{" "}
                €

                {Number(
                  request.initial_deposit
                ).toFixed(2)}
              </Box>

              <Box>
                <b>Status:</b>{" "}
                {request.status}
              </Box>

            </CardContent>

          </Card>

          {/* =================================================
              DOCUMENTS
          ================================================= */}

          <Box
            sx={{
              fontSize: 21,
              fontWeight: 700,
              mb: 2,
            }}
          >
            Documents
          </Box>

          {documents.length === 0 ? (

            <Alert
              severity="warning"
              sx={{ mb: 3 }}
            >
              No documents found.
            </Alert>

          ) : (

            <Box sx={{ mb: 3 }}>

              {documents.map(
                (document) => {

                  /*
                   * Convert backend object
                   * to generic object.
                   */

                  const backendDocument =
                    document as unknown as DocumentFromBackend;

                  /*
                   * Find the actual path.
                   */

                  const documentPath =
                    getDocumentPath(
                      backendDocument
                    );

                  /*
                   * Build complete URL.
                   */

                  const documentUrl =
                    getDocumentUrl(
                      documentPath
                    );

                  /*
                   * DEBUG
                   */

                  console.log(
                    "DOCUMENT:",
                    backendDocument
                  );

                  console.log(
                    "DOCUMENT PATH:",
                    documentPath
                  );

                  console.log(
                    "DOCUMENT URL:",
                    documentUrl
                  );

                  return (

                    <Card
                      key={
                        document.id
                      }
                      variant="outlined"
                      sx={{
                        mb: 2,
                      }}
                    >

                      <CardContent>

                        <Box
                          sx={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            gap: 2,
                            flexWrap:
                              "wrap",
                          }}
                        >

                          {/* =================================================
                              DOCUMENT INFO
                          ================================================= */}

                          <Box
                            sx={{
                              flex: 1,
                              minWidth: 0,
                            }}
                          >

                            <Box
                              sx={{
                                fontWeight: 700,
                                fontSize: 17,
                                mb: 1,
                              }}
                            >
                              {backendDocument.document_type ||
                                "Document"}
                            </Box>

                            {/* PATH */}

                            {documentPath ? (

                              <Box
                                sx={{
                                  fontSize: 13,
                                  color:
                                    "text.secondary",
                                  mb: 1.5,
                                  wordBreak:
                                    "break-all",
                                }}
                              >
                                {documentPath}
                              </Box>

                            ) : (

                              <Box
                                sx={{
                                  fontSize: 13,
                                  color:
                                    "error.main",
                                  mb: 1.5,
                                }}
                              >
                                No document path
                                returned by API.
                              </Box>

                            )}

                            {/* OPEN */}

                            {documentUrl ? (

                              <Box
                                sx={{
                                  display:
                                    "flex",
                                  gap: 2,
                                  flexWrap:
                                    "wrap",
                                }}
                              >

                                <Link
                                  href={
                                    documentUrl
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  underline="hover"
                                >
                                  Open document
                                </Link>

                                <Link
                                  href={
                                    documentUrl
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  underline="hover"
                                >
                                  Download document
                                </Link>

                              </Box>

                            ) : (

                              <Alert
                                severity="error"
                                sx={{
                                  mt: 1,
                                }}
                              >
                                Document file not found.
                              </Alert>

                            )}

                          </Box>

                          {/* =================================================
                              DOCUMENT STATUS
                          ================================================= */}

                          <Box
                            sx={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 1,
                            }}
                          >

                            <Chip
                              label={
                                backendDocument.verified
                                  ? "Verified"
                                  : "Not verified"
                              }
                              color={
                                backendDocument.verified
                                  ? "success"
                                  : "default"
                              }
                              size="small"
                            />

                            {isManager &&
                              !backendDocument.verified && (

                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  disabled={
                                    actionLoading
                                  }
                                  onClick={() =>
                                    handleVerifyDocument(
                                      document.id
                                    )
                                  }
                                >
                                  Verify
                                </Button>

                              )}

                          </Box>

                        </Box>

                      </CardContent>

                    </Card>

                  );
                }
              )}

            </Box>

          )}

          {/* =================================================
              MANAGER ACTIONS
          ================================================= */}

          {isManager && (

            <>

              <Divider
                sx={{ my: 3 }}
              />

              <Box
                sx={{
                  fontSize: 21,
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Manager Actions
              </Box>

              <Box
                sx={{
                  display:
                    "flex",
                  gap: 2,
                  alignItems:
                    "center",
                }}
              >

                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as AccountRequestStatus
                    )
                  }
                >

                  <MenuItem value="PENDING REVIEW">
                    PENDING REVIEW
                  </MenuItem>

                  <MenuItem value="UNDER REVIEW">
                    UNDER REVIEW
                  </MenuItem>

                  <MenuItem value="APPROVED">
                    APPROVED
                  </MenuItem>

                  <MenuItem value="REJECTED">
                    REJECTED
                  </MenuItem>

                </TextField>

                <Button
                  variant="contained"
                  disabled={
                    actionLoading ||
                    status ===
                      request.status
                  }
                  onClick={
                    handleUpdateStatus
                  }
                >
                  {actionLoading
                    ? "Updating..."
                    : "Update Status"}
                </Button>

              </Box>

            </>

          )}

          {/* =================================================
              BACK
          ================================================= */}

          <Box sx={{ mt: 4 }}>

            <Button
              variant="outlined"
              onClick={() =>
                navigate(
                  "/account-requests"
                )
              }
            >
              Back to Requests
            </Button>

          </Box>

        </Paper>

      </Box>

    </Layout>
  );
}