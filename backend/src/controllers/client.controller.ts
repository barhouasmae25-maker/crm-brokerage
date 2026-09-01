import type { Response } from "express";

import {
  createClient,
  getClients,
  getClientById,
  updateClient,
} from "../services/client.service.js";

import type {
  User,
  ClientStatus,
} from "../services/client.service.js";

/* =========================================================
   CREATE CLIENT
   POST /api/clients
========================================================= */

export const createClientController = async (
  req: any,
  res: Response
) => {

  try {

    const prospectId =
      Number(req.body.prospectId);

    const accountRequestId =
      Number(req.body.accountRequestId);

    if (
      !Number.isInteger(prospectId) ||
      prospectId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid prospectId",
      });
    }

    if (
      !Number.isInteger(accountRequestId) ||
      accountRequestId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid accountRequestId",
      });
    }

    const client =
      await createClient(
        prospectId,
        accountRequestId,
        req.user as User
      );

    return res.status(201).json(
      client
    );

  } catch (error: any) {

    console.error(
      "CREATE CLIENT ERROR:",
      error
    );

    if (
      error.message ===
      "Forbidden"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    if (
      error.message ===
      "Prospect not found"
    ) {
      return res.status(404).json({
        message:
          "Prospect not found",
      });
    }

    if (
      error.message ===
      "Account request not found"
    ) {
      return res.status(404).json({
        message:
          "Account request not found",
      });
    }

    return res.status(400).json({
      message:
        error.message ||
        "Cannot create client",
    });
  }
};

/* =========================================================
   GET ALL CLIENTS
   GET /api/clients
========================================================= */

export const getClientsController = async (
  req: any,
  res: Response
) => {

  try {

    const status =
      req.query.status !== undefined
        ? String(req.query.status)
        : undefined;

    const assignedTo =
      req.query.assignedTo !== undefined
        ? Number(req.query.assignedTo)
        : undefined;

    const clients =
      await getClients(
        req.user as User,
        status,
        assignedTo
      );

    return res.status(200).json(
      clients
    );

  } catch (error: any) {

    console.error(
      "GET CLIENTS ERROR:",
      error
    );

    if (
      error.message ===
      "Forbidden"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    return res.status(400).json({
      message:
        error.message ||
        "Cannot get clients",
    });
  }
};

/* =========================================================
   GET ONE CLIENT
   GET /api/clients/:clientId
========================================================= */

export const getClientByIdController =
async (
  req: any,
  res: Response
) => {

  try {

    const clientId =
      Number(
        req.params.clientId
      );

    if (
      !Number.isInteger(clientId) ||
      clientId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid client ID",
      });
    }

    const client =
      await getClientById(
        clientId,
        req.user as User
      );

    return res.status(200).json(
      client
    );

  } catch (error: any) {

    console.error(
      "GET CLIENT ERROR:",
      error
    );

    if (
      error.message ===
      "Client not found"
    ) {
      return res.status(404).json({
        message:
          "Client not found",
      });
    }

    if (
      error.message ===
      "Forbidden"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    return res.status(500).json({
      message:
        "Server error",
    });
  }
};

/* =========================================================
   UPDATE CLIENT
   PUT /api/clients/:clientId
========================================================= */

export const updateClientController =
async (
  req: any,
  res: Response
) => {

  try {

    const clientId =
      Number(
        req.params.clientId
      );

    if (
      !Number.isInteger(clientId) ||
      clientId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid client ID",
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      status,
      accountType,
      tradingExperience,
    } = req.body;

    const client =
      await updateClient(
        clientId,
        {
          firstName,
          lastName,
          email,
          phone,
          status:
            status as ClientStatus,
          accountType,
          tradingExperience,
        },
        req.user as User
      );

    return res.status(200).json(
      client
    );

  } catch (error: any) {

    console.error(
      "UPDATE CLIENT ERROR:",
      error
    );

    if (
      error.message ===
      "Client not found"
    ) {
      return res.status(404).json({
        message:
          "Client not found",
      });
    }

    if (
      error.message ===
      "Forbidden"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    return res.status(400).json({
      message:
        error.message ||
        "Cannot update client",
    });
  }
};