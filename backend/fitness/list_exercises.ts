import { api } from "encore.dev/api";
import { fitnessDB } from "./db";
import type { Exercise } from "./types";

export interface ListExercisesResponse {
  exercises: Exercise[];
}

// Retrieves all available exercises.
export const listExercises = api<void, ListExercisesResponse>(
  { expose: true, method: "GET", path: "/exercises" },
  async () => {
    const exercises = await fitnessDB.queryAll<Exercise>`
      SELECT id, name, description, category, muscle_groups, equipment, instructions, created_at
      FROM exercises
      ORDER BY name
    `;
    
    return { exercises };
  }
);
