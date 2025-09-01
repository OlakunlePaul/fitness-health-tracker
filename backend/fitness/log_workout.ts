import { api } from "encore.dev/api";
import { fitnessDB } from "./db";
import type { WorkoutLog } from "./types";

export interface LogWorkoutRequest {
  workout_routine_id: number;
  date_performed: string;
  duration_minutes?: number;
  notes?: string;
  rating?: number;
  exercises: {
    exercise_id: number;
    sets_completed: number;
    reps_completed?: number;
    weight_kg?: number;
    duration_seconds?: number;
    notes?: string;
  }[];
}

// Logs a completed workout session.
export const logWorkout = api<LogWorkoutRequest, WorkoutLog>(
  { expose: true, method: "POST", path: "/workout-logs" },
  async (req) => {
    await fitnessDB.exec`BEGIN`;
    
    try {
      const workoutLog = await fitnessDB.queryRow<WorkoutLog>`
        INSERT INTO workout_logs (workout_routine_id, date_performed, duration_minutes, notes, rating)
        VALUES (${req.workout_routine_id}, ${req.date_performed}, ${req.duration_minutes}, ${req.notes}, ${req.rating})
        RETURNING id, workout_routine_id, date_performed, duration_minutes, notes, rating, created_at
      `;

      if (!workoutLog) {
        throw new Error("Failed to create workout log");
      }

      for (const exercise of req.exercises) {
        await fitnessDB.exec`
          INSERT INTO workout_log_exercises (
            workout_log_id, exercise_id, sets_completed, reps_completed, 
            weight_kg, duration_seconds, notes
          )
          VALUES (
            ${workoutLog.id}, ${exercise.exercise_id}, ${exercise.sets_completed}, 
            ${exercise.reps_completed}, ${exercise.weight_kg}, ${exercise.duration_seconds}, 
            ${exercise.notes}
          )
        `;
      }

      await fitnessDB.exec`COMMIT`;
      return workoutLog;
    } catch (error) {
      await fitnessDB.exec`ROLLBACK`;
      throw error;
    }
  }
);
