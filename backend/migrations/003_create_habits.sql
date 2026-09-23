CREATE TABLE habits (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  frequency ENUM('daily','weekly','custom') DEFAULT 'daily',
  color VARCHAR(7) DEFAULT '#4f46e5',
  archived_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);