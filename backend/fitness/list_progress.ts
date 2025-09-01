import { api } from "encore.dev/api";
import { fitnessDB } from "./db";
import type { ProgressMeasurement } from "./types";

export interface ListProgressResponse {
  measurements: ProgressMeasurement[];
}

// Retrieves all progress measurements ordered by date.
export const listProgress = api<void, ListProgressResponse>(
  { expose: true, method: "GET", path: "/progress" },
  async () => {
    const measurements = await fitnessDB.queryAll<ProgressMeasurement>`
      SELECT id, date_measured, measurement_type, value, unit, notes, created_at
      FROM progress_measurements
      ORDER BY date_measured DESC, measurement_type
    `;
    
    return { measurements };
  }
);
