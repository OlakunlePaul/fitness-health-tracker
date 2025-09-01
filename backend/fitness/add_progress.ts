import { api } from "encore.dev/api";
import { fitnessDB } from "./db";
import type { ProgressMeasurement } from "./types";

export interface AddProgressRequest {
  date_measured: string;
  measurement_type: string;
  value: number;
  unit: string;
  notes?: string;
}

// Records a progress measurement like weight, body fat percentage, or body measurements.
export const addProgress = api<AddProgressRequest, ProgressMeasurement>(
  { expose: true, method: "POST", path: "/progress" },
  async (req) => {
    const measurement = await fitnessDB.queryRow<ProgressMeasurement>`
      INSERT INTO progress_measurements (date_measured, measurement_type, value, unit, notes)
      VALUES (${req.date_measured}, ${req.measurement_type}, ${req.value}, ${req.unit}, ${req.notes})
      RETURNING id, date_measured, measurement_type, value, unit, notes, created_at
    `;

    if (!measurement) {
      throw new Error("Failed to create progress measurement");
    }

    return measurement;
  }
);
