import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const nutritionDB = SQLDatabase.named("nutrition");

interface GetNutritionStatsParams {
  days?: number;
}

export interface NutritionStats {
  averageDailyCalories: number;
  averageDailyProtein: number;
  averageDailyCarbs: number;
  averageDailyFat: number;
  totalMealsLogged: number;
  mostLoggedMealType: string;
  topFoods: Array<{
    foodName: string;
    count: number;
  }>;
  weeklyTrend: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

// Retrieves nutrition statistics for the authenticated user.
export const getNutritionStats = api<GetNutritionStatsParams, NutritionStats>(
  { expose: true, method: "GET", path: "/analytics/nutrition", auth: true },
  async (params) => {
    const auth = getAuthData()!;
    const days = params.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const avgStats = await nutritionDB.queryRow<{
      averageDailyCalories: number,
      averageDailyProtein: number,
      averageDailyCarbs: number,
      averageDailyFat: number
    }>`
      SELECT 
        COALESCE(AVG(daily_calories), 0)::integer as "averageDailyCalories",
        COALESCE(AVG(daily_protein), 0)::integer as "averageDailyProtein",
        COALESCE(AVG(daily_carbs), 0)::integer as "averageDailyCarbs",
        COALESCE(AVG(daily_fat), 0)::integer as "averageDailyFat"
      FROM (
        SELECT 
          DATE(nl.logged_at) as log_date,
          SUM(f.calories_per_100g * nl.serving_size_grams / 100) as daily_calories,
          SUM(f.protein_per_100g * nl.serving_size_grams / 100) as daily_protein,
          SUM(f.carbs_per_100g * nl.serving_size_grams / 100) as daily_carbs,
          SUM(f.fat_per_100g * nl.serving_size_grams / 100) as daily_fat
        FROM nutrition_logs nl
        JOIN foods f ON nl.food_id = f.id
        WHERE nl.user_id = ${auth.userID} AND nl.logged_at >= ${startDate}
        GROUP BY DATE(nl.logged_at)
      ) daily_totals
    `;

    const totalMeals = await nutritionDB.queryRow<{totalMealsLogged: number}>`
      SELECT COUNT(*)::integer as "totalMealsLogged"
      FROM nutrition_logs 
      WHERE user_id = ${auth.userID} AND logged_at >= ${startDate}
    `;

    const mostMealType = await nutritionDB.queryRow<{mostLoggedMealType: string}>`
      SELECT COALESCE(
        (SELECT meal_type
         FROM nutrition_logs 
         WHERE user_id = ${auth.userID} AND logged_at >= ${startDate}
         GROUP BY meal_type
         ORDER BY COUNT(*) DESC
         LIMIT 1), 'breakfast'
      ) as "mostLoggedMealType"
    `;

    const topFoods: Array<{foodName: string, count: number}> = [];
    for await (const row of nutritionDB.query<{foodName: string, count: number}>`
      SELECT f.name as "foodName", COUNT(*)::integer as count
      FROM nutrition_logs nl
      JOIN foods f ON nl.food_id = f.id
      WHERE nl.user_id = ${auth.userID} AND nl.logged_at >= ${startDate}
      GROUP BY f.name
      ORDER BY COUNT(*) DESC
      LIMIT 5
    `) {
      topFoods.push(row);
    }

    const weeklyTrend: Array<{date: string, calories: number, protein: number, carbs: number, fat: number}> = [];
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    for await (const row of nutritionDB.query<{date: string, calories: number, protein: number, carbs: number, fat: number}>`
      SELECT 
        DATE(nl.logged_at)::text as date,
        COALESCE(SUM(f.calories_per_100g * nl.serving_size_grams / 100), 0)::integer as calories,
        COALESCE(SUM(f.protein_per_100g * nl.serving_size_grams / 100), 0)::integer as protein,
        COALESCE(SUM(f.carbs_per_100g * nl.serving_size_grams / 100), 0)::integer as carbs,
        COALESCE(SUM(f.fat_per_100g * nl.serving_size_grams / 100), 0)::integer as fat
      FROM nutrition_logs nl
      JOIN foods f ON nl.food_id = f.id
      WHERE nl.user_id = ${auth.userID} AND nl.logged_at >= ${last7Days}
      GROUP BY DATE(nl.logged_at)
      ORDER BY DATE(nl.logged_at) DESC
      LIMIT 7
    `) {
      weeklyTrend.push(row);
    }

    return {
      averageDailyCalories: avgStats?.averageDailyCalories || 0,
      averageDailyProtein: avgStats?.averageDailyProtein || 0,
      averageDailyCarbs: avgStats?.averageDailyCarbs || 0,
      averageDailyFat: avgStats?.averageDailyFat || 0,
      totalMealsLogged: totalMeals?.totalMealsLogged || 0,
      mostLoggedMealType: mostMealType?.mostLoggedMealType || 'breakfast',
      topFoods,
      weeklyTrend,
    };
  }
);
