import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { workoutsDB } from "./db";
import type { WorkoutTemplate } from "./create_template";

export interface ListTemplatesResponse {
  templates: WorkoutTemplate[];
}

// Retrieves all workout templates for the authenticated user.
export const listTemplates = api<void, ListTemplatesResponse>(
  { expose: true, method: "GET", path: "/workouts/templates", auth: true },
  async () => {
    const auth = getAuthData()!;
    const templates: WorkoutTemplate[] = [];
    
    for await (const row of workoutsDB.query<WorkoutTemplate>`
      SELECT id, user_id as "userId", name, description, category, 
             estimated_duration_minutes as "estimatedDurationMinutes",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM workout_templates 
      WHERE user_id = ${auth.userID}
      ORDER BY created_at DESC
    `) {
      templates.push(row);
    }
    
    return { templates };
  }
);
