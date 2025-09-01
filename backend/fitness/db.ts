import { SQLDatabase } from "encore.dev/storage/sqldb";

export const fitnessDB = new SQLDatabase("fitness", {
  migrations: "./migrations",
});
