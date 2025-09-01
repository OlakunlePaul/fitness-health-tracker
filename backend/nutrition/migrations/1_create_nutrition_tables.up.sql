CREATE TABLE foods (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  serving_size VARCHAR(100),
  calories_per_100g DOUBLE PRECISION NOT NULL,
  protein_per_100g DOUBLE PRECISION DEFAULT 0,
  carbs_per_100g DOUBLE PRECISION DEFAULT 0,
  fat_per_100g DOUBLE PRECISION DEFAULT 0,
  fiber_per_100g DOUBLE PRECISION DEFAULT 0,
  sugar_per_100g DOUBLE PRECISION DEFAULT 0,
  sodium_per_100g DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE nutrition_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  food_id BIGINT NOT NULL REFERENCES foods(id),
  serving_size_grams DOUBLE PRECISION NOT NULL,
  meal_type VARCHAR(50) NOT NULL,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_nutrition_goals (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  calories_goal DOUBLE PRECISION NOT NULL,
  protein_goal DOUBLE PRECISION NOT NULL,
  carbs_goal DOUBLE PRECISION NOT NULL,
  fat_goal DOUBLE PRECISION NOT NULL,
  fiber_goal DOUBLE PRECISION DEFAULT 25,
  sodium_limit DOUBLE PRECISION DEFAULT 2300,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nutrition_logs_user_id ON nutrition_logs(user_id);
CREATE INDEX idx_nutrition_logs_logged_at ON nutrition_logs(logged_at);
CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_daily_nutrition_goals_user_id ON daily_nutrition_goals(user_id);
