import { api, APIError } from "encore.dev/api";
import { usersDB } from "./db";
import type { User } from "./create";

interface GetUserParams {
  id: number;
}

// Retrieves a user profile by ID.
export const get = api<GetUserParams, User>(
  { expose: true, method: "GET", path: "/users/:id" },
  async (params) => {
    const user = await usersDB.queryRow<User>`
      SELECT id, email, name, age, weight_kg as "weightKg", height_cm as "heightCm", 
             activity_level as "activityLevel", fitness_goal as "fitnessGoal", 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users 
      WHERE id = ${params.id}
    `;
    
    if (!user) {
      throw APIError.notFound("user not found");
    }
    
    return user;
  }
);
