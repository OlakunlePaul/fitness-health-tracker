import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { nutritionDB } from "./db";

interface GetDailyLogsParams {
  date: string;
}

export interface DailyLogEntry {
  id: number;
  foodId: number;
  foodName: string;
  brand?: string;
  servingSizeGrams: number;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  loggedAt: Date;
  notes?: string;
}

export interface GetDailyLogsResponse {
  logs: DailyLogEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
}

// Retrieves nutrition logs for a specific date for the authenticated user.
export const getDailyLogs = api<GetDailyLogsParams, GetDailyLogsResponse>(
  { expose: true, method: "GET", path: "/nutrition/logs/:date", auth: true },
  async (params) => {
    const auth = getAuthData()!;
    const logs: DailyLogEntry[] = [];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;

    const startDate = new Date(params.date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    
    for await (const row of nutritionDB.query<DailyLogEntry>`
      SELECT nl.id, nl.food_id as "foodId", f.name as "foodName", f.brand,
             nl.serving_size_grams as "servingSizeGrams", nl.meal_type as "mealType",
             (f.calories_per_100g * nl.serving_size_grams / 100) as calories,
             (f.protein_per_100g * nl.serving_size_grams / 100) as protein,
             (f.carbs_per_100g * nl.serving_size_grams / 100) as carbs,
             (f.fat_per_100g * nl.serving_size_grams / 100) as fat,
             (f.fiber_per_100g * nl.serving_size_grams / 100) as fiber,
             (f.sugar_per_100g * nl.serving_size_grams / 100) as sugar,
             (f.sodium_per_100g * nl.serving_size_grams / 100) as sodium,
             nl.logged_at as "loggedAt", nl.notes
      FROM nutrition_logs nl
      JOIN foods f ON nl.food_id = f.id
      WHERE nl.user_id = ${auth.userID} 
        AND nl.logged_at >= ${startDate}
        AND nl.logged_at < ${endDate}
      ORDER BY nl.logged_at DESC
    `) {
      logs.push(row);
      totalCalories += row.calories;
      totalProtein += row.protein;
      totalCarbs += row.carbs;
      totalFat += row.fat;
      totalFiber += row.fiber;
      totalSugar += row.sugar;
      totalSodium += row.sodium;
    }
    
    return {
      logs,
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
      totalFiber: Math.round(totalFiber * 10) / 10,
      totalSugar: Math.round(totalSugar * 10) / 10,
      totalSodium: Math.round(totalSodium * 10) / 10,
    };
  }
);
