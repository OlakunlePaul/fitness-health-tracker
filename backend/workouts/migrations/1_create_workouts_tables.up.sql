CREATE TABLE workout_templates (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  estimated_duration_minutes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exercises (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  muscle_groups TEXT[],
  equipment VARCHAR(100),
  instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE template_exercises (
  id BIGSERIAL PRIMARY KEY,
  template_id BIGINT NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id BIGINT NOT NULL REFERENCES exercises(id),
  sets INTEGER NOT NULL DEFAULT 1,
  reps INTEGER,
  weight_kg DOUBLE PRECISION,
  duration_seconds INTEGER,
  rest_seconds INTEGER DEFAULT 60,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workout_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  template_id BIGINT REFERENCES workout_templates(id),
  name VARCHAR(255) NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session_exercises (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id BIGINT NOT NULL REFERENCES exercises(id),
  sets_completed INTEGER NOT NULL DEFAULT 0,
  reps_completed INTEGER,
  weight_kg DOUBLE PRECISION,
  duration_seconds INTEGER,
  rest_seconds INTEGER,
  order_index INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_templates_user_id ON workout_templates(user_id);
CREATE INDEX idx_template_exercises_template_id ON template_exercises(template_id);
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_session_exercises_session_id ON session_exercises(session_id);
