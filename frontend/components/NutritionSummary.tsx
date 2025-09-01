import React from 'react';

interface NutritionSummaryProps {
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

export default function NutritionSummary({ totals }: NutritionSummaryProps) {
  const macros = [
    { name: 'Protein', value: totals.protein_g, unit: 'g', color: 'bg-blue-500' },
    { name: 'Carbs', value: totals.carbs_g, unit: 'g', color: 'bg-green-500' },
    { name: 'Fat', value: totals.fat_g, unit: 'g', color: 'bg-yellow-500' },
  ];

  const totalMacroCalories = (totals.protein_g * 4) + (totals.carbs_g * 4) + (totals.fat_g * 9);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-3xl font-bold text-foreground">{Math.round(totals.calories)}</div>
        <p className="text-sm text-muted-foreground">Total Calories</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {macros.map((macro) => (
          <div key={macro.name} className="text-center">
            <div className="text-lg font-semibold">{Math.round(macro.value)}{macro.unit}</div>
            <p className="text-xs text-muted-foreground">{macro.name}</p>
            {totalMacroCalories > 0 && (
              <div className="mt-1">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${macro.color}`}
                    style={{
                      width: `${((macro.value * (macro.name === 'Fat' ? 9 : 4)) / totalMacroCalories) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-sm font-medium">{Math.round(totals.fiber_g)}g</div>
          <p className="text-xs text-muted-foreground">Fiber</p>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium">{Math.round(totals.sodium_mg)}mg</div>
          <p className="text-xs text-muted-foreground">Sodium</p>
        </div>
      </div>
    </div>
  );
}
