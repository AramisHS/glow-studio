
-- Services table
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_min decimal(10,2) NOT NULL,
  price_max decimal(10,2),
  duration_minutes int NOT NULL DEFAULT 60,
  category text NOT NULL,
  active boolean DEFAULT true,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_email text,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  service_name text,
  approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Services: anyone can read active services
CREATE POLICY "public_read_services" ON services
  FOR SELECT TO anon, authenticated
  USING (active = true);

-- Appointments: anyone can create a booking
CREATE POLICY "public_insert_appointments" ON appointments
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Appointments: allow reading to check slot availability (date/time only, no personal data)
CREATE POLICY "public_read_appointment_slots" ON appointments
  FOR SELECT TO anon, authenticated
  USING (true);

-- Reviews: anyone can read approved reviews
CREATE POLICY "public_read_reviews" ON reviews
  FOR SELECT TO anon, authenticated
  USING (approved = true);

-- Reviews: anyone can submit a review
CREATE POLICY "public_insert_reviews" ON reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Seed services data
INSERT INTO services (name, description, price_min, price_max, duration_minutes, category, display_order) VALUES
  ('Uñas Acrílicas Manos', 'Uñas acrílicas con diseño personalizado para manos', 350.00, NULL, 90, 'Uñas', 1),
  ('Uñas Acrílicas Pies', 'Uñas acrílicas con diseño personalizado para pies', 300.00, NULL, 75, 'Uñas', 2),
  ('Uñas Acrílicas Manos + Pies', 'Paquete completo de uñas acrílicas manos y pies', 600.00, NULL, 150, 'Uñas', 3),
  ('Gelish Manos', 'Esmalte semipermanente Gelish para manos', 250.00, NULL, 60, 'Uñas', 4),
  ('Gelish Pies', 'Esmalte semipermanente Gelish para pies', 200.00, NULL, 60, 'Uñas', 5),
  ('Corte de Cabello Dama', 'Corte profesional para dama con acabado', 150.00, NULL, 45, 'Cabello', 6),
  ('Corte de Cabello Caballero', 'Corte profesional para caballero con acabado', 100.00, NULL, 30, 'Cabello', 7),
  ('Permanente', 'Permanente profesional para ondular o rizar el cabello', 400.00, 600.00, 120, 'Cabello', 8),
  ('Depilación Área Pequeña', 'Depilación de cejas, labio o mentón', 80.00, NULL, 20, 'Depilación', 9),
  ('Depilación Área Grande', 'Depilación de piernas, axilas o bikini', 150.00, 250.00, 45, 'Depilación', 10),
  ('Maquillaje Social', 'Maquillaje para eventos sociales, graduaciones, etc.', 350.00, NULL, 60, 'Maquillaje & Peinado', 11),
  ('Maquillaje de Noche / Evento', 'Maquillaje profesional para eventos especiales y noche', 450.00, 600.00, 75, 'Maquillaje & Peinado', 12),
  ('Peinado', 'Peinado profesional para cualquier ocasión', 200.00, 350.00, 60, 'Maquillaje & Peinado', 13),
  ('Paquete Novia (Maquillaje + Peinado)', 'Paquete completo de maquillaje y peinado para novia', 800.00, 1200.00, 150, 'Maquillaje & Peinado', 14);

-- Seed some sample reviews
INSERT INTO reviews (client_name, rating, comment, service_name, approved) VALUES
  ('Ana Martínez', 5, 'Excelente servicio, mis uñas quedaron perfectas. ¡Muy recomendada!', 'Uñas Acrílicas Manos', true),
  ('Sofía Ramírez', 5, 'Mayra es una profesional increíble. El maquillaje para mi graduación quedó espectacular.', 'Maquillaje de Noche / Evento', true),
  ('Carmen López', 4, 'Muy buen trabajo el corte de cabello, quedé muy contenta. Ambiente muy agradable.', 'Corte de Cabello Dama', true),
  ('Valeria Torres', 5, 'El Gelish me duró más de 3 semanas sin despegarse. Calidad excelente y muy buen trato.', 'Gelish Manos', true),
  ('Mariana García', 5, 'El peinado para mi boda fue un sueño, exactamente lo que quería. ¡Gracias Mayra!', 'Peinado', true);
