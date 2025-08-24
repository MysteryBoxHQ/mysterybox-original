CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  website VARCHAR(255),
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  api_key VARCHAR(255) NOT NULL UNIQUE,
  secret_key VARCHAR(255) NOT NULL,
  webhook_url VARCHAR(500),
  allowed_domains TEXT,
  rate_limit INTEGER NOT NULL DEFAULT 1000,
  permissions TEXT NOT NULL DEFAULT 'read',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_usage_log (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER REFERENCES partners(id),
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER,
  user_agent VARCHAR(500),
  ip_address VARCHAR(45),
  request_data TEXT,
  response_data TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_transactions (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER REFERENCES partners(id),
  external_user_id VARCHAR(255) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  box_id INTEGER REFERENCES boxes(id),
  item_id INTEGER REFERENCES items(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  external_transaction_id VARCHAR(255),
  metadata TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
