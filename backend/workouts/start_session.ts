import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { workoutsDB } from "./db";

export interface StartSessionRequest {
  templateId?: number;
  name: string;
}

export interface WorkoutSession {
  id: number;
  userId: string;
  templateId?: number;
  name: string;
  startedAt: Date;
  completedAt?: Date;
  durationMinutes?: number;
  notes?: string;
  createdAt: Date;
}

// Starts a new workout session for the authenticated user.
export const startSession = api<StartSessionRequest, WorkoutSession>(
  { expose: true, method: "POST", path: "/workouts/sessions", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    const session = await workoutsDB.queryRow<WorkoutSession>`
      INSERT INTO workout_sessions (user_id, template_id, name)
      VALUES (${auth.userID}, ${req.templateId}, ${req.name})
      RETURNING id, user_id as "userId", template_id as "templateId", name, 
                started_at as "startedAt", completed_at as "completedAt", 
                duration_minutes as "durationMinutes", notes,
                created_at as "createdAt"
    `;
    
    return session!;
  }
);
