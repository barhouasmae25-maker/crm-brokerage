import axios from "axios";

/* =========================================================
   ENUM TYPES
========================================================= */

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
  | "PENDING REVIEW"
  | "UNDER REVIEW"
  | "APPROVED"
  | "REJECTED";

/* =========================================================
   DOCUMENT
========================================================= */

export interface AccountRequestDocument {
  id: number;

  request_id: number;

  document_type:
    | "ID CARD"
    | "PASSPORT"
    | "PROOF OF ADDRESS"
    | string;

  /*
   * Backend / Database field
   *
   * Example:
   * /uploads/account-requests/file.pdf
   */
  file_path: string;

  verified: boolean;

  verified_at?: string | null;

  verified_by?: number | null;

  created_at?: string;
}

/* =========================================================
   ACCOUNT REQUEST
========================================================= */

export interface AccountRequest {
  id: number;

  prospect_id: number;

  account_type: AccountType;

  trading_experience: TradingExperience;

  initial_deposit: number | string;

  status: AccountRequestStatus;

  created_at: string;

  updated_at?: string;

  /* Prospect information */

  first_name?: string;

  last_name?: string;

  email?: string;

  phone?: string;

  assigned_to?: number | null;

  /* Documents */

  documents?: AccountRequestDocument[];
}

/* =========================================================
   CREATE DATA
========================================================= */

export interface CreateAccountRequestData {
  prospectId: number;

  accountType: AccountType;

  tradingExperience: TradingExperience;

  initialDeposit: number;

  /*
   * Passport OU ID Card
   * Un seul des deux est obligatoire
   */

  passport?: File | null;

  idCard?: File | null;

  /*
   * Required
   */

  proofOfAddress?: File | null;
}

/* =========================================================
   AXIOS
========================================================= */

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

/*
 * IMPORTANT:
 * We don't set Content-Type globally because
 * createAccountRequest uses FormData.
 */

/* =========================================================
   TOKEN
========================================================= */

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);

/* =========================================================
   ERROR HELPER
========================================================= */

const getErrorMessage = (
  error: unknown
): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An error occurred"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An error occurred";
};

/* =========================================================
   GET ALL ACCOUNT REQUESTS
   GET /api/account-requests
========================================================= */

export const getAccountRequests =
  async (): Promise<AccountRequest[]> => {
    try {
      const response =
        await api.get<AccountRequest[]>(
          "/account-requests"
        );

      return response.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error)
      );
    }
  };

/* =========================================================
   GET ONE ACCOUNT REQUEST
   GET /api/account-requests/:requestId
========================================================= */

export const getAccountRequest =
  async (
    requestId: number
  ): Promise<AccountRequest> => {
    try {
      if (
        !Number.isInteger(requestId) ||
        requestId <= 0
      ) {
        throw new Error(
          "Invalid account request ID"
        );
      }

      const response =
        await api.get<AccountRequest>(
          `/account-requests/${requestId}`
        );

      return response.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error)
      );
    }
  };

/* =========================================================
   CREATE ACCOUNT REQUEST
   POST /api/account-requests
========================================================= */

export const createAccountRequest =
  async (
    data: CreateAccountRequestData
  ): Promise<AccountRequest> => {
    try {
      /* -----------------------------------------------
         VALIDATE PROSPECT
      ----------------------------------------------- */

      if (
        !Number.isInteger(
          data.prospectId
        ) ||
        data.prospectId <= 0
      ) {
        throw new Error(
          "Invalid prospect ID"
        );
      }

      /* -----------------------------------------------
         VALIDATE ACCOUNT TYPE
      ----------------------------------------------- */

      if (!data.accountType) {
        throw new Error(
          "Account type is required"
        );
      }

      /* -----------------------------------------------
         VALIDATE TRADING EXPERIENCE
      ----------------------------------------------- */

      if (!data.tradingExperience) {
        throw new Error(
          "Trading experience is required"
        );
      }

      /* -----------------------------------------------
         VALIDATE DEPOSIT
      ----------------------------------------------- */

      if (
        !Number.isFinite(
          data.initialDeposit
        )
      ) {
        throw new Error(
          "Initial deposit must be a valid number"
        );
      }

      if (
        data.initialDeposit < 1000
      ) {
        throw new Error(
          "Initial deposit must be at least €1000"
        );
      }

      /* -----------------------------------------------
         VALIDATE IDENTITY DOCUMENT
      ----------------------------------------------- */

      if (
        !data.passport &&
        !data.idCard
      ) {
        throw new Error(
          "Passport or ID Card is required"
        );
      }

      /* -----------------------------------------------
         VALIDATE PROOF OF ADDRESS
      ----------------------------------------------- */

      if (
        !data.proofOfAddress
      ) {
        throw new Error(
          "Proof of Address is required"
        );
      }

      /* -----------------------------------------------
         FORM DATA
      ----------------------------------------------- */

      const formData =
        new FormData();

      formData.append(
        "prospectId",
        String(data.prospectId)
      );

      formData.append(
        "accountType",
        data.accountType
      );

      formData.append(
        "tradingExperience",
        data.tradingExperience
      );

      formData.append(
        "initialDeposit",
        String(data.initialDeposit)
      );

      /* -----------------------------------------------
         PASSPORT
      ----------------------------------------------- */

      if (data.passport) {
        formData.append(
          "passport",
          data.passport
        );
      }

      /* -----------------------------------------------
         ID CARD
      ----------------------------------------------- */

      if (data.idCard) {
        formData.append(
          "idCard",
          data.idCard
        );
      }

      /* -----------------------------------------------
         PROOF OF ADDRESS
      ----------------------------------------------- */

      if (
        data.proofOfAddress
      ) {
        formData.append(
          "proofOfAddress",
          data.proofOfAddress
        );
      }

      /* -----------------------------------------------
         DEBUG
      ----------------------------------------------- */

      console.log(
        "===== ACCOUNT REQUEST ====="
      );

      for (
        const [
          key,
          value
        ] of formData.entries()
      ) {
        if (
          value instanceof File
        ) {
          console.log(
            key,
            {
              name: value.name,
              type: value.type,
              size: value.size,
            }
          );
        } else {
          console.log(
            key,
            value
          );
        }
      }

      console.log(
        "==========================="
      );

      /* -----------------------------------------------
         SEND
      ----------------------------------------------- */

      const response =
        await api.post<AccountRequest>(
          "/account-requests",
          formData
        );

      return response.data;

    } catch (error) {
      console.error(
        "CREATE ACCOUNT REQUEST ERROR:",
        error
      );

      throw new Error(
        getErrorMessage(error)
      );
    }
  };

/* =========================================================
   UPDATE STATUS
   PUT /api/account-requests/:requestId/status
========================================================= */

export const updateAccountRequestStatus =
  async (
    requestId: number,
    status: AccountRequestStatus
  ): Promise<AccountRequest> => {
    try {
      if (
        !Number.isInteger(
          requestId
        ) ||
        requestId <= 0
      ) {
        throw new Error(
          "Invalid account request ID"
        );
      }

      const response =
        await api.put<AccountRequest>(
          `/account-requests/${requestId}/status`,
          {
            status,
          }
        );

      return response.data;

    } catch (error) {
      throw new Error(
        getErrorMessage(error)
      );
    }
  };

/* =========================================================
   VERIFY DOCUMENT
   PUT /api/account-requests/:requestId/documents/:docId/verify
========================================================= */

export const verifyAccountRequestDocument =
  async (
    requestId: number,
    documentId: number
  ): Promise<AccountRequestDocument> => {
    try {
      if (
        !Number.isInteger(
          requestId
        ) ||
        requestId <= 0
      ) {
        throw new Error(
          "Invalid account request ID"
        );
      }

      if (
        !Number.isInteger(
          documentId
        ) ||
        documentId <= 0
      ) {
        throw new Error(
          "Invalid document ID"
        );
      }

      const response =
        await api.put<AccountRequestDocument>(
          `/account-requests/${requestId}/documents/${documentId}/verify`
        );

      return response.data;

    } catch (error) {
      throw new Error(
        getErrorMessage(error)
      );
    }
  };