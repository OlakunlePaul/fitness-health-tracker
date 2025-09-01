import { api } from "encore.dev/api";
import { fitnessDB } from "./db";
import type { NutritionLog } from "./types";

export interface AddNutritionRequest {
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
}

// Logs a nutrition entry for a specific meal.
export const addNutrition = api<AddNutritionRequest, NutritionLog>(
  { expose: true, method: "POST", path: "/nutrition" },
  async (req) => {
    const nutritionLog = await fitnessDB.queryRow<NutritionLog>`
      INSERT INTO nutrition_logs (
        date_logged, meal_type, food_name, serving_size, calories,
        protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg
      )
      VALUES (
        ${req.date_logged}, ${req.meal_type}, ${req.food_name}, ${req.serving_size}, 
        ${req.calories}, ${req.protein_g}, ${req.carbs_g}, ${req.fat_g}, 
        ${req.fiber_g}, ${req.sugar_g}, ${req.sodium_mg}
      )
      RETURNING id, date_logged, meal_type, food_name, serving_size, calories,
                protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, created_at
    `;

    if (!nutritionLog) {
      throw new Error("Failed to create nutrition log");
    }

    return nutritionLog;
  }
);
