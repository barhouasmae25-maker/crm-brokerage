import { Request, Response } from "express";
import pool from "../models/db.js";


export const getAgents = async (
  req: Request,
  res: Response
) => {

  try {

    const result = await pool.query(
      `
      SELECT id,email,role
      FROM users
      WHERE role='AGENT'
      `
    );


    res.json(result.rows);


  } catch (error:any) {

    res.status(500).json({
      message:error.message
    });

  }

};