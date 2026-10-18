
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
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";

import {
  createAccountRequest,
  getAccountRequests,
  getAccountRequestById,
  updateAccountRequestStatus,
  verifyAccountRequestDocument,
  downloadAccountRequestDocument,
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

type RequestDetails = AccountRequest & {
  prospectName?: string;
  prospectFirstName?: string;
  prospectLastName?: string;
  prospectEmail?: string;
};

const STATUSES: AccountRequestStatus[] = [
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

const initialForm = {
  prospectId: "",
  accountType: "INDIVIDUAL" as AccountType,
  tradingExperience: "BEGINNER" as TradingExperience,
  initialDeposit: "1000",
  identityType: "ID_CARD" as AccountDocumentType,
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

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

function getStatusColor(
  status: AccountRequestStatus
): "default" | "warning" | "info" | "success" | "error" {
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

function getProspectName(request: RequestDetails): string {
  const name = [
    request.prospectFirstName,
    request.prospectLastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    name ||
    request.prospectName ||
    `Prospect #${request.prospectId}`
  );
}

function validateFile(file: File): string | null {
  const extension = file.name
    .slice(file.name.lastIndexOf("."))
    .toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return "Formats autorisés : PDF, JPG et PNG.";
  }

  if (file.size === 0) {
    return "Le fichier est vide.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Chaque document doit avoir une taille maximale de 5 MB.";
  }

  return null;
}

export default function AccountRequests() {
  const role = (localStorage.getItem("role") || "")
    .replace(/^ROLE_/, "")
    .toUpperCase();

  const isManager = role === "MANAGER";

  const [requests, setRequests] = useState<AccountRequest[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AccountRequestStatus | "ALL">("ALL");

  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<RequestDetails | null>(null);

  const [reviewComment, setReviewComment] = useState("");
  const [form, setForm] = useState(initialForm);

  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [requestData, prospectData] = await Promise.all([
        getAccountRequests(),
        getProspects({}),
      ]);

      setRequests(requestData);
      setProspects(prospectData);
    } catch (err) {
      console.error("Load account requests error:", err);
      setError(
        "Impossible de charger les demandes. Vérifiez le backend et vos autorisations."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();

    return requests.filter((request) => {
      const item = request as RequestDetails;

      const matchesStatus =
        statusFilter === "ALL" ||
        request.status === statusFilter;

      const searchableText = [
        request.id,
        request.prospectId,
        getProspectName(item),
        item.prospectEmail,
        request.accountType,
        request.status,
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchableText.includes(term);
    });
  }, [requests, search, statusFilter]);

  const updateForm = <K extends keyof typeof initialForm>(
    field: K,
    value: (typeof initialForm)[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetCreateForm = () => {
    setForm(initialForm);
    setIdentityFile(null);
    setAddressFile(null);
  };

  const handleCreate = async () => {
    setError("");
    setSuccess("");

    const prospectId = Number(form.prospectId);
    const initialDeposit = Number(form.initialDeposit);

    if (!form.prospectId || !Number.isInteger(prospectId)) {
      setError("Veuillez sélectionner un prospect.");
      return;
    }

    if (!Number.isFinite(initialDeposit) || initialDeposit < 1000) {
      setError("Le dépôt initial minimum est de 1000.");
      return;
    }

    if (!identityFile || !addressFile) {
      setError("Veuillez sélectionner les deux documents obligatoires.");
      return;
    }

    const identityError = validateFile(identityFile);
    if (identityError) {
      setError(`Document d'identité : ${identityError}`);
      return;
    }

    const addressError = validateFile(addressFile);
    if (addressError) {
      setError(`Justificatif de domicile : ${addressError}`);
      return;
    }

    const payload: AccountRequestCreate = {
      prospectId,
      accountType: form.accountType,
      tradingExperience: form.tradingExperience,
      initialDeposit,
      documents: [
        { documentType: form.identityType },
        { documentType: "PROOF_OF_ADDRESS" },
      ],
    };

    setSaving(true);

    try {
      await createAccountRequest(
        payload,
        identityFile,
        addressFile
      );

      setCreateOpen(false);
      resetCreateForm();
      setSuccess("La demande a été créée avec succès.");

      await loadData();
    } catch (err) {
      console.error("Create account request error:", err);
      setError(
        "Échec de création. Vérifiez les données, les fichiers et la configuration du backend."
      );
    } finally {
      setSaving(false);
    }
  };

  const openDetails = async (requestId: number) => {
    setError("");
    setSuccess("");

    try {
      const data = await getAccountRequestById(requestId);

      setSelectedRequest(data as RequestDetails);
      setReviewComment(data.reviewComment || "");
      setDetailsOpen(true);
    } catch (err) {
      console.error("Request details error:", err);
      setError("Impossible de charger les détails de la demande.");
    }
  };

  const refreshSelectedRequest = async (requestId: number) => {
    const updated = await getAccountRequestById(requestId);

    setSelectedRequest(updated as RequestDetails);

    setRequests((previous) =>
      previous.map((item) =>
        item.id === updated.id ? updated : item
      )
    );
  };

  const handleDownloadDocument = async (
    requestId: number,
    documentId: number,
    documentType: string
  ) => {
    setError("");

    try {
      const blob = await downloadAccountRequestDocument(
        requestId,
        documentId
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${documentType.toLowerCase()}-${documentId}`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Document download error:", err);
      setError(
        "Impossible de télécharger le document. Vérifiez que le backend dispose de l'endpoint sécurisé de téléchargement."
      );
    }
  };

  const handleVerifyDocument = async (documentId: number) => {
    if (!selectedRequest || !isManager) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await verifyAccountRequestDocument(
        selectedRequest.id,
        documentId
      );

      await refreshSelectedRequest(selectedRequest.id);
      setSuccess("Le document a été vérifié.");
    } catch (err) {
      console.error("Document verification error:", err);
      setError("Impossible de vérifier le document.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (
    status: AccountRequestStatus
  ) => {
    if (!selectedRequest || !isManager) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateAccountRequestStatus(selectedRequest.id, {
        status,
        reviewComment: reviewComment.trim(),
      });

      await refreshSelectedRequest(selectedRequest.id);
      await loadData();

      setSuccess(`Statut modifié : ${formatLabel(status)}.`);
    } catch (err) {
      console.error("Status update error:", err);
      setError(
        "Impossible de modifier le statut. Pour approuver, vérifiez que les documents obligatoires sont validés."
      );
    } finally {
      setSaving(false);
    }
  };

  const isFinalStatus =
    selectedRequest?.status === "APPROVED" ||
    selectedRequest?.status === "REJECTED";

  const identityVerified =
    selectedRequest?.documents?.some(
      (document) =>
        (document.documentType === "ID_CARD" ||
          document.documentType === "PASSPORT") &&
        document.verified
    ) ?? false;

  const addressVerified =
    selectedRequest?.documents?.some(
      (document) =>
        document.documentType === "PROOF_OF_ADDRESS" &&
        document.verified
    ) ?? false;

  const canApprove = identityVerified && addressVerified;

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
            Demandes de comptes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Création, suivi et validation des demandes d'ouverture de compte.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"
            disabled={loading}
            onClick={() => void loadData()}
          >
            Actualiser
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              setError("");
              setSuccess("");
              resetCreateForm();
              setCreateOpen(true);
            }}
          >
            Nouvelle demande
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
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
            label="Rechercher"
            placeholder="Nom, email ou ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
          />

          <FormControl sx={{ minWidth: { xs: "100%", md: 240 } }}>
            <InputLabel id="status-filter-label">Statut</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Statut"
              onChange={(event: SelectChangeEvent) =>
                setStatusFilter(
                  event.target.value as AccountRequestStatus | "ALL"
                )
              }
            >
              <MenuItem value="ALL">Tous les statuts</MenuItem>
              {STATUSES.map((status) => (
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              p: 5,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Prospect</TableCell>
                  <TableCell>Type de compte</TableCell>
                  <TableCell>Expérience</TableCell>
                  <TableCell>Dépôt initial</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date de création</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Aucune demande trouvée.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => {
                    const item = request as RequestDetails;

                    return (
                      <TableRow key={request.id} hover>
                        <TableCell>{request.id}</TableCell>

                        <TableCell>
                          <Typography sx={{ fontWeight: 600 }}>
                            {getProspectName(item)}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {item.prospectEmail || "—"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {formatLabel(request.accountType)}
                        </TableCell>

                        <TableCell>
                          {formatLabel(request.tradingExperience)}
                        </TableCell>

                        <TableCell>
                          {Number(
                            request.initialDeposit
                          ).toLocaleString()}
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={formatLabel(request.status)}
                            color={getStatusColor(request.status)}
                          />
                        </TableCell>

                        <TableCell>
                          {formatDate(request.createdAt)}
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => void openDetails(request.id)}
                          >
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Création de la demande */}
      <Dialog
        open={createOpen}
        onClose={() => {
          if (!saving) setCreateOpen(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Nouvelle demande de compte</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel id="prospect-select-label">
                Prospect
              </InputLabel>

              <Select
                labelId="prospect-select-label"
                value={form.prospectId}
                label="Prospect"
                onChange={(event) =>
                  updateForm("prospectId", event.target.value)
                }
              >
                {prospects.map((prospect) => (
                  <MenuItem
                    key={prospect.id}
                    value={String(prospect.id)}
                  >
                    {prospect.firstName} {prospect.lastName} —{" "}
                    {prospect.email}
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
                value={form.accountType}
                label="Type de compte"
                onChange={(event) =>
                  updateForm(
                    "accountType",
                    event.target.value as AccountType
                  )
                }
              >
                {ACCOUNT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {formatLabel(type)}
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
                value={form.tradingExperience}
                label="Expérience en trading"
                onChange={(event) =>
                  updateForm(
                    "tradingExperience",
                    event.target.value as TradingExperience
                  )
                }
              >
                {EXPERIENCES.map((experience) => (
                  <MenuItem key={experience} value={experience}>
                    {formatLabel(experience)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Dépôt initial (minimum 1000)"
              type="number"
              value={form.initialDeposit}
              onChange={(event) =>
                updateForm("initialDeposit", event.target.value)
              }
              slotProps={{
                htmlInput: { min: 1000, step: 0.01 },
              }}
              required
              fullWidth
            />

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Documents obligatoires
            </Typography>

            <FormControl fullWidth>
              <InputLabel id="identity-type-label">
                Document d'identité
              </InputLabel>

              <Select
                labelId="identity-type-label"
                value={form.identityType}
                label="Document d'identité"
                onChange={(event) =>
                  updateForm(
                    "identityType",
                    event.target.value as AccountDocumentType
                  )
                }
              >
                <MenuItem value="ID_CARD">Carte d'identité</MenuItem>
                <MenuItem value="PASSPORT">Passeport</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                fullWidth
                sx={{ minHeight: 48 }}
              >
                Choisir CIN ou passeport
                <input
                  hidden
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setIdentityFile(file);
                    event.target.value = "";
                  }}
                />
              </Button>

              <Typography
                variant="body2"
                color={identityFile ? "text.primary" : "text.secondary"}
                sx={{ mt: 1, overflowWrap: "anywhere" }}
              >
                {identityFile
                  ? `${identityFile.name} — ${(identityFile.size / 1024 / 1024).toFixed(2)} MB`
                  : "Aucun document d'identité sélectionné"}
              </Typography>
            </Box>

            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                fullWidth
                sx={{ minHeight: 48 }}
              >
                Choisir justificatif de domicile
                <input
                  hidden
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setAddressFile(file);
                    event.target.value = "";
                  }}
                />
              </Button>

              <Typography
                variant="body2"
                color={addressFile ? "text.primary" : "text.secondary"}
                sx={{ mt: 1, overflowWrap: "anywhere" }}
              >
                {addressFile
                  ? `${addressFile.name} — ${(addressFile.size / 1024 / 1024).toFixed(2)} MB`
                  : "Aucun justificatif sélectionné"}
              </Typography>
            </Box>

            <Alert severity="info">
              Formats acceptés : PDF, JPG et PNG. Taille maximale :
              5 MB par document. Sur téléphone, vous pouvez sélectionner
              un fichier depuis les fichiers ou photos disponibles.
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
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
            {saving ? "Création..." : "Créer la demande"}
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

        <DialogContent>
          {!selectedRequest ? (
            <CircularProgress />
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Informations générales
                </Typography>

                <Typography>
                  <strong>Prospect :</strong>{" "}
                  {getProspectName(selectedRequest)}
                </Typography>

                <Typography>
                  <strong>Email :</strong>{" "}
                  {selectedRequest.prospectEmail || "—"}
                </Typography>

                <Typography>
                  <strong>ID prospect :</strong>{" "}
                  {selectedRequest.prospectId}
                </Typography>

                <Typography>
                  <strong>Type de compte :</strong>{" "}
                  {formatLabel(selectedRequest.accountType)}
                </Typography>

                <Typography>
                  <strong>Expérience :</strong>{" "}
                  {formatLabel(selectedRequest.tradingExperience)}
                </Typography>

                <Typography>
                  <strong>Dépôt initial :</strong>{" "}
                  {Number(
                    selectedRequest.initialDeposit
                  ).toLocaleString()}
                </Typography>

                <Typography>
                  <strong>Date de création :</strong>{" "}
                  {formatDate(selectedRequest.createdAt)}
                </Typography>

                <Box sx={{ mt: 1 }}>
                  <Chip
                    size="small"
                    label={formatLabel(selectedRequest.status)}
                    color={getStatusColor(selectedRequest.status)}
                  />
                </Box>

                {selectedRequest.reviewComment && (
                  <Typography sx={{ mt: 1 }}>
                    <strong>Commentaire :</strong>{" "}
                    {selectedRequest.reviewComment}
                  </Typography>
                )}
              </Paper>

              <Typography variant="h6">Documents</Typography>

              {selectedRequest.documents?.length ? (
                selectedRequest.documents.map((document) => (
                  <Paper
                    key={document.id}
                    variant="outlined"
                    sx={{ p: 2 }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{
                        justifyContent: "space-between",
                        alignItems: { xs: "stretch", sm: "center" },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          {formatLabel(document.documentType)}
                        </Typography>

                        <Chip
                          size="small"
                          sx={{ mt: 1 }}
                          label={
                            document.verified ? "Vérifié" : "Non vérifié"
                          }
                          color={
                            document.verified ? "success" : "default"
                          }
                        />
                      </Box>

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() =>
                            void handleDownloadDocument(
                              selectedRequest.id,
                              document.id,
                              document.documentType
                            )
                          }
                        >
                          Télécharger
                        </Button>

                        {isManager &&
                          !document.verified &&
                          !isFinalStatus && (
                            <Button
                              variant="contained"
                              size="small"
                              disabled={saving}
                              onClick={() =>
                                void handleVerifyDocument(document.id)
                              }
                            >
                              Vérifier
                            </Button>
                          )}
                      </Stack>
                    </Stack>
                  </Paper>
                ))
              ) : (
                <Alert severity="warning">
                  Aucun document n'est associé à cette demande.
                </Alert>
              )}

              {isManager && !isFinalStatus && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Révision de la demande
                  </Typography>

                  <TextField
                    label="Commentaire de révision"
                    value={reviewComment}
                    onChange={(event) =>
                      setReviewComment(event.target.value)
                    }
                    multiline
                    minRows={2}
                    fullWidth
                    sx={{ mb: 2 }}
                  />

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                  >
                    <Button
                      variant="outlined"
                      disabled={saving}
                      onClick={() =>
                        void handleStatusChange("UNDER_REVIEW")
                      }
                    >
                      Mettre en révision
                    </Button>

                    <Button
                      variant="contained"
                      color="success"
                      disabled={saving || !canApprove}
                      onClick={() =>
                        void handleStatusChange("APPROVED")
                      }
                    >
                      Approuver
                    </Button>

                    <Button
                      variant="contained"
                      color="error"
                      disabled={saving}
                      onClick={() =>
                        void handleStatusChange("REJECTED")
                      }
                    >
                      Rejeter
                    </Button>
                  </Stack>

                  {!canApprove && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Pour approuver, le document d'identité et le
                      justificatif de domicile doivent être vérifiés.
                    </Alert>
                  )}
                </Paper>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailsOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
