import { api } from "encore.dev/api";
import { fitnessDB } from "./db";
import type { WorkoutLogWithExercises, WorkoutLogExercise, Exercise } from "./types";

export interface ListWorkoutLogsResponse {
  logs: WorkoutLogWithExercises[];
}

// Retrieves all workout logs with exercise details.
export const listWorkoutLogs = api<void, ListWorkoutLogsResponse>(
  { expose: true, method: "GET", path: "/workout-logs" },
  async () => {
    const logs = await fitnessDB.queryAll<WorkoutLogWithExercises>`
      SELECT 
        wl.id, wl.workout_routine_id, wl.date_performed, wl.duration_minutes, 
        wl.notes, wl.rating, wl.created_at,
        wr.name as routine_name
      FROM workout_logs wl
      JOIN workout_routines wr ON wl.workout_routine_id = wr.id
      ORDER BY wl.date_performed DESC
    `;
    
    const logsWithExercises: WorkoutLogWithExercises[] = [];
    
    for (const log of logs) {
      const exercises = await fitnessDB.queryAll<WorkoutLogExercise & { exercise: Exercise }>`
        SELECT 
          wle.id, wle.workout_log_id, wle.exercise_id, wle.sets_completed, 
          wle.reps_completed, wle.weight_kg, wle.duration_seconds, wle.notes,
          e.name as exercise_name, e.description as exercise_description, 
          e.category as exercise_category, e.muscle_groups, e.equipment, e.instructions
        FROM workout_log_exercises wle
        JOIN exercises e ON wle.exercise_id = e.id
        WHERE wle.workout_log_id = ${log.id}
      `;

      const exercisesWithExercise = exercises.map(ex => ({
        id: ex.id,
        workout_log_id: ex.workout_log_id,
        exercise_id: ex.exercise_id,
        sets_completed: ex.sets_completed,
        reps_completed: ex.reps_completed,
        weight_kg: ex.weight_kg,
        duration_seconds: ex.duration_seconds,
        notes: ex.notes,
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

      logsWithExercises.push({
        ...log,
        exercises: exercisesWithExercise
      });
    }
    
    return { logs: logsWithExercises };
  }
);
