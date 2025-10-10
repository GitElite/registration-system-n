-- REGIONS
INSERT INTO regions (name) VALUES
('Central'), ('Eastern'), ('Western'), ('Northern');

-- SUBREGIONS
INSERT INTO subregions (region_id, name) VALUES
(1, 'Buganda'),
(2, 'Bugisu'), (2, 'Elgon'), (2, 'Bukedi'), (2, 'Busoga'), (2, 'Teso'),
(3, 'Ankole'), (3, 'Bunyoro'), (3, 'Kigezi'), (3, 'Rwenzori'), (3, 'Toro'),
(4, 'Acholi'), (4, 'Lango'), (4, 'West Nile'), (4, 'Karamoja');

-- DISTRICTS (sample)
INSERT INTO districts (subregion_id, name, type) VALUES
(9, 'Kabale', 'Rural'),
(9, 'Kisoro', 'Rural'),
(9, 'Rukungiri', 'Rural'),
(9, 'Kabale Municipality', 'Municipality'),
(9, 'Kisoro Town Council', 'TownCouncil'),
(9, 'Rukungiri Town Council', 'TownCouncil');

-- SUBCOUNTIES
INSERT INTO subcounties (district_id, name) VALUES
(1, 'Kamuganguzi'),
(1, 'Bubaare'),
(1, 'Rubaya'),
(2, 'Nyundo'),
(3, 'Bwambara');

-- PARISHES
INSERT INTO parishes (subcounty_id, name) VALUES
(1, 'Kagoma'), (1, 'Kasheregyenyi'),
(2, 'Kyanamira'), (2, 'Kicumbi');

-- VILLAGES
INSERT INTO villages (parish_id, name) VALUES
(1, 'Kanyankwanzi'),
(1, 'Rugarama'),
(2, 'Kihanga'),
(3, 'Kakomo');

-- DIVISIONS (for
