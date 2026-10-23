
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
  Divider,
  FormControl,
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
} from "@mui/material";

import {
  createAccountRequest,
  getAccountRequests,
  getAccountRequestById,
  updateAccountRequestStatus,
  verifyAccountRequestDocument,
} from "../services/accountRequestService";

import type {
  AccountRequest,
  AccountRequestCreate,
  AccountRequestStatus,
  AccountType,
  TradingExperience,
  AccountDocumentType,
} from "../services/accountRequestService";

import { getProspects } from "../services/prospectService";
import type { Prospect } from "../types/prospect";

interface RequestNote {
  id: number;
  content: string;
  createdAt: string;
  accountRequestId: number;
  createdById?: number;
  createdByEmail?: string;
}

const STATUS_OPTIONS: AccountRequestStatus[] = [
  "PENDING_REVIEW",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
];

const ACCOUNT_TYPES: AccountType[] = [
  "INDIVIDUAL",
  "JOINT",
  "CORPORATE",
  "IRA",
];

const EXPERIENCES: TradingExperience[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "PROFESSIONAL",
];

const DOCUMENT_TYPES: AccountDocumentType[] = [
  "ID_CARD",
  "PASSPORT",
  "PROOF_OF_ADDRESS",
];

const initialForm: AccountRequestCreate = {
  prospectId: 0,
  accountType: "INDIVIDUAL",
  tradingExperience: "BEGINNER",
  initialDeposit: 1000,
  documents: [
    {
      documentType: "ID_CARD",
      fileName: "cin.pdf",
    },
    {
      documentType: "PROOF_OF_ADDRESS",
      fileName: "justificatif_domicile.pdf",
    },
  ],
};

function labelOf(value?: string): string {
  if (!value) return "—";

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("fr-FR");
}

function statusColor(
  status?: AccountRequestStatus,
): "default" | "warning" | "success" | "error" | "info" {
  switch (status) {
    case "PENDING_REVIEW":
      return "warning";
    case "UNDER_REVIEW":
      return "info";
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "error";
    default:
      return "default";
  }
}

function getProspectName(request: AccountRequest): string {
  const name = [
    request.prospectFirstName,
    request.prospectLastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    name ||
    request.prospectName ||
    request.prospectEmail ||
    `Prospect #${request.prospectId}`
  );
}

function isValidFileName(fileName: string): boolean {
  const name = fileName.trim();

  return (
    name.length > 0 &&
    name.length <= 255 &&
    !/[\\/]/.test(name) &&
    !name.includes("..")
  );
}

function getUserRole(): string {
  return (localStorage.getItem("role") || "")
    .replace(/^ROLE_/, "")
    .toUpperCase();
}

function getToken(): string {
  return localStorage.getItem("token") || "";
}

async function fetchNotes(
  requestId: number,
): Promise<RequestNote[]> {
  const token = getToken();

  const response = await fetch(
    `http://localhost:8080/api/account-requests/${requestId}/notes`,
    {
      method: "GET",
      headers: {
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Erreur HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<RequestNote[]>;
}

async function postNote(
  requestId: number,
  content: string,
): Promise<void> {
  const token = getToken();

  const response = await fetch(
    `http://localhost:8080/api/account-requests/${requestId}/notes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
      body: JSON.stringify({ content }),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Erreur HTTP ${response.status}`,
    );
  }
}

export default function AccountRequests() {
  const isManager = getUserRole() === "MANAGER";

  const [requests, setRequests] = useState<AccountRequest[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AccountRequestStatus | "ALL">("ALL");

  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<AccountRequest | null>(null);

  const [form, setForm] = useState<AccountRequest>({
    id: 0,
    prospectId: 0,
    accountType: "INDIVIDUAL",
    tradingExperience: "BEGINNER",
    initialDeposit: 1000,
    status: "PENDING_REVIEW",
    documents: [],
  });

  const [formData, setFormData] =
    useState<AccountRequestCreate>({
      ...initialForm,
      documents: initialForm.documents.map((doc) => ({ ...doc })),
    });

  const [reviewComment, setReviewComment] = useState("");
  const [nextStatus, setNextStatus] =
    useState<AccountRequestStatus>("UNDER_REVIEW");

  const [notes, setNotes] = useState<RequestNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [requestData, prospectData] = await Promise.all([
        getAccountRequests(),
        getProspects(),
      ]);

      setRequests(requestData);
      setProspects(prospectData);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Impossible de charger les demandes.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        request.status === statusFilter;

      const matchesSearch =
        !query ||
        String(request.id).includes(query) ||
        getProspectName(request).toLowerCase().includes(query) ||
        (request.prospectEmail || "").toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [requests, search, statusFilter]);

  function resetForm() {
    setFormData({
      ...initialForm,
      documents: initialForm.documents.map((doc) => ({ ...doc })),
    });
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setCreateOpen(true);
  }

  function updateDocumentName(
    documentType: AccountDocumentType,
    fileName: string,
  ) {
    setFormData((previous) => ({
      ...previous,
      documents: previous.documents.some(
        (doc) => doc.documentType === documentType,
      )
        ? previous.documents.map((doc) =>
            doc.documentType === documentType
              ? { ...doc, fileName }
              : doc,
          )
        : [
            ...previous.documents,
            { documentType, fileName },
          ],
    }));
  }

  async function handleCreate() {
    setError("");

    if (!formData.prospectId) {
      setError("Veuillez sélectionner un prospect.");
      return;
    }

    if (
      !Number.isFinite(formData.initialDeposit) ||
      formData.initialDeposit < 1000
    ) {
      setError("Le dépôt initial doit être au minimum de 1000.");
      return;
    }

    const identity = formData.documents.find(
      (doc) =>
        doc.documentType === "ID_CARD" ||
        doc.documentType === "PASSPORT",
    );

    const address = formData.documents.find(
      (doc) => doc.documentType === "PROOF_OF_ADDRESS",
    );

    if (
      !identity ||
      !address ||
      !isValidFileName(identity.fileName) ||
      !isValidFileName(address.fileName)
    ) {
      setError(
        "Veuillez saisir un nom valide pour la pièce d'identité et le justificatif de domicile.",
      );
      return;
    }

    setSaving(true);

    try {
      const payload: AccountRequestCreate = {
        prospectId: formData.prospectId,
        accountType: formData.accountType,
        tradingExperience: formData.tradingExperience,
        initialDeposit: formData.initialDeposit,
        documents: formData.documents.map((doc) => ({
          documentType: doc.documentType,
          fileName: doc.fileName.trim(),
        })),
      };

      await createAccountRequest(payload);

      setCreateOpen(false);
      setSuccess("Demande créée avec succès.");
      await loadData();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Erreur lors de la création de la demande.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function loadNotes(requestId: number) {
    setNotesLoading(true);

    try {
      const data = await fetchNotes(requestId);
      setNotes(data);
    } catch (e) {
      setNotes([]);
      setError(
        e instanceof Error
          ? `Chargement des notes impossible : ${e.message}`
          : "Chargement des notes impossible.",
      );
    } finally {
      setNotesLoading(false);
    }
  }

  async function openDetails(request: AccountRequest) {
    setError("");
    setNotes([]);
    setNoteContent("");
    setDetailsOpen(true);
    setSelectedRequest(request);
    setReviewComment(request.reviewComment || "");
    setNextStatus(request.status);

    try {
      const data = await getAccountRequestById(request.id);

      setSelectedRequest(data);
      setReviewComment(data.reviewComment || "");
      setNextStatus(data.status);

      if (isManager) {
        await loadNotes(request.id);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Impossible de charger les détails.",
      );
    }
  }

  async function refreshSelectedRequest() {
    if (!selectedRequest) return;

    const data = await getAccountRequestById(selectedRequest.id);

    setSelectedRequest(data);

    setRequests((previous) =>
      previous.map((request) =>
        request.id === data.id ? data : request,
      ),
    );
  }

  async function handleAddNote() {
    if (!selectedRequest || !noteContent.trim()) {
      setError("Veuillez saisir une note.");
      return;
    }

    if (noteContent.trim().length > 5000) {
      setError("La note ne doit pas dépasser 5000 caractères.");
      return;
    }

    setNoteSaving(true);
    setError("");

    try {
      await postNote(selectedRequest.id, noteContent.trim());

      setNoteContent("");
      await loadNotes(selectedRequest.id);
      setSuccess("Note ajoutée avec succès.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Impossible d'ajouter la note.",
      );
    } finally {
      setNoteSaving(false);
    }
  }

  async function handleVerifyDocument(documentId: number) {
    if (!selectedRequest) return;

    setActionLoading(true);
    setError("");

    try {
      await verifyAccountRequestDocument(
        selectedRequest.id,
        documentId,
      );

      await refreshSelectedRequest();
      setSuccess("Document vérifié avec succès.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Impossible de vérifier le document.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStatusChange() {
    if (!selectedRequest) return;

    const documents = selectedRequest.documents || [];

    const hasVerifiedIdentity = documents.some(
      (doc) =>
        (doc.documentType === "ID_CARD" ||
          doc.documentType === "PASSPORT") &&
        doc.verified,
    );

    const hasVerifiedAddress = documents.some(
      (doc) =>
        doc.documentType === "PROOF_OF_ADDRESS" &&
        doc.verified,
    );

    if (
      nextStatus === "APPROVED" &&
      (!hasVerifiedIdentity || !hasVerifiedAddress)
    ) {
      setError(
        "Impossible d'approuver la demande : vérifiez d'abord la pièce d'identité et le justificatif de domicile.",
      );
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      await updateAccountRequestStatus(selectedRequest.id, {
        status: nextStatus,
        reviewComment,
      });

      await refreshSelectedRequest();
      await loadData();
      setSuccess("Statut de la demande mis à jour.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Impossible de modifier le statut.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  const selectedDocuments = selectedRequest?.documents || [];

  const hasVerifiedIdentity = selectedDocuments.some(
    (doc) =>
      (doc.documentType === "ID_CARD" ||
        doc.documentType === "PASSPORT") &&
      doc.verified,
  );

  const hasVerifiedAddress = selectedDocuments.some(
    (doc) =>
      doc.documentType === "PROOF_OF_ADDRESS" &&
      doc.verified,
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <Box>
          <h2 style={{ margin: 0 }}>Demandes de comptes</h2>
          <p style={{ color: "#666", marginBottom: 0 }}>
            Gestion des demandes, documents et notes internes.
          </p>
        </Box>

        <Button variant="contained" onClick={openCreateDialog}>
          Nouvelle demande
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Rechercher"
            placeholder="ID, prospect ou email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ flex: 1, minWidth: 220 }}
          />

          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel id="request-status-filter">
              Statut
            </InputLabel>
            <Select
              labelId="request-status-filter"
              label="Statut"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as AccountRequestStatus | "ALL",
                )
              }
            >
              <MenuItem value="ALL">Tous les statuts</MenuItem>
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {labelOf(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={() => void loadData()}
          >
            Actualiser
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Prospect</TableCell>
              <TableCell>Type de compte</TableCell>
              <TableCell>Dépôt initial</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date de création</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucune demande trouvée.
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>
                    <Box>
                      <strong>{getProspectName(request)}</strong>
                      <Box
                        sx={{
                          color: "text.secondary",
                          fontSize: 12,
                        }}
                      >
                        {request.prospectEmail || "—"}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{labelOf(request.accountType)}</TableCell>
                  <TableCell>
                    {Number(request.initialDeposit).toLocaleString(
                      "fr-FR",
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={labelOf(request.status)}
                      color={statusColor(request.status)}
                    />
                  </TableCell>
                  <TableCell>{formatDate(request.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => void openDetails(request)}
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

      {/* Création de la demande */}
      <Dialog
        open={createOpen}
        onClose={() => !saving && setCreateOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Nouvelle demande de compte</DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pt: 1,
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="prospect-select-label">
                Prospect
              </InputLabel>
              <Select
                labelId="prospect-select-label"
                label="Prospect"
                value={formData.prospectId || ""}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    prospectId: Number(event.target.value),
                  }))
                }
              >
                {prospects.map((prospect) => (
                  <MenuItem key={prospect.id} value={prospect.id}>
                    {[
                      prospect.firstName,
                      prospect.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ") || prospect.email}
                    {prospect.email ? ` — ${prospect.email}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="account-type-label">
                Type de compte
              </InputLabel>
              <Select
                labelId="account-type-label"
                label="Type de compte"
                value={formData.accountType}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    accountType: event.target.value as AccountType,
                  }))
                }
              >
                {ACCOUNT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {labelOf(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="experience-label">
                Expérience en trading
              </InputLabel>
              <Select
                labelId="experience-label"
                label="Expérience en trading"
                value={formData.tradingExperience}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    tradingExperience:
                      event.target.value as TradingExperience,
                  }))
                }
              >
                {EXPERIENCES.map((experience) => (
                  <MenuItem key={experience} value={experience}>
                    {labelOf(experience)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Dépôt initial"
              type="number"
              value={formData.initialDeposit}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  initialDeposit: Number(event.target.value),
                }))
              }
              slotProps={{
                htmlInput: {
                  min: 1000,
                  step: 0.01,
                },
              }}
              helperText="Montant minimum : 1000"
              fullWidth
            />

            <Divider />
            <strong>Documents simulés</strong>

            <Alert severity="info">
              Aucun fichier réel n'est envoyé. Seul le nom du document
              est enregistré.
            </Alert>

            {DOCUMENT_TYPES.map((documentType) => {
              const document = formData.documents.find(
                (item) => item.documentType === documentType,
              );

              return (
                <TextField
                  key={documentType}
                  label={`${labelOf(documentType)} — nom du fichier`}
                  placeholder="exemple.pdf"
                  value={document?.fileName || ""}
                  onChange={(event) =>
                    updateDocumentName(
                      documentType,
                      event.target.value,
                    )
                  }
                  slotProps={{
                    htmlInput: {
                      maxLength: 255,
                    },
                  }}
                  fullWidth
                />
              );
            })}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setCreateOpen(false)}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleCreate()}
            disabled={saving}
          >
            {saving ? (
              <CircularProgress size={22} />
            ) : (
              "Créer la demande"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Détails de la demande */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Détails de la demande
          {selectedRequest ? ` #${selectedRequest.id}` : ""}
        </DialogTitle>

        <DialogContent dividers>
          {!selectedRequest ? (
            <CircularProgress />
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <strong>Prospect</strong>
                  <Box>{getProspectName(selectedRequest)}</Box>
                  <Box color="text.secondary">
                    {selectedRequest.prospectEmail || "—"}
                  </Box>
                </Box>

                <Box>
                  <strong>Statut actuel</strong>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={labelOf(selectedRequest.status)}
                      color={statusColor(selectedRequest.status)}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 2,
                }}
              >
                <Box>
                  <strong>Type de compte</strong>
                  <Box>{labelOf(selectedRequest.accountType)}</Box>
                </Box>
                <Box>
                  <strong>Expérience</strong>
                  <Box>
                    {labelOf(selectedRequest.tradingExperience)}
                  </Box>
                </Box>
                <Box>
                  <strong>Dépôt initial</strong>
                  <Box>
                    {Number(
                      selectedRequest.initialDeposit,
                    ).toLocaleString("fr-FR")}
                  </Box>
                </Box>
                <Box>
                  <strong>Date de création</strong>
                  <Box>{formatDate(selectedRequest.createdAt)}</Box>
                </Box>
                <Box>
                  <strong>Date de mise à jour</strong>
                  <Box>{formatDate(selectedRequest.updatedAt)}</Box>
                </Box>
                <Box>
                  <strong>Date de revue</strong>
                  <Box>{formatDate(selectedRequest.reviewedAt)}</Box>
                </Box>
              </Box>

              <Divider />
              <strong>Documents</strong>

              {selectedDocuments.length === 0 ? (
                <Alert severity="warning">
                  Aucun document enregistré pour cette demande.
                </Alert>
              ) : (
                selectedDocuments.map((document) => (
                  <Paper
                    key={document.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box>
                      <strong>
                        {labelOf(document.documentType)}
                      </strong>
                      <Box>{document.fileName || "Nom indisponible"}</Box>
                      <Chip
                        size="small"
                        label={
                          document.verified
                            ? "Vérifié"
                            : "Non vérifié"
                        }
                        color={
                          document.verified ? "success" : "warning"
                        }
                        sx={{ mt: 1 }}
                      />
                      {document.verifiedAt && (
                        <Box
                          sx={{
                            color: "text.secondary",
                            fontSize: 12,
                            mt: 0.5,
                          }}
                        >
                          Vérifié le {formatDate(document.verifiedAt)}
                        </Box>
                      )}
                    </Box>

                    {isManager && !document.verified && (
                      <Button
                        variant="outlined"
                        disabled={actionLoading}
                        onClick={() =>
                          void handleVerifyDocument(document.id)
                        }
                      >
                        Vérifier
                      </Button>
                    )}
                  </Paper>
                ))
              )}

              {isManager && (
                <>
                  <Divider />
                  <strong>Revue de la demande</strong>

                  <Alert
                    severity={
                      hasVerifiedIdentity && hasVerifiedAddress
                        ? "success"
                        : "warning"
                    }
                  >
                    Pièce d'identité :{" "}
                    {hasVerifiedIdentity ? "vérifiée" : "à vérifier"}
                    {" — "}
                    Justificatif de domicile :{" "}
                    {hasVerifiedAddress ? "vérifié" : "à vérifier"}.
                  </Alert>

                  <FormControl fullWidth>
                    <InputLabel id="next-status-label">
                      Nouveau statut
                    </InputLabel>
                    <Select
                      labelId="next-status-label"
                      label="Nouveau statut"
                      value={nextStatus}
                      onChange={(event) =>
                        setNextStatus(
                          event.target.value as AccountRequestStatus,
                        )
                      }
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <MenuItem key={status} value={status}>
                          {labelOf(status)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Commentaire de revue"
                    placeholder="Commentaire concernant la décision..."
                    value={reviewComment}
                    onChange={(event) =>
                      setReviewComment(event.target.value)
                    }
                    multiline
                    rows={3}
                    fullWidth
                  />

                  <Button
                    variant="contained"
                    onClick={() => void handleStatusChange()}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <CircularProgress size={22} />
                    ) : (
                      "Enregistrer le statut"
                    )}
                  </Button>

                  <Divider />
                  <strong>Notes internes</strong>

                  {notesLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : notes.length === 0 ? (
                    <Box color="text.secondary">
                      Aucune note pour le moment.
                    </Box>
                  ) : (
                    notes.map((note) => (
                      <Paper
                        key={note.id}
                        variant="outlined"
                        sx={{ p: 2 }}
                      >
                        <Box sx={{ whiteSpace: "pre-wrap" }}>
                          {note.content}
                        </Box>
                        <Box
                          sx={{
                            mt: 1,
                            color: "text.secondary",
                            fontSize: 12,
                          }}
                        >
                          {note.createdByEmail || "Manager"} —{" "}
                          {formatDate(note.createdAt)}
                        </Box>
                      </Paper>
                    ))
                  )}

                  <TextField
                    label="Ajouter une note interne"
                    placeholder="Saisir une note..."
                    value={noteContent}
                    onChange={(event) =>
                      setNoteContent(event.target.value)
                    }
                    multiline
                    rows={3}
                    slotProps={{
                      htmlInput: {
                        maxLength: 5000,
                      },
                    }}
                    helperText={`${noteContent.length}/5000 caractères`}
                    fullWidth
                  />

                  <Button
                    variant="outlined"
                    onClick={() => void handleAddNote()}
                    disabled={noteSaving || !noteContent.trim()}
                  >
                    {noteSaving ? (
                      <CircularProgress size={22} />
                    ) : (
                      "Ajouter la note"
                    )}
                  </Button>
                </>
              )}

              {!isManager && selectedRequest.reviewComment && (
                <Box>
                  <strong>Commentaire de revue</strong>
                  <Box>{selectedRequest.reviewComment}</Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={4000}
        onClose={() => setSuccess("")}
        message={success}
      />
    </Box>
  );
}
