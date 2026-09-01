import { Response } from "express";

import {
  getAgentDashboard,
  getManagerDashboard,
  getDashboardTasks,
} from "../services/dashboard.service.js";

import type {
  User,
} from "../services/dashboard.service.js";

/* =========================================================
   AGENT DASHBOARD
========================================================= */

export const getAgentDashboardController =
async (
  req: any,
  res: Response
) => {
  try {

    const user =
      req.user as User;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const dashboard =
      await getAgentDashboard(
        user
      );

    return res.status(200).json(
      dashboard
    );

  } catch (error: any) {

    console.error(
      "AGENT DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Cannot get agent dashboard",
    });
  }
};

/* =========================================================
   MANAGER DASHBOARD
========================================================= */

export const getManagerDashboardController =
async (
  req: any,
  res: Response
) => {
  try {

    const user =
      req.user as User;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const dashboard =
      await getManagerDashboard(
        user
      );

    return res.status(200).json(
      dashboard
    );

  } catch (error: any) {

    console.error(
      "MANAGER DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Cannot get manager dashboard",
    });
  }
};

/* =========================================================
   TASKS
========================================================= */

export const getDashboardTasksController =
async (
  req: any,
  res: Response
) => {
  try {

    const user =
      req.user as User;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const tasks =
      await getDashboardTasks(
        user
      );

    return res.status(200).json(
      tasks
    );

  } catch (error: any) {

    console.error(
      "DASHBOARD TASKS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Cannot get dashboard tasks",
    });
  }
};