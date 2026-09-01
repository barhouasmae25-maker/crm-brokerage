import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

import type { SelectChangeEvent } from "@mui/material/Select";

import api from "../../services/api";

/* =====================================================
   TYPES
===================================================== */

interface Client {
  id: number;
  prospect_id: number;

  first_name: string;
  last_name: string;

  email: string;
  phone: string;

  account_number: string;
  account_type: string;

  trading_experience: string | null;

  initial_deposit: string | number | null;
  balance: string | number;

  status:
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED"
    | "CLOSED";

  assigned_to: number | null;

  created_at: string;
  updated_at: string;

  account_request_id: number | null;

  prospect_status?: string;
}

/* =====================================================
   CLIENTS PAGE
===================================================== */

export default function Clients() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);

  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* ===================================================
     LOAD CLIENTS
  =================================================== */

  const loadClients = async () => {
    try {
      setLoading(true);
      setError("");

      let url = "/clients";

      if (status) {
        url += `?status=${encodeURIComponent(status)}`;
      }

      const response = await api.get<Client[]>(url);

      setClients(response.data);
    } catch (err: any) {
      console.error("GET CLIENTS ERROR:", err);

      setError(
        err?.response?.data?.message ||
          "Impossible de récupérer les clients"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     USE EFFECT
  =================================================== */

  useEffect(() => {
    loadClients();
  }, [status]);

  /* ===================================================
     STATUS
  =================================================== */

  const handleStatusChange = (
    event: SelectChangeEvent
  ) => {
    setStatus(event.target.value);
  };

  /* ===================================================
     DETAILS
  =================================================== */

  const handleDetails = (clientId: number) => {
    navigate(`/agent/clients/${clientId}`);
  };

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <Box
      sx={{
        padding: 3,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
          }}
        >
          Clients
        </Typography>

        <FormControl
          sx={{
            minWidth: 200,
          }}
        >
          <InputLabel id="client-status-label">
            Status
          </InputLabel>

          <Select
            labelId="client-status-label"
            value={status}
            label="Status"
            onChange={handleStatusChange}
          >
            <MenuItem value="">
              Tous
            </MenuItem>

            <MenuItem value="ACTIVE">
              ACTIVE
            </MenuItem>

            <MenuItem value="INACTIVE">
              INACTIVE
            </MenuItem>

            <MenuItem value="SUSPENDED">
              SUSPENDED
            </MenuItem>

            <MenuItem value="CLOSED">
              CLOSED
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <Card
          sx={{
            marginBottom: 3,
          }}
        >
          <CardContent>
            <Typography
              component="p"
              sx={{
                color: "error.main",
              }}
            >
              {error}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 6,
          }}
        >
          <CircularProgress />
        </Box>
      ) : clients.length === 0 ? (
        /* =================================================
           EMPTY
        ================================================= */

        <Card>
          <CardContent>
            <Typography
              component="p"
              sx={{
                textAlign: "center",
              }}
            >
              Aucun client trouvé.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        /* =================================================
           TABLE
        ================================================= */

        <TableContainer
          component={Paper}
          sx={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  ID
                </TableCell>

                <TableCell>
                  Nom
                </TableCell>

                <TableCell>
                  Email
                </TableCell>

                <TableCell>
                  Téléphone
                </TableCell>

                <TableCell>
                  Account Number
                </TableCell>

                <TableCell>
                  Account Type
                </TableCell>

                <TableCell>
                  Experience
                </TableCell>

                <TableCell>
                  Balance
                </TableCell>

                <TableCell>
                  Status
                </TableCell>

                <TableCell>
                  Prospect Status
                </TableCell>

                <TableCell>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {clients.map((client) => (
                <TableRow
                  key={client.id}
                  hover
                >
                  <TableCell>
                    {client.id}
                  </TableCell>

                  <TableCell>
                    {client.first_name}{" "}
                    {client.last_name}
                  </TableCell>

                  <TableCell>
                    {client.email}
                  </TableCell>

                  <TableCell>
                    {client.phone}
                  </TableCell>

                  <TableCell>
                    {client.account_number}
                  </TableCell>

                  <TableCell>
                    {client.account_type}
                  </TableCell>

                  <TableCell>
                    {client.trading_experience ||
                      "-"}
                  </TableCell>

                  <TableCell>
                    {client.balance}
                  </TableCell>

                  <TableCell>
                    {client.status}
                  </TableCell>

                  <TableCell>
                    {client.prospect_status ||
                      "-"}
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() =>
                        handleDetails(
                          client.id
                        )
                      }
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}