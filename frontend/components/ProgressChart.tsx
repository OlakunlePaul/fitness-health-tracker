import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import type { ProgressMeasurement } from '~backend/fitness/types';

interface ProgressChartProps {
  measurements: ProgressMeasurement[];
  type: string;
}

export default function ProgressChart({ measurements, type }: ProgressChartProps) {
  if (measurements.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data to display
      </div>
    );
  }

  const data = measurements.map((measurement) => ({
    date: format(parseISO(measurement.date_measured), 'MMM d'),
    value: measurement.value,
    fullDate: measurement.date_measured,
  }));

  const unit = measurements[0]?.unit || '';

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-muted-foreground"
            fontSize={12}
          />
          <YAxis 
            className="text-muted-foreground"
            fontSize={12}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return format(parseISO(payload[0].payload.fullDate), 'MMMM d, yyyy');
              }
              return label;
            }}
            formatter={(value: number) => [`${value} ${unit}`, type.replace('_', ' ')]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
