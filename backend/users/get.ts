import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { usersDB } from "./db";
import type { User } from "./create";

// Retrieves the current user's profile.
export const get = api<void, User>(
  { expose: true, method: "GET", path: "/users/me", auth: true },
  async () => {
    const auth = getAuthData()!;
    
    const user = await usersDB.queryRow<User>`
      SELECT id, email, name, age, weight_kg as "weightKg", height_cm as "heightCm", 
             activity_level as "activityLevel", fitness_goal as "fitnessGoal", 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users 
      WHERE id = ${auth.userID}
    `;
    
    if (!user) {
      throw APIError.notFound("user profile not found");
    }
    
    return user;
  }
);
