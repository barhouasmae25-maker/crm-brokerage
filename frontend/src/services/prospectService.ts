
import axios from "axios";
import type { Prospect, ProspectRequest } from "../types/prospect";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

// Ajouter le JWT dans chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Type Agent
export interface Agent {
  id: number;
  email: string;
}

// Filtres de recherche
export interface ProspectFilters {
  status?: string;
  source?: string;
}

// GET : récupérer les prospects avec filtres
export const getProspects = async (
  filters: ProspectFilters = {}
): Promise<Prospect[]> => {
  const response = await api.get<Prospect[]>("/api/prospects", {
    params: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.source ? { source: filters.source } : {}),
    },
  });

  return response.data;
};

// GET : récupérer un prospect par son ID
export const getProspectById = async (
  id: number
): Promise<Prospect> => {
  const response = await api.get<Prospect>(`/api/prospects/${id}`);

  return response.data;
};

// POST : créer un prospect
export const createProspect = async (
  data: ProspectRequest
): Promise<Prospect> => {
  const response = await api.post<Prospect>("/api/prospects", data);

  return response.data;
};

// PUT : modifier un prospect
export const updateProspect = async (
  id: number,
  data: ProspectRequest
): Promise<Prospect> => {
  const response = await api.put<Prospect>(
    `/api/prospects/${id}`,
    data
  );

  return response.data;
};

// GET : récupérer les agents
export const getAgents = async (): Promise<Agent[]> => {
  const response = await api.get<Agent[]>("/api/users/agents");

  return response.data;
};

// PUT : réassigner un prospect à un agent
export const assignProspect = async (
  prospectId: number,
  agentId: number
): Promise<Prospect> => {
  const response = await api.put<Prospect>(
    `/api/prospects/${prospectId}/assign`,
    null,
    {
      params: { agentId },
    }
  );

  return response.data;
};
