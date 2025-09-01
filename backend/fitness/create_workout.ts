import { api } from "encore.dev/api";
import { fitnessDB } from "./db";
import type { WorkoutRoutine } from "./types";

export interface CreateWorkoutRequest {
  name: string;
  description?: string;
  category: string;
  duration_minutes?: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  exercises: {
    exercise_id: number;
    sets: number;
    reps?: number;
    weight_kg?: number;
    duration_seconds?: number;
    rest_seconds?: number;
  }[];
}

// Creates a new workout routine with exercises.
export const createWorkout = api<CreateWorkoutRequest, WorkoutRoutine>(
  { expose: true, method: "POST", path: "/workouts" },
  async (req) => {
    await fitnessDB.exec`BEGIN`;
    
    try {
      const workout = await fitnessDB.queryRow<WorkoutRoutine>`
        INSERT INTO workout_routines (name, description, category, duration_minutes, difficulty_level)
        VALUES (${req.name}, ${req.description}, ${req.category}, ${req.duration_minutes}, ${req.difficulty_level})
        RETURNING id, name, description, category, duration_minutes, difficulty_level, created_at
      `;

      if (!workout) {
        throw new Error("Failed to create workout routine");
      }

      for (let i = 0; i < req.exercises.length; i++) {
        const exercise = req.exercises[i];
        await fitnessDB.exec`
          INSERT INTO workout_exercises (
            workout_routine_id, exercise_id, sets, reps, weight_kg, 
            duration_seconds, rest_seconds, order_index
          )
          VALUES (
            ${workout.id}, ${exercise.exercise_id}, ${exercise.sets}, 
            ${exercise.reps}, ${exercise.weight_kg}, ${exercise.duration_seconds}, 
            ${exercise.rest_seconds}, ${i + 1}
          )
        `;
      }

      await fitnessDB.exec`COMMIT`;
      return workout;
    } catch (error) {
      await fitnessDB.exec`ROLLBACK`;
      throw error;
    }
  }
);
