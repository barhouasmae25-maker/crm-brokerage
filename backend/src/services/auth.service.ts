import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../models/db.js";

export const registerUser = async (email: string, password: string, role: string) => {
  if (!email || !password || !role) throw new Error("Missing fields");

  if (password.length < 6) throw new Error("Password too short");

  const exist = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

  if (exist.rows.length > 0) throw new Error("Email already exists");

  const hashed = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users(email,password,role)
     VALUES($1,$2,$3)
     RETURNING id,email,role,created_at`,
    [email, hashed, role]
  );

  return result.rows[0];
};

export const loginUser = async (email: string, password: string) => {
  const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

  if (result.rows.length === 0) throw new Error("Invalid credentials");

  const user = result.rows[0];

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "24h" }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};