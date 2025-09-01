import { SQLDatabase } from 'encore.dev/storage/sqldb';

export const nutritionDB = new SQLDatabase("nutrition", {
  migrations: "./migrations",
});
