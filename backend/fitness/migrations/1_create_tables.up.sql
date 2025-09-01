CREATE TABLE workout_routines (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  duration_minutes INTEGER,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE exercises (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  muscle_groups TEXT[] NOT NULL,
  equipment TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workout_exercises (
  id BIGSERIAL PRIMARY KEY,
  workout_routine_id BIGINT NOT NULL REFERENCES workout_routines(id) ON DELETE CASCADE,
  exercise_id BIGINT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sets INTEGER NOT NULL,
  reps INTEGER,
  weight_kg DOUBLE PRECISION,
  duration_seconds INTEGER,
  rest_seconds INTEGER,
  order_index INTEGER NOT NULL
);

CREATE TABLE workout_logs (
  id BIGSERIAL PRIMARY KEY,
  workout_routine_id BIGINT NOT NULL REFERENCES workout_routines(id),
  date_performed DATE NOT NULL,
  duration_minutes INTEGER,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workout_log_exercises (
  id BIGSERIAL PRIMARY KEY,
  workout_log_id BIGINT NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
  exercise_id BIGINT NOT NULL REFERENCES exercises(id),
  sets_completed INTEGER NOT NULL,
  reps_completed INTEGER,
  weight_kg DOUBLE PRECISION,
  duration_seconds INTEGER,
  notes TEXT
);

CREATE TABLE nutrition_logs (
  id BIGSERIAL PRIMARY KEY,
  date_logged DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name TEXT NOT NULL,
  serving_size TEXT NOT NULL,
  calories DOUBLE PRECISION NOT NULL,
  protein_g DOUBLE PRECISION,
  carbs_g DOUBLE PRECISION,
  fat_g DOUBLE PRECISION,
  fiber_g DOUBLE PRECISION,
  sugar_g DOUBLE PRECISION,
  sodium_mg DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE progress_measurements (
  id BIGSERIAL PRIMARY KEY,
  date_measured DATE NOT NULL,
  measurement_type TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample exercises
INSERT INTO exercises (name, description, category, muscle_groups, equipment, instructions) VALUES
('Push-up', 'Classic bodyweight chest exercise', 'strength', ARRAY['chest', 'triceps', 'shoulders'], 'bodyweight', 'Start in plank position, lower body to ground, push back up'),
('Squats', 'Lower body compound movement', 'strength', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'bodyweight', 'Stand with feet shoulder-width apart, lower body as if sitting back into chair'),
('Plank', 'Core stability exercise', 'core', ARRAY['core', 'shoulders'], 'bodyweight', 'Hold body in straight line from head to heels'),
('Burpees', 'Full body cardio exercise', 'cardio', ARRAY['full body'], 'bodyweight', 'Squat down, jump back to plank, do push-up, jump forward, jump up'),
('Deadlift', 'Compound pulling exercise', 'strength', ARRAY['hamstrings', 'glutes', 'back'], 'barbell', 'Lift barbell from ground to hip level with straight back'),
('Running', 'Cardiovascular endurance exercise', 'cardio', ARRAY['legs', 'cardiovascular'], 'none', 'Steady pace running for distance or time');

-- Insert some sample workout routines
INSERT INTO workout_routines (name, description, category, duration_minutes, difficulty_level) VALUES
('Beginner Full Body', 'Complete workout for beginners', 'strength', 30, 'beginner'),
('HIIT Cardio Blast', 'High intensity interval training', 'cardio', 20, 'intermediate'),
('Advanced Strength', 'Heavy compound movements', 'strength', 60, 'advanced');

-- Add exercises to workout routines
INSERT INTO workout_exercises (workout_routine_id, exercise_id, sets, reps, order_index) VALUES
(1, 1, 3, 10, 1),
(1, 2, 3, 15, 2),
(1, 3, 2, 30, 3),
(2, 4, 4, 10, 1),
(2, 6, 1, 300, 2),
(3, 5, 5, 5, 1),
(3, 2, 4, 8, 2);
