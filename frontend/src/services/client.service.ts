import api from "./api";

export type ClientStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "CLOSED";

export interface Client {
  id: number;
  prospect_id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  account_number: string | null;
  account_type: string | null;
  trading_experience: string | null;
  initial_deposit: number | string | null;
  balance: number | string;
  status: ClientStatus;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
  account_request_id?: number | null;
  prospect_status?: string | null;
  prospect_source?: string | null;
  prospect_interest?: string | null;
}

export interface UpdateClientData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: ClientStatus;
  accountType?: string;
  tradingExperience?: string;
}

export const getClients = async (
  status?: ClientStatus,
  assignedTo?: number
): Promise<Client[]> => {
  const params: Record<string, string | number> = {};

  if (status) {
    params.status = status;
  }

  if (assignedTo !== undefined) {
    params.assignedTo = assignedTo;
  }

  const response = await api.get<Client[]>(
    "/clients",
    { params }
  );

  return response.data;
};

export const getClientById = async (
  clientId: number
): Promise<Client> => {
  const response = await api.get<Client>(
    `/clients/${clientId}`
  );

  return response.data;
};

export const updateClient = async (
  clientId: number,
  data: UpdateClientData
): Promise<Client> => {
  const response = await api.put<Client>(
    `/clients/${clientId}`,
    data
  );

  return response.data;
};

export const createClient = async (
  prospectId: number,
  accountRequestId: number
): Promise<Client> => {
  const response = await api.post<Client>(
    "/clients",
    {
      prospectId,
      accountRequestId,
    }
  );

  return response.data;
};