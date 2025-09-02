import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { workoutsDB } from "./db";

export interface TemplateExercise {
  exerciseId: number;
  sets: number;
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  restSeconds?: number;
  orderIndex: number;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  category?: string;
  estimatedDurationMinutes?: number;
  exercises: TemplateExercise[];
}

export interface WorkoutTemplate {
  id: number;
  userId: string;
  name: string;
  description?: string;
  category?: string;
  estimatedDurationMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new workout template for the authenticated user.
export const createTemplate = api<CreateTemplateRequest, WorkoutTemplate>(
  { expose: true, method: "POST", path: "/workouts/templates", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    await workoutsDB.exec`BEGIN`;
    
    try {
      const template = await workoutsDB.queryRow<WorkoutTemplate>`
        INSERT INTO workout_templates (user_id, name, description, category, estimated_duration_minutes)
        VALUES (${auth.userID}, ${req.name}, ${req.description}, ${req.category}, ${req.estimatedDurationMinutes})
        RETURNING id, user_id as "userId", name, description, category, 
                  estimated_duration_minutes as "estimatedDurationMinutes",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;

      for (const exercise of req.exercises) {
        await workoutsDB.exec`
          INSERT INTO template_exercises (template_id, exercise_id, sets, reps, weight_kg, duration_seconds, rest_seconds, order_index)
          VALUES (${template!.id}, ${exercise.exerciseId}, ${exercise.sets}, ${exercise.reps}, ${exercise.weightKg}, ${exercise.durationSeconds}, ${exercise.restSeconds}, ${exercise.orderIndex})
        `;
      }

      await workoutsDB.exec`COMMIT`;
      return template!;
    } catch (error) {
      await workoutsDB.exec`ROLLBACK`;
      throw error;
    }
  }
);
