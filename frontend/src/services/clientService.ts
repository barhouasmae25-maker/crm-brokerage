
import api from "./api";

export type ClientStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "CLOSED";

export type InteractionType =
  | "CALL"
  | "EMAIL"
  | "MEETING"
  | "NOTE"
  | "TASK";

export type InteractionOutcome =
  | "POSITIVE"
  | "NEGATIVE"
  | "NEUTRAL"
  | "NO_ANSWER";

export interface Client {
  id: number;
  accountNumber: string;
  accountRequestId: number;
  prospectId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  balance: number;
  status: ClientStatus;

  // Les noms correspondent au DTO ClientResponse du backend
  assignedToId?: number | null;
  assignedToEmail?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ClientInteraction {
  id: number;
  type: InteractionType;
  notes?: string | null;
  outcome: InteractionOutcome;
  nextAction?: string | null;
  nextActionDate?: string | null;
  prospectId?: number | null;
  clientId?: number | null;
  createdById?: number | null;
  createdAt?: string | null;
}

export interface CreateInteractionRequest {
  type: InteractionType;
  notes: string;
  outcome: InteractionOutcome;
  nextAction?: string;
  nextActionDate?: string;
}

export async function getClients(
  filters: {
    status?: ClientStatus;
    assignedTo?: number;
  } = {}
): Promise<Client[]> {
  const params: {
    status?: ClientStatus;
    assignedTo?: number;
  } = {};

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.assignedTo != null) {
    params.assignedTo = filters.assignedTo;
  }

  const response = await api.get<Client[]>("/clients", { params });
  return response.data;
}

export async function getClientById(
  clientId: number
): Promise<Client> {
  const response = await api.get<Client>(`/clients/${clientId}`);
  return response.data;
}

export async function updateClientStatus(
  clientId: number,
  status: ClientStatus
): Promise<Client> {
  const response = await api.put<Client>(`/clients/${clientId}`, {
    status,
  });

  return response.data;
}

export async function getClientInteractions(
  clientId: number
): Promise<ClientInteraction[]> {
  const response = await api.get<ClientInteraction[]>(
    `/clients/${clientId}/interactions`
  );

  return response.data;
}

export async function createClientInteraction(
  clientId: number,
  data: CreateInteractionRequest
): Promise<ClientInteraction> {
  const response = await api.post<ClientInteraction>(
    `/clients/${clientId}/interactions`,
    data
  );

  return response.data;
}
