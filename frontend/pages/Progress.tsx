import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import backend from '~backend/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import AddProgressDialog from '../components/AddProgressDialog';
import ProgressChart from '../components/ProgressChart';
import ProgressMeasurementCard from '../components/ProgressMeasurementCard';
import { useToast } from '@/components/ui/use-toast';

export default function Progress() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: progress, isLoading, error } = useQuery({
    queryKey: ['progress'],
    queryFn: () => backend.fitness.listProgress(),
  });

  const addProgressMutation = useMutation({
    mutationFn: backend.fitness.addProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setShowAddDialog(false);
      toast({
        title: "Success",
        description: "Progress measurement added successfully",
      });
    },
    onError: (error) => {
      console.error('Add progress error:', error);
      toast({
        title: "Error",
        description: "Failed to add progress measurement",
        variant: "destructive",
      });
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load progress data" />;

  const measurementsByType = progress?.measurements.reduce((acc, measurement) => {
    if (!acc[measurement.measurement_type]) {
      acc[measurement.measurement_type] = [];
    }
    acc[measurement.measurement_type].push(measurement);
    return acc;
  }, {} as Record<string, typeof progress.measurements>) || {};

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Progress Tracking</h1>
          <p className="text-muted-foreground">Monitor your fitness progress over time</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Measurement
        </Button>
      </div>

      {Object.keys(measurementsByType).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No progress measurements yet</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Measurement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(measurementsByType).map(([type, measurements]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="capitalize">{type.replace('_', ' ')}</CardTitle>
                <CardDescription>
                  Latest: {measurements[0]?.value} {measurements[0]?.unit} on {measurements[0]?.date_measured}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <ProgressChart 
                    measurements={measurements.slice().reverse()} 
                    type={type}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {measurements.slice(0, 6).map((measurement) => (
                      <ProgressMeasurementCard
                        key={measurement.id}
                        measurement={measurement}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddProgressDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={(data) => addProgressMutation.mutate(data)}
        isLoading={addProgressMutation.isPending}
      />
    </div>
  );
}
