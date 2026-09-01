import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Alert,
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

import {
  createAccountRequest,
  type AccountType,
  type TradingExperience,
  type CreateAccountRequestData,
} from "../../services/accountRequest.service";

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

/* =========================================================
   COMPONENT
========================================================= */

const AddAccountRequest = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  /* =======================================================
     PROSPECT ID
  ======================================================= */

  const prospectIdParam =
    searchParams.get("prospectId");

  const parsedProspectId =
    prospectIdParam
      ? Number(prospectIdParam)
      : NaN;

  const prospectId =
    Number.isInteger(parsedProspectId) &&
    parsedProspectId > 0
      ? parsedProspectId
      : null;

  /* =======================================================
     FORM
  ======================================================= */

  const [accountType, setAccountType] =
    useState<AccountType | "">("");

  const [
    tradingExperience,
    setTradingExperience,
  ] = useState<TradingExperience | "">("");

  const [initialDeposit, setInitialDeposit] =
    useState<string>("");

  /* =======================================================
     DOCUMENTS
  ======================================================= */

  const [passport, setPassport] =
    useState<File | null>(null);

  const [idCard, setIdCard] =
    useState<File | null>(null);

  const [
    proofOfAddress,
    setProofOfAddress,
  ] = useState<File | null>(null);

  /* =======================================================
     UI
  ======================================================= */

  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  const [success, setSuccess] =
    useState<string>("");

  /* =======================================================
     FILE VALIDATION
  ======================================================= */

  const validateFile = (
    file: File
  ): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return (
        "Only PDF, JPG, JPEG and PNG files are allowed."
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return (
        "File size must not exceed 5 MB."
      );
    }

    return null;
  };

  /* =======================================================
     PASSPORT
  ======================================================= */

  const handlePassportChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setError("");

    const file =
      event.target.files?.[0] ?? null;

    if (!file) {
      setPassport(null);
      return;
    }

    const validationError =
      validateFile(file);

    if (validationError) {
      setPassport(null);
      setError(validationError);
      event.target.value = "";
      return;
    }

    setPassport(file);

    /*
     * Passport OU ID Card
     * Un seul des deux.
     */

    setIdCard(null);
  };

  /* =======================================================
     ID CARD
  ======================================================= */

  const handleIdCardChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setError("");

    const file =
      event.target.files?.[0] ?? null;

    if (!file) {
      setIdCard(null);
      return;
    }

    const validationError =
      validateFile(file);

    if (validationError) {
      setIdCard(null);
      setError(validationError);
      event.target.value = "";
      return;
    }

    setIdCard(file);

    /*
     * ID Card OU Passport
     */

    setPassport(null);
  };

  /* =======================================================
     PROOF OF ADDRESS
  ======================================================= */

  const handleProofOfAddressChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setError("");

    const file =
      event.target.files?.[0] ?? null;

    if (!file) {
      setProofOfAddress(null);
      return;
    }

    const validationError =
      validateFile(file);

    if (validationError) {
      setProofOfAddress(null);
      setError(validationError);
      event.target.value = "";
      return;
    }

    setProofOfAddress(file);
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    /* =====================================================
       PROSPECT
    ===================================================== */

    if (!prospectId) {
      setError(
        "Prospect ID introuvable ou invalide."
      );

      return;
    }

    /* =====================================================
       ACCOUNT TYPE
    ===================================================== */

    if (!accountType) {
      setError(
        "Veuillez sélectionner le type de compte."
      );

      return;
    }

    /* =====================================================
       TRADING EXPERIENCE
    ===================================================== */

    if (!tradingExperience) {
      setError(
        "Veuillez sélectionner l'expérience de trading."
      );

      return;
    }

    /* =====================================================
       INITIAL DEPOSIT
    ===================================================== */

    if (!initialDeposit.trim()) {
      setError(
        "Veuillez saisir le dépôt initial."
      );

      return;
    }

    const deposit =
      Number(initialDeposit);

    if (!Number.isFinite(deposit)) {
      setError(
        "Le dépôt initial doit être un nombre valide."
      );

      return;
    }

    if (deposit < 1000) {
      setError(
        "Le dépôt initial doit être au minimum de 1000 €."
      );

      return;
    }

    /* =====================================================
       IDENTITY DOCUMENT
    ===================================================== */

    if (!passport && !idCard) {
      setError(
        "Passport or ID Card is required."
      );

      return;
    }

    /* =====================================================
       PROOF OF ADDRESS
    ===================================================== */

    if (!proofOfAddress) {
      setError(
        "Proof of Address is required."
      );

      return;
    }

    /* =====================================================
       DATA
    ===================================================== */

    const data: CreateAccountRequestData = {
      prospectId,

      accountType,

      tradingExperience,

      initialDeposit: deposit,

      passport,

      idCard,

      proofOfAddress,
    };

    /* =====================================================
       SEND REQUEST
    ===================================================== */

    try {
      setLoading(true);

      await createAccountRequest(data);

      setSuccess(
        "La demande de compte a été créée avec succès."
      );

      /*
       * Redirect after success
       */

      setTimeout(() => {
        navigate("/account-requests");
      }, 1000);

    } catch (err) {
      console.error(
        "CREATE ACCOUNT REQUEST ERROR:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Une erreur est survenue lors de la création de la demande."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     CANCEL
  ======================================================= */

  const handleCancel = () => {
    if (loading) {
      return;
    }

    navigate("/account-requests");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 900,
        mx: "auto",
        p: 3,
      }}
    >
      <Card elevation={3}>
        <CardContent
          sx={{
            p: 4,
          }}
        >
          {/* =================================================
              TITLE
          ================================================= */}

          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 700,
            }}
          >
            Create Account Request
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
            }}
          >
            Créer une nouvelle demande
            d'ouverture de compte.
          </Typography>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
              }}
            >
              {error}
            </Alert>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 2,
              }}
            >
              {success}
            </Alert>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit}>

            {/* =================================================
                PROSPECT
            ================================================= */}

            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
              }}
            >
              Prospect
            </Typography>

            <TextField
              fullWidth
              label="Prospect ID"
              value={prospectId ?? ""}
              disabled
              helperText={
                prospectId
                  ? "Prospect sélectionné automatiquement depuis l'URL."
                  : "Aucun prospect sélectionné."
              }
              sx={{
                mb: 3,
              }}
            />

            <Divider
              sx={{
                mb: 3,
              }}
            />

            {/* =================================================
                ACCOUNT INFORMATION
            ================================================= */}

            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
              }}
            >
              Account Information
            </Typography>

            {/* =================================================
                ACCOUNT TYPE
            ================================================= */}

            <FormControl
              fullWidth
              sx={{
                mb: 2,
              }}
            >
              <InputLabel id="account-type-label">
                Account Type
              </InputLabel>

              <Select
                labelId="account-type-label"
                value={accountType}
                label="Account Type"
                onChange={(event) => {
                  setAccountType(
                    event.target.value as AccountType
                  );
                }}
              >
                <MenuItem value="INDIVIDUAL">
                  Individual
                </MenuItem>

                <MenuItem value="JOINT">
                  Joint
                </MenuItem>

                <MenuItem value="CORPORATE">
                  Corporate
                </MenuItem>

                <MenuItem value="IRA">
                  IRA
                </MenuItem>
              </Select>
            </FormControl>

            {/* =================================================
                TRADING EXPERIENCE
            ================================================= */}

            <FormControl
              fullWidth
              sx={{
                mb: 2,
              }}
            >
              <InputLabel id="trading-experience-label">
                Trading Experience
              </InputLabel>

              <Select
                labelId="trading-experience-label"
                value={tradingExperience}
                label="Trading Experience"
                onChange={(event) => {
                  setTradingExperience(
                    event.target
                      .value as TradingExperience
                  );
                }}
              >
                <MenuItem value="BEGINNER">
                  Beginner
                </MenuItem>

                <MenuItem value="INTERMEDIATE">
                  Intermediate
                </MenuItem>

                <MenuItem value="ADVANCED">
                  Advanced
                </MenuItem>

                <MenuItem value="PROFESSIONAL">
                  Professional
                </MenuItem>
              </Select>
            </FormControl>

            {/* =================================================
                INITIAL DEPOSIT
            ================================================= */}

            <TextField
              fullWidth
              type="number"
              label="Initial Deposit (€)"
              value={initialDeposit}
              onChange={(event) => {
                setInitialDeposit(
                  event.target.value
                );
              }}
              slotProps={{
                htmlInput: {
                  min: 1000,
                  step: "0.01",
                },
              }}
              helperText="Minimum 1000 €"
              sx={{
                mb: 3,
              }}
            />

            <Divider
              sx={{
                mb: 3,
              }}
            />

            {/* =================================================
                DOCUMENTS
            ================================================= */}

            <Typography
              variant="h6"
              sx={{
                mb: 1,
                fontWeight: 600,
              }}
            >
              Required Documents
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
              }}
            >
              Vous devez fournir un Passport
              ou une ID Card ainsi qu'un
              Proof of Address.
            </Typography>

            {/* =================================================
                PASSPORT
            ================================================= */}

            <Typography
              variant="subtitle1"
              sx={{
                mb: 1,
                fontWeight: 600,
              }}
            >
              Passport
            </Typography>

            <Button
              component="label"
              variant="outlined"
              fullWidth
              disabled={loading}
              sx={{
                mb: 1,
              }}
            >
              {passport
                ? passport.name
                : "Choose Passport"}

              <input
                hidden
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={
                  handlePassportChange
                }
              />
            </Button>

            {passport && (
              <Typography
                variant="body2"
                color="success.main"
                sx={{
                  mb: 2,
                }}
              >
                ✓ {passport.name}
              </Typography>
            )}

            {/* =================================================
                ID CARD
            ================================================= */}

            <Typography
              variant="subtitle1"
              sx={{
                mb: 1,
                fontWeight: 600,
              }}
            >
              ID Card
            </Typography>

            <Button
              component="label"
              variant="outlined"
              fullWidth
              disabled={loading}
              sx={{
                mb: 1,
              }}
            >
              {idCard
                ? idCard.name
                : "Choose ID Card"}

              <input
                hidden
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={
                  handleIdCardChange
                }
              />
            </Button>

            {idCard && (
              <Typography
                variant="body2"
                color="success.main"
                sx={{
                  mb: 1,
                }}
              >
                ✓ {idCard.name}
              </Typography>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mb: 3,
              }}
            >
              Passport OU ID Card :
              un seul des deux est nécessaire.
            </Typography>

            {/* =================================================
                PROOF OF ADDRESS
            ================================================= */}

            <Typography
              variant="subtitle1"
              sx={{
                mb: 1,
                fontWeight: 600,
              }}
            >
              Proof of Address *
            </Typography>

            <Button
              component="label"
              variant="outlined"
              fullWidth
              disabled={loading}
              sx={{
                mb: 1,
              }}
            >
              {proofOfAddress
                ? proofOfAddress.name
                : "Choose Proof of Address"}

              <input
                hidden
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={
                  handleProofOfAddressChange
                }
              />
            </Button>

            {proofOfAddress && (
              <Typography
                variant="body2"
                color="success.main"
                sx={{
                  mb: 3,
                }}
              >
                ✓ {proofOfAddress.name}
              </Typography>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mb: 3,
              }}
            >
              Formats acceptés : PDF, JPG,
              JPEG, PNG. Taille maximale :
              5 MB par fichier.
            </Typography>

            <Divider
              sx={{
                mb: 3,
              }}
            />

            {/* =================================================
                BUTTONS
            ================================================= */}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button
                type="button"
                variant="outlined"
                disabled={loading}
                onClick={handleCancel}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={
                  loading ||
                  !prospectId
                }
              >
                {loading ? (
                  <>
                    <CircularProgress
                      size={20}
                      sx={{
                        mr: 1,
                      }}
                    />

                    Creating...
                  </>
                ) : (
                  "Create Account Request"
                )}
              </Button>
            </Box>

          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddAccountRequest;