import { SQLDatabase } from 'encore.dev/storage/sqldb';

export const workoutsDB = new SQLDatabase("workouts", {
  migrations: "./migrations",
});
