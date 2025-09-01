import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Dumbbell, Play } from 'lucide-react';
import type { WorkoutRoutine } from '~backend/fitness/types';

interface WorkoutCardProps {
  workout: WorkoutRoutine;
  onStartWorkout: () => void;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

export default function WorkoutCard({ workout, onStartWorkout }: WorkoutCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{workout.name}</CardTitle>
            <CardDescription>{workout.description}</CardDescription>
          </div>
          <Badge className={difficultyColors[workout.difficulty_level]}>
            {workout.difficulty_level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              <span>{workout.category}</span>
            </div>
            {workout.duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{workout.duration_minutes}m</span>
              </div>
            )}
          </div>
        </div>
        <Button onClick={onStartWorkout} className="w-full">
          <Play className="h-4 w-4 mr-2" />
          Start Workout
        </Button>
      </CardContent>
    </Card>
  );
}
