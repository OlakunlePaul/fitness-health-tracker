import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { fitnessDB } from "./db";
import type { NutritionLog } from "./types";

interface ListNutritionParams {
  date?: Query<string>;
}

export interface ListNutritionResponse {
  logs: NutritionLog[];
  totals: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sugar_g: number;
    sodium_mg: number;
  };
}

// Retrieves nutrition logs for a specific date with daily totals.
export const listNutrition = api<ListNutritionParams, ListNutritionResponse>(
  { expose: true, method: "GET", path: "/nutrition" },
  async ({ date }) => {
    const whereClause = date ? `WHERE date_logged = '${date}'` : '';
    
    const logs = await fitnessDB.queryAll<NutritionLog>`
      SELECT id, date_logged, meal_type, food_name, serving_size, calories,
             protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, created_at
      FROM nutrition_logs
      ${whereClause}
      ORDER BY date_logged DESC, meal_type, created_at
    `;
    
    const totals = logs.reduce((acc, log) => ({
      calories: acc.calories + log.calories,
      protein_g: acc.protein_g + (log.protein_g || 0),
      carbs_g: acc.carbs_g + (log.carbs_g || 0),
      fat_g: acc.fat_g + (log.fat_g || 0),
      fiber_g: acc.fiber_g + (log.fiber_g || 0),
      sugar_g: acc.sugar_g + (log.sugar_g || 0),
      sodium_mg: acc.sodium_mg + (log.sodium_mg || 0),
    }), {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      sugar_g: 0,
      sodium_mg: 0,
    });
    
    return { logs, totals };
  }
);
