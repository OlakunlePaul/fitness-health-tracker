import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import type { Exercise } from '~backend/workouts/list_exercises';
import type { CreateTemplateRequest, TemplateExercise } from '~backend/workouts/create_template';

interface CreateWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercises: Exercise[];
}

export function CreateWorkoutDialog({ open, onOpenChange, exercises }: CreateWorkoutDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    estimatedDurationMinutes: '',
  });
  const [selectedExercises, setSelectedExercises] = useState<TemplateExercise[]>([]);
  const [showExerciseSelect, setShowExerciseSelect] = useState(false);

  const { backend } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTemplateMutation = useMutation({
    mutationFn: (data: CreateTemplateRequest) => backend.workouts.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutTemplates'] });
      onOpenChange(false);
      resetForm();
      toast({
        title: "Template Created",
        description: "Your workout template has been created successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to create template:', error);
      toast({
        title: "Error",
        description: "Failed to create workout template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      estimatedDurationMinutes: '',
    });
    setSelectedExercises([]);
    setShowExerciseSelect(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedExercises.length === 0) {
      toast({
        title: "No exercises selected",
        description: "Please add at least one exercise to your workout template.",
        variant: "destructive",
      });
      return;
    }

    const request: CreateTemplateRequest = {
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category || undefined,
      estimatedDurationMinutes: formData.estimatedDurationMinutes ? parseInt(formData.estimatedDurationMinutes) : undefined,
      exercises: selectedExercises,
    };

    createTemplateMutation.mutate(request);
  };

  const addExercise = (exerciseId: number) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const newExercise: TemplateExercise = {
      exerciseId,
      sets: 3,
      reps: 10,
      restSeconds: 60,
      orderIndex: selectedExercises.length,
    };

    setSelectedExercises(prev => [...prev, newExercise]);
    setShowExerciseSelect(false);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof TemplateExercise, value: any) => {
    setSelectedExercises(prev => prev.map((exercise, i) => 
      i === index ? { ...exercise, [field]: value } : exercise
    ));
  };

  const getExerciseName = (exerciseId: number) => {
    return exercises.find(e => e.id === exerciseId)?.name || 'Unknown Exercise';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Workout Template</DialogTitle>
          <DialogDescription>
            Design a reusable workout template with exercises, sets, and reps.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Upper Body Strength"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                  <SelectItem value="hiit">HIIT</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Estimated Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.estimatedDurationMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedDurationMinutes: e.target.value }))}
                placeholder="e.g., 45"
                min="5"
                max="300"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your workout template..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Exercises</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowExerciseSelect(!showExerciseSelect)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </div>

            {showExerciseSelect && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {exercises.map((exercise) => (
                      <Button
                        key={exercise.id}
                        type="button"
                        variant="ghost"
                        className="justify-start h-auto p-3"
                        onClick={() => addExercise(exercise.id)}
                      >
                        <div className="text-left">
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-sm text-muted-foreground">{exercise.category}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {selectedExercises.map((exercise, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{getExerciseName(exercise.exerciseId)}</h4>
                        <Badge variant="secondary" className="mt-1">
                          {exercises.find(e => e.id === exercise.exerciseId)?.category}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExercise(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs">Sets</Label>
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                          min="1"
                          max="20"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Reps</Label>
                        <Input
                          type="number"
                          value={exercise.reps || ''}
                          onChange={(e) => updateExercise(index, 'reps', e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="10"
                          min="1"
                          max="100"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Weight (kg)</Label>
                        <Input
                          type="number"
                          value={exercise.weightKg || ''}
                          onChange={(e) => updateExercise(index, 'weightKg', e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="0"
                          min="0"
                          step="0.5"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Rest (sec)</Label>
                        <Input
                          type="number"
                          value={exercise.restSeconds || 60}
                          onChange={(e) => updateExercise(index, 'restSeconds', parseInt(e.target.value) || 60)}
                          min="0"
                          max="600"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {selectedExercises.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No exercises added yet. Click "Add Exercise" to get started.
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={createTemplateMutation.isPending || selectedExercises.length === 0}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
