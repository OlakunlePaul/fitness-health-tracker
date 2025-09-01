import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfWeek, eachWeekOfInterval, subWeeks } from 'date-fns';
import type { WorkoutLogWithExercises } from '~backend/fitness/types';

interface WorkoutAnalyticsProps {
  stats: {
    totalWorkouts: number;
    averageRating: number;
    totalDurationMinutes: number;
    workoutsThisWeek: number;
    workoutsThisMonth: number;
  };
  workoutLogs: WorkoutLogWithExercises[];
}

export default function WorkoutAnalytics({ stats, workoutLogs }: WorkoutAnalyticsProps) {
  const last8Weeks = eachWeekOfInterval({
    start: subWeeks(new Date(), 7),
    end: new Date(),
  });

  const weeklyData = last8Weeks.map((weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const workoutsInWeek = workoutLogs.filter((log) => {
      const logDate = parseISO(log.date_performed);
      return logDate >= weekStart && logDate <= weekEnd;
    });

    return {
      week: format(weekStart, 'MMM d'),
      workouts: workoutsInWeek.length,
      totalDuration: workoutsInWeek.reduce((sum, log) => sum + (log.duration_minutes || 0), 0),
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{stats.totalWorkouts}</div>
          <p className="text-sm text-muted-foreground">Total Workouts</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{stats.averageRating.toFixed(1)}</div>
          <p className="text-sm text-muted-foreground">Avg Rating</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Weekly Workout Frequency</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="week" 
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
              <Bar 
                dataKey="workouts" 
                fill="hsl(var(--primary))"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-lg font-semibold">{stats.workoutsThisWeek}</div>
          <p className="text-xs text-muted-foreground">This Week</p>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold">{Math.round(stats.totalDurationMinutes / 60)}h</div>
          <p className="text-xs text-muted-foreground">Total Time</p>
        </div>
      </div>
    </div>
  );
}
