-- ==========================================
-- Supabase PostgreSQL Schema & Initial Data
-- Botica DASHA - Sistema de Inventario
-- ==========================================

-- 1. Tabla Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL DEFAULT 'TECNICO',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla Categorías
CREATE TABLE IF NOT EXISTS categorias (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla Laboratorios
CREATE TABLE IF NOT EXISTS laboratorios (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  contacto VARCHAR(150),
  telefono VARCHAR(50),
  direccion VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla Productos
CREATE TABLE IF NOT EXISTS productos (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  presentacion VARCHAR(100),
  lote VARCHAR(50),
  fecha_vencimiento DATE,
  stock_actual INT DEFAULT 0,
  stock_minimo INT DEFAULT 10,
  precio_compra NUMERIC(10,2) DEFAULT 0.00,
  precio_venta NUMERIC(10,2) DEFAULT 0.00,
  categoria_id BIGINT REFERENCES categorias(id) ON DELETE SET NULL,
  laboratorio_id BIGINT REFERENCES laboratorios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla Compras
CREATE TABLE IF NOT EXISTS compras (
  id BIGSERIAL PRIMARY KEY,
  numero_comprobante VARCHAR(50),
  fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  total NUMERIC(10,2) DEFAULT 0.00,
  proveedor_id BIGINT REFERENCES proveedores(id) ON DELETE SET NULL,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 7. Tabla Detalle Compras
CREATE TABLE IF NOT EXISTS detalle_compras (
  id BIGSERIAL PRIMARY KEY,
  compra_id BIGINT REFERENCES compras(id) ON DELETE CASCADE,
  producto_id BIGINT REFERENCES productos(id) ON DELETE SET NULL,
  cantidad INT NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL
);

-- ==========================================
-- SEED DATA
-- ==========================================

INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Ana María López', 'admin@dasha.com', 'admin123', 'ADMIN'),
('Carlos Pérez', 'tecnico@dasha.com', 'tecnico123', 'TECNICO')
ON CONFLICT (email) DO NOTHING;

INSERT INTO categorias (nombre) VALUES 
('Analgésicos'),
('Antibióticos'),
('Vitaminas'),
('Antihistamínicos'),
('Descongestionantes nasales')
ON CONFLICT DO NOTHING;

INSERT INTO laboratorios (nombre) VALUES 
('Laboratorios Internacionales'),
('Farmacéutica Nacional S.A.'),
('Medicamentos del Perú'),
('Salud Global S.R.L.'),
('FarmaTech')
ON CONFLICT DO NOTHING;

INSERT INTO proveedores (nombre, contacto, telefono, direccion) VALUES 
('Distribuidora Farma S.A.C.', 'Sr. Juan Mendoza', '987654321', 'Av. Aviación 123, Lima'),
('Medicamentos del Sur S.R.L.', 'Sra. Rosa González', '976543210', 'Calle Comercio 456, Arequipa'),
('Laboratorios Peruanos S.A.', 'Sr. Luis Rojas', '965432109', 'Jr. Lampa 789, Cusco'),
('Importadora de Medicamentos S.A.C.', 'Sra. Carmen Vásquez', '954321098', 'Av. Tacna 101, Tacna'),
('Farma Distribuciones EIRL', 'Sr. Miguel Torres', '943210987', 'Calle Ayacucho 202, Huamanga')
ON CONFLICT DO NOTHING;

INSERT INTO productos (codigo, nombre, presentacion, lote, fecha_vencimiento, stock_actual, stock_minimo, precio_compra, precio_venta, categoria_id, laboratorio_id) VALUES 
('P001', 'Paracetamol 500mg', 'Tabletas', 'L202512', '2026-06-15', 100, 20, 2.50, 5.00, 1, 1),
('P002', 'Ibuprofeno 400mg', 'Tabletas', 'L202513', '2026-03-20', 75, 15, 3.00, 6.00, 1, 2),
('P003', 'Amoxicilina 500mg', 'Cápsulas', 'L202514', '2025-12-10', 50, 10, 8.00, 15.00, 2, 1),
('P004', 'Vitamina C 1000mg', 'Comprimidos efervescentes', 'L202515', '2026-09-05', 200, 30, 1.20, 3.00, 3, 3),
('P005', 'Loratadina 10mg', 'Tabletas', 'L202516', '2026-01-30', 80, 25, 4.50, 8.00, 4, 2),
('P006', 'Clorfenamina 4mg', 'Jarabe', 'L202517', '2025-11-25', 40, 10, 6.00, 12.00, 4, 4),
('P007', 'Pseudoefedrina 60mg', 'Tabletas', 'L202518', '2026-05-15', 60, 15, 5.00, 10.00, 5, 3)
ON CONFLICT (codigo) DO NOTHING;
