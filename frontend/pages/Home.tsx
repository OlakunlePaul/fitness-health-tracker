import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Dumbbell, 
  Apple, 
  BarChart3, 
  User, 
  Play, 
  Plus, 
  TrendingUp,
  Target,
  Clock,
  Flame
} from 'lucide-react';
import backend from '~backend/client';
import { formatDate, formatDuration } from '../utils/date';

export function Home() {
  const userId = 1;
  const today = new Date().toISOString().split('T')[0];

  const { data: workoutStats } = useQuery({
    queryKey: ['workoutStats', userId, 7],
    queryFn: () => backend.analytics.getWorkoutStats({ userId, days: 7 }),
  });

  const { data: nutritionStats } = useQuery({
    queryKey: ['nutritionStats', userId, 7],
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

  const { data: templates } = useQuery({
    queryKey: ['workoutTemplates', userId],
    queryFn: () => backend.workouts.listTemplates({ userId }),
  });

  const quickActions = [
    {
      title: 'Start Quick Workout',
      description: 'Begin a workout session',
      icon: Play,
      href: '/workouts',
      color: 'bg-blue-500',
    },
    {
      title: 'Log Food',
      description: 'Track your nutrition',
      icon: Plus,
      href: '/nutrition',
      color: 'bg-green-500',
    },
    {
      title: 'View Analytics',
      description: 'Check your progress',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-purple-500',
    },
  ];

  const navigationCards = [
    {
      title: 'Workouts',
      description: 'Plan and track your workout routines',
      icon: Dumbbell,
      href: '/workouts',
      stats: `${workoutStats?.totalWorkouts || 0} total workouts`,
    },
    {
      title: 'Nutrition',
      description: 'Monitor your daily nutrition intake',
      icon: Apple,
      href: '/nutrition',
      stats: `${nutritionStats?.totalMealsLogged || 0} meals logged`,
    },
    {
      title: 'Analytics',
      description: 'View detailed fitness insights',
      icon: BarChart3,
      href: '/analytics',
      stats: 'Comprehensive insights',
    },
    {
      title: 'Profile',
      description: 'Manage your profile and goals',
      icon: User,
      href: '/profile',
      stats: 'Personal information',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Activity className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">FitTracker</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your complete fitness companion for tracking workouts, nutrition, and progress
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workoutStats?.workoutsThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">Workouts completed</p>
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
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workoutStats?.totalDuration ? `${workoutStats.totalDuration}m` : '0m'}
            </div>
            <p className="text-xs text-muted-foreground">Exercise time this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nutritionStats?.averageDailyCalories || 0}
            </div>
            <p className="text-xs text-muted-foreground">Calories per day</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with these common actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} to={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="flex items-center space-x-4 p-6">
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {navigationCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <span>{card.title}</span>
                  </CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{card.stats}</Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
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
              {recentSessions?.sessions.slice(0, 3).map((session) => (
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
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-3">No workouts yet</p>
                  <Link to="/workouts">
                    <Button size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Start Your First Workout
                    </Button>
                  </Link>
                </div>
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
                        {Math.round(todayNutrition.totalProtein)}g
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
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-3">No meals logged today</p>
                      <Link to="/nutrition">
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Log Your First Meal
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workout Templates Preview */}
      {templates && templates.templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Workout Templates</span>
              <Link to="/workouts">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardTitle>
            <CardDescription>Quick access to your favorite workouts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.templates.slice(0, 3).map((template) => (
                <Card key={template.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      {template.category && (
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                    )}
                    {template.estimatedDurationMinutes && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(template.estimatedDurationMinutes)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Activity className="h-16 w-16 text-primary mb-4" />
          <h2 className="text-2xl font-bold text-center mb-2">Ready to Start Your Fitness Journey?</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Track your workouts, monitor your nutrition, and achieve your fitness goals with FitTracker.
          </p>
          <div className="flex space-x-4">
            <Link to="/workouts">
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Start a Workout
              </Button>
            </Link>
            <Link to="/nutrition">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Meal
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
