
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ==================== TYPES ====================

export type AccountType =
  | "INDIVIDUAL"
  | "JOINT"
  | "CORPORATE"
  | "IRA";

export type TradingExperience =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "PROFESSIONAL";

export type AccountRequestStatus =
  | "PENDING_REVIEW"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type AccountDocumentType =
  | "ID_CARD"
  | "PASSPORT"
  | "PROOF_OF_ADDRESS";

export interface AccountRequestDocumentInput {
  documentType: AccountDocumentType;
}

export interface AccountRequestCreate {
  prospectId: number;
  accountType: AccountType;
  tradingExperience: TradingExperience;
  initialDeposit: number;
  documents: AccountRequestDocumentInput[];
}

export interface AccountRequestDocument {
  id: number;
  documentType: AccountDocumentType;
  documentUrl: string;
  verified: boolean;
  verifiedAt?: string | null;
}

export interface AccountRequest {
  id: number;
  prospectId: number;
  prospectName?: string;
  prospectFirstName?: string;
  prospectLastName?: string;
  prospectEmail?: string;
  accountType: AccountType;
  tradingExperience: TradingExperience;
  initialDeposit: number;
  status: AccountRequestStatus;
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string | null;
  reviewComment?: string | null;
  documents: AccountRequestDocument[];
}

export interface AccountRequestStatusUpdate {
  status: AccountRequestStatus;
  reviewComment?: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Récupérer toutes les demandes de comptes.
 */
export async function getAccountRequests(): Promise<AccountRequest[]> {
  const response = await api.get<AccountRequest[]>(
    "/api/account-requests"
  );

  return response.data;
}

/**
 * Récupérer une demande par son ID.
 */
export async function getAccountRequestById(
  requestId: number
): Promise<AccountRequest> {
  const response = await api.get<AccountRequest>(
    `/api/account-requests/${requestId}`
  );

  return response.data;
}

/**
 * Créer une demande avec les documents d'identité et de domicile.
 */
export async function createAccountRequest(
  data: AccountRequestCreate,
  identityFile: File,
  addressFile: File
): Promise<AccountRequest> {
  const formData = new FormData();

  formData.append(
    "request",
    new Blob([JSON.stringify(data)], {
      type: "application/json",
    })
  );

  formData.append("identityDocument", identityFile);
  formData.append("addressDocument", addressFile);

  const response = await api.post<AccountRequest>(
    "/api/account-requests",
    formData
  );

  return response.data;
}

/**
 * Modifier le statut d'une demande.
 * Réservé au MANAGER selon les règles du backend.
 */
export async function updateAccountRequestStatus(
  requestId: number,
  data: AccountRequestStatusUpdate
): Promise<AccountRequest> {
  const response = await api.put<AccountRequest>(
    `/api/account-requests/${requestId}/status`,
    data
  );

  return response.data;
}

/**
 * Vérifier un document.
 * Réservé au MANAGER selon les règles du backend.
 */
export async function verifyAccountRequestDocument(
  requestId: number,
  documentId: number
): Promise<AccountRequest> {
  const response = await api.put<AccountRequest>(
    `/api/account-requests/${requestId}/documents/${documentId}/verify`
  );

  return response.data;
}

/**
 * Télécharger un document de manière sécurisée.
 * Le backend doit exposer :
 * GET /api/account-requests/{requestId}/documents/{documentId}/download
 */
export async function downloadAccountRequestDocument(
  requestId: number,
  documentId: number
): Promise<Blob> {
  const response = await api.get<Blob>(
    `/api/account-requests/${requestId}/documents/${documentId}/download`,
    {
      responseType: "blob",
    }
  );

  return response.data;
}
