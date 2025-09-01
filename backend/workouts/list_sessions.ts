import { api } from "encore.dev/api";
import { workoutsDB } from "./db";
import type { WorkoutSession } from "./start_session";

interface ListSessionsParams {
  userId: number;
}

export interface ListSessionsResponse {
  sessions: WorkoutSession[];
}

// Retrieves all workout sessions for a user.
export const listSessions = api<ListSessionsParams, ListSessionsResponse>(
  { expose: true, method: "GET", path: "/workouts/sessions/:userId" },
  async (params) => {
    const sessions: WorkoutSession[] = [];
    
    for await (const row of workoutsDB.query<WorkoutSession>`
      SELECT id, user_id as "userId", template_id as "templateId", name, 
             started_at as "startedAt", completed_at as "completedAt", 
             duration_minutes as "durationMinutes", notes,
             created_at as "createdAt"
      FROM workout_sessions 
      WHERE user_id = ${params.userId}
      ORDER BY started_at DESC
      LIMIT 50
    `) {
      sessions.push(row);
    }
    
    return { sessions };
  }
);
