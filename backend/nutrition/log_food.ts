import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { nutritionDB } from "./db";

export interface LogFoodRequest {
  foodId: number;
  servingSizeGrams: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  loggedAt?: Date;
  notes?: string;
}

export interface NutritionLog {
  id: number;
  userId: string;
  foodId: number;
  servingSizeGrams: number;
  mealType: string;
  loggedAt: Date;
  notes?: string;
  createdAt: Date;
}

// Logs a food item for the authenticated user.
export const logFood = api<LogFoodRequest, NutritionLog>(
  { expose: true, method: "POST", path: "/nutrition/logs", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    const log = await nutritionDB.queryRow<NutritionLog>`
      INSERT INTO nutrition_logs (user_id, food_id, serving_size_grams, meal_type, logged_at, notes)
      VALUES (${auth.userID}, ${req.foodId}, ${req.servingSizeGrams}, ${req.mealType}, ${req.loggedAt || new Date()}, ${req.notes})
      RETURNING id, user_id as "userId", food_id as "foodId", 
                serving_size_grams as "servingSizeGrams", meal_type as "mealType",
                logged_at as "loggedAt", notes, created_at as "createdAt"
    `;
    
    return log!;
  }
);
