import {
  Response,
} from "express";

import {
  createAccountRequest,
  getAccountRequests,
  getAccountRequestById,
  updateAccountRequestStatus,
  verifyDocument,
} from "../services/accountRequest.service.js";


/*
================================================
CREATE ACCOUNT REQUEST
================================================
*/

export const createAccountRequestController =
async (
  req: any,
  res: Response
) => {

  try {

    const files =
      req.files as {
        [fieldname: string]:
          Express.Multer.File[];
      };

    const passport =
      files?.passport?.[0];

    const idCard =
      files?.idCard?.[0];

    const proofOfAddress =
      files?.proofOfAddress?.[0];


    /*
    --------------------------------------------
    REQUIRED DOCUMENTS
    --------------------------------------------
    */

    /*
    ID CARD OR PASSPORT
    */

    if (
      !passport &&
      !idCard
    ) {

      return res.status(400).json({
        message:
          "Passport or ID Card is required",
      });

    }

    /*
    PROOF OF ADDRESS
    */

    if (
      !proofOfAddress
    ) {

      return res.status(400).json({
        message:
          "Proof of Address is required",
      });

    }


    /*
    --------------------------------------------
    BUILD DOCUMENTS
    --------------------------------------------
    */

    const documents: any[] = [];


    if (passport) {

      documents.push({
        documentType:
          "PASSPORT",

        documentUrl:
          `/uploads/account-requests/${passport.filename}`,
      });

    }


    if (idCard) {

      documents.push({
        documentType:
          "ID CARD",

        documentUrl:
          `/uploads/account-requests/${idCard.filename}`,
      });

    }


    if (proofOfAddress) {

      documents.push({
        documentType:
          "PROOF OF ADDRESS",

        documentUrl:
          `/uploads/account-requests/${proofOfAddress.filename}`,
      });

    }


    /*
    --------------------------------------------
    DATA
    --------------------------------------------
    */

    const data = {

      ...req.body,

      prospectId:
        Number(req.body.prospectId),

      initialDeposit:
        Number(req.body.initialDeposit),

      documents,
    };


    /*
    --------------------------------------------
    CREATE
    --------------------------------------------
    */

    const request =
      await createAccountRequest(
        data,
        req.user
      );


    return res.status(201).json(
      request
    );


  } catch (error: any) {

    console.error(
      "CREATE ACCOUNT REQUEST ERROR:",
      error
    );


    /*
    --------------------------------------------
    DUPLICATE
    --------------------------------------------
    */

    if (
      error.message ===
      "This prospect already has an account request"
    ) {

      return res.status(409).json({

        message:
          "This prospect already has an account request",

      });

    }


    /*
    --------------------------------------------
    FORBIDDEN
    --------------------------------------------
    */

    if (
      error.message ===
      "Forbidden"
    ) {

      return res.status(403).json({
        message:
          "Forbidden",
      });

    }


    /*
    --------------------------------------------
    PROSPECT NOT FOUND
    --------------------------------------------
    */

    if (
      error.message ===
      "Prospect not found"
    ) {

      return res.status(404).json({
        message:
          "Prospect not found",
      });

    }


    return res.status(400).json({

      message:
        error.message ||
        "Cannot create account request",

    });

  }
};


/*
================================================
GET ACCOUNT REQUESTS
================================================
*/

export const getAccountRequestsController =
async (
  req: any,
  res: Response
) => {

  try {

    const requests =
      await getAccountRequests(
        req.user
      );

    return res.status(200).json(
      requests
    );

  } catch (error: any) {

    console.error(
      "GET ACCOUNT REQUESTS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Server error",
    });

  }
};


/*
================================================
GET ACCOUNT REQUEST BY ID
================================================
*/

export const getAccountRequestByIdController =
async (
  req: any,
  res: Response
) => {

  try {

    const requestId =
      Number(
        req.params.requestId
      );

    const request =
      await getAccountRequestById(
        requestId,
        req.user
      );

    return res.status(200).json(
      request
    );

  } catch (error: any) {

    console.error(
      "GET ACCOUNT REQUEST ERROR:",
      error
    );


    if (
      error.message ===
      "Forbidden"
    ) {

      return res.status(403).json({
        message:
          "Forbidden",
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


    return res.status(500).json({
      message:
        "Server error",
    });

  }
};


/*
================================================
UPDATE STATUS
================================================
*/

export const updateAccountRequestStatusController =
async (
  req: any,
  res: Response
) => {

  try {

    const requestId =
      Number(
        req.params.requestId
      );

    const {
      status,
    } = req.body;

    const request =
      await updateAccountRequestStatus(
        requestId,
        status
      );

    return res.status(200).json(
      request
    );

  } catch (error: any) {

    console.error(
      "UPDATE ACCOUNT REQUEST STATUS ERROR:",
      error
    );


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
        error.message,
    });

  }
};


/*
================================================
VERIFY DOCUMENT
================================================
*/

export const verifyDocumentController =
async (
  req: any,
  res: Response
) => {

  try {

    const requestId =
      Number(
        req.params.requestId
      );

    const documentId =
      Number(
        req.params.docId
      );

    const document =
      await verifyDocument(
        requestId,
        documentId,
        req.user.id
      );

    return res.status(200).json(
      document
    );

  } catch (error: any) {

    console.error(
      "VERIFY DOCUMENT ERROR:",
      error
    );


    if (
      error.message ===
      "Account request not found"
    ) {

      return res.status(404).json({
        message:
          "Account request not found",
      });

    }


    if (
      error.message ===
      "Document not found"
    ) {

      return res.status(404).json({
        message:
          "Document not found",
      });

    }


    return res.status(400).json({
      message:
        error.message,
    });

  }
};