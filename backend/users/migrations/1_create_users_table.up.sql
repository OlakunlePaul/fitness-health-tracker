CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  weight_kg DOUBLE PRECISION,
  height_cm DOUBLE PRECISION,
  activity_level VARCHAR(50) DEFAULT 'moderate',
  fitness_goal VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_id ON users(id);
