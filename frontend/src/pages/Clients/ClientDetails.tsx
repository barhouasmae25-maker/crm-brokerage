import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
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
  prospect_source?: string | null;
  prospect_interest?: string | null;
}

/* =====================================================
   EDIT DATA
===================================================== */

interface EditClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  accountType: string;
  tradingExperience: string;
  status: Client["status"];
}

/* =====================================================
   COMPONENT
===================================================== */

export default function ClientDetails() {
  const navigate = useNavigate();

  const { clientId } =
    useParams<{ clientId: string }>();

  const [client, setClient] =
    useState<Client | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ===================================================
     FORM
  =================================================== */

  const [form, setForm] =
    useState<EditClientData>({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      accountType: "",
      tradingExperience: "",
      status: "ACTIVE",
    });

  /* ===================================================
     GET CLIENT
  =================================================== */

  const loadClient = async () => {
    try {
      setLoading(true);
      setError("");

      if (!clientId) {
        setError(
          "ID du client introuvable"
        );
        return;
      }

      const id = Number(clientId);

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        setError(
          "ID du client invalide"
        );
        return;
      }

      const response =
        await api.get<Client>(
          `/clients/${id}`
        );

      const data = response.data;

      setClient(data);

      /* -----------------------------------------------
         INITIALIZE FORM
      ----------------------------------------------- */

      setForm({
        firstName:
          data.first_name || "",

        lastName:
          data.last_name || "",

        email:
          data.email || "",

        phone:
          data.phone || "",

        accountType:
          data.account_type || "",

        tradingExperience:
          data.trading_experience || "",

        status:
          data.status || "ACTIVE",
      });
    } catch (err: any) {
      console.error(
        "GET CLIENT DETAILS ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Impossible de récupérer les détails du client"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     EFFECT
  =================================================== */

  useEffect(() => {
    loadClient();
  }, [clientId]);

  /* ===================================================
     INPUT CHANGE
  =================================================== */

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ===================================================
     SELECT CHANGE
  =================================================== */

  const handleStatusChange = (
    event: SelectChangeEvent
  ) => {
    setForm((previous) => ({
      ...previous,
      status:
        event.target.value as Client["status"],
    }));
  };

  const handleAccountTypeChange = (
    event: SelectChangeEvent
  ) => {
    setForm((previous) => ({
      ...previous,
      accountType:
        event.target.value,
    }));
  };

  const handleTradingExperienceChange = (
    event: SelectChangeEvent
  ) => {
    setForm((previous) => ({
      ...previous,
      tradingExperience:
        event.target.value,
    }));
  };

  /* ===================================================
     START EDIT
  =================================================== */

  const handleEdit = () => {
    setError("");
    setSuccess("");
    setEditing(true);
  };

  /* ===================================================
     CANCEL EDIT
  =================================================== */

  const handleCancel = () => {
    if (!client) {
      return;
    }

    setForm({
      firstName:
        client.first_name || "",

      lastName:
        client.last_name || "",

      email:
        client.email || "",

      phone:
        client.phone || "",

      accountType:
        client.account_type || "",

      tradingExperience:
        client.trading_experience || "",

      status:
        client.status || "ACTIVE",
    });

    setError("");
    setSuccess("");
    setEditing(false);
  };

  /* ===================================================
     SAVE
  =================================================== */

  const handleSave = async () => {
    if (!clientId) {
      setError(
        "ID du client introuvable"
      );
      return;
    }

    if (!form.firstName.trim()) {
      setError(
        "Le prénom est obligatoire"
      );
      return;
    }

    if (!form.lastName.trim()) {
      setError(
        "Le nom est obligatoire"
      );
      return;
    }

    if (!form.email.trim()) {
      setError(
        "L'email est obligatoire"
      );
      return;
    }

    if (!form.phone.trim()) {
      setError(
        "Le téléphone est obligatoire"
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const id = Number(clientId);

      const response =
        await api.put<Client>(
          `/clients/${id}`,
          {
            firstName:
              form.firstName.trim(),

            lastName:
              form.lastName.trim(),

            email:
              form.email.trim(),

            phone:
              form.phone.trim(),

            accountType:
              form.accountType,

            tradingExperience:
              form.tradingExperience,

            status:
              form.status,
          }
        );

      setClient(response.data);

      /* -----------------------------------------------
         UPDATE FORM WITH RESPONSE
      ----------------------------------------------- */

      setForm({
        firstName:
          response.data.first_name || "",

        lastName:
          response.data.last_name || "",

        email:
          response.data.email || "",

        phone:
          response.data.phone || "",

        accountType:
          response.data.account_type || "",

        tradingExperience:
          response.data.trading_experience ||
          "",

        status:
          response.data.status || "ACTIVE",
      });

      setEditing(false);

      setSuccess(
        "Client modifié avec succès."
      );
    } catch (err: any) {
      console.error(
        "UPDATE CLIENT ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Impossible de modifier le client"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ===================================================
     DATE
  =================================================== */

  const formatDate = (
    date: string
  ) => {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleString(
      "fr-FR"
    );
  };

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
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
    );
  }

  /* ===================================================
     ERROR WITHOUT CLIENT
  =================================================== */

  if (error && !client) {
    return (
      <Box sx={{ padding: 3 }}>
        <Card>
          <CardContent>
            <Typography
              component="p"
              sx={{
                color: "error.main",
                marginBottom: 2,
              }}
            >
              {error}
            </Typography>

            <Button
              variant="contained"
              onClick={() =>
                navigate(
                  "/agent/clients"
                )
              }
            >
              Retour aux clients
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!client) {
    return (
      <Box sx={{ padding: 3 }}>
        <Typography
          component="p"
          sx={{
            marginBottom: 2,
          }}
        >
          Client introuvable.
        </Typography>

        <Button
          variant="contained"
          onClick={() =>
            navigate(
              "/agent/clients"
            )
          }
        >
          Retour aux clients
        </Button>
      </Box>
    );
  }

  /* ===================================================
     PAGE
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
          justifyContent:
            "space-between",
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
          Détails du client
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={() =>
              navigate(
                "/agent/clients"
              )
            }
          >
            Retour
          </Button>

          {!editing && (
            <Button
              variant="contained"
              onClick={handleEdit}
            >
              Modifier le client
            </Button>
          )}
        </Box>
      </Box>

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <Card
          sx={{
            marginBottom: 3,
          }}
        >
          <CardContent>
            <Typography
              component="p"
              sx={{
                color: "success.main",
              }}
            >
              {success}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && client && (
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
          EDIT FORM
      ================================================= */}

      {editing && (
        <Card
          sx={{
            marginBottom: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 700,
                marginBottom: 3,
              }}
            >
              Modifier le client
            </Typography>

            <Divider
              sx={{
                marginBottom: 3,
              }}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 3,
              }}
            >
              {/* FIRST NAME */}

              <TextField
                label="Prénom"
                name="firstName"
                value={form.firstName}
                onChange={
                  handleInputChange
                }
                fullWidth
              />

              {/* LAST NAME */}

              <TextField
                label="Nom"
                name="lastName"
                value={form.lastName}
                onChange={
                  handleInputChange
                }
                fullWidth
              />

              {/* EMAIL */}

              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={
                  handleInputChange
                }
                fullWidth
                type="email"
              />

              {/* PHONE */}

              <TextField
                label="Téléphone"
                name="phone"
                value={form.phone}
                onChange={
                  handleInputChange
                }
                fullWidth
              />

              {/* ACCOUNT TYPE */}

              <FormControl fullWidth>
                <InputLabel id="account-type-label">
                  Account Type
                </InputLabel>

                <Select
                  labelId="account-type-label"
                  value={
                    form.accountType
                  }
                  label="Account Type"
                  onChange={
                    handleAccountTypeChange
                  }
                >
                  <MenuItem value="INDIVIDUAL">
                    INDIVIDUAL
                  </MenuItem>

                  <MenuItem value="JOINT">
                    JOINT
                  </MenuItem>

                  <MenuItem value="CORPORATE">
                    CORPORATE
                  </MenuItem>

                  <MenuItem value="IRA">
                    IRA
                  </MenuItem>
                </Select>
              </FormControl>

              {/* TRADING EXPERIENCE */}

              <FormControl fullWidth>
                <InputLabel id="trading-experience-label">
                  Trading Experience
                </InputLabel>

                <Select
                  labelId="trading-experience-label"
                  value={
                    form.tradingExperience
                  }
                  label="Trading Experience"
                  onChange={
                    handleTradingExperienceChange
                  }
                >
                  <MenuItem value="BEGINNER">
                    BEGINNER
                  </MenuItem>

                  <MenuItem value="INTERMEDIATE">
                    INTERMEDIATE
                  </MenuItem>

                  <MenuItem value="ADVANCED">
                    ADVANCED
                  </MenuItem>

                  <MenuItem value="PROFESSIONAL">
                    PROFESSIONAL
                  </MenuItem>
                </Select>
              </FormControl>

              {/* STATUS */}

              <FormControl fullWidth>
                <InputLabel id="status-label">
                  Status
                </InputLabel>

                <Select
                  labelId="status-label"
                  value={form.status}
                  label="Status"
                  onChange={
                    handleStatusChange
                  }
                >
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

            {/* BUTTONS */}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                marginTop: 3,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
              >
                Annuler
              </Button>

              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Enregistrement..."
                  : "Enregistrer"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* =================================================
          PERSONAL INFORMATION
      ================================================= */}

      <Card
        sx={{
          marginBottom: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 700,
              marginBottom: 2,
            }}
          >
            Informations personnelles
          </Typography>

          <Divider
            sx={{
              marginBottom: 3,
            }}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 3,
            }}
          >
            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                ID
              </Typography>

              <Typography component="p">
                {client.id}
              </Typography>
            </Box>

            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Prénom
              </Typography>

              <Typography component="p">
                {client.first_name}
              </Typography>
            </Box>

            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Nom
              </Typography>

              <Typography component="p">
                {client.last_name}
              </Typography>
            </Box>

            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Email
              </Typography>

              <Typography component="p">
                {client.email}
              </Typography>
            </Box>

            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Téléphone
              </Typography>

              <Typography component="p">
                {client.phone}
              </Typography>
            </Box>

            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Prospect ID
              </Typography>

              <Typography component="p">
                {client.prospect_id}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* =================================================
          ACCOUNT INFORMATION
      ================================================= */}

      <Card
        sx={{
          marginBottom: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 700,
              marginBottom: 2,
            }}
          >
            Informations du compte
          </Typography>

          <Divider
            sx={{
              marginBottom: 3,
            }}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 3,
            }}
          >
            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Account Number
              </Typography>

              <Typography component="p">
                {client.account_number}
              </Typography>
            </Box>

            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Account Type
              </Typography>

              <Typography component="p">
                {client.account_type}
              </Typography>
            </Box>

            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Trading Experience
              </Typography>

              <Typography component="p">
                {client.trading_experience ||
                  "-"}
              </Typography>
            </Box>

            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Initial Deposit
              </Typography>

              <Typography component="p">
                {client.initial_deposit ??
                  "-"}
              </Typography>
            </Box>

            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Balance
              </Typography>

              <Typography component="p">
                {client.balance}
              </Typography>
            </Box>

            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Status
              </Typography>

              <Typography component="p">
                {client.status}
              </Typography>
            </Box>

            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Assigned To
              </Typography>

              <Typography component="p">
                {client.assigned_to ??
                  "-"}
              </Typography>
            </Box>

            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Account Request ID
              </Typography>

              <Typography component="p">
                {client.account_request_id ??
                  "-"}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* =================================================
          PROSPECT INFORMATION
      ================================================= */}

      <Card
        sx={{
          marginBottom: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 700,
              marginBottom: 2,
            }}
          >
            Informations du prospect
          </Typography>

          <Divider
            sx={{
              marginBottom: 3,
            }}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 3,
            }}
          >
            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Prospect Status
              </Typography>

              <Typography component="p">
                {client.prospect_status ||
                  "-"}
              </Typography>
            </Box>

            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Prospect Source
              </Typography>

              <Typography component="p">
                {client.prospect_source ||
                  "-"}
              </Typography>
            </Box>

            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Prospect Interest
              </Typography>

              <Typography component="p">
                {client.prospect_interest ||
                  "-"}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* =================================================
          SYSTEM INFORMATION
      ================================================= */}

      <Card>
        <CardContent>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 700,
              marginBottom: 2,
            }}
          >
            Informations système
          </Typography>

          <Divider
            sx={{
              marginBottom: 3,
            }}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 3,
            }}
          >
            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Créé le
              </Typography>

              <Typography component="p">
                {formatDate(
                  client.created_at
                )}
              </Typography>
            </Box>

            <Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 700,
                }}
              >
                Modifié le
              </Typography>

              <Typography component="p">
                {formatDate(
                  client.updated_at
                )}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}