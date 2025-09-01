import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import backend from '~backend/client';
import type { WorkoutRoutine } from '~backend/fitness/types';
import type { LogWorkoutRequest } from '~backend/fitness/log_workout';

interface LogWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: WorkoutRoutine;
  onSubmit: (data: LogWorkoutRequest) => void;
  isLoading: boolean;
}

interface ExerciseLog {
  exercise_id: number;
  sets_completed: number;
  reps_completed?: number;
  weight_kg?: number;
  duration_seconds?: number;
  notes?: string;
}

export default function LogWorkoutDialog({
  open,
  onOpenChange,
  workout,
  onSubmit,
  isLoading,
}: LogWorkoutDialogProps) {
  const [formData, setFormData] = useState({
    date_performed: format(new Date(), 'yyyy-MM-dd'),
    duration_minutes: 0,
    notes: '',
    rating: 5,
  });
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);

  const { data: workoutDetails } = useQuery({
    queryKey: ['workout', workout.id],
    queryFn: () => backend.fitness.getWorkout({ id: workout.id }),
    enabled: open,
  });

  useEffect(() => {
    if (workoutDetails?.exercises) {
      setExerciseLogs(
        workoutDetails.exercises.map((exercise) => ({
          exercise_id: exercise.exercise_id,
          sets_completed: exercise.sets,
          reps_completed: exercise.reps,
          weight_kg: exercise.weight_kg,
          duration_seconds: exercise.duration_seconds,
          notes: '',
        }))
      );
    }
  }, [workoutDetails]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      workout_routine_id: workout.id,
      ...formData,
      duration_minutes: formData.duration_minutes || undefined,
      rating: formData.rating || undefined,
      exercises: exerciseLogs,
    });
  };

  const updateExerciseLog = (index: number, updates: Partial<ExerciseLog>) => {
    const updated = [...exerciseLogs];
    updated[index] = { ...updated[index], ...updates };
    setExerciseLogs(updated);
  };

  const reset = () => {
    setFormData({
      date_performed: format(new Date(), 'yyyy-MM-dd'),
      duration_minutes: 0,
      notes: '',
      rating: 5,
    });
    setExerciseLogs([]);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) reset();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Workout: {workout.name}</DialogTitle>
          <DialogDescription>
            Record your completed workout session
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date Performed</Label>
              <Input
                id="date"
                type="date"
                value={formData.date_performed}
                onChange={(e) => setFormData({ ...formData, date_performed: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration_minutes || ''}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                placeholder="45"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Select
                value={formData.rating.toString()}
                onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Poor</SelectItem>
                  <SelectItem value="2">2 - Fair</SelectItem>
                  <SelectItem value="3">3 - Good</SelectItem>
                  <SelectItem value="4">4 - Very Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="How did the workout feel? Any observations..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Exercise Performance</h3>
            {workoutDetails?.exercises.map((exercise, index) => (
              <Card key={exercise.id}>
                <CardHeader>
                  <CardTitle className="text-base">{exercise.exercise.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label>Sets Completed</Label>
                      <Input
                        type="number"
                        value={exerciseLogs[index]?.sets_completed || 0}
                        onChange={(e) =>
                          updateExerciseLog(index, { sets_completed: parseInt(e.target.value) || 0 })
                        }
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reps (per set)</Label>
                      <Input
                        type="number"
                        value={exerciseLogs[index]?.reps_completed || ''}
                        onChange={(e) =>
                          updateExerciseLog(index, { reps_completed: parseInt(e.target.value) || undefined })
                        }
                        placeholder="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Weight (kg)</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={exerciseLogs[index]?.weight_kg || ''}
                        onChange={(e) =>
                          updateExerciseLog(index, { weight_kg: parseFloat(e.target.value) || undefined })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (seconds)</Label>
                      <Input
                        type="number"
                        value={exerciseLogs[index]?.duration_seconds || ''}
                        onChange={(e) =>
                          updateExerciseLog(index, { duration_seconds: parseInt(e.target.value) || undefined })
                        }
                        placeholder="60"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Input
                        value={exerciseLogs[index]?.notes || ''}
                        onChange={(e) =>
                          updateExerciseLog(index, { notes: e.target.value })
                        }
                        placeholder="Form notes..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging...' : 'Log Workout'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
