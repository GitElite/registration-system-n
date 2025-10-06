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
