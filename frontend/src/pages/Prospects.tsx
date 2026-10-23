
import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

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
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import type { SelectChangeEvent } from "@mui/material";

import {
  Add,
  Edit,
  Visibility,
  AssignmentInd,
  Refresh,
} from "@mui/icons-material";

import {
  assignProspect,
  createProspect,
  getAgents,
  getProspects,
  updateProspect,
} from "../services/prospectService";

import type { Agent } from "../services/prospectService";

import type {
  Prospect,
  ProspectRequest,
  ProspectSource,
  ProspectInterest,
  ProspectStatus,
} from "../types/prospect";

import ProspectInteractions from "../components/ProspectInteractions";

const sources: ProspectSource[] = [
  "WEBSITE",
  "REFERRAL",
  "COLD_CALL",
  "SOCIAL_MEDIA",
  "EVENT",
  "OTHER",
];

const interests: ProspectInterest[] = [
  "STOCKS_TRADING",
  "FOREX",
  "CRYPTO",
  "COMMODITIES",
  "OPTIONS",
  "MIXED",
];

const statuses: ProspectStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
];

const emptyForm: ProspectRequest = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  source: "WEBSITE",
  interest: "MIXED",
  estimatedCapital: undefined,
  notes: "",
  status: "NEW",
};

const formatLabel = (value?: string | null): string => {
  if (!value) return "—";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getUserRole = (): string => {
  const role = localStorage.getItem("role");

  return role
    ? role.replace(/^ROLE_/i, "").trim().toUpperCase()
    : "";
};

export default function Prospects() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const [selectedProspect, setSelectedProspect] =
    useState<Prospect | null>(null);

  const [editing, setEditing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("");

  const [form, setForm] = useState<ProspectRequest>({
    ...emptyForm,
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const isManager = getUserRole() === "MANAGER";

  const showMessage = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const loadProspects = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getProspects({
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
      });

      setProspects(data);
    } catch (error) {
      console.error("Erreur chargement prospects :", error);
      showMessage("Impossible de charger les prospects.", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sourceFilter]);

  const loadAgents = useCallback(async () => {
    if (!isManager) {
      setAgents([]);
      return;
    }

    try {
      const data = await getAgents();
      setAgents(data);
    } catch (error) {
      console.error("Erreur chargement agents :", error);
      showMessage("Impossible de charger les agents.", "error");
    }
  }, [isManager]);

  useEffect(() => {
    void loadProspects();
  }, [loadProspects]);

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  const handleTextChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    if (name === "estimatedCapital") {
      setForm((previous) => ({
        ...previous,
        estimatedCapital:
          value === "" ? undefined : Number(value),
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFormSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;

    if (name === "source") {
      setForm((previous) => ({
        ...previous,
        source: value as ProspectSource,
      }));
    }

    if (name === "interest") {
      setForm((previous) => ({
        ...previous,
        interest: value as ProspectInterest,
      }));
    }
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setForm((previous) => ({
      ...previous,
      status: event.target.value as ProspectStatus,
    }));
  };

  const handleOpenCreate = () => {
    setEditing(false);
    setSelectedProspect(null);
    setForm({ ...emptyForm, status: "NEW" });
    setFormOpen(true);
  };

  const handleOpenEdit = (prospect: Prospect) => {
    setEditing(true);
    setSelectedProspect(prospect);

    setForm({
      firstName: prospect.firstName ?? "",
      lastName: prospect.lastName ?? "",
      email: prospect.email ?? "",
      phone: prospect.phone ?? "",
      source: prospect.source,
      interest: prospect.interest,
      estimatedCapital: prospect.estimatedCapital ?? undefined,
      notes: prospect.notes ?? "",
      status: prospect.status,
    });

    setFormOpen(true);
  };

  const handleCloseForm = () => {
    if (saving) return;

    setFormOpen(false);
    setSelectedProspect(null);
    setEditing(false);
    setForm({ ...emptyForm });
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      showMessage(
        "Veuillez remplir les champs obligatoires.",
        "error"
      );
      return;
    }

    if (
      form.estimatedCapital !== undefined &&
      (!Number.isFinite(form.estimatedCapital) ||
        form.estimatedCapital < 0)
    ) {
      showMessage(
        "Le capital estimé doit être un nombre positif ou nul.",
        "error"
      );
      return;
    }

    setSaving(true);

    try {
      const payload: ProspectRequest = {
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        notes: form.notes?.trim() ?? "",
        status: editing ? form.status : "NEW",
      };

      if (editing && selectedProspect) {
        await updateProspect(selectedProspect.id, payload);
        showMessage("Prospect modifié avec succès.");
      } else {
        await createProspect(payload);
        showMessage("Prospect créé avec succès.");
      }

      setFormOpen(false);
      setSelectedProspect(null);
      setEditing(false);
      setForm({ ...emptyForm });

      await loadProspects();
    } catch (error) {
      console.error("Erreur enregistrement prospect :", error);

      showMessage(
        editing
          ? "Erreur lors de la modification du prospect."
          : "Erreur lors de la création du prospect.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDetails = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedProspect(null);
  };

  const handleOpenAssign = (prospect: Prospect) => {
    if (!isManager) return;

    setSelectedProspect(prospect);
    setSelectedAgent("");
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!isManager) {
      showMessage("Action réservée au manager.", "error");
      return;
    }

    if (!selectedProspect || !selectedAgent) {
      showMessage("Veuillez sélectionner un agent.", "error");
      return;
    }

    setAssigning(true);

    try {
      await assignProspect(
        selectedProspect.id,
        Number(selectedAgent)
      );

      showMessage("Prospect réassigné avec succès.");

      setAssignOpen(false);
      setSelectedProspect(null);
      setSelectedAgent("");

      await loadProspects();
    } catch (error) {
      console.error("Erreur assignation :", error);

      showMessage(
        "Erreur lors de la réassignation du prospect.",
        "error"
      );
    } finally {
      setAssigning(false);
    }
  };

  const handleResetFilters = () => {
    setStatusFilter("");
    setSourceFilter("");
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* En-tête */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Prospects
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Suivre les prospects et leurs interactions
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
        >
          Nouveau prospect
        </Button>
      </Box>

      {/* Filtres */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Filtres
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr auto auto",
            },
            gap: 2,
            alignItems: "center",
          }}
        >
          <FormControl fullWidth size="small">
            <InputLabel id="status-filter-label">
              Statut
            </InputLabel>

            <Select
              labelId="status-filter-label"
              label="Statut"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <MenuItem value="">Tous les statuts</MenuItem>

              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {formatLabel(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="source-filter-label">
              Source
            </InputLabel>

            <Select
              labelId="source-filter-label"
              label="Source"
              value={sourceFilter}
              onChange={(event) =>
                setSourceFilter(event.target.value)
              }
            >
              <MenuItem value="">Toutes les sources</MenuItem>

              {sources.map((source) => (
                <MenuItem key={source} value={source}>
                  {formatLabel(source)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleResetFilters}
          >
            Réinitialiser
          </Button>

          <Button
            variant="contained"
            onClick={() => void loadProspects()}
            disabled={loading}
          >
            Rechercher
          </Button>
        </Box>
      </Paper>

      {/* Tableau des prospects */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nom complet</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Téléphone</strong></TableCell>
              <TableCell><strong>Source</strong></TableCell>
              <TableCell><strong>Intérêt</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress sx={{ my: 3 }} />
                </TableCell>
              </TableRow>
            ) : prospects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    Aucun prospect trouvé.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              prospects.map((prospect) => (
                <TableRow key={prospect.id} hover>
                  <TableCell>
                    {prospect.firstName} {prospect.lastName}
                  </TableCell>

                  <TableCell>{prospect.email}</TableCell>
                  <TableCell>{prospect.phone}</TableCell>
                  <TableCell>{formatLabel(prospect.source)}</TableCell>
                  <TableCell>{formatLabel(prospect.interest)}</TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={formatLabel(prospect.status)}
                      color={
                        prospect.status === "WON"
                          ? "success"
                          : prospect.status === "LOST"
                            ? "error"
                            : "default"
                      }
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 0.5,
                      }}
                    >
                      <IconButton
                        color="primary"
                        title="Voir les détails et interactions"
                        onClick={() => handleOpenDetails(prospect)}
                      >
                        <Visibility />
                      </IconButton>

                      <IconButton
                        color="primary"
                        title="Modifier"
                        onClick={() => handleOpenEdit(prospect)}
                      >
                        <Edit />
                      </IconButton>

                      {isManager && (
                        <IconButton
                          color="secondary"
                          title="Réassigner"
                          onClick={() => handleOpenAssign(prospect)}
                        >
                          <AssignmentInd />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Création et modification */}
      <Dialog
        open={formOpen}
        onClose={handleCloseForm}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>
            {editing ? "Modifier le prospect" : "Nouveau prospect"}
          </DialogTitle>

          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                pt: 1,
              }}
            >
              <TextField
                name="firstName"
                label="Prénom"
                value={form.firstName}
                onChange={handleTextChange}
                required
                fullWidth
              />

              <TextField
                name="lastName"
                label="Nom"
                value={form.lastName}
                onChange={handleTextChange}
                required
                fullWidth
              />

              <TextField
                name="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={handleTextChange}
                required
                fullWidth
              />

              <TextField
                name="phone"
                label="Téléphone"
                value={form.phone}
                onChange={handleTextChange}
                required
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel id="form-source-label">
                  Source
                </InputLabel>

                <Select
                  name="source"
                  labelId="form-source-label"
                  label="Source"
                  value={form.source}
                  onChange={handleFormSelectChange}
                >
                  {sources.map((source) => (
                    <MenuItem key={source} value={source}>
                      {formatLabel(source)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="form-interest-label">
                  Intérêt
                </InputLabel>

                <Select
                  name="interest"
                  labelId="form-interest-label"
                  label="Intérêt"
                  value={form.interest}
                  onChange={handleFormSelectChange}
                >
                  {interests.map((interest) => (
                    <MenuItem key={interest} value={interest}>
                      {formatLabel(interest)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Le statut est modifiable uniquement en édition */}
              <FormControl fullWidth disabled={!editing}>
                <InputLabel id="form-status-label">
                  Statut
                </InputLabel>

                <Select
                  name="status"
                  labelId="form-status-label"
                  label="Statut"
                  value={form.status ?? "NEW"}
                  onChange={handleStatusChange}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {formatLabel(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                name="estimatedCapital"
                label="Capital estimé"
                type="number"
                value={form.estimatedCapital ?? ""}
                onChange={handleTextChange}
                slotProps={{ htmlInput: { min: 0 } }}
                fullWidth
              />

              <TextField
                name="notes"
                label="Notes"
                value={form.notes ?? ""}
                onChange={handleTextChange}
                multiline
                minRows={3}
                fullWidth
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseForm} disabled={saving}>
              Annuler
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={saving}
            >
              {saving
                ? "Enregistrement..."
                : editing
                  ? "Enregistrer"
                  : "Créer"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Détails du prospect + historique des interactions */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Détails du prospect</DialogTitle>

        <DialogContent dividers>
          {selectedProspect && (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Typography>
                  <strong>ID :</strong> {selectedProspect.id}
                </Typography>

                <Typography>
                  <strong>Nom :</strong> {selectedProspect.firstName}{" "}
                  {selectedProspect.lastName}
                </Typography>

                <Typography>
                  <strong>Email :</strong> {selectedProspect.email}
                </Typography>

                <Typography>
                  <strong>Téléphone :</strong> {selectedProspect.phone}
                </Typography>

                <Typography>
                  <strong>Source :</strong>{" "}
                  {formatLabel(selectedProspect.source)}
                </Typography>

                <Typography>
                  <strong>Intérêt :</strong>{" "}
                  {formatLabel(selectedProspect.interest)}
                </Typography>

                <Typography>
                  <strong>Capital estimé :</strong>{" "}
                  {selectedProspect.estimatedCapital ?? "—"}
                </Typography>

                <Typography>
                  <strong>Statut :</strong>{" "}
                  {formatLabel(selectedProspect.status)}
                </Typography>

                <Typography>
                  <strong>Notes :</strong>{" "}
                  {selectedProspect.notes || "Aucune note"}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <ProspectInteractions
                prospectId={selectedProspect.id}
              />
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDetails}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Réassignation réservée au manager */}
      {isManager && (
        <Dialog
          open={assignOpen}
          onClose={() => {
            if (!assigning) {
              setAssignOpen(false);
            }
          }}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Réassigner le prospect</DialogTitle>

          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Sélectionnez l'agent auquel assigner ce prospect.
            </Typography>

            <FormControl fullWidth>
              <InputLabel id="agent-select-label">
                Agent
              </InputLabel>

              <Select
                labelId="agent-select-label"
                label="Agent"
                value={selectedAgent}
                onChange={(event) =>
                  setSelectedAgent(event.target.value)
                }
              >
                {agents.map((agent) => (
                  <MenuItem
                    key={agent.id}
                    value={String(agent.id)}
                  >
                    {agent.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {agents.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Aucun agent disponible.
              </Alert>
            )}
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => setAssignOpen(false)}
              disabled={assigning}
            >
              Annuler
            </Button>

            <Button
              variant="contained"
              onClick={() => void handleAssign()}
              disabled={!selectedAgent || assigning}
            >
              {assigning ? "Assignation..." : "Réassigner"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar((previous) => ({
            ...previous,
            open: false,
          }))
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() =>
            setSnackbar((previous) => ({
              ...previous,
              open: false,
            }))
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
