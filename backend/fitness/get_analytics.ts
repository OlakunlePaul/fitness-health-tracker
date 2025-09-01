import { api } from "encore.dev/api";
import { fitnessDB } from "./db";

export interface AnalyticsResponse {
  workoutStats: {
    totalWorkouts: number;
    averageRating: number;
    totalDurationMinutes: number;
    workoutsThisWeek: number;
    workoutsThisMonth: number;
  };
  nutritionStats: {
    averageDailyCalories: number;
    averageDailyProtein: number;
    averageDailyCarbs: number;
    averageDailyFat: number;
    daysLogged: number;
  };
  progressStats: {
    latestWeight?: number;
    weightChange30Days?: number;
    measurementTypes: string[];
  };
  recentActivity: {
    lastWorkout?: string;
    lastNutritionLog?: string;
    lastProgressUpdate?: string;
  };
}

// Provides comprehensive analytics and statistics for fitness progress.
export const getAnalytics = api<void, AnalyticsResponse>(
  { expose: true, method: "GET", path: "/analytics" },
  async () => {
    // Workout statistics
    const workoutStats = await fitnessDB.queryRow<{
      total_workouts: number;
      average_rating: number;
      total_duration_minutes: number;
      workouts_this_week: number;
      workouts_this_month: number;
    }>`
      SELECT 
        COUNT(*) as total_workouts,
        COALESCE(AVG(rating), 0) as average_rating,
        COALESCE(SUM(duration_minutes), 0) as total_duration_minutes,
        COALESCE(COUNT(*) FILTER (WHERE date_performed >= CURRENT_DATE - INTERVAL '7 days'), 0) as workouts_this_week,
        COALESCE(COUNT(*) FILTER (WHERE date_performed >= CURRENT_DATE - INTERVAL '30 days'), 0) as workouts_this_month
      FROM workout_logs
    `;

    // Nutrition statistics
    const nutritionStats = await fitnessDB.queryRow<{
      average_daily_calories: number;
      average_daily_protein: number;
      average_daily_carbs: number;
      average_daily_fat: number;
      days_logged: number;
    }>`
      SELECT 
        COALESCE(AVG(daily_calories), 0) as average_daily_calories,
        COALESCE(AVG(daily_protein), 0) as average_daily_protein,
        COALESCE(AVG(daily_carbs), 0) as average_daily_carbs,
        COALESCE(AVG(daily_fat), 0) as average_daily_fat,
        COUNT(*) as days_logged
      FROM (
        SELECT 
          date_logged,
          SUM(calories) as daily_calories,
          SUM(COALESCE(protein_g, 0)) as daily_protein,
          SUM(COALESCE(carbs_g, 0)) as daily_carbs,
          SUM(COALESCE(fat_g, 0)) as daily_fat
        FROM nutrition_logs
        GROUP BY date_logged
      ) daily_nutrition
    `;

    // Progress statistics
    const latestWeight = await fitnessDB.queryRow<{ value: number }>`
      SELECT value
      FROM progress_measurements
      WHERE measurement_type = 'weight'
      ORDER BY date_measured DESC, created_at DESC
      LIMIT 1
    `;

    const weight30DaysAgo = await fitnessDB.queryRow<{ value: number }>`
      SELECT value
      FROM progress_measurements
      WHERE measurement_type = 'weight' 
        AND date_measured <= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY date_measured DESC, created_at DESC
      LIMIT 1
    `;

    const measurementTypes = await fitnessDB.queryAll<{ measurement_type: string }>`
      SELECT DISTINCT measurement_type
      FROM progress_measurements
      ORDER BY measurement_type
    `;

    // Recent activity
    const lastWorkout = await fitnessDB.queryRow<{ date_performed: string }>`
      SELECT date_performed
      FROM workout_logs
      ORDER BY date_performed DESC, created_at DESC
      LIMIT 1
    `;

    const lastNutritionLog = await fitnessDB.queryRow<{ date_logged: string }>`
      SELECT date_logged
      FROM nutrition_logs
      ORDER BY date_logged DESC, created_at DESC
      LIMIT 1
    `;

    const lastProgressUpdate = await fitnessDB.queryRow<{ date_measured: string }>`
      SELECT date_measured
      FROM progress_measurements
      ORDER BY date_measured DESC, created_at DESC
      LIMIT 1
    `;

    const weightChange30Days = latestWeight && weight30DaysAgo
      ? latestWeight.value - weight30DaysAgo.value
      : undefined;

    return {
      workoutStats: {
        totalWorkouts: workoutStats?.total_workouts || 0,
        averageRating: workoutStats?.average_rating || 0,
        totalDurationMinutes: workoutStats?.total_duration_minutes || 0,
        workoutsThisWeek: workoutStats?.workouts_this_week || 0,
        workoutsThisMonth: workoutStats?.workouts_this_month || 0,
      },
      nutritionStats: {
        averageDailyCalories: nutritionStats?.average_daily_calories || 0,
        averageDailyProtein: nutritionStats?.average_daily_protein || 0,
        averageDailyCarbs: nutritionStats?.average_daily_carbs || 0,
        averageDailyFat: nutritionStats?.average_daily_fat || 0,
        daysLogged: nutritionStats?.days_logged || 0,
      },
      progressStats: {
        latestWeight: latestWeight?.value,
        weightChange30Days,
        measurementTypes: measurementTypes.map(m => m.measurement_type),
      },
      recentActivity: {
        lastWorkout: lastWorkout?.date_performed,
        lastNutritionLog: lastNutritionLog?.date_logged,
        lastProgressUpdate: lastProgressUpdate?.date_measured,
      },
    };
  }
);
