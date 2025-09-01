import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Apple, Target, TrendingUp, Clock, Flame } from 'lucide-react';
import backend from '~backend/client';
import { formatDate, formatDuration } from '../utils/date';

export function Dashboard() {
  const today = new Date().toISOString().split('T')[0];
  const userId = 1;

  const { data: workoutStats } = useQuery({
    queryKey: ['workoutStats', userId],
    queryFn: () => backend.analytics.getWorkoutStats({ userId, days: 7 }),
  });

  const { data: nutritionStats } = useQuery({
    queryKey: ['nutritionStats', userId],
    queryFn: () => backend.analytics.getNutritionStats({ userId, days: 7 }),
  });

  const { data: recentSessions } = useQuery({
    queryKey: ['recentSessions', userId],
    queryFn: () => backend.workouts.listSessions({ userId }),
  });

  const { data: todayNutrition } = useQuery({
    queryKey: ['todayNutrition', userId, today],
    queryFn: () => backend.nutrition.getDailyLogs({ userId, date: today }),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's your fitness overview for today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts This Week</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workoutStats?.workoutsThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">
              {workoutStats?.totalDuration ? `${workoutStats.totalDuration} min total` : 'No workouts yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Calories</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayNutrition?.totalCalories || 0}</div>
            <p className="text-xs text-muted-foreground">
              {todayNutrition?.logs.length || 0} meals logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Workout</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workoutStats?.averageDuration ? `${workoutStats.averageDuration}m` : '0m'}
            </div>
            <p className="text-xs text-muted-foreground">
              Most active: {workoutStats?.mostActiveDay || 'Monday'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {nutritionStats?.averageDailyCalories ? `${nutritionStats.averageDailyCalories}` : '0'} cal
            </div>
            <p className="text-xs text-muted-foreground">Daily average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Dumbbell className="h-5 w-5" />
              <span>Recent Workouts</span>
            </CardTitle>
            <CardDescription>Your latest workout sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSessions?.sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{session.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(session.startedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    {session.completedAt ? (
                      <Badge variant="default">Completed</Badge>
                    ) : (
                      <Badge variant="secondary">In Progress</Badge>
                    )}
                    {session.durationMinutes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDuration(session.durationMinutes)}
                      </p>
                    )}
                  </div>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-8">
                  No workouts yet. Start your first workout!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Apple className="h-5 w-5" />
              <span>Today's Nutrition</span>
            </CardTitle>
            <CardDescription>Your meals and nutrition for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayNutrition && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {todayNutrition.totalCalories}
                      </p>
                      <p className="text-sm text-muted-foreground">Calories</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {todayNutrition.totalProtein}g
                      </p>
                      <p className="text-sm text-muted-foreground">Protein</p>
                    </div>
                  </div>
                  
                  {todayNutrition.logs.slice(0, 3).map((log) => (
                    <div key={log.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{log.foodName}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.mealType} • {log.servingSizeGrams}g
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{Math.round(log.calories)} cal</p>
                      </div>
                    </div>
                  ))}
                  
                  {todayNutrition.logs.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No meals logged today. Start tracking your nutrition!
                    </p>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
