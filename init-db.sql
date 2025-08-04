-- Create database if it doesn't exist
SELECT 'CREATE DATABASE budget_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'budget_db');

-- Create user if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'budget_user') THEN

      CREATE ROLE budget_user LOGIN PASSWORD 'budget_password';
   END IF;
END
$do$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE budget_db TO budget_user;

-- Connect to the budget database
\c budget_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sample data (will be inserted only if tables are empty)
-- Categories
INSERT INTO categories (id, name, color, budget) 
SELECT 
    uuid_generate_v4()::text,
    'Żywność',
    '#10B981',
    1500.00
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Żywność');

INSERT INTO categories (id, name, color, budget) 
SELECT 
    uuid_generate_v4()::text,
    'Transport',
    '#3B82F6',
    500.00
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Transport');

INSERT INTO categories (id, name, color, budget) 
SELECT 
    uuid_generate_v4()::text,
    'Rozrywka',
    '#8B5CF6',
    300.00
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Rozrywka');

-- Sample income
INSERT INTO incomes (id, name, amount, frequency, date) 
SELECT 
    uuid_generate_v4()::text,
    'Pensja',
    5000.00,
    'monthly',
    CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM incomes WHERE name = 'Pensja');

-- Sample investment
INSERT INTO investments (id, symbol, name, type, quantity, purchase_price, purchase_date) 
SELECT 
    uuid_generate_v4()::text,
    'AAPL',
    'Apple Inc.',
    'stock',
    10.00000000,
    150.00,
    CURRENT_DATE - INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM investments WHERE symbol = 'AAPL');

-- Sample savings goal
INSERT INTO savings_goals (id, name, description, target_amount, current_amount, target_date, color) 
SELECT 
    uuid_generate_v4()::text,
    'Wakacje',
    'Oszczędności na letnie wakacje',
    5000.00,
    1200.00,
    CURRENT_DATE + INTERVAL '6 months',
    '#F59E0B'
WHERE NOT EXISTS (SELECT 1 FROM savings_goals WHERE name = 'Wakacje');