import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { nutritionDB } from "./db";

export interface Food {
  id: number;
  name: string;
  brand?: string;
  servingSize?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  sugarPer100g: number;
  sodiumPer100g: number;
  createdAt: Date;
}

interface SearchFoodsParams {
  query: Query<string>;
}

export interface SearchFoodsResponse {
  foods: Food[];
}

// Searches for foods by name.
export const searchFoods = api<SearchFoodsParams, SearchFoodsResponse>(
  { expose: true, method: "GET", path: "/nutrition/foods/search" },
  async (params) => {
    const foods: Food[] = [];
    const searchTerm = `%${params.query}%`;
    
    for await (const row of nutritionDB.query<Food>`
      SELECT id, name, brand, serving_size as "servingSize", 
             calories_per_100g as "caloriesPer100g", protein_per_100g as "proteinPer100g",
             carbs_per_100g as "carbsPer100g", fat_per_100g as "fatPer100g",
             fiber_per_100g as "fiberPer100g", sugar_per_100g as "sugarPer100g",
             sodium_per_100g as "sodiumPer100g", created_at as "createdAt"
      FROM foods 
      WHERE name ILIKE ${searchTerm} OR brand ILIKE ${searchTerm}
      ORDER BY name
      LIMIT 20
    `) {
      foods.push(row);
    }
    
    return { foods };
  }
);
