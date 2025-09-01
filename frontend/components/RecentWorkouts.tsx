import React from 'react';
import { format } from 'date-fns';
import { Clock, Star } from 'lucide-react';
import type { WorkoutLogWithExercises } from '~backend/fitness/types';

interface RecentWorkoutsProps {
  workouts: WorkoutLogWithExercises[];
}

export default function RecentWorkouts({ workouts }: RecentWorkoutsProps) {
  if (workouts.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No recent workouts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workouts.map((workout) => (
        <div key={workout.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium">{workout.routine_name}</h4>
            <p className="text-sm text-muted-foreground">
              {format(new Date(workout.date_performed), 'MMM d, yyyy')}
            </p>
            <p className="text-xs text-muted-foreground">
              {workout.exercises.length} exercises
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {workout.duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{workout.duration_minutes}m</span>
              </div>
            )}
            {workout.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>{workout.rating}/5</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
