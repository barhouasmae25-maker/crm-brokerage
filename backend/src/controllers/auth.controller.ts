import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service.js";

export const register = async (req: Request, res: Response) => {
  try {
    console.log("BODY RECEIVED:", req.body); 
    const { email, password, role } = req.body;
    const user = await registerUser(email, password, role);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};