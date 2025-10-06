-- =====================
-- SEED DATA for Location Tables
-- =====================

-- 1. Regions
INSERT INTO region (name) VALUES 
('Central'),
('Eastern'),
('Western'),
('Northern');

-- 2. Subregions
INSERT INTO subregion (region_id, name) VALUES
(1, 'Buganda'),
(2, 'Bugisu'),
(2, 'Elgon'),
(2, 'Bukedi'),
(2, 'Busoga'),
(2, 'Teso'),
(3, 'Ankole'),
(3, 'Bunyoro'),
(3, 'Kigezi'),
(3, 'Rwenzori'),
(3, 'Toro'),
(4, 'Acholi'),
(4, 'Lango'),
(4, 'West Nile'),
(4, 'Karamoja');

-- 3. Example Districts
INSERT INTO district (subregion_id, name, type) VALUES
(9, 'Kabale', 'Rural'),
(9, 'Rukungiri', 'Rural'),
(9, 'Kisoro', 'Rural'),
(9, 'Kanungu', 'Rural'),
(1, 'Kampala', 'City'),
(7, 'Mbarara', 'Municipality'),
(12, 'Gulu', 'City');

-- 4. Example Subcounties (for Rural Districts)
INSERT INTO subcounty (district_id, name) VALUES
(1, 'Bubare'),
(1, 'Kamuganguzi'),
(2, 'Nyakagyeme'),
(3, 'Nyakabande');

-- 5. Example Parishes
INSERT INTO parish (subcounty_id, name) VALUES
(1, 'Kigata'),
(1, 'Butare'),
(2, 'Nyakinengo'),
(3, 'Gasiza');

-- 6. Example Villages
INSERT INTO village (parish_id, name) VALUES
(1, 'Kigata A'),
(1, 'Kigata B'),
(2, 'Butare Central'),
(3, 'Gasiza Hill');

-- 7. Example Divisions (for City/Municipality)
INSERT INTO division (district_id, name) VALUES
(5, 'Central Division'),
(6, 'Mbarara City North'),
(7, 'Pece-Laroo');

-- 8. Example Wards (for Divisions or Town Councils)
INSERT INTO ward (parent_type, parent_id, name) VALUES
('Division', 1, 'Old Kampala'),
('Division', 2, 'Kakoba'),
('Division', 3, 'Layibi');

-- 9. Example CellZones
INSERT INTO cellzone (ward_id, name) VALUES
(1, 'Namirembe Hill'),
(2, 'Kakoba Central'),
(3, 'Layibi Central');
