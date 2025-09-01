import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Clock, Star, Dumbbell } from 'lucide-react';
import type { WorkoutLogWithExercises } from '~backend/fitness/types';

interface WorkoutLogCardProps {
  log: WorkoutLogWithExercises;
}

export default function WorkoutLogCard({ log }: WorkoutLogCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{log.routine_name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(new Date(log.date_performed), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {log.duration_minutes && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {log.duration_minutes}m
              </Badge>
            )}
            {log.rating && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {log.rating}/5
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Dumbbell className="h-4 w-4" />
            <span>{log.exercises.length} exercises completed</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {log.exercises.map((exercise) => (
              <div key={exercise.id} className="p-2 border rounded">
                <p className="font-medium text-sm">{exercise.exercise.name}</p>
                <p className="text-xs text-muted-foreground">
                  {exercise.sets_completed} sets
                  {exercise.reps_completed && ` × ${exercise.reps_completed} reps`}
                  {exercise.weight_kg && ` @ ${exercise.weight_kg}kg`}
                </p>
              </div>
            ))}
          </div>

          {log.notes && (
            <div className="mt-3 p-2 bg-muted rounded">
              <p className="text-sm">{log.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
