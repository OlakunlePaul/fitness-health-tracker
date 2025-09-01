import { api } from "encore.dev/api";
import { workoutsDB } from "./db";
import type { WorkoutTemplate } from "./create_template";

interface ListTemplatesParams {
  userId: number;
}

export interface ListTemplatesResponse {
  templates: WorkoutTemplate[];
}

// Retrieves all workout templates for a user.
export const listTemplates = api<ListTemplatesParams, ListTemplatesResponse>(
  { expose: true, method: "GET", path: "/workouts/templates/:userId" },
  async (params) => {
    const templates: WorkoutTemplate[] = [];
    
    for await (const row of workoutsDB.query<WorkoutTemplate>`
      SELECT id, user_id as "userId", name, description, category, 
             estimated_duration_minutes as "estimatedDurationMinutes",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM workout_templates 
      WHERE user_id = ${params.userId}
      ORDER BY created_at DESC
    `) {
      templates.push(row);
    }
    
    return { templates };
  }
);
