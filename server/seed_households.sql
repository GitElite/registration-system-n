INSERT INTO households (
  head_name,
  primary_phone,
  alternate_contact,
  region_id,
  subregion_id,
  district_id,
  subcounty_id,
  parish_id,
  village_id,
  gps_latitude,
  gps_longitude,
  land_size,
  plot_characteristics,
  num_members,
  primary_income,
  past_orchard_experience,
  water_source,
  payment_method,
  mobile_money_number,
  agreed_to_credit_terms,
  registration_date,
  registered_by,
  registration_status
)
VALUES
('John Kato', '0701234567', '0758123456', 3, 9, 1, 1, 1, 1, -1.234, 29.993, 1.5, 'Flat', 5, 'Subsistence farming', true, 'Rainwater harvesting', 'MobileMoney', '0701234567', true, NOW(), 1, 'Pending'),
('Sarah Namanda', '0709876543', NULL, 3, 9, 1, 2, 3, 4, -1.210, 29.900, 0.8, 'Gentle slope', 3, 'Small business', false, 'Stream', 'Bank', NULL, true, NOW(), 1, 'Approved');
