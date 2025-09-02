import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { usersDB } from "./db";

export interface CreateUserRequest {
  name: string;
  age?: number;
  weightKg?: number;
  heightCm?: number;
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  fitnessGoal?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  weightKg?: number;
  heightCm?: number;
  activityLevel: string;
  fitnessGoal?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new user profile.
export const create = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/users", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    // Check if user profile already exists
    const existingUser = await usersDB.queryRow<{ id: string }>`
      SELECT id FROM users WHERE id = ${auth.userID}
    `;

    if (existingUser) {
      throw new Error("User profile already exists");
    }

    const user = await usersDB.queryRow<User>`
      INSERT INTO users (id, email, name, age, weight_kg, height_cm, activity_level, fitness_goal)
      VALUES (${auth.userID}, ${auth.email}, ${req.name}, ${req.age}, ${req.weightKg}, ${req.heightCm}, ${req.activityLevel || 'moderate'}, ${req.fitnessGoal})
      RETURNING id, email, name, age, weight_kg as "weightKg", height_cm as "heightCm", 
                activity_level as "activityLevel", fitness_goal as "fitnessGoal", 
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    return user!;
  }
);
