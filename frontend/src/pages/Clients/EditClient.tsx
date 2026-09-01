import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";

import { useNavigate, useParams } from "react-router-dom";

import {
  getClientById,
  updateClient,
  type Client,
  type ClientStatus,
} from "../../services/client.service";

const EditClient = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [client, setClient] =
    useState<Client | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [accountType, setAccountType] =
    useState("");

  const [
    tradingExperience,
    setTradingExperience,
  ] = useState("");

  const [status, setStatus] =
    useState<ClientStatus>("ACTIVE");

  useEffect(() => {
    const loadClient = async () => {
      try {
        setLoading(true);
        setError("");

        if (!clientId) {
          setError("ID introuvable");
          return;
        }

        const id = Number(clientId);

        if (!Number.isInteger(id) || id <= 0) {
          setError("ID invalide");
          return;
        }

        const data =
          await getClientById(id);

        setClient(data);

        setFirstName(data.first_name);
        setLastName(data.last_name);
        setEmail(data.email);
        setPhone(data.phone || "");

        setAccountType(
          data.account_type || ""
        );

        setTradingExperience(
          data.trading_experience || ""
        );

        setStatus(data.status);
      } catch (err: any) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            "Impossible de charger le client"
        );
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [clientId]);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!client) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateClient(
        client.id,
        {
          firstName,
          lastName,
          email,
          phone,
          accountType,
          tradingExperience,
          status,
        }
      );

      setSuccess(
        "Client modifié avec succès."
      );

      setTimeout(() => {
        navigate(
          `/clients/${client.id}`
        );
      }, 700);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Erreur lors de la modification"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!client) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error || "Client introuvable"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        component="h1"
        sx={{
          m: 0,
          mb: 3,
          fontSize: 28,
          fontWeight: 600,
        }}
      >
        Modifier le client
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 2,
              }}
            >
              <TextField
                label="Prénom"
                value={firstName}
                onChange={(event) =>
                  setFirstName(
                    event.target.value
                  )
                }
                required
                fullWidth
              />

              <TextField
                label="Nom"
                value={lastName}
                onChange={(event) =>
                  setLastName(
                    event.target.value
                  )
                }
                required
                fullWidth
              />

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
                fullWidth
              />

              <TextField
                label="Téléphone"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                  )
                }
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>
                  Account Type
                </InputLabel>

                <Select
                  value={accountType}
                  label="Account Type"
                  onChange={(event) =>
                    setAccountType(
                      String(
                        event.target.value
                      )
                    )
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

              <FormControl fullWidth>
                <InputLabel>
                  Trading Experience
                </InputLabel>

                <Select
                  value={tradingExperience}
                  label="Trading Experience"
                  onChange={(event) =>
                    setTradingExperience(
                      String(
                        event.target.value
                      )
                    )
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

              <FormControl fullWidth>
                <InputLabel>
                  Status
                </InputLabel>

                <Select
                  value={status}
                  label="Status"
                  onChange={(event) =>
                    setStatus(
                      String(
                        event.target.value
                      ) as ClientStatus
                    )
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

              <TextField
                label="Account Number"
                value={
                  client.account_number ||
                  ""
                }
                disabled
                fullWidth
              />

              <TextField
                label="Initial Deposit"
                value={
                  client.initial_deposit ??
                  ""
                }
                disabled
                fullWidth
              />

              <TextField
                label="Balance"
                value={client.balance}
                disabled
                fullWidth
              />

              <TextField
                label="Assigned To"
                value={
                  client.assigned_to ??
                  ""
                }
                disabled
                fullWidth
              />
            </Box>

            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 3 }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
              >
                {saving
                  ? "Enregistrement..."
                  : "Enregistrer"}
              </Button>

              <Button
                variant="outlined"
                disabled={saving}
                onClick={() =>
                  navigate(
                    `/clients/${client.id}`
                  )
                }
              >
                Annuler
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditClient;