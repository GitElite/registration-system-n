-- ============================================================
-- UGANDA LOCATION SCHEMA + SEED (FULL CLEAN VERSION)
-- Region → Subregion → District → LC3 → LC4 → LC1
-- ============================================================

-- Drop old tables safely
DROP TABLE IF EXISTS admin_unit_lc1 CASCADE;
DROP TABLE IF EXISTS admin_unit_lc4 CASCADE;
DROP TABLE IF EXISTS admin_unit_lc3 CASCADE;
DROP TABLE IF EXISTS district CASCADE;
DROP TABLE IF EXISTS subregion CASCADE;
DROP TABLE IF EXISTS region CASCADE;

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
-- CLEAN DUPLICATES (if any)
-- ============================================================
DELETE FROM region a
USING region b
WHERE a.region_id < b.region_id AND a.name = b.name;

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
-- SEED SUBREGIONS (CLEAN, FIXED VERSION)
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
    ('Bunyoro', 'Western Region')
) AS v(subregion_name, region_name)
ON r.name = v.region_name
ON CONFLICT (name, region_id) DO NOTHING;

-- ============================================================
-- SAMPLE DISTRICTS
-- ============================================================
INSERT INTO district(name, subregion_id)
SELECT v.district_name, s.subregion_id
FROM subregion s
JOIN (
  VALUES
    ('Gulu', 'Acholi'),
    ('Kitgum', 'Acholi'),
    ('Pader', 'Acholi'),
    ('Amuru', 'Acholi'),
    ('Lira', 'Lango'),
    ('Apac', 'Lango'),
    ('Soroti', 'Teso'),
    ('Kumi', 'Teso'),
    ('Mbale', 'Elgon'),
    ('Tororo', 'Bukedi'),
    ('Iganga', 'Busoga'),
    ('Mbarara', 'Ankole'),
    ('Kabale', 'Kigezi'),
    ('Kabarole', 'Tooro'),
    ('Hoima', 'Bunyoro'),
    ('Kampala', 'Central Region Placeholder') -- ensures 4-region coverage
) AS v(district_name, subregion_name)
ON s.name = v.subregion_name
ON CONFLICT (name, subregion_id) DO NOTHING;

-- ============================================================
-- SAMPLE LC3 (Subcounties/Town Councils/Divisions)
-- ============================================================
INSERT INTO admin_unit_lc3(name, district_id)
SELECT v.lc3_name, d.district_id
FROM district d
JOIN (
  VALUES
    ('Awach', 'Gulu'),
    ('Kitgum Matidi', 'Kitgum'),
    ('Pader Town Council', 'Pader'),
    ('Bibia', 'Amuru'),
    ('Adekokwok', 'Lira'),
    ('Apac Town Council', 'Apac'),
    ('Arapai', 'Soroti'),
    ('Atutur', 'Kumi'),
    ('Bufumbo', 'Mbale'),
    ('Malaba Town Council', 'Tororo'),
    ('Nawandala', 'Iganga'),
    ('Bubaare', 'Mbarara'),
    ('Bukinda', 'Kabale'),
    ('Buheesi', 'Kabarole'),
    ('Bugambe', 'Hoima'),
    ('Central Division', 'Kampala')
) AS v(lc3_name, district_name)
ON d.name = v.district_name
ON CONFLICT (name, district_id) DO NOTHING;

-- ============================================================
-- SAMPLE LC4 (Parish/Ward)
-- ============================================================
INSERT INTO admin_unit_lc4(name, unit_type, lc3_id)
SELECT 'Bukinda Parish','Parish',a.admin_unit_id
FROM admin_unit_lc3 a
JOIN district d ON d.district_id=a.district_id
WHERE d.name='Kabale'
LIMIT 1
ON CONFLICT (name, lc3_id) DO NOTHING;

INSERT INTO admin_unit_lc4(name, unit_type, lc3_id)
SELECT 'Kabale Central Ward','Ward',a.admin_unit_id
FROM admin_unit_lc3 a
JOIN district d ON d.district_id=a.district_id
WHERE d.name='Kabale'
LIMIT 1
ON CONFLICT (name, lc3_id) DO NOTHING;

-- ============================================================
-- SAMPLE LC1 (Village/Cell)
-- ============================================================
INSERT INTO admin_unit_lc1(name, unit_type, lc4_id)
SELECT 'Kanyankwanzi Village','Village',l.admin_unit_id
FROM admin_unit_lc4 l WHERE l.name='Bukinda Parish'
ON CONFLICT (name, lc4_id) DO NOTHING;

INSERT INTO admin_unit_lc1(name, unit_type, lc4_id)
SELECT 'Rwakaraba Cell','Cell',l.admin_unit_id
FROM admin_unit_lc4 l WHERE l.name='Kabale Central Ward'
ON CONFLICT (name, lc4_id) DO NOTHING;

-- ============================================================
-- DONE
-- ============================================================
SELECT '✅ Uganda location hierarchy loaded successfully.' AS status;
