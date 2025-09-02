import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { workoutsDB } from "./db";
import type { WorkoutSession } from "./start_session";

export interface ListSessionsResponse {
  sessions: WorkoutSession[];
}

// Retrieves all workout sessions for the authenticated user.
export const listSessions = api<void, ListSessionsResponse>(
  { expose: true, method: "GET", path: "/workouts/sessions", auth: true },
  async () => {
    const auth = getAuthData()!;
    const sessions: WorkoutSession[] = [];
    
    for await (const row of workoutsDB.query<WorkoutSession>`
      SELECT id, user_id as "userId", template_id as "templateId", name, 
             started_at as "startedAt", completed_at as "completedAt", 
             duration_minutes as "durationMinutes", notes,
             created_at as "createdAt"
      FROM workout_sessions 
      WHERE user_id = ${auth.userID}
      ORDER BY started_at DESC
      LIMIT 50
    `) {
      sessions.push(row);
    }
    
    return { sessions };
  }
);
