import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AddNutritionRequest } from '~backend/fitness/add_nutrition';

interface AddNutritionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string;
  onSubmit: (data: AddNutritionRequest) => void;
  isLoading: boolean;
}

export default function AddNutritionDialog({
  open,
  onOpenChange,
  selectedDate,
  onSubmit,
  isLoading,
}: AddNutritionDialogProps) {
  const [formData, setFormData] = useState<AddNutritionRequest>({
    date_logged: selectedDate,
    meal_type: 'breakfast',
    food_name: '',
    serving_size: '',
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    sugar_g: 0,
    sodium_mg: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const reset = () => {
    setFormData({
      date_logged: selectedDate,
      meal_type: 'breakfast',
      food_name: '',
      serving_size: '',
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      sugar_g: 0,
      sodium_mg: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) reset();
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Nutrition Entry</DialogTitle>
          <DialogDescription>
            Log your food intake with nutritional information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="food_name">Food Name</Label>
              <Input
                id="food_name"
                value={formData.food_name}
                onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                placeholder="e.g., Grilled Chicken Breast"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal_type">Meal Type</Label>
              <Select
                value={formData.meal_type}
                onValueChange={(value: 'breakfast' | 'lunch' | 'dinner' | 'snack') =>
                  setFormData({ ...formData, meal_type: value })
                }
              >
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
            <div className="space-y-2">
              <Label htmlFor="serving_size">Serving Size</Label>
              <Input
                id="serving_size"
                value={formData.serving_size}
                onChange={(e) => setFormData({ ...formData, serving_size: e.target.value })}
                placeholder="e.g., 1 cup, 100g, 1 medium"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                step="0.1"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Macronutrients</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.1"
                  value={formData.protein_g || ''}
                  onChange={(e) => setFormData({ ...formData, protein_g: parseFloat(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  step="0.1"
                  value={formData.carbs_g || ''}
                  onChange={(e) => setFormData({ ...formData, carbs_g: parseFloat(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  value={formData.fat_g || ''}
                  onChange={(e) => setFormData({ ...formData, fat_g: parseFloat(e.target.value) || undefined })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Nutrients</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fiber">Fiber (g)</Label>
                <Input
                  id="fiber"
                  type="number"
                  step="0.1"
                  value={formData.fiber_g || ''}
                  onChange={(e) => setFormData({ ...formData, fiber_g: parseFloat(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sugar">Sugar (g)</Label>
                <Input
                  id="sugar"
                  type="number"
                  step="0.1"
                  value={formData.sugar_g || ''}
                  onChange={(e) => setFormData({ ...formData, sugar_g: parseFloat(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sodium">Sodium (mg)</Label>
                <Input
                  id="sodium"
                  type="number"
                  step="0.1"
                  value={formData.sodium_mg || ''}
                  onChange={(e) => setFormData({ ...formData, sodium_mg: parseFloat(e.target.value) || undefined })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.food_name || !formData.serving_size}>
              {isLoading ? 'Adding...' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
