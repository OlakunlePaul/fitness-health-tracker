import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Apple, Target, TrendingUp } from 'lucide-react';
import backend from '~backend/client';
import { formatDate } from '../utils/date';
import { LogFoodDialog } from '../components/LogFoodDialog';

export function Nutrition() {
  const [showLogDialog, setShowLogDialog] = useState(false);
  const userId = 1;
  const today = new Date().toISOString().split('T')[0];

  const { data: todayLogs } = useQuery({
    queryKey: ['dailyLogs', userId, today],
    queryFn: () => backend.nutrition.getDailyLogs({ userId, date: today }),
  });

  const { data: nutritionStats } = useQuery({
    queryKey: ['nutritionStats', userId],
    queryFn: () => backend.analytics.getNutritionStats({ userId, days: 7 }),
  });

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

  const getMealsByType = (mealType: string) => {
    return todayLogs?.logs.filter(log => log.mealType === mealType) || [];
  };

  const getMealCalories = (mealType: string) => {
    return getMealsByType(mealType).reduce((total, log) => total + log.calories, 0);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nutrition</h1>
          <p className="text-muted-foreground mt-2">
            Track your daily nutrition and reach your goals.
          </p>
        </div>
        <Button onClick={() => setShowLogDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Food
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Calories</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayLogs?.totalCalories || 0}</div>
            <p className="text-xs text-muted-foreground">
              {todayLogs?.logs.length || 0} items logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protein</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayLogs?.totalProtein || 0}g</div>
            <p className="text-xs text-muted-foreground">
              {nutritionStats?.averageDailyProtein || 0}g weekly avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbohydrates</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayLogs?.totalCarbs || 0}g</div>
            <p className="text-xs text-muted-foreground">
              {nutritionStats?.averageDailyCarbs || 0}g weekly avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fat</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayLogs?.totalFat || 0}g</div>
            <p className="text-xs text-muted-foreground">
              {nutritionStats?.averageDailyFat || 0}g weekly avg
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-6">
        <TabsList>
          <TabsTrigger value="today">Today's Log</TabsTrigger>
          <TabsTrigger value="trends">Weekly Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mealTypes.map((mealType) => {
              const meals = getMealsByType(mealType);
              const calories = getMealCalories(mealType);

              return (
                <Card key={mealType}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">{mealType}</span>
                      <Badge variant="outline">{calories} cal</Badge>
                    </CardTitle>
                    <CardDescription>
                      {meals.length} item{meals.length !== 1 ? 's' : ''} logged
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {meals.map((log) => (
                        <div key={log.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{log.foodName}</p>
                            <p className="text-sm text-muted-foreground">
                              {log.servingSizeGrams}g
                              {log.brand && ` • ${log.brand}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{Math.round(log.calories)} cal</p>
                            <p className="text-sm text-muted-foreground">
                              {Math.round(log.protein)}g protein
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {meals.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">
                          No items logged for {mealType}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Nutrition Overview</CardTitle>
              <CardDescription>Your nutrition trends over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {nutritionStats?.averageDailyCalories || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Daily Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {nutritionStats?.averageDailyProtein || 0}g
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Daily Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {nutritionStats?.averageDailyCarbs || 0}g
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Daily Carbs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {nutritionStats?.averageDailyFat || 0}g
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Daily Fat</p>
                </div>
              </div>

              {nutritionStats?.topFoods && nutritionStats.topFoods.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Most Logged Foods</h4>
                  <div className="space-y-2">
                    {nutritionStats.topFoods.map((food, index) => (
                      <div key={food.foodName} className="flex items-center justify-between">
                        <span>{food.foodName}</span>
                        <Badge variant="secondary">{food.count} times</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <LogFoodDialog
        open={showLogDialog}
        onOpenChange={setShowLogDialog}
        userId={userId}
      />
    </div>
  );
}
