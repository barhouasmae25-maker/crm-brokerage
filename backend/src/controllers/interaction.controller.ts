import { Response } from "express";

import {
  createProspectInteraction,
  getProspectInteractions,
  createClientInteraction
} from "../services/interaction.service.js";


/*
================================================
CREATE PROSPECT INTERACTION
================================================
*/

export const createProspectInteractionController = async (
  req: any,
  res: Response
) => {

  try {

    const prospectId =
      Number(req.params.prospectId);


    if (Number.isNaN(prospectId)) {

      return res.status(400).json({
        message: "Invalid prospect ID"
      });

    }


    const interaction =
      await createProspectInteraction(
        {
          prospectId,

          type: req.body.type,

          notes: req.body.notes,

          outcome: req.body.outcome,

          nextAction:
            req.body.nextAction,

          nextActionDate:
            req.body.nextActionDate
        },

        req.user
      );


    return res.status(201).json(
      interaction
    );


  } catch (error: any) {

    console.log(
      "CREATE INTERACTION ERROR:",
      error
    );


    if (
      error.message === "Forbidden"
    ) {

      return res.status(403).json({
        message: "Forbidden"
      });

    }


    if (
      error.message === "Prospect not found"
    ) {

      return res.status(404).json({
        message: "Prospect not found"
      });

    }


    return res.status(400).json({
      message: error.message
    });

  }

};


/*
================================================
GET PROSPECT INTERACTIONS
================================================
*/

export const getProspectInteractionsController = async (
  req: any,
  res: Response
) => {

  try {

    const prospectId =
      Number(req.params.prospectId);


    if (Number.isNaN(prospectId)) {

      return res.status(400).json({
        message: "Invalid prospect ID"
      });

    }


    const interactions =
      await getProspectInteractions(
        prospectId,
        req.user
      );


    return res.status(200).json(
      interactions
    );


  } catch (error: any) {

    console.log(
      "GET INTERACTIONS ERROR:",
      error
    );


    if (
      error.message === "Forbidden"
    ) {

      return res.status(403).json({
        message: "Forbidden"
      });

    }


    if (
      error.message === "Prospect not found"
    ) {

      return res.status(404).json({
        message: "Prospect not found"
      });

    }


    return res.status(500).json({
      message: "Server error"
    });

  }

};


/*
================================================
CREATE CLIENT INTERACTION
================================================
*/

export const createClientInteractionController = async (
  req: any,
  res: Response
) => {

  try {

    const clientId =
      Number(req.params.clientId);


    if (Number.isNaN(clientId)) {

      return res.status(400).json({
        message: "Invalid client ID"
      });

    }


    const interaction =
      await createClientInteraction(
        {
          clientId,

          type: req.body.type,

          notes: req.body.notes,

          outcome: req.body.outcome,

          nextAction:
            req.body.nextAction,

          nextActionDate:
            req.body.nextActionDate
        },

        req.user
      );


    return res.status(201).json(
      interaction
    );


  } catch (error: any) {

    console.log(
      "CREATE CLIENT INTERACTION ERROR:",
      error
    );


    if (
      error.message === "Forbidden"
    ) {

      return res.status(403).json({
        message: "Forbidden"
      });

    }


    if (
      error.message === "Client not found"
    ) {

      return res.status(404).json({
        message: "Client not found"
      });

    }


    return res.status(400).json({
      message: error.message
    });

  }

};