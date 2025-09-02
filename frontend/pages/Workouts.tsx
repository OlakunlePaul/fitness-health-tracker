import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Play, Clock, Dumbbell } from 'lucide-react';
import { formatDate, formatDuration } from '../utils/date';
import { CreateWorkoutDialog } from '../components/CreateWorkoutDialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';

export function Workouts() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { backend } = useAuth();

  const { data: templates } = useQuery({
    queryKey: ['workoutTemplates'],
    queryFn: () => backend.workouts.listTemplates(),
  });

  const { data: sessions } = useQuery({
    queryKey: ['workoutSessions'],
    queryFn: () => backend.workouts.listSessions(),
  });

  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => backend.workouts.listExercises(),
  });

  const startSessionMutation = useMutation({
    mutationFn: (data: { templateId?: number; name: string }) => backend.workouts.startSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutSessions'] });
      toast({
        title: "Workout Started",
        description: "Your workout session has been started successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to start workout:', error);
      toast({
        title: "Error",
        description: "Failed to start workout session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartWorkout = (templateId?: number, name: string = 'Quick Workout') => {
    startSessionMutation.mutate({
      templateId,
      name,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workouts</h1>
          <p className="text-muted-foreground mt-2">
            Plan, track, and manage your workout routines.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates?.templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{template.name}</span>
                    {template.category && (
                      <Badge variant="secondary">{template.category}</Badge>
                    )}
                  </CardTitle>
                  {template.description && (
                    <CardDescription>{template.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    {template.estimatedDurationMinutes && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(template.estimatedDurationMinutes)}
                      </div>
                    )}
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleStartWorkout(template.id, template.name)}
                    disabled={startSessionMutation.isPending}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Workout
                  </Button>
                </CardContent>
              </Card>
            )) || (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No workout templates yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first workout template to get started.
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <div className="space-y-4">
            {sessions?.sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{session.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {session.completedAt ? (
                        <Badge variant="default">Completed</Badge>
                      ) : (
                        <Badge variant="secondary">In Progress</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    Started {formatDate(session.startedAt)}
                    {session.durationMinutes && ` • ${formatDuration(session.durationMinutes)}`}
                  </CardDescription>
                </CardHeader>
                {session.notes && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{session.notes}</p>
                  </CardContent>
                )}
              </Card>
            )) || (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Play className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No workout sessions yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start your first workout to see it here.
                  </p>
                  <Button onClick={() => handleStartWorkout()}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Quick Workout
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CreateWorkoutDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        exercises={exercises?.exercises || []}
      />
    </div>
  );
}
