-- ============================================================
-- SCHEMA: Uganda Location Hierarchy
-- VERSION: v3.1 (Stable for Production & Dev)
-- AUTHOR: Edwin (Orchard Links)
-- DATE: 2025-10-14
--
-- STRUCTURE:
--   Region → Subregion → District → LC3 (Subcounty/TownCouncil/Division)
--   → LC4 (Parish/Ward) → LC1 (Village/Cell)
--
-- PURPOSE:
--   Full schema + realistic seed for registration workflow testing.
--   Supports entity_type filtering (District, City, Municipality, TownCouncil)
--
-- USE:
--   psql -d obi_registration -f schema_and_seed_full.sql
-- ============================================================

BEGIN;

-- ============================================================
-- DROP OLD TABLES (for clean rebuild)
-- ============================================================
DROP TABLE IF EXISTS admin_unit_lc1 CASCADE;
DROP TABLE IF EXISTS admin_unit_lc4 CASCADE;
DROP TABLE IF EXISTS admin_unit_lc3 CASCADE;
DROP TABLE IF EXISTS district CASCADE;
DROP TABLE IF EXISTS subregion CASCADE;
DROP TABLE IF EXISTS region CASCADE;

DROP VIEW IF EXISTS subcounty, division, ward, parish, village, cellzone CASCADE;

-- ============================================================
-- TABLES
-- ============================================================
CREATE TABLE region (
  region_id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE subregion (
  subregion_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  region_id INT NOT NULL REFERENCES region(region_id) ON DELETE CASCADE,
  UNIQUE(name, region_id)
);

CREATE TABLE district (
  district_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  subregion_id INT NOT NULL REFERENCES subregion(subregion_id) ON DELETE CASCADE,
  type TEXT DEFAULT 'Rural', -- City, Municipality, TownCouncil, Rural
  UNIQUE(name, subregion_id)
);

CREATE TABLE admin_unit_lc3 (
  admin_unit_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  unit_type TEXT DEFAULT 'LC3',
  district_id INT NOT NULL REFERENCES district(district_id) ON DELETE CASCADE,
  UNIQUE(name, district_id)
);

CREATE TABLE admin_unit_lc4 (
  admin_unit_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  unit_type TEXT DEFAULT 'LC4',
  lc3_id INT NOT NULL REFERENCES admin_unit_lc3(admin_unit_id) ON DELETE CASCADE,
  UNIQUE(name, lc3_id)
);

CREATE TABLE admin_unit_lc1 (
  admin_unit_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  unit_type TEXT DEFAULT 'LC1',
  lc4_id INT NOT NULL REFERENCES admin_unit_lc4(admin_unit_id) ON DELETE CASCADE,
  UNIQUE(name, lc4_id)
);


-- ============================================================
-- LEGACY VIEW ALIASES (so old routes still work)
-- ============================================================

-- Subcounties (Rural LC3)
CREATE OR REPLACE VIEW subcounty AS
SELECT admin_unit_id AS subcounty_id,
       name,
       district_id,
       unit_type
FROM admin_unit_lc3
WHERE unit_type = 'Subcounty';

-- Divisions (City/Municipality LC3)
CREATE OR REPLACE VIEW division AS
SELECT admin_unit_id AS division_id,
       name,
       district_id,
       unit_type
FROM admin_unit_lc3
WHERE unit_type = 'Division';

-- Wards (City/Muni/TownCouncil LC4)
CREATE OR REPLACE VIEW ward AS
SELECT admin_unit_id AS ward_id,
       name,
       lc3_id AS parent_id,
       unit_type
FROM admin_unit_lc4
WHERE unit_type = 'Ward';

-- Parishes (Rural LC4)
CREATE OR REPLACE VIEW parish AS
SELECT admin_unit_id AS parish_id,
       name,
       lc3_id AS subcounty_id,
       unit_type
FROM admin_unit_lc4
WHERE unit_type = 'Parish';

-- Villages (Rural LC1)
CREATE OR REPLACE VIEW village AS
SELECT admin_unit_id AS village_id,
       name,
       lc4_id AS parish_id,
       unit_type
FROM admin_unit_lc1
WHERE unit_type = 'Village';

-- Cellzones (Urban LC1)
CREATE OR REPLACE VIEW cellzone AS
SELECT admin_unit_id AS cellzone_id,
       name,
       lc4_id AS ward_id,
       unit_type
FROM admin_unit_lc1
WHERE unit_type = 'Cell';


-- ============================================================
-- SEED REGIONS
-- ============================================================
INSERT INTO region(name) VALUES
('Northern Region'),
('Eastern Region'),
('Western Region'),
('Central Region')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED SUBREGIONS (adds Buganda for Central)
-- ============================================================
INSERT INTO subregion(name, region_id)
SELECT v.subregion_name, r.region_id
FROM region r
JOIN (
  VALUES
    ('Acholi', 'Northern Region'),
    ('Lango', 'Northern Region'),
    ('West Nile', 'Northern Region'),
    ('Karamoja', 'Northern Region'),
    ('Teso', 'Eastern Region'),
    ('Elgon', 'Eastern Region'),
    ('Bukedi', 'Eastern Region'),
    ('Busoga', 'Eastern Region'),
    ('Ankole', 'Western Region'),
    ('Kigezi', 'Western Region'),
    ('Tooro', 'Western Region'),
    ('Bunyoro', 'Western Region'),
    ('Buganda', 'Central Region')
) AS v(subregion_name, region_name)
ON r.name = v.region_name
ON CONFLICT (name, region_id) DO NOTHING;

-- ============================================================
-- SEED DISTRICTS (covers every subregion)
-- ============================================================
INSERT INTO district(name, subregion_id)
SELECT v.district_name, s.subregion_id
FROM subregion s
JOIN (
  VALUES
    -- Northern
    ('Gulu', 'Acholi'),
    ('Kitgum', 'Acholi'),
    ('Pader', 'Acholi'),
    ('Amuru', 'Acholi'),
    ('Lira', 'Lango'),
    ('Apac', 'Lango'),
    ('Arua', 'West Nile'),
    ('Nebbi', 'West Nile'),
    ('Zombo', 'West Nile'),
    ('Moroto', 'Karamoja'),
    ('Kotido', 'Karamoja'),

    -- Eastern
    ('Soroti', 'Teso'),
    ('Kumi', 'Teso'),
    ('Mbale', 'Elgon'),
    ('Tororo', 'Bukedi'),
    ('Iganga', 'Busoga'),

    -- Western
    ('Mbarara', 'Ankole'),
    ('Kabale', 'Kigezi'),
    ('Kabarole', 'Tooro'),
    ('Hoima', 'Bunyoro'),

    -- Central
    ('Kampala', 'Buganda'),
    ('Wakiso', 'Buganda'),
    ('Mukono', 'Buganda')
) AS v(district_name, subregion_name)
ON s.name = v.subregion_name
ON CONFLICT (name, subregion_id) DO NOTHING;

-- ============================================================
-- TAG ENTITY TYPES (City / Municipality / TownCouncil)
-- ============================================================
UPDATE district SET type='City'
WHERE name IN ('Kampala','Mbarara','Gulu','Arua','Mbale','Soroti');

UPDATE district SET type='Municipality'
WHERE name IN ('Hoima','Tororo','Lira');

UPDATE district SET type='TownCouncil'
WHERE name IN ('Apac','Kitgum','Nebbi');

-- ============================================================
-- UNIVERSAL MIN-SEED: ensures every dropdown has options
-- (Rural + City + Municipality + TownCouncil)
-- ============================================================

-- 1️⃣ For every district, create 2 LC3 entries with correct unit_type
INSERT INTO admin_unit_lc3 (name, unit_type, district_id)
SELECT
  CASE
    WHEN d.type IN ('City','Municipality') THEN d.name || ' Division ' || gs.n
    WHEN d.type = 'TownCouncil'            THEN d.name || ' Town Council ' || gs.n
    ELSE                                         d.name || ' Subcounty ' || gs.n
  END AS name,
  CASE
    WHEN d.type IN ('City','Municipality') THEN 'Division'
    WHEN d.type = 'TownCouncil'            THEN 'TownCouncil'
    ELSE                                         'Subcounty'
  END AS unit_type,
  d.district_id
FROM district d
CROSS JOIN generate_series(1,2) AS gs(n)
ON CONFLICT (name, district_id) DO NOTHING;

-- 2️⃣ For every LC3, create 2 LC4 with correct unit_type
INSERT INTO admin_unit_lc4 (name, unit_type, lc3_id)
SELECT
  CASE
    WHEN lc3.unit_type IN ('Division','TownCouncil') THEN lc3.name || ' - Ward '   || gs.n
    ELSE                                                   lc3.name || ' - Parish ' || gs.n
  END AS name,
  CASE
    WHEN lc3.unit_type IN ('Division','TownCouncil') THEN 'Ward'
    ELSE                                                   'Parish'
  END AS unit_type,
  lc3.admin_unit_id
FROM admin_unit_lc3 lc3
CROSS JOIN generate_series(1,2) AS gs(n)
ON CONFLICT (name, lc3_id) DO NOTHING;

-- 3️⃣ For every LC4, create 2 LC1 with correct unit_type
INSERT INTO admin_unit_lc1 (name, unit_type, lc4_id)
SELECT
  CASE
    WHEN lc4.unit_type = 'Ward' THEN lc4.name || ' - Cell '    || gs.n
    ELSE                           lc4.name || ' - Village '  || gs.n
  END AS name,
  CASE
    WHEN lc4.unit_type = 'Ward' THEN 'Cell'
    ELSE                           'Village'
  END AS unit_type,
  lc4.admin_unit_id
FROM admin_unit_lc4 lc4
CROSS JOIN generate_series(1,2) AS gs(n)
ON CONFLICT (name, lc4_id) DO NOTHING;

-- ============================================================
-- OPTIONAL INDEXES (for performance)
-- ============================================================
CREATE INDEX idx_subregion_region_id ON subregion(region_id);
CREATE INDEX idx_district_subregion_id ON district(subregion_id);
CREATE INDEX idx_lc3_district_id ON admin_unit_lc3(district_id);
CREATE INDEX idx_lc4_lc3_id ON admin_unit_lc4(lc3_id);
CREATE INDEX idx_lc1_lc4_id ON admin_unit_lc1(lc4_id);

-- ============================================================
-- DONE
-- ============================================================
SELECT '✅ Uganda location hierarchy loaded successfully.' AS status;

COMMIT;
