import { api } from "encore.dev/api";
import { workoutsDB } from "./db";

export interface StartSessionRequest {
  userId: number;
  templateId?: number;
  name: string;
}

export interface WorkoutSession {
  id: number;
  userId: number;
  templateId?: number;
  name: string;
  startedAt: Date;
  completedAt?: Date;
  durationMinutes?: number;
  notes?: string;
  createdAt: Date;
}

// Starts a new workout session.
export const startSession = api<StartSessionRequest, WorkoutSession>(
  { expose: true, method: "POST", path: "/workouts/sessions" },
  async (req) => {
    const session = await workoutsDB.queryRow<WorkoutSession>`
      INSERT INTO workout_sessions (user_id, template_id, name)
      VALUES (${req.userId}, ${req.templateId}, ${req.name})
      RETURNING id, user_id as "userId", template_id as "templateId", name, 
                started_at as "startedAt", completed_at as "completedAt", 
                duration_minutes as "durationMinutes", notes,
                created_at as "createdAt"
    `;
    
    return session!;
  }
);
