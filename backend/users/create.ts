import { api } from "encore.dev/api";
import { usersDB } from "./db";

export interface CreateUserRequest {
  email: string;
  name: string;
  age?: number;
  weightKg?: number;
  heightCm?: number;
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  fitnessGoal?: string;
}

export interface User {
  id: number;
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
  { expose: true, method: "POST", path: "/users" },
  async (req) => {
    const user = await usersDB.queryRow<User>`
      INSERT INTO users (email, name, age, weight_kg, height_cm, activity_level, fitness_goal)
      VALUES (${req.email}, ${req.name}, ${req.age}, ${req.weightKg}, ${req.heightCm}, ${req.activityLevel || 'moderate'}, ${req.fitnessGoal})
      RETURNING id, email, name, age, weight_kg as "weightKg", height_cm as "heightCm", 
                activity_level as "activityLevel", fitness_goal as "fitnessGoal", 
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    return user!;
  }
);
