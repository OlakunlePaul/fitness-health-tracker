import { api, APIError } from "encore.dev/api";
import { fitnessDB } from "./db";
import type { WorkoutRoutineWithExercises, WorkoutExercise, Exercise } from "./types";

interface GetWorkoutParams {
  id: number;
}

// Retrieves a specific workout routine with all its exercises.
export const getWorkout = api<GetWorkoutParams, WorkoutRoutineWithExercises>(
  { expose: true, method: "GET", path: "/workouts/:id" },
  async ({ id }) => {
    const workout = await fitnessDB.queryRow<WorkoutRoutineWithExercises>`
      SELECT id, name, description, category, duration_minutes, difficulty_level, created_at
      FROM workout_routines
      WHERE id = ${id}
    `;

    if (!workout) {
      throw APIError.notFound("workout routine not found");
    }

    const exercises = await fitnessDB.queryAll<WorkoutExercise & { exercise: Exercise }>`
      SELECT 
        we.id, we.workout_routine_id, we.exercise_id, we.sets, we.reps, 
        we.weight_kg, we.duration_seconds, we.rest_seconds, we.order_index,
        e.name as exercise_name, e.description as exercise_description, 
        e.category as exercise_category, e.muscle_groups, e.equipment, e.instructions
      FROM workout_exercises we
      JOIN exercises e ON we.exercise_id = e.id
      WHERE we.workout_routine_id = ${id}
      ORDER BY we.order_index
    `;

    const exercisesWithExercise = exercises.map(ex => ({
      id: ex.id,
      workout_routine_id: ex.workout_routine_id,
      exercise_id: ex.exercise_id,
      sets: ex.sets,
      reps: ex.reps,
      weight_kg: ex.weight_kg,
      duration_seconds: ex.duration_seconds,
      rest_seconds: ex.rest_seconds,
      order_index: ex.order_index,
      exercise: {
        id: ex.exercise_id,
        name: ex.exercise_name,
        description: ex.exercise_description,
        category: ex.exercise_category,
        muscle_groups: ex.muscle_groups,
        equipment: ex.equipment,
        instructions: ex.instructions,
        created_at: new Date()
      }
    }));

    return {
      ...workout,
      exercises: exercisesWithExercise
    };
  }
);
