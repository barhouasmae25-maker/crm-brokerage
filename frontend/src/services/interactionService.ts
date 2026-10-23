
import axios from "axios";

const API_URL = "http://localhost:8080/api";

export type InteractionType =
  | "CALL"
  | "EMAIL"
  | "MEETING"
  | "SMS"
  | "NOTE";

export type InteractionOutcome =
  | "POSITIVE"
  | "NEUTRAL"
  | "NEGATIVE"
  | "NO_ANSWER";

export interface InteractionRequest {
  type: InteractionType;
  notes: string;
  outcome: InteractionOutcome;
  nextAction: string | null;
  nextActionDate: string | null;
}

export interface Interaction {
  id: number;
  type: InteractionType;
  notes: string | null;
  outcome: InteractionOutcome;
  nextAction: string | null;
  nextActionDate: string | null;
  createdAt: string;
  prospectId: number | null;
  clientId: number | null;
  createdById: number;
}

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// POST /api/prospects/{prospectId}/interactions
export async function createProspectInteraction(
  prospectId: number,
  data: InteractionRequest
): Promise<Interaction> {
  const response = await api.post<Interaction>(
    `/prospects/${prospectId}/interactions`,
    data
  );

  return response.data;
}

// GET /api/prospects/{prospectId}/interactions
export async function getProspectInteractions(
  prospectId: number
): Promise<Interaction[]> {
  const response = await api.get<Interaction[]>(
    `/prospects/${prospectId}/interactions`
  );

  return response.data;
}
