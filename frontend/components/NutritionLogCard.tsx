import React from 'react';
import type { NutritionLog } from '~backend/fitness/types';

interface NutritionLogCardProps {
  log: NutritionLog;
}

export default function NutritionLogCard({ log }: NutritionLogCardProps) {
  return (
    <div className="p-3 border rounded-lg">
      <h4 className="font-medium text-sm">{log.food_name}</h4>
      <p className="text-xs text-muted-foreground">{log.serving_size}</p>
      <div className="mt-1 flex justify-between text-xs">
        <span>{Math.round(log.calories)} cal</span>
        {log.protein_g && <span>P: {Math.round(log.protein_g)}g</span>}
      </div>
    </div>
  );
}
