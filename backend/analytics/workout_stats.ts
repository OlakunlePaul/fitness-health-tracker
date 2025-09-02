import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const workoutsDB = SQLDatabase.named("workouts");

interface GetWorkoutStatsParams {
  days?: number;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number;
  averageDuration: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  mostActiveDay: string;
  popularExercises: Array<{
    exerciseName: string;
    count: number;
  }>;
}

// Retrieves workout statistics for the authenticated user.
export const getWorkoutStats = api<GetWorkoutStatsParams, WorkoutStats>(
  { expose: true, method: "GET", path: "/analytics/workouts", auth: true },
  async (params) => {
    const auth = getAuthData()!;
    const days = params.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const totalStats = await workoutsDB.queryRow<{totalWorkouts: number, totalDuration: number, averageDuration: number}>`
      SELECT 
        COUNT(*)::integer as "totalWorkouts",
        COALESCE(SUM(duration_minutes), 0)::integer as "totalDuration",
        COALESCE(AVG(duration_minutes), 0)::integer as "averageDuration"
      FROM workout_sessions 
      WHERE user_id = ${auth.userID} 
        AND completed_at IS NOT NULL
        AND started_at >= ${startDate}
    `;

    const weekStats = await workoutsDB.queryRow<{workoutsThisWeek: number}>`
      SELECT COUNT(*)::integer as "workoutsThisWeek"
      FROM workout_sessions 
      WHERE user_id = ${auth.userID} 
        AND completed_at IS NOT NULL
        AND started_at >= NOW() - INTERVAL '7 days'
    `;

    const monthStats = await workoutsDB.queryRow<{workoutsThisMonth: number}>`
      SELECT COUNT(*)::integer as "workoutsThisMonth"
      FROM workout_sessions 
      WHERE user_id = ${auth.userID} 
        AND completed_at IS NOT NULL
        AND started_at >= NOW() - INTERVAL '30 days'
    `;

    const dayStats = await workoutsDB.queryRow<{mostActiveDay: string}>`
      SELECT COALESCE(
        (SELECT TO_CHAR(started_at, 'Day')
         FROM workout_sessions 
         WHERE user_id = ${auth.userID} 
           AND completed_at IS NOT NULL
           AND started_at >= ${startDate}
         GROUP BY EXTRACT(DOW FROM started_at), TO_CHAR(started_at, 'Day')
         ORDER BY COUNT(*) DESC
         LIMIT 1), 'Monday'
      ) as "mostActiveDay"
    `;

    const popularExercises: Array<{exerciseName: string, count: number}> = [];
    for await (const row of workoutsDB.query<{exerciseName: string, count: number}>`
      SELECT e.name as "exerciseName", COUNT(*)::integer as count
      FROM session_exercises se
      JOIN exercises e ON se.exercise_id = e.id
      JOIN workout_sessions ws ON se.session_id = ws.id
      WHERE ws.user_id = ${auth.userID}
        AND ws.completed_at IS NOT NULL
        AND ws.started_at >= ${startDate}
      GROUP BY e.name
      ORDER BY COUNT(*) DESC
      LIMIT 5
    `) {
      popularExercises.push(row);
    }

    return {
      totalWorkouts: totalStats?.totalWorkouts || 0,
      totalDuration: totalStats?.totalDuration || 0,
      averageDuration: totalStats?.averageDuration || 0,
      workoutsThisWeek: weekStats?.workoutsThisWeek || 0,
      workoutsThisMonth: monthStats?.workoutsThisMonth || 0,
      mostActiveDay: dayStats?.mostActiveDay?.trim() || 'Monday',
      popularExercises,
    };
  }
);
