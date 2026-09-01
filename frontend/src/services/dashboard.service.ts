import api from "./api";

/* =========================================================
   TYPES
========================================================= */

export interface DashboardStatus {
  status: string;
  count: number;
}

export interface DashboardProspects {
  byStatus: DashboardStatus[];
  total: number;
  won: number;
}

export interface DashboardClients {
  total: number;
  active: number;
  inactive: number;
}

export interface DashboardAccountRequests {
  byStatus: DashboardStatus[];
}

export interface DashboardData {
  prospects: DashboardProspects;
  clients: DashboardClients;
  accountRequests: DashboardAccountRequests;
  conversionRate: number;
  totalBalance: number;
}

export interface DashboardTask {
  id: number;
  prospect_id: number | null;
  client_id: number | null;
  next_action_date: string;

  prospect_first_name: string | null;
  prospect_last_name: string | null;

  client_first_name: string | null;
  client_last_name: string | null;

  [key: string]: any;
}

/* =========================================================
   AGENT DASHBOARD
========================================================= */

export const getAgentDashboard =
  async (): Promise<DashboardData> => {

    const response =
      await api.get<DashboardData>(
        "/dashboard/agent"
      );

    return response.data;
  };

/* =========================================================
   MANAGER DASHBOARD
========================================================= */

export const getManagerDashboard =
  async (): Promise<DashboardData> => {

    const response =
      await api.get<DashboardData>(
        "/dashboard/manager"
      );

    return response.data;
  };

/* =========================================================
   TASKS
========================================================= */

export const getDashboardTasks =
  async (): Promise<DashboardTask[]> => {

    const response =
      await api.get<DashboardTask[]>(
        "/dashboard/tasks"
      );

    return response.data;
  };