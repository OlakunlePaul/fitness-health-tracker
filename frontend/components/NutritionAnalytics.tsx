import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns';
import type { NutritionLog } from '~backend/fitness/types';

interface NutritionAnalyticsProps {
  stats: {
    averageDailyCalories: number;
    averageDailyProtein: number;
    averageDailyCarbs: number;
    averageDailyFat: number;
    daysLogged: number;
  };
  nutritionLogs: NutritionLog[];
}

export default function NutritionAnalytics({ stats, nutritionLogs }: NutritionAnalyticsProps) {
  const last14Days = eachDayOfInterval({
    start: subDays(new Date(), 13),
    end: new Date(),
  });

  const dailyData = last14Days.map((day) => {
    const dayString = format(day, 'yyyy-MM-dd');
    const logsForDay = nutritionLogs.filter((log) => log.date_logged === dayString);
    
    const totals = logsForDay.reduce((acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + (log.protein_g || 0),
      carbs: acc.carbs + (log.carbs_g || 0),
      fat: acc.fat + (log.fat_g || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return {
      date: format(day, 'MMM d'),
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{Math.round(stats.averageDailyCalories)}</div>
          <p className="text-sm text-muted-foreground">Avg Daily Calories</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{stats.daysLogged}</div>
          <p className="text-sm text-muted-foreground">Days Logged</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Daily Calorie Intake (Last 14 Days)</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis 
                className="text-muted-foreground"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="calories" 
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">{Math.round(stats.averageDailyProtein)}g</div>
          <p className="text-xs text-muted-foreground">Avg Protein</p>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">{Math.round(stats.averageDailyCarbs)}g</div>
          <p className="text-xs text-muted-foreground">Avg Carbs</p>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600">{Math.round(stats.averageDailyFat)}g</div>
          <p className="text-xs text-muted-foreground">Avg Fat</p>
        </div>
      </div>
    </div>
  );
}
