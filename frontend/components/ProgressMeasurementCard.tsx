import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import type { ProgressMeasurement } from '~backend/fitness/types';

interface ProgressMeasurementCardProps {
  measurement: ProgressMeasurement;
}

export default function ProgressMeasurementCard({ measurement }: ProgressMeasurementCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {measurement.value} {measurement.unit}
          </div>
          <p className="text-sm text-muted-foreground">
            {format(parseISO(measurement.date_measured), 'MMM d, yyyy')}
          </p>
          {measurement.notes && (
            <p className="text-xs text-muted-foreground mt-2">
              {measurement.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
