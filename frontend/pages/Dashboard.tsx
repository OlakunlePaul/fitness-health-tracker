import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dumbbell, Apple, Target, TrendingUp, Clock, Flame, Calendar, Activity, Plus, Play, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatDuration } from '../utils/date';

export function Dashboard() {
  const today = new Date().toISOString().split('T')[0];
  const { backend } = useAuth();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => backend.users.get(),
    retry: false,
  });

  const { data: workoutStats } = useQuery({
    queryKey: ['workoutStats'],
    queryFn: () => backend.analytics.getWorkoutStats({ days: 7 }),
    enabled: !!user,
  });

  const { data: nutritionStats } = useQuery({
    queryKey: ['nutritionStats'],
    queryFn: () => backend.analytics.getNutritionStats({ days: 7 }),
    enabled: !!user,
  });

  const { data: recentSessions } = useQuery({
    queryKey: ['recentSessions'],
    queryFn: () => backend.workouts.listSessions(),
    enabled: !!user,
  });

  const { data: todayNutrition } = useQuery({
    queryKey: ['todayNutrition', today],
    queryFn: () => backend.nutrition.getDailyLogs({ date: today }),
    enabled: !!user,
  });

  const { data: workoutTemplates } = useQuery({
    queryKey: ['workoutTemplates'],
    queryFn: () => backend.workouts.listTemplates(),
    enabled: !!user,
  });

  // Show profile creation prompt if user doesn't exist
  if (!user) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Welcome to FitTracker</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started by creating your profile to access your personalized dashboard.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-16 w-16 text-primary mb-6" />
            <h2 className="text-2xl font-bold mb-4">Create Your Profile</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              To access your dashboard and start tracking your fitness journey, you'll need to create a profile first.
            </p>
            <Button asChild size="lg">
              <Link to="/profile">
                <User className="h-5 w-5 mr-2" />
                Create Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Dumbbell className="h-5 w-5" />
                <span>Track Workouts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Create workout templates, log your sessions, and track your exercise progress over time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Apple className="h-5 w-5" />
                <span>Monitor Nutrition</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Log your meals, track macronutrients, and monitor your daily calorie intake.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>View Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get detailed insights into your fitness progress with comprehensive analytics and charts.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Set Goals</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Define your fitness goals and track your progress towards achieving them.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate daily calorie goal progress (assuming 2000 cal goal)
  const calorieGoal = 2000;
  const calorieProgress = todayNutrition ? (todayNutrition.totalCalories / calorieGoal) * 100 : 0;

  // Calculate weekly workout goal progress (assuming 3 workouts/week goal)
  const weeklyWorkoutGoal = 3;
  const workoutProgress = workoutStats ? (workoutStats.workoutsThisWeek / weeklyWorkoutGoal) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Welcome back, {user.name}!</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your complete fitness companion for tracking workouts, nutrition, and progress. 
          Keep up the great work on your fitness journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/workouts">
              <Play className="h-5 w-5 mr-2" />
              Start Workout
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/nutrition">
              <Plus className="h-5 w-5 mr-2" />
              Log Food
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts This Week</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workoutStats?.workoutsThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">
              Goal: {weeklyWorkoutGoal} workouts
            </p>
            <Progress value={Math.min(workoutProgress, 100)} className="mt-2" />
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
              Goal: {calorieGoal} calories
            </p>
            <Progress value={Math.min(calorieProgress, 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exercise Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workoutStats?.totalDuration ? `${workoutStats.totalDuration}m` : '0m'}
            </div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {nutritionStats?.averageDailyCalories ? `${Math.round(nutritionStats.averageDailyCalories)}` : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Calories per day</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Today's Goals</span>
            </CardTitle>
            <CardDescription>Track your daily fitness targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Calorie Intake</span>
                <span className="text-sm text-muted-foreground">
                  {todayNutrition?.totalCalories || 0} / {calorieGoal}
                </span>
              </div>
              <Progress value={Math.min(calorieProgress, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Weekly Workouts</span>
                <span className="text-sm text-muted-foreground">
                  {workoutStats?.workoutsThisWeek || 0} / {weeklyWorkoutGoal}
                </span>
              </div>
              <Progress value={Math.min(workoutProgress, 100)} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">
                  {todayNutrition?.totalProtein || 0}g
                </p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">
                  {todayNutrition?.totalCarbs || 0}g
                </p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600">
                  {todayNutrition?.totalFat || 0}g
                </p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>Jump into your fitness activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button asChild className="w-full justify-start h-auto p-4">
                <Link to="/workouts">
                  <div className="flex items-center space-x-3">
                    <Play className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Start Quick Workout</p>
                      <p className="text-sm text-muted-foreground">Begin an unplanned session</p>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start h-auto p-4">
                <Link to="/nutrition">
                  <div className="flex items-center space-x-3">
                    <Apple className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Log Your Meal</p>
                      <p className="text-sm text-muted-foreground">Track what you're eating</p>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start h-auto p-4">
                <Link to="/analytics">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">View Progress</p>
                      <p className="text-sm text-muted-foreground">Check your fitness analytics</p>
                    </div>
                  </div>
                </Link>
              </Button>
            </div>

            {workoutTemplates?.templates && workoutTemplates.templates.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Workout Templates</h4>
                <div className="space-y-2">
                  {workoutTemplates.templates.slice(0, 3).map((template) => (
                    <Button
                      key={template.id}
                      asChild
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <Link to="/workouts">
                        <Dumbbell className="h-4 w-4 mr-2" />
                        {template.name}
                        {template.estimatedDurationMinutes && (
                          <Badge variant="secondary" className="ml-auto">
                            {template.estimatedDurationMinutes}m
                          </Badge>
                        )}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Today's Nutrition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Dumbbell className="h-5 w-5" />
                <span>Recent Workouts</span>
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/workouts">View All</Link>
              </Button>
            </div>
            <CardDescription>Your latest workout sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSessions?.sessions.slice(0, 4).map((session) => (
                <div key={session.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{session.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(session.startedAt)}
                    </p>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    {session.completedAt ? (
                      <Badge variant="default" className="text-xs">Completed</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">In Progress</Badge>
                    )}
                    {session.durationMinutes && (
                      <span className="text-sm text-muted-foreground">
                        {formatDuration(session.durationMinutes)}
                      </span>
                    )}
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No workouts yet</p>
                  <Button asChild>
                    <Link to="/workouts">
                      <Play className="h-4 w-4 mr-2" />
                      Start Your First Workout
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Nutrition */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Apple className="h-5 w-5" />
                <span>Today's Nutrition</span>
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/nutrition">View All</Link>
              </Button>
            </div>
            <CardDescription>Your meals and nutrition for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayNutrition && todayNutrition.logs.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {todayNutrition.totalCalories}
                      </p>
                      <p className="text-sm text-muted-foreground">Calories</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round(todayNutrition.totalProtein)}g
                      </p>
                      <p className="text-sm text-muted-foreground">Protein</p>
                    </div>
                  </div>
                  
                  {todayNutrition.logs.slice(0, 4).map((log) => (
                    <div key={log.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{log.foodName}</p>
                        <p className="text-sm text-muted-foreground">
                          <span className="capitalize">{log.mealType}</span> • {log.servingSizeGrams}g
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{Math.round(log.calories)} cal</p>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <Apple className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No meals logged today</p>
                  <Button asChild>
                    <Link to="/nutrition">
                      <Plus className="h-4 w-4 mr-2" />
                      Log Your First Meal
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Summary */}
      {(workoutStats || nutritionStats) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Weekly Summary</span>
            </CardTitle>
            <CardDescription>Your fitness overview for this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {workoutStats?.workoutsThisWeek || 0}
                </div>
                <p className="text-sm text-muted-foreground">Workouts Completed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {workoutStats?.totalDuration ? `${workoutStats.totalDuration}m` : '0m'}
                </div>
                <p className="text-sm text-muted-foreground">Total Exercise Time</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {nutritionStats?.averageDailyCalories ? Math.round(nutritionStats.averageDailyCalories) : 0}
                </div>
                <p className="text-sm text-muted-foreground">Avg Daily Calories</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {workoutStats?.mostActiveDay || 'Monday'}
                </div>
                <p className="text-sm text-muted-foreground">Most Active Day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
