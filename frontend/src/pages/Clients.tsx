
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

import {
  createClientInteraction,
  getClientById,
  getClientInteractions,
  getClients,
  updateClientStatus,
} from "../services/clientService";

import type {
  Client,
  ClientInteraction,
  ClientStatus,
  CreateInteractionRequest,
  InteractionOutcome,
  InteractionType,
} from "../services/clientService";

const CLIENT_STATUSES: ClientStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "CLOSED",
];

const INTERACTION_TYPES: InteractionType[] = [
  "CALL",
  "EMAIL",
  "MEETING",
  "NOTE",
  "TASK",
];

const INTERACTION_OUTCOMES: InteractionOutcome[] = [
  "POSITIVE",
  "NEGATIVE",
  "NEUTRAL",
  "NO_ANSWER",
];

const emptyInteractionForm: CreateInteractionRequest = {
  type: "CALL",
  notes: "",
  outcome: "POSITIVE",
  nextAction: "",
  nextActionDate: "",
};

function formatLabel(value?: string | null): string {
  if (!value) return "—";

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString();
}

function formatMoney(value?: number | null): string {
  if (value == null || Number.isNaN(Number(value))) {
    return "0.00";
  }

  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getStatusColor(
  status: ClientStatus
): "success" | "warning" | "error" | "default" {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "SUSPENDED":
      return "warning";
    case "CLOSED":
      return "error";
    case "INACTIVE":
    default:
      return "default";
  }
}

function getFullName(client: Client): string {
  return [client.firstName, client.lastName]
    .filter(Boolean)
    .join(" ") || `Client #${client.id}`;
}

export default function Clients() {
  const role = (localStorage.getItem("role") || "")
    .replace(/^ROLE_/, "")
    .toUpperCase();

  const isManager = role === "MANAGER";

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<ClientStatus | "ALL">("ALL");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [statusToSave, setStatusToSave] =
    useState<ClientStatus>("ACTIVE");

  const [interactions, setInteractions] =
    useState<ClientInteraction[]>([]);
  const [interactionsLoading, setInteractionsLoading] = useState(false);
  const [interactionForm, setInteractionForm] =
    useState<CreateInteractionRequest>({ ...emptyInteractionForm });

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getClients(
        statusFilter === "ALL" ? {} : { status: statusFilter }
      );

      setClients(data);
    } catch (err) {
      console.error("Load clients error:", err);
      setError(
        "Impossible de charger les clients. Vérifiez le backend, le token et vos autorisations."
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return clients;

    return clients.filter((client) => {
      const searchable = [
        client.id,
        client.accountNumber,
        client.firstName,
        client.lastName,
        client.email,
        client.phone,
        client.assignedToEmail,
        client.status,
      ]
        .filter((value) => value != null)
        .join(" ")
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [clients, search]);

  const loadInteractions = async (clientId: number) => {
    setInteractionsLoading(true);

    try {
      const data = await getClientInteractions(clientId);
      setInteractions(data);
    } catch (err) {
      console.error("Load client interactions error:", err);
      setInteractions([]);
      setError("Impossible de charger les interactions de ce client.");
    } finally {
      setInteractionsLoading(false);
    }
  };

  const openDetails = async (clientId: number) => {
    setError("");
    setSuccess("");
    setSelectedClient(null);
    setInteractions([]);
    setInteractionForm({ ...emptyInteractionForm });
    setDetailsOpen(true);

    try {
      const client = await getClientById(clientId);

      setSelectedClient(client);
      setStatusToSave(client.status);

      await loadInteractions(clientId);
    } catch (err) {
      console.error("Client details error:", err);
      setSelectedClient(null);
      setError("Impossible de charger les détails du client.");
    }
  };

  const handleStatusChange = async () => {
    if (!selectedClient || !isManager) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = await updateClientStatus(
        selectedClient.id,
        statusToSave
      );

      setSelectedClient(updated);

      setClients((previous) =>
        previous.map((client) =>
          client.id === updated.id ? updated : client
        )
      );

      setSuccess("Le statut du client a été mis à jour.");

      if (statusFilter !== "ALL" && updated.status !== statusFilter) {
        setDetailsOpen(false);
        await loadClients();
      }
    } catch (err) {
      console.error("Update client status error:", err);
      setError(
        "Impossible de modifier le statut. Vérifiez les autorisations du backend."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateInteractionForm = <
    K extends keyof CreateInteractionRequest
  >(
    field: K,
    value: CreateInteractionRequest[K]
  ) => {
    setInteractionForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleCreateInteraction = async () => {
    if (!selectedClient) return;

    setError("");
    setSuccess("");

    if (!interactionForm.notes.trim()) {
      setError("Veuillez saisir les notes de l'interaction.");
      return;
    }

    setSaving(true);

    try {
      const payload: CreateInteractionRequest = {
        ...interactionForm,
        notes: interactionForm.notes.trim(),
        nextAction: interactionForm.nextAction?.trim() || "",
        nextActionDate: interactionForm.nextActionDate || "",
      };

      await createClientInteraction(selectedClient.id, payload);

      setInteractionForm({ ...emptyInteractionForm });

      await loadInteractions(selectedClient.id);

      setSuccess("Interaction ajoutée avec succès.");
    } catch (err) {
      console.error("Create client interaction error:", err);
      setError(
        "Impossible d'ajouter l'interaction. Vérifiez les valeurs du type et du résultat acceptées par le backend."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1500, mx: "auto" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Clients
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Gestion des clients et suivi des interactions.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          disabled={loading}
          onClick={() => void loadClients()}
        >
          Actualiser
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label="Rechercher un client"
            placeholder="Nom, email, numéro de compte, agent..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
          />

          <FormControl sx={{ minWidth: { xs: "100%", md: 240 } }}>
            <InputLabel id="client-status-filter-label">
              Statut
            </InputLabel>

            <Select
              labelId="client-status-filter-label"
              value={statusFilter}
              label="Statut"
              onChange={(event: SelectChangeEvent) =>
                setStatusFilter(event.target.value as ClientStatus | "ALL")
              }
            >
              <MenuItem value="ALL">Tous les statuts</MenuItem>

              {CLIENT_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {formatLabel(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>N° de compte</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Solde</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Aucun client trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id} hover>
                      <TableCell>{client.id}</TableCell>

                      <TableCell>
                        {client.accountNumber || "—"}
                      </TableCell>

                      <TableCell sx={{ fontWeight: 600 }}>
                        {getFullName(client)}
                      </TableCell>

                      <TableCell>{client.email || "—"}</TableCell>

                      <TableCell>
                        {formatMoney(client.balance)}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={formatLabel(client.status)}
                          color={getStatusColor(client.status)}
                        />
                      </TableCell>

                      <TableCell>
                        {client.assignedToEmail || "—"}
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => void openDetails(client.id)}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={detailsOpen}
        onClose={() => {
          if (!saving) setDetailsOpen(false);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Détails du client
          {selectedClient ? ` #${selectedClient.id}` : ""}
        </DialogTitle>

        <DialogContent>
          {!selectedClient ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Informations du compte
                </Typography>

                <Typography>
                  <strong>Client :</strong> {getFullName(selectedClient)}
                </Typography>

                <Typography>
                  <strong>Numéro de compte :</strong>{" "}
                  {selectedClient.accountNumber || "—"}
                </Typography>

                <Typography>
                  <strong>Email :</strong> {selectedClient.email || "—"}
                </Typography>

                <Typography>
                  <strong>Téléphone :</strong>{" "}
                  {selectedClient.phone || "—"}
                </Typography>

                <Typography>
                  <strong>Solde :</strong>{" "}
                  {formatMoney(selectedClient.balance)}
                </Typography>

                <Typography>
                  <strong>Agent :</strong>{" "}
                  {selectedClient.assignedToEmail || "—"}
                </Typography>

                <Typography>
                  <strong>Créé le :</strong>{" "}
                  {formatDate(selectedClient.createdAt)}
                </Typography>

                <Box sx={{ mt: 1 }}>
                  <Chip
                    size="small"
                    label={formatLabel(selectedClient.status)}
                    color={getStatusColor(selectedClient.status)}
                  />
                </Box>

                {isManager && (
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    sx={{ mt: 2, alignItems: { sm: "center" } }}
                  >
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel id="update-client-status-label">
                        Nouveau statut
                      </InputLabel>

                      <Select
                        labelId="update-client-status-label"
                        value={statusToSave}
                        label="Nouveau statut"
                        onChange={(event) =>
                          setStatusToSave(
                            event.target.value as ClientStatus
                          )
                        }
                      >
                        {CLIENT_STATUSES.map((status) => (
                          <MenuItem key={status} value={status}>
                            {formatLabel(status)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Button
                      variant="contained"
                      disabled={
                        saving || statusToSave === selectedClient.status
                      }
                      onClick={() => void handleStatusChange()}
                    >
                      Enregistrer le statut
                    </Button>
                  </Stack>
                )}
              </Paper>

              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Interactions
                </Typography>

                {interactionsLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      p: 2,
                    }}
                  >
                    <CircularProgress size={26} />
                  </Box>
                ) : interactions.length === 0 ? (
                  <Alert severity="info">
                    Aucune interaction pour ce client.
                  </Alert>
                ) : (
                  <Stack spacing={1}>
                    {interactions.map((interaction) => (
                      <Paper
                        key={interaction.id}
                        variant="outlined"
                        sx={{ p: 2 }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          sx={{
                            justifyContent: "space-between",
                            alignItems: { sm: "center" },
                          }}
                        >
                          <Typography sx={{ fontWeight: 600 }}>
                            {formatLabel(interaction.type)}
                          </Typography>

                          <Chip
                            size="small"
                            label={formatLabel(interaction.outcome)}
                            color={
                              interaction.outcome === "POSITIVE"
                                ? "success"
                                : interaction.outcome === "NEGATIVE"
                                  ? "error"
                                  : "default"
                            }
                          />
                        </Stack>

                        <Typography sx={{ mt: 1 }}>
                          {interaction.notes || "Sans notes"}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Prochaine action :{" "}
                          {interaction.nextAction || "—"}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Date de suivi :{" "}
                          {formatDate(interaction.nextActionDate)}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Créée le : {formatDate(interaction.createdAt)}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Ajouter une interaction
                </Typography>

                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel id="interaction-type-label">
                      Type
                    </InputLabel>

                    <Select
                      labelId="interaction-type-label"
                      value={interactionForm.type}
                      label="Type"
                      onChange={(event) =>
                        updateInteractionForm(
                          "type",
                          event.target.value as InteractionType
                        )
                      }
                    >
                      {INTERACTION_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {formatLabel(type)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel id="interaction-outcome-label">
                      Résultat
                    </InputLabel>

                    <Select
                      labelId="interaction-outcome-label"
                      value={interactionForm.outcome}
                      label="Résultat"
                      onChange={(event) =>
                        updateInteractionForm(
                          "outcome",
                          event.target.value as InteractionOutcome
                        )
                      }
                    >
                      {INTERACTION_OUTCOMES.map((outcome) => (
                        <MenuItem key={outcome} value={outcome}>
                          {formatLabel(outcome)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Notes"
                    value={interactionForm.notes}
                    onChange={(event) =>
                      updateInteractionForm("notes", event.target.value)
                    }
                    multiline
                    minRows={2}
                    required
                    fullWidth
                  />

                  <TextField
                    label="Prochaine action"
                    value={interactionForm.nextAction || ""}
                    onChange={(event) =>
                      updateInteractionForm("nextAction", event.target.value)
                    }
                    fullWidth
                  />

                  <TextField
                    label="Date de la prochaine action"
                    type="date"
                    value={interactionForm.nextActionDate || ""}
                    onChange={(event) =>
                      updateInteractionForm(
                        "nextActionDate",
                        event.target.value
                      )
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                  />

                  <Button
                    variant="contained"
                    disabled={saving}
                    onClick={() => void handleCreateInteraction()}
                  >
                    {saving
                      ? "Enregistrement..."
                      : "Ajouter l'interaction"}
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDetailsOpen(false)}
            disabled={saving}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
