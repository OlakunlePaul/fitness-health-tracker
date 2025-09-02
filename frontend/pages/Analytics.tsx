import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Activity, Target, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Analytics() {
  const { backend } = useAuth();

  const { data: workoutStats } = useQuery({
    queryKey: ['workoutStats', 30],
    queryFn: () => backend.analytics.getWorkoutStats({ days: 30 }),
  });

  const { data: nutritionStats } = useQuery({
    queryKey: ['nutritionStats', 30],
    queryFn: () => backend.analytics.getNutritionStats({ days: 30 }),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive insights into your fitness and nutrition progress.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workouts">Workout Analytics</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workoutStats?.totalWorkouts || 0}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workoutStats?.totalDuration || 0}m</div>
                <p className="text-xs text-muted-foreground">Exercise time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meals Logged</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nutritionStats?.totalMealsLogged || 0}</div>
                <p className="text-xs text-muted-foreground">Food entries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Daily Calories</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nutritionStats?.averageDailyCalories || 0}</div>
                <p className="text-xs text-muted-foreground">Calorie intake</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workout Summary</CardTitle>
                <CardDescription>Your workout performance overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>This Week</span>
                  <Badge variant="default">{workoutStats?.workoutsThisWeek || 0} workouts</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>This Month</span>
                  <Badge variant="secondary">{workoutStats?.workoutsThisMonth || 0} workouts</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average Duration</span>
                  <span className="font-medium">{workoutStats?.averageDuration || 0} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Most Active Day</span>
                  <span className="font-medium">{workoutStats?.mostActiveDay || 'Monday'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nutrition Summary</CardTitle>
                <CardDescription>Your nutrition tracking overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {nutritionStats?.averageDailyProtein || 0}g
                    </p>
                    <p className="text-sm text-muted-foreground">Protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">
                      {nutritionStats?.averageDailyCarbs || 0}g
                    </p>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">
                      {nutritionStats?.averageDailyFat || 0}g
                    </p>
                    <p className="text-sm text-muted-foreground">Fat</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Most Logged Meal</span>
                  <Badge variant="outline" className="capitalize">
                    {nutritionStats?.mostLoggedMealType || 'breakfast'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Popular Exercises</span>
                </CardTitle>
                <CardDescription>Your most frequently performed exercises</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workoutStats?.popularExercises.map((exercise, index) => (
                    <div key={exercise.exerciseName} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <span>{exercise.exerciseName}</span>
                      </div>
                      <Badge variant="secondary">{exercise.count} times</Badge>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-8">
                      No exercise data available yet. Complete some workouts to see insights!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Workout Frequency</span>
                </CardTitle>
                <CardDescription>Your workout consistency metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {workoutStats?.workoutsThisWeek || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">This Week</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {workoutStats?.workoutsThisMonth || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">This Month</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Total Duration</span>
                    <span className="font-medium">{workoutStats?.totalDuration || 0} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average per Workout</span>
                    <span className="font-medium">{workoutStats?.averageDuration || 0} minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Top Foods</span>
                </CardTitle>
                <CardDescription>Your most frequently logged foods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nutritionStats?.topFoods.map((food, index) => (
                    <div key={food.foodName} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <span>{food.foodName}</span>
                      </div>
                      <Badge variant="secondary">{food.count} times</Badge>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-8">
                      No nutrition data available yet. Start logging meals to see insights!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Weekly Nutrition Trend</span>
                </CardTitle>
                <CardDescription>Your nutrition over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nutritionStats?.weeklyTrend.slice(0, 7).map((day) => (
                    <div key={day.date} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-sm text-muted-foreground">{day.calories} cal</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-blue-600">{day.protein}g protein</div>
                        <div className="text-green-600">{day.carbs}g carbs</div>
                        <div className="text-purple-600">{day.fat}g fat</div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-8">
                      No recent nutrition data available.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
