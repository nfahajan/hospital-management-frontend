-- Seed data for Healthcare Appointment System
-- Version 1.0

-- Insert Admin User
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'admin@healthcare.com', '$2a$10$XQKvvXQKvvXQKvvXQKvvXe', 'admin', 'System', 'Administrator', '+1-555-0100');

-- Insert Doctor Users
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone)
VALUES 
  ('d0000000-0000-0000-0000-000000000001', 'dr.smith@healthcare.com', '$2a$10$XQKvvXQKvvXQKvvXQKvvXe', 'doctor', 'Sarah', 'Smith', '+1-555-0101'),
  ('d0000000-0000-0000-0000-000000000002', 'dr.johnson@healthcare.com', '$2a$10$XQKvvXQKvvXQKvvXQKvvXe', 'doctor', 'Michael', 'Johnson', '+1-555-0102'),
  ('d0000000-0000-0000-0000-000000000003', 'dr.williams@healthcare.com', '$2a$10$XQKvvXQKvvXQKvvXQKvvXe', 'doctor', 'Emily', 'Williams', '+1-555-0103'),
  ('d0000000-0000-0000-0000-000000000004', 'dr.brown@healthcare.com', '$2a$10$XQKvvXQKvvXQKvvXQKvvXe', 'doctor', 'David', 'Brown', '+1-555-0104'),
  ('d0000000-0000-0000-0000-000000000005', 'dr.davis@healthcare.com', '$2a$10$XQKvvXQKvvXQKvvXQKvvXe', 'doctor', 'Jennifer', 'Davis', '+1-555-0105');

-- Insert Patient Users
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone)
VALUES 
  ('p0000000-0000-0000-0000-000000000001', 'john.doe@email.com', '$2a$10$XQKvvXQKvvXQKvvXQKvvXe', 'patient', 'John', 'Doe', '+1-555-0201'),
  ('p0000000-0000-0000-0000-000000000002', 'jane.smith@email.com', '$2a$10$XQKvvXQKvvXQKvvXQKvvXe', 'patient', 'Jane', 'Smith', '+1-555-0202'),
  ('p0000000-0000-0000-0000-000000000003', 'robert.wilson@email.com', '$2a$10$XQKvvXQKvvXQKvvXQKvvXe', 'patient', 'Robert', 'Wilson', '+1-555-0203');

-- Insert Doctors
INSERT INTO doctors (id, user_id, specialization, license_number, years_of_experience, education, bio, consultation_fee, rating, total_reviews)
VALUES 
  ('dd000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Cardiology', 'MD-CARD-12345', 15, 'MD from Harvard Medical School, Cardiology Fellowship at Mayo Clinic', 'Dr. Smith specializes in cardiovascular diseases with over 15 years of experience treating complex heart conditions.', 200.00, 4.8, 127),
  ('dd000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'Pediatrics', 'MD-PED-23456', 10, 'MD from Johns Hopkins, Pediatrics Residency at Children''s Hospital', 'Dr. Johnson is dedicated to providing comprehensive care for children from infancy through adolescence.', 150.00, 4.9, 203),
  ('dd000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'Dermatology', 'MD-DERM-34567', 8, 'MD from Stanford University, Dermatology Residency at UCSF', 'Dr. Williams specializes in medical and cosmetic dermatology with a focus on skin cancer prevention.', 175.00, 4.7, 89),
  ('dd000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'Orthopedics', 'MD-ORTH-45678', 12, 'MD from Yale School of Medicine, Orthopedic Surgery Fellowship', 'Dr. Brown focuses on sports medicine and joint replacement surgery with cutting-edge techniques.', 225.00, 4.6, 156),
  ('dd000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', 'Internal Medicine', 'MD-IM-56789', 20, 'MD from Columbia University, Internal Medicine Residency at NYU', 'Dr. Davis provides comprehensive primary care and manages chronic conditions with a holistic approach.', 180.00, 4.9, 312);

-- Insert Patients
INSERT INTO patients (id, user_id, date_of_birth, gender, address, city, state, zip_code, emergency_contact_name, emergency_contact_phone, insurance_provider, insurance_policy_number)
VALUES 
  ('pp000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', '1985-03-15', 'Male', '123 Main Street', 'New York', 'NY', '10001', 'Mary Doe', '+1-555-0301', 'Blue Cross Blue Shield', 'BCBS-123456'),
  ('pp000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000002', '1990-07-22', 'Female', '456 Oak Avenue', 'Los Angeles', 'CA', '90001', 'Tom Smith', '+1-555-0302', 'Aetna', 'AETNA-234567'),
  ('pp000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000003', '1978-11-08', 'Male', '789 Pine Road', 'Chicago', 'IL', '60601', 'Lisa Wilson', '+1-555-0303', 'UnitedHealthcare', 'UHC-345678');

-- Insert Doctor Schedules (Monday to Friday, 9 AM to 5 PM)
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
VALUES 
  -- Dr. Smith (Cardiology) - Mon, Wed, Fri
  ('dd000000-0000-0000-0000-000000000001', 1, '09:00', '17:00'),
  ('dd000000-0000-0000-0000-000000000001', 3, '09:00', '17:00'),
  ('dd000000-0000-0000-0000-000000000001', 5, '09:00', '17:00'),
  
  -- Dr. Johnson (Pediatrics) - Mon to Fri
  ('dd000000-0000-0000-0000-000000000002', 1, '08:00', '16:00'),
  ('dd000000-0000-0000-0000-000000000002', 2, '08:00', '16:00'),
  ('dd000000-0000-0000-0000-000000000002', 3, '08:00', '16:00'),
  ('dd000000-0000-0000-0000-000000000002', 4, '08:00', '16:00'),
  ('dd000000-0000-0000-0000-000000000002', 5, '08:00', '16:00'),
  
  -- Dr. Williams (Dermatology) - Tue, Thu
  ('dd000000-0000-0000-0000-000000000003', 2, '10:00', '18:00'),
  ('dd000000-0000-0000-0000-000000000003', 4, '10:00', '18:00'),
  
  -- Dr. Brown (Orthopedics) - Mon, Wed, Fri
  ('dd000000-0000-0000-0000-000000000004', 1, '09:00', '17:00'),
  ('dd000000-0000-0000-0000-000000000004', 3, '09:00', '17:00'),
  ('dd000000-0000-0000-0000-000000000004', 5, '09:00', '17:00'),
  
  -- Dr. Davis (Internal Medicine) - Mon to Fri
  ('dd000000-0000-0000-0000-000000000005', 1, '09:00', '17:00'),
  ('dd000000-0000-0000-0000-000000000005', 2, '09:00', '17:00'),
  ('dd000000-0000-0000-0000-000000000005', 3, '09:00', '17:00'),
  ('dd000000-0000-0000-0000-000000000005', 4, '09:00', '17:00'),
  ('dd000000-0000-0000-0000-000000000005', 5, '09:00', '17:00');

-- Insert Sample Appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, reason_for_visit, notes)
VALUES 
  ('pp000000-0000-0000-0000-000000000001', 'dd000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '3 days', '10:00', 'confirmed', 'Annual cardiac checkup', 'Patient has history of high blood pressure'),
  ('pp000000-0000-0000-0000-000000000002', 'dd000000-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '5 days', '14:00', 'pending', 'Child vaccination', 'Routine immunization schedule'),
  ('pp000000-0000-0000-0000-000000000003', 'dd000000-0000-0000-0000-000000000005', CURRENT_DATE + INTERVAL '1 day', '11:00', 'confirmed', 'Follow-up for diabetes management', 'Blood sugar levels need monitoring');
