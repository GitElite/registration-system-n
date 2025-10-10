-- ======================
-- Orchard Links Location Schema
-- ======================

CREATE TABLE IF NOT EXISTS region (
    region_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS subregion (
    subregion_id SERIAL PRIMARY KEY,
    region_id INT REFERENCES region(region_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS district (
    district_id SERIAL PRIMARY KEY,
    subregion_id INT REFERENCES subregion(subregion_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('Rural','City','Municipality','TownCouncil')) NOT NULL
);

CREATE TABLE IF NOT EXISTS subcounty (
    subcounty_id SERIAL PRIMARY KEY,
    district_id INT REFERENCES district(district_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS parish (
    parish_id SERIAL PRIMARY KEY,
    subcounty_id INT REFERENCES subcounty(subcounty_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS village (
    village_id SERIAL PRIMARY KEY,
    parish_id INT REFERENCES parish(parish_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS division (
    division_id SERIAL PRIMARY KEY,
    district_id INT REFERENCES district(district_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS ward (
    ward_id SERIAL PRIMARY KEY,
    parent_type VARCHAR(20) CHECK (parent_type IN ('Division','TownCouncil')) NOT NULL,
    parent_id INT NOT NULL,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS cellzone (
    cellzone_id SERIAL PRIMARY KEY,
    ward_id INT REFERENCES ward(ward_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'FieldOfficer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- HOUSEHOLD REGISTRATION
-- ======================

CREATE TABLE IF NOT EXISTS household (
    household_id SERIAL PRIMARY KEY,
    head_name VARCHAR(100) NOT NULL,
    primary_phone VARCHAR(15) NOT NULL,
    alternate_contact VARCHAR(15),
    region_id INT REFERENCES region(region_id),
    subregion_id INT REFERENCES subregion(subregion_id),
    district_id INT REFERENCES district(district_id),
    subcounty_id INT,
    parish_id INT,
    village_id INT,
    gps_latitude FLOAT NOT NULL,
    gps_longitude FLOAT NOT NULL,
    land_size FLOAT CHECK (land_size >= 0),
    plot_characteristics VARCHAR(50),
    num_members INT CHECK (num_members >= 1),
    primary_income VARCHAR(50),
    past_orchard_experience BOOLEAN,
    water_source VARCHAR(50),
    payment_method VARCHAR(20),
    mobile_money_number VARCHAR(15),
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    agreed_to_credit_terms BOOLEAN NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registered_by INT REFERENCES users(user_id),
    registration_status VARCHAR(20) DEFAULT 'Pending',
    rejection_reason VARCHAR(200)
);
