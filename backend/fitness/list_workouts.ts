import { api } from "encore.dev/api";
import { fitnessDB } from "./db";
import type { WorkoutRoutine } from "./types";

export interface ListWorkoutsResponse {
  workouts: WorkoutRoutine[];
}

// Retrieves all workout routines with optional filtering by category or difficulty.
export const listWorkouts = api<void, ListWorkoutsResponse>(
  { expose: true, method: "GET", path: "/workouts" },
  async () => {
    const workouts = await fitnessDB.queryAll<WorkoutRoutine>`
      SELECT id, name, description, category, duration_minutes, difficulty_level, created_at
      FROM workout_routines
      ORDER BY created_at DESC
    `;
    
    return { workouts };
  }
);
