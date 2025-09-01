import { api } from "encore.dev/api";
import { workoutsDB } from "./db";

export interface Exercise {
  id: number;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment?: string;
  instructions?: string;
  createdAt: Date;
}

export interface ListExercisesResponse {
  exercises: Exercise[];
}

// Retrieves all available exercises.
export const listExercises = api<void, ListExercisesResponse>(
  { expose: true, method: "GET", path: "/workouts/exercises" },
  async () => {
    const exercises: Exercise[] = [];
    
    for await (const row of workoutsDB.query<Exercise>`
      SELECT id, name, category, muscle_groups as "muscleGroups", equipment, instructions, created_at as "createdAt"
      FROM exercises 
      ORDER BY category, name
    `) {
      exercises.push(row);
    }
    
    return { exercises };
  }
);
