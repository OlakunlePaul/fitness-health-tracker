export interface WorkoutRoutine {
  id: number;
  name: string;
  description?: string;
  category: string;
  duration_minutes?: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  created_at: Date;
}

export interface Exercise {
  id: number;
  name: string;
  description?: string;
  category: string;
  muscle_groups: string[];
  equipment?: string;
  instructions?: string;
  created_at: Date;
}

export interface WorkoutExercise {
  id: number;
  workout_routine_id: number;
  exercise_id: number;
  sets: number;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  rest_seconds?: number;
  order_index: number;
}

export interface WorkoutLog {
  id: number;
  workout_routine_id: number;
  date_performed: string;
  duration_minutes?: number;
  notes?: string;
  rating?: number;
  created_at: Date;
}

export interface WorkoutLogExercise {
  id: number;
  workout_log_id: number;
  exercise_id: number;
  sets_completed: number;
  reps_completed?: number;
  weight_kg?: number;
  duration_seconds?: number;
  notes?: string;
}

export interface NutritionLog {
  id: number;
  date_logged: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  serving_size: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  created_at: Date;
}

export interface ProgressMeasurement {
  id: number;
  date_measured: string;
  measurement_type: string;
  value: number;
  unit: string;
  notes?: string;
  created_at: Date;
}

export interface WorkoutRoutineWithExercises extends WorkoutRoutine {
  exercises: (WorkoutExercise & { exercise: Exercise })[];
}

export interface WorkoutLogWithExercises extends WorkoutLog {
  routine_name: string;
  exercises: (WorkoutLogExercise & { exercise: Exercise })[];
}
