import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus } from 'lucide-react';
import backend from '~backend/client';
import { useToast } from '@/components/ui/use-toast';
import type { Food } from '~backend/nutrition/search_foods';
import type { LogFoodRequest } from '~backend/nutrition/log_food';

interface LogFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
}

export function LogFoodDialog({ open, onOpenChange, userId }: LogFoodDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servingSize, setServingSize] = useState('100');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: searchResults } = useQuery({
    queryKey: ['searchFoods', searchQuery],
    queryFn: () => backend.nutrition.searchFoods({ query: searchQuery }),
    enabled: searchQuery.length > 2,
  });

  const logFoodMutation = useMutation({
    mutationFn: backend.nutrition.logFood,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLogs'] });
      onOpenChange(false);
      resetForm();
      toast({
        title: "Food Logged",
        description: "Your food has been logged successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to log food:', error);
      toast({
        title: "Error",
        description: "Failed to log food. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSearchQuery('');
    setSelectedFood(null);
    setServingSize('100');
    setMealType('breakfast');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFood) {
      toast({
        title: "No food selected",
        description: "Please select a food item to log.",
        variant: "destructive",
      });
      return;
    }

    const request: LogFoodRequest = {
      userId,
      foodId: selectedFood.id,
      servingSizeGrams: parseFloat(servingSize),
      mealType,
    };

    logFoodMutation.mutate(request);
  };

  const calculateNutrition = (food: Food, grams: number) => {
    const multiplier = grams / 100;
    return {
      calories: Math.round(food.caloriesPer100g * multiplier),
      protein: Math.round(food.proteinPer100g * multiplier * 10) / 10,
      carbs: Math.round(food.carbsPer100g * multiplier * 10) / 10,
      fat: Math.round(food.fatPer100g * multiplier * 10) / 10,
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Food</DialogTitle>
          <DialogDescription>
            Search for a food item and log it to your nutrition diary.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Search Food</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Start typing to search for foods..."
                  className="pl-10"
                />
              </div>
            </div>

            {searchResults && searchResults.foods.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.foods.map((food) => (
                  <Card 
                    key={food.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedFood?.id === food.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedFood(food)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{food.name}</h4>
                          {food.brand && (
                            <p className="text-sm text-muted-foreground">{food.brand}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{food.caloriesPer100g} cal</p>
                          <p className="text-sm text-muted-foreground">per 100g</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {selectedFood && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Selected Food: {selectedFood.name}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="servingSize">Serving Size (grams)</Label>
                      <Input
                        id="servingSize"
                        type="number"
                        value={servingSize}
                        onChange={(e) => setServingSize(e.target.value)}
                        min="1"
                        max="2000"
                        step="0.1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="mealType">Meal Type</Label>
                      <Select value={mealType} onValueChange={(value) => setMealType(value as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {servingSize && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <h4 className="font-medium mb-2">Nutrition for {servingSize}g:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-orange-600">
                            {calculateNutrition(selectedFood, parseFloat(servingSize)).calories}
                          </span>
                          <br />
                          <span className="text-muted-foreground">Calories</span>
                        </div>
                        <div>
                          <span className="font-medium text-blue-600">
                            {calculateNutrition(selectedFood, parseFloat(servingSize)).protein}g
                          </span>
                          <br />
                          <span className="text-muted-foreground">Protein</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-600">
                            {calculateNutrition(selectedFood, parseFloat(servingSize)).carbs}g
                          </span>
                          <br />
                          <span className="text-muted-foreground">Carbs</span>
                        </div>
                        <div>
                          <span className="font-medium text-purple-600">
                            {calculateNutrition(selectedFood, parseFloat(servingSize)).fat}g
                          </span>
                          <br />
                          <span className="text-muted-foreground">Fat</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={logFoodMutation.isPending}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {logFoodMutation.isPending ? 'Logging...' : 'Log Food'}
                </Button>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
