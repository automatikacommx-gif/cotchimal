-- ==============================================================================
-- MIGRACIÓN BASE DE DATOS SUPABASE - SISTEMA DE COTIZACIONES INDUSTRIAL & CRM
-- Proyecto: Grupo Chimal / Editorial Jiménez - Cotizador Industrial
-- Base de Datos: PostgreSQL en Supabase
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: profiles (Perfiles vinculados a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'seller')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- Índices para perfiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. TABLA: clients (Directorio de Clientes CRM)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    business_name TEXT NOT NULL,
    rfc TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_role TEXT NOT NULL DEFAULT 'Contacto Comercial',
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Corporativo' CHECK (category IN ('Editorial', 'Automotriz', 'Corporativo', 'Publicidad', 'PyME')),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    notes TEXT DEFAULT '',
    cfdi_use TEXT DEFAULT 'G03 Gastos en general',
    tax_regime TEXT DEFAULT '601 General de Ley PM',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clients_business_name ON public.clients(business_name);
CREATE INDEX IF NOT EXISTS idx_clients_rfc ON public.clients(rfc);
CREATE INDEX IF NOT EXISTS idx_clients_category ON public.clients(category);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- 4. TABLA: quotes (Cotizaciones Comerciales)
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    quote_number TEXT NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_title TEXT NOT NULL,
    project_type TEXT NOT NULL DEFAULT 'general' CHECK (project_type IN ('general', 'editorial', 'empaque', 'gran_formato')),
    status TEXT NOT NULL DEFAULT 'borrador' CHECK (status IN ('borrador', 'enviada', 'negociacion', 'aceptada', 'rechazada')),
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 16.00,
    tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'MXN',
    valid_until DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '15 days'),
    technical_notes TEXT DEFAULT '',
    material TEXT DEFAULT '',
    observations TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para cotizaciones
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON public.quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON public.quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at DESC);

-- 5. TABLA: quote_items (Partidas / Desglose de cotización)
CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 1.00,
    unit TEXT NOT NULL DEFAULT 'Pza',
    unit_price NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    substrate_finishing TEXT DEFAULT '',
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON public.quote_items(quote_id);

-- 6. TABLA: company_settings (Ajustes de la Imprenta y Parámetros)
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    contact_name TEXT NOT NULL DEFAULT 'luis jimenez',
    company_name TEXT NOT NULL UNIQUE DEFAULT 'editorial jimenez',
    city TEXT NOT NULL DEFAULT 'toluca',
    phone TEXT NOT NULL DEFAULT '7226201052',
    email TEXT DEFAULT '01luisenrique@gmail.com',
    rfc TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    accent_color TEXT DEFAULT '#10B981',
    referral_code TEXT DEFAULT '',
    work_types TEXT[] DEFAULT ARRAY['general', 'editorial', 'empaque']::TEXT[],
    press_cut_percent NUMERIC(5, 2) DEFAULT 5.00,
    final_cut_price NUMERIC(10, 2) DEFAULT 1.00,
    final_cut_mode TEXT DEFAULT 'por_corte_millar',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLA: workshop_machines (Prensas y Maquinaria del Taller)
CREATE TABLE IF NOT EXISTS public.workshop_machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sheet_size TEXT DEFAULT '71x102 cm',
    plate_price NUMERIC(10, 2) DEFAULT 80.00,
    print_price_type TEXT DEFAULT 'fijo',
    print_price NUMERIC(10, 2) DEFAULT 80.00,
    waste_ranges TEXT DEFAULT '5 rangos · desde 100 plgs',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABLA: paper_catalog (Catálogo de Papeles y Gramajes)
CREATE TABLE IF NOT EXISTS public.paper_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'frecuente',
    grammages JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABLA: workshop_services (Carta de Servicios y Acabados)
CREATE TABLE IF NOT EXISTS public.workshop_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    rate_mode TEXT DEFAULT 'General',
    price NUMERIC(10, 2) DEFAULT 0.00,
    unit TEXT DEFAULT 'por pieza',
    min_price NUMERIC(10, 2) DEFAULT 0.00,
    is_selected BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. TABLA: shipping_zones (Zonas de Envío)
CREATE TABLE IF NOT EXISTS public.shipping_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    unit TEXT DEFAULT '/proyecto',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. TABLA: team_members (Miembros del Equipo)
CREATE TABLE IF NOT EXISTS public.team_members (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'seller',
    is_owner BOOLEAN DEFAULT false,
    role_label TEXT DEFAULT 'Vendedor',
    access_label TEXT DEFAULT '• Permisos configurados',
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Acceso completo para clientes y cotizaciones a roles anon y authenticated
DROP POLICY IF EXISTS "Permitir todo acceso a profiles" ON public.profiles;
CREATE POLICY "Permitir todo acceso a profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo acceso a clients" ON public.clients;
CREATE POLICY "Permitir todo acceso a clients" ON public.clients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo acceso a quotes" ON public.quotes;
CREATE POLICY "Permitir todo acceso a quotes" ON public.quotes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo acceso a quote_items" ON public.quote_items;
CREATE POLICY "Permitir todo acceso a quote_items" ON public.quote_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo acceso a company_settings" ON public.company_settings;
CREATE POLICY "Permitir todo acceso a company_settings" ON public.company_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo acceso a workshop_machines" ON public.workshop_machines;
CREATE POLICY "Permitir todo acceso a workshop_machines" ON public.workshop_machines FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo acceso a paper_catalog" ON public.paper_catalog;
CREATE POLICY "Permitir todo acceso a paper_catalog" ON public.paper_catalog FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo acceso a workshop_services" ON public.workshop_services;
CREATE POLICY "Permitir todo acceso a workshop_services" ON public.workshop_services FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo acceso a shipping_zones" ON public.shipping_zones;
CREATE POLICY "Permitir todo acceso a shipping_zones" ON public.shipping_zones FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo acceso a team_members" ON public.team_members;
CREATE POLICY "Permitir todo acceso a team_members" ON public.team_members FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 13. TRIGGER: Creación automática de perfil al registrarse nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, role)
    VALUES (
        new.id, 
        new.email, 
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'admin')
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 14. POBLACIÓN INICIAL DE PRUEBA: 5 Clientes Corporativos
INSERT INTO public.clients (
    id, business_name, rfc, contact_name, contact_role, email, phone, address, category, tags, notes, cfdi_use, tax_regime
) VALUES 
(
    'a1111111-1111-4111-a111-111111111111',
    'Distribuidora Automotriz del Valle S.A. de C.V.',
    'DAV890312KP4',
    'Lic. Mariana Velasco Solís',
    'Directora de Mercadotecnia',
    'mvelasco@autovalle.com.mx',
    '55 5678 1234',
    'Av. Insurgentes Sur 1480, Col. Actipan, Benito Juárez, CDMX, C.P. 03230',
    'Automotriz',
    ARRAY['#Automotriz', '#Gran Formato', '#Flotillas', '#Factura Mensual', '#Polizas Garantia'],
    'Cliente corporativo recurrente con 14 agencias activas en centro y bajío. Requieren rotulación de flotillas en vinil automotriz 3M y tirajes de 12,000 manuales trimestralmente.',
    'G03 Gastos en general',
    '601 General de Ley PM'
),
(
    'b2222222-2222-4222-b222-222222222222',
    'Laboratorios Farmacéuticos Quimex S.A. de C.V.',
    'LFQ040819TX1',
    'Rodrigo Cárdenas',
    'Gerente de Compras',
    'rcardenas@quimexlabs.com.mx',
    '55 4321 8765',
    'Calz. de Tlalpan 3020, Sta. Úrsula Coapa, Coyoacán, CDMX',
    'Corporativo',
    ARRAY['#Farmacéutico', '#Empaque', '#Barniz UV', '#Alta Calidad'],
    'Solicitan cajas plegadizas con acabados UV a registro y folletos prospecto para medicamentos clase B.',
    'G01 Adquisición de mercancías',
    '601 General de Ley PM'
),
(
    'c3333333-3333-4333-c333-333333333333',
    'Editorial Raíces de México',
    'ERM160705MM8',
    'Sofía Altamirano',
    'Coordinadora de Publicaciones',
    'saltamirano@raicesdemexico.org',
    '55 8899 7766',
    'Calle Donceles 66, Centro Histórico, Cuauhtémoc, CDMX',
    'Editorial',
    ARRAY['#Editorial', '#Libros', '#Pasta Dura', '#Hotmelt'],
    'Proyectos editoriales de arte y tirajes institucionales de pasta dura con encuadernación de lujo.',
    'G03 Gastos en general',
    '603 Personas Morales con Fines no Lucrativos'
),
(
    'd4444444-4444-4444-d444-444444444444',
    'Cadena de Restaurantes Fogón & Brasa',
    'CFB1809228Y3',
    'Manuel Arteaga',
    'Director de Operaciones y Franquicias',
    'marteaga@fogonbrasa.com',
    '55 3322 1100',
    'Av. Paseo de las Palmas 405, Lomas de Chapultepec, Miguel Hidalgo, CDMX',
    'Corporativo',
    ARRAY['#Restaurantero', '#Plastificado', '#Menús', '#Señalética'],
    'Impresión de manteles, menús plastificados soft-touch y señalética de mesa para 22 sucursales.',
    'G03 Gastos en general',
    '601 General de Ley PM'
),
(
    'e5555555-5555-4555-e555-555555555555',
    'Inmobiliaria Metropolitana & Desarrollos',
    'IME210115HQ7',
    'Karla Sotomayor',
    'Branding & Ventas',
    'ksotomayor@metropolitanainmo.com',
    '55 9988 2211',
    'Av. Santa Fe 495, Cruz Manca, Cuajimalpa, CDMX',
    'Publicidad',
    ARRAY['#Inmobiliario', '#Gran Formato', '#Vallas', '#Stands'],
    'Publicidad exterior para casetas de ventas de departamentos, pendones y tótems luminosos.',
    'G03 Gastos en general',
    '601 General de Ley PM'
)
ON CONFLICT (id) DO NOTHING;

-- 15. POBLACIÓN INICIAL DE COTIZACIONES DE PRUEBA
INSERT INTO public.quotes (
    id, quote_number, client_id, project_title, project_type, status, subtotal, tax_rate, tax_amount, total
) VALUES 
(
    '11111111-aaaa-4111-aaaa-111111111111',
    'CHM-2026-084',
    'a1111111-1111-4111-a111-111111111111',
    'Rotulación Integral de Flotilla 2026 (12 Pick-ups) y Manuales',
    'gran_formato',
    'enviada',
    116850.00,
    16.00,
    18696.00,
    135546.00
),
(
    '22222222-bbbb-4222-bbbb-222222222222',
    'CHM-2026-083',
    'b2222222-2222-4222-b222-222222222222',
    'Cajas Plegadizas Suplemento Quimex Plus con Barniz UV a Registro',
    'empaque',
    'aceptada',
    42000.00,
    16.00,
    6720.00,
    48720.00
),
(
    '33333333-cccc-4333-cccc-333333333333',
    'CHM-2026-082',
    'c3333333-3333-4333-c333-333333333333',
    'Tiraje Especial: "Crónicas del Arte Prehispánico" (Pasta Dura)',
    'editorial',
    'negociacion',
    84180.17,
    16.00,
    13468.83,
    97649.00
),
(
    '44444444-dddd-4444-dddd-444444444444',
    'CHM-2026-081',
    'd4444444-4444-4444-d444-444444444444',
    'Menús Plastificados Soft Touch y Señalética COVID/STPS',
    'general',
    'borrador',
    17779.31,
    16.00,
    2844.69,
    20625.00
),
(
    '55555555-eeee-4555-eeee-555555555555',
    'CHM-2026-080',
    'e5555555-5555-4555-e555-555555555555',
    'Tótem Exterior Luminoso y Rotulación Caseta Hábitat Coyoacán',
    'gran_formato',
    'rechazada',
    46319.83,
    16.00,
    7411.17,
    53731.00
)
ON CONFLICT (id) DO NOTHING;

-- 16. PARTIDAS DE EJEMPLO
INSERT INTO public.quote_items (
    quote_id, description, quantity, unit, unit_price, substrate_finishing, subtotal
) VALUES 
('11111111-aaaa-4111-aaaa-111111111111', 'Rotulación vehicular en vinil automotriz 3M microperforado y laminado UV', 12, 'Vehículo', 7500.00, 'Laminado UV Antipiedras 3M', 90000.00),
('11111111-aaaa-4111-aaaa-111111111111', 'Manuales de garantía foliados en couché mate 130g grapados a caballo', 2000, 'Ejemplar', 13.425, 'Couché mate 130g / Grapa', 26850.00),
('22222222-bbbb-4222-bbbb-222222222222', 'Cajas plegadizas con suaje, plecado y Barniz UV a registro', 15000, 'Pza', 2.80, 'Cartulina Sulfatada 16pts + UV', 42000.00)
ON CONFLICT DO NOTHING;

-- 17. MIGRACIONES / ACTUALIZACIÓN DE COLUMNAS OPCIONALES
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS material TEXT DEFAULT '';
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS observations TEXT DEFAULT '';
