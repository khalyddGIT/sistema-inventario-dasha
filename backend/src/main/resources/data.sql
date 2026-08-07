

-- Insert sample usuarios
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Ana María López', 'admin@dasha.com', 'admin123', 'ADMIN'),
('Carlos Pérez', 'tecnico@dasha.com', 'tecnico123', 'TECNICO');

-- Insert sample categorias
INSERT INTO categorias (nombre) VALUES 
('Analgésicos'),
('Antibióticos'),
('Vitaminas'),
('Antihistamínicos'),
('Descongestionantes nasales');

-- Insert sample laboratorios
INSERT INTO laboratorios (nombre) VALUES 
('Laboratorios Internacionales'),
('Farmacéutica Nacional S.A.'),
('Medicamentos del Perú'),
('Salud Global S.R.L.'),
('FarmaTech');

-- Insert sample proveedores
INSERT INTO proveedores (nombre, contacto, telefono, direccion) VALUES 
('Distribuidora Farma S.A.C.', 'Sr. Juan Mendoza', '987654321', 'Av. Aviación 123, Lima'),
('Medicamentos del Sur S.R.L.', 'Sra. Rosa González', '976543210', 'Calle Comercio 456, Arequipa'),
('Laboratorios Peruanos S.A.', 'Sr. Luis Rojas', '965432109', 'Jr. Lampa 789, Cusco'),
('Importadora de Medicamentos S.A.C.', 'Sra. Carmen Vásquez', '954321098', 'Av. Tacna 101, Tacna'),
('Farma Distribuciones EIRL', 'Sr. Miguel Torres', '943210987', 'Calle Ayacucho 202, Huamanga');

-- Insert sample productos
INSERT INTO productos (codigo, nombre, presentacion, lote, fecha_vencimiento, stock_actual, stock_minimo, precio_compra, precio_venta, categoria_id, laboratorio_id) VALUES 
('P001', 'Paracetamol 500mg', 'Tabletas', 'L202512', '2026-06-15', 100, 20, 2.50, 5.00, 1, 1),
('P002', 'Ibuprofeno 400mg', 'Tabletas', 'L202513', '2026-03-20', 75, 15, 3.00, 6.00, 1, 2),
('P003', 'Amoxicilina 500mg', 'Cápsulas', 'L202514', '2025-12-10', 50, 10, 8.00, 15.00, 2, 1),
('P004', 'Vitamina C 1000mg', 'Comprimidos efervescentes', 'L202515', '2026-09-05', 200, 30, 1.20, 3.00, 3, 3),
('P005', 'Loratadina 10mg', 'Tabletas', 'L202516', '2026-01-30', 80, 25, 4.50, 8.00, 4, 2),
('P006', 'Clorfenamina 4mg', 'Jarabe', 'L202517', '2025-11-25', 40, 10, 6.00, 12.00, 4, 4),
('P007', 'Pseudoefedrina 60mg', 'Tabletas', 'L202518', '2026-05-15', 60, 15, 5.00, 10.00, 5, 3);