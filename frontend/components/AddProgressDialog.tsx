import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import type { AddProgressRequest } from '~backend/fitness/add_progress';

interface AddProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AddProgressRequest) => void;
  isLoading: boolean;
}

export default function AddProgressDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: AddProgressDialogProps) {
  const [formData, setFormData] = useState<AddProgressRequest>({
    date_measured: format(new Date(), 'yyyy-MM-dd'),
    measurement_type: '',
    value: 0,
    unit: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      notes: formData.notes || undefined,
    });
  };

  const reset = () => {
    setFormData({
      date_measured: format(new Date(), 'yyyy-MM-dd'),
      measurement_type: '',
      value: 0,
      unit: '',
      notes: '',
    });
  };

  const commonMeasurements = [
    { type: 'weight', unit: 'kg' },
    { type: 'body_fat_percentage', unit: '%' },
    { type: 'muscle_mass', unit: 'kg' },
    { type: 'chest', unit: 'cm' },
    { type: 'waist', unit: 'cm' },
    { type: 'hips', unit: 'cm' },
    { type: 'arms', unit: 'cm' },
    { type: 'thighs', unit: 'cm' },
  ];

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) reset();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Progress Measurement</DialogTitle>
          <DialogDescription>
            Track your body measurements and fitness progress
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date Measured</Label>
            <Input
              id="date"
              type="date"
              value={formData.date_measured}
              onChange={(e) => setFormData({ ...formData, date_measured: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="measurement_type">Measurement Type</Label>
            <Input
              id="measurement_type"
              value={formData.measurement_type}
              onChange={(e) => setFormData({ ...formData, measurement_type: e.target.value })}
              placeholder="e.g., weight, body_fat_percentage, chest"
              required
              list="measurement-types"
            />
            <datalist id="measurement-types">
              {commonMeasurements.map((measurement) => (
                <option key={measurement.type} value={measurement.type} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                step="0.1"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="kg, cm, %"
                required
                list="units"
              />
              <datalist id="units">
                <option value="kg" />
                <option value="lbs" />
                <option value="cm" />
                <option value="inches" />
                <option value="%" />
              </datalist>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this measurement..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.measurement_type || !formData.unit}
            >
              {isLoading ? 'Adding...' : 'Add Measurement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
