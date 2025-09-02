import { api, APIError } from "encore.dev/api";
import { authDB } from "./db";
import { hashPassword, generateSalt, generateToken } from "./auth";

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface SignupResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// Creates a new user account.
export const signup = api<SignupRequest, SignupResponse>(
  { expose: true, method: "POST", path: "/auth/signup" },
  async (req) => {
    if (req.password.length < 6) {
      throw APIError.invalidArgument("password must be at least 6 characters");
    }

    const email = req.email.toLowerCase();
    
    // Check if user already exists
    const existingUser = await authDB.queryRow<{ id: string }>`
      SELECT id FROM auth_users WHERE email = ${email}
    `;

    if (existingUser) {
      throw APIError.alreadyExists("user with this email already exists");
    }

    // Create new user
    const salt = generateSalt();
    const passwordHash = hashPassword(req.password, salt);

    const user = await authDB.queryRow<{
      id: string;
      email: string;
      name: string;
    }>`
      INSERT INTO auth_users (email, name, password_hash, salt)
      VALUES (${email}, ${req.name}, ${passwordHash}, ${salt})
      RETURNING id, email, name
    `;

    if (!user) {
      throw APIError.internal("failed to create user");
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
