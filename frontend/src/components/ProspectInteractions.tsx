
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";

import {
  createProspectInteraction,
  getProspectInteractions,
  type Interaction,
  type InteractionRequest,
  type InteractionType,
  type InteractionOutcome,
} from "../services/interactionService";

interface ProspectInteractionsProps {
  prospectId: number;
}

const interactionTypes: InteractionType[] = [
  "CALL",
  "EMAIL",
  "MEETING",
  "SMS",
  "NOTE",
];

const interactionOutcomes: InteractionOutcome[] = [
  "POSITIVE",
  "NEUTRAL",
  "NEGATIVE",
  "NO_ANSWER",
];

const initialForm: InteractionRequest = {
  type: "CALL",
  notes: "",
  outcome: "NEUTRAL",
  nextAction: null,
  nextActionDate: null,
};

function formatLabel(value: string): string {
  const labels: Record<string, string> = {
    CALL: "Appel",
    EMAIL: "E-mail",
    MEETING: "Réunion",
    SMS: "SMS",
    NOTE: "Note",
    POSITIVE: "Positif",
    NEUTRAL: "Neutre",
    NEGATIVE: "Négatif",
    NO_ANSWER: "Pas de réponse",
  };

  return labels[value] ?? value.replaceAll("_", " ");
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("fr-FR");
}

export default function ProspectInteractions({
  prospectId,
}: ProspectInteractionsProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [form, setForm] =
    useState<InteractionRequest>({ ...initialForm });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadInteractions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getProspectInteractions(prospectId);
      setInteractions(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Impossible de charger les interactions. Vérifiez le backend et vos autorisations."
        );
      } else {
        setError("Erreur lors du chargement des interactions.");
      }
    } finally {
      setLoading(false);
    }
  }, [prospectId]);

  useEffect(() => {
    void loadInteractions();
  }, [loadInteractions]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!form.notes?.trim()) {
      setError("Veuillez saisir les notes de l'interaction.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload: InteractionRequest = {
      type: form.type,
      notes: form.notes.trim(),
      outcome: form.outcome,
      nextAction: form.nextAction?.trim() || null,
      nextActionDate: form.nextActionDate || null,
    };

    try {
      await createProspectInteraction(prospectId, payload);

      setForm({ ...initialForm });
      setSuccess("Interaction ajoutée avec succès.");

      await loadInteractions();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            `Échec de création de l'interaction (HTTP ${err.response?.status ?? "inconnu"}).`
        );
      } else {
        setError("Erreur lors de la création de l'interaction.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 3, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mb: 2,
          "@media (min-width:600px)": {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Historique des interactions
        </Typography>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => void loadInteractions()}
          disabled={loading}
        >
          Actualiser
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 2 }}
          >
            Ajouter une interaction
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                select
                fullWidth
                label="Type d'interaction"
                value={form.type}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    type: event.target.value as InteractionType,
                  }))
                }
                required
              >
                {interactionTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {formatLabel(type)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Résultat"
                value={form.outcome}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    outcome: event.target.value as InteractionOutcome,
                  }))
                }
                required
              >
                {interactionOutcomes.map((outcome) => (
                  <MenuItem key={outcome} value={outcome}>
                    {formatLabel(outcome)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Notes"
                placeholder="Décrivez l'échange avec le prospect..."
                value={form.notes ?? ""}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    notes: event.target.value,
                  }))
                }
                required
              />

              <TextField
                fullWidth
                label="Prochaine action (optionnel)"
                placeholder="Ex. Envoyer une proposition"
                value={form.nextAction ?? ""}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    nextAction: event.target.value,
                  }))
                }
              />

              <TextField
                fullWidth
                type="date"
                label="Date de la prochaine action (optionnel)"
                value={form.nextActionDate ?? ""}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    nextActionDate: event.target.value || null,
                  }))
                }
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />

              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={submitting}
                >
                  {submitting
                    ? "Enregistrement..."
                    : "Ajouter l'interaction"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Typography
        variant="h6"
        sx={{ fontWeight: 600, mb: 2 }}
      >
        Interactions enregistrées ({interactions.length})
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 4,
          }}
        >
          <CircularProgress />
        </Box>
      ) : interactions.length === 0 ? (
        <Alert severity="info">
          Aucune interaction enregistrée pour ce prospect.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {interactions.map((interaction) => (
            <Card key={interaction.id} variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    "@media (min-width:600px)": {
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700 }}
                  >
                    {formatLabel(interaction.type)}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {formatDate(interaction.createdAt)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Résultat
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600 }}
                >
                  {formatLabel(interaction.outcome)}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2, mb: 0.5 }}
                >
                  Notes
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                  }}
                >
                  {interaction.notes || "Aucune note"}
                </Typography>

                {interaction.nextAction && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Prochaine action
                    </Typography>

                    <Typography variant="body2">
                      {interaction.nextAction}
                    </Typography>

                    {interaction.nextActionDate && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Date : {interaction.nextActionDate}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
