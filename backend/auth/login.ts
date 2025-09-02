import { api, APIError } from "encore.dev/api";
import { authDB } from "./db";
import { verifyPassword, generateToken } from "./auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// Logs in a user with email and password.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    const user = await authDB.queryRow<{
      id: string;
      email: string;
      name: string;
      password_hash: string;
      salt: string;
    }>`
      SELECT id, email, name, password_hash, salt
      FROM auth_users
      WHERE email = ${req.email.toLowerCase()}
    `;

    if (!user || !verifyPassword(req.password, user.password_hash, user.salt)) {
      throw APIError.unauthenticated("invalid email or password");
    }

    const token = generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
);
