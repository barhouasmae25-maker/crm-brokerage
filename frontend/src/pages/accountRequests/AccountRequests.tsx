import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import Layout from "../../components/layout/Layout";

import {
  getAccountRequests,
} from "../../services/accountRequest.service";

import type {
  AccountRequest,
  AccountRequestStatus,
} from "../../services/accountRequest.service";

/* =====================================================
   STATUS COLOR
===================================================== */

const getStatusColor = (
  status: AccountRequestStatus
) => {
  switch (status) {
    case "APPROVED":
      return "success";

    case "REJECTED":
      return "error";

    case "UNDER REVIEW":
      return "warning";

    default:
      return "info";
  }
};

/* =====================================================
   PAGE
===================================================== */

export default function AccountRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] =
    useState<AccountRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ===================================================
     LOAD DATA
  =================================================== */

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAccountRequests();

      setRequests(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Cannot load account requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  /* ===================================================
     PAGE
  =================================================== */

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
          }}
        >
          {/* HEADER */}

          <Box
            sx={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box>
              <Box
                sx={{
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                Account Requests
              </Box>

              <Box
                sx={{
                  mt: 0.5,
                  color:
                    "text.secondary",
                }}
              >
                Liste des demandes de
                comptes
              </Box>
            </Box>

            <Button
              variant="contained"
              onClick={() =>
                navigate(
                  "/account-requests/add"
                )
              }
            >
              New Request
            </Button>
          </Box>

          {/* ERROR */}

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>
          )}

          {/* LOADING */}

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "center",
                py: 6,
              }}
            >
              <CircularProgress />
            </Box>
          ) : requests.length === 0 ? (
            <Card variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    textAlign: "center",
                    color:
                      "text.secondary",
                    py: 3,
                  }}
                >
                  No account requests
                  found.
                </Box>
              </CardContent>
            </Card>
          ) : (
            <TableContainer
              component={Paper}
              variant="outlined"
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>ID</b>
                    </TableCell>

                    <TableCell>
                      <b>Prospect</b>
                    </TableCell>

                    <TableCell>
                      <b>Email</b>
                    </TableCell>

                    <TableCell>
                      <b>Account Type</b>
                    </TableCell>

                    <TableCell>
                      <b>Experience</b>
                    </TableCell>

                    <TableCell>
                      <b>Deposit</b>
                    </TableCell>

                    <TableCell>
                      <b>Status</b>
                    </TableCell>

                    <TableCell align="center">
                      <b>Action</b>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {requests.map(
                    (request) => (
                      <TableRow
                        key={request.id}
                        hover
                      >
                        <TableCell>
                          {request.id}
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              fontWeight: 600,
                            }}
                          >
                            {request.first_name ||
                              "-"}{" "}
                            {request.last_name ||
                              ""}
                          </Box>

                          <Box
                            sx={{
                              fontSize: 12,
                              color:
                                "text.secondary",
                            }}
                          >
                            Prospect #
                            {
                              request.prospect_id
                            }
                          </Box>
                        </TableCell>

                        <TableCell>
                          {request.email ||
                            "-"}
                        </TableCell>

                        <TableCell>
                          {
                            request.account_type
                          }
                        </TableCell>

                        <TableCell>
                          {
                            request.trading_experience
                          }
                        </TableCell>

                        <TableCell>
                          €
                          {Number(
                            request.initial_deposit
                          ).toFixed(2)}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              request.status
                            }
                            color={getStatusColor(
                              request.status
                            )}
                            size="small"
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              navigate(
                                `/account-requests/${request.id}`
                              )
                            }
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Layout>
  );
}