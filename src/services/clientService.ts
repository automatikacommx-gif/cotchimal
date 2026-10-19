import { supabase, isSupabaseConfigured, isTableMissingError, setSupabaseTablesStatus } from '../lib/supabase';
import { Client, ClientCategory } from '../types';

// Datos semilla de respaldo para evaluación inicial si las credenciales aún no están vinculadas
export const INITIAL_SEED_CLIENTS: Client[] = [
  {
    id: 'a1111111-1111-4111-a111-111111111111',
    user_id: '00000000-0000-0000-0000-000000000001',
    business_name: 'Distribuidora Automotriz del Valle S.A. de C.V.',
    rfc: 'DAV890312KP4',
    contact_name: 'Lic. Mariana Velasco Solís',
    contact_role: 'Directora de Mercadotecnia',
    email: 'mvelasco@autovalle.com.mx',
    phone: '55 5678 1234',
    address: 'Av. Insurgentes Sur 1480, Col. Actipan, Benito Juárez, CDMX, C.P. 03230',
    category: 'Automotriz',
    tags: ['#Automotriz', '#Gran Formato', '#Flotillas', '#Factura Mensual', '#Polizas Garantia'],
    notes: 'Cliente corporativo recurrente con 14 agencias activas en centro y bajío. Requieren rotulación de flotillas en vinil automotriz 3M y tirajes de 12,000 manuales de pólizas de garantía trimestralmente en couché mate 130g. Contactar con Mariana los días martes para autorizaciones de preprensa.',
    cfdi_use: 'G03 Gastos en general',
    tax_regime: '601 General de Ley PM',
    total_billed: 248600,
    quotes_count: 8,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-09-05T14:30:00Z',
  },
  {
    id: 'b2222222-2222-4222-b222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000001',
    business_name: 'Laboratorios Farmacéuticos Quimex S.A. de C.V.',
    rfc: 'LFQ040819TX1',
    contact_name: 'Rodrigo Cárdenas',
    contact_role: 'Gerente de Compras',
    email: 'rcardenas@quimexlabs.com.mx',
    phone: '55 4321 8765',
    address: 'Calz. de Tlalpan 3020, Sta. Úrsula Coapa, Coyoacán, CDMX',
    category: 'Corporativo',
    tags: ['#Farmacéutico', '#Empaque', '#Barniz UV', '#Alta Calidad'],
    notes: 'Solicitan cajas plegadizas con acabados UV a registro y folletos prospecto para medicamentos clase B.',
    cfdi_use: 'G01 Adquisición de mercancías',
    tax_regime: '601 General de Ley PM',
    total_billed: 182400,
    quotes_count: 5,
    created_at: '2026-02-01T09:15:00Z',
    updated_at: '2026-09-04T11:00:00Z',
  },
  {
    id: 'c3333333-3333-4333-c333-333333333333',
    user_id: '00000000-0000-0000-0000-000000000001',
    business_name: 'Editorial Raíces de México',
    rfc: 'ERM160705MM8',
    contact_name: 'Sofía Altamirano',
    contact_role: 'Coordinadora de Publicaciones',
    email: 'saltamirano@raicesdemexico.org',
    phone: '55 8899 7766',
    address: 'Calle Donceles 66, Centro Histórico, Cuauhtémoc, CDMX',
    category: 'Editorial',
    tags: ['#Editorial', '#Libros', '#Pasta Dura', '#Hotmelt'],
    notes: 'Proyectos editoriales de arte y tirajes institucionales de pasta dura con encuadernación de lujo.',
    cfdi_use: 'G03 Gastos en general',
    tax_regime: '603 Personas Morales con Fines no Lucrativos',
    total_billed: 145000,
    quotes_count: 6,
    created_at: '2026-02-15T12:00:00Z',
    updated_at: '2026-09-03T16:20:00Z',
  },
  {
    id: 'd4444444-4444-4444-d444-444444444444',
    user_id: '00000000-0000-0000-0000-000000000001',
    business_name: 'Cadena de Restaurantes Fogón & Brasa',
    rfc: 'CFB1809228Y3',
    contact_name: 'Manuel Arteaga',
    contact_role: 'Director de Operaciones y Franquicias',
    email: 'marteaga@fogonbrasa.com',
    phone: '55 3322 1100',
    address: 'Av. Paseo de las Palmas 405, Lomas de Chapultepec, Miguel Hidalgo, CDMX',
    category: 'Corporativo',
    tags: ['#Restaurantero', '#Plastificado', '#Menús', '#Señalética'],
    notes: 'Impresión de manteles, menús plastificados soft-touch y señalética de mesa para 22 sucursales.',
    cfdi_use: 'G03 Gastos en general',
    tax_regime: '601 General de Ley PM',
    total_billed: 96300,
    quotes_count: 3,
    created_at: '2026-03-01T15:45:00Z',
    updated_at: '2026-09-06T10:10:00Z',
  },
  {
    id: 'e5555555-5555-4555-e555-555555555555',
    user_id: '00000000-0000-0000-0000-000000000001',
    business_name: 'Inmobiliaria Metropolitana & Desarrollos',
    rfc: 'IME210115HQ7',
    contact_name: 'Karla Sotomayor',
    contact_role: 'Branding & Ventas',
    email: 'ksotomayor@metropolitanainmo.com',
    phone: '55 9988 2211',
    address: 'Av. Santa Fe 495, Cruz Manca, Cuajimalpa, CDMX',
    category: 'Publicidad',
    tags: ['#Inmobiliario', '#Gran Formato', '#Vallas', '#Stands'],
    notes: 'Publicidad exterior para casetas de ventas de departamentos, pendones y tótems luminosos.',
    cfdi_use: 'G03 Gastos en general',
    tax_regime: '601 General de Ley PM',
    total_billed: 112850,
    quotes_count: 4,
    created_at: '2026-03-10T11:20:00Z',
    updated_at: '2026-09-01T08:50:00Z',
  },
];

// Estado en memoria para cuando no se ha provisto Supabase URL o las tablas no se han creado
let localClientsStore: Client[] = [...INITIAL_SEED_CLIENTS];

const getFilteredLocalClients = (categoryFilter?: ClientCategory | 'TODOS', searchQuery?: string): Client[] => {
  let filtered = [...localClientsStore];
  if (categoryFilter && categoryFilter !== 'TODOS') {
    filtered = filtered.filter((c) => c.category === categoryFilter);
  }
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.business_name.toLowerCase().includes(q) ||
        c.rfc.toLowerCase().includes(q) ||
        c.contact_name.toLowerCase().includes(q)
    );
  }
  return filtered;
};

export const clientService = {
  /**
   * Obtiene todos los clientes registrados
   */
  async getClients(categoryFilter?: ClientCategory | 'TODOS', searchQuery?: string): Promise<{ data: Client[]; error: string | null }> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        if (categoryFilter && categoryFilter !== 'TODOS') {
          query = query.eq('category', categoryFilter);
        }

        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.trim();
          query = query.or(`business_name.ilike.%${q}%,rfc.ilike.%${q}%,contact_name.ilike.%${q}%`);
        }

        const { data, error } = await query;

        if (error) {
          if (isTableMissingError(error)) {
            setSupabaseTablesStatus(false);
          } else {
            console.warn('Nota Supabase clients:', error.message);
          }
          return { data: getFilteredLocalClients(categoryFilter, searchQuery), error: null };
        }

        setSupabaseTablesStatus(true);

        // Obtener estadísticas de cotizaciones para cada cliente
        const clientsWithStats = await Promise.all(
          (data || []).map(async (client: Client) => {
            try {
              const { data: quotesData, error: qErr } = await supabase
                .from('quotes')
                .select('total')
                .eq('client_id', client.id);

              if (qErr) {
                return client;
              }
              const total = quotesData?.reduce((acc, curr) => acc + Number(curr.total || 0), 0) || 0;
              return {
                ...client,
                total_billed: total,
                quotes_count: quotesData?.length || 0,
              };
            } catch {
              return client;
            }
          })
        );

        return { data: clientsWithStats, error: null };
      } catch (err: any) {
        if (isTableMissingError(err)) {
          setSupabaseTablesStatus(false);
        } else {
          console.warn('Nota Supabase query error:', err?.message || err);
        }
        return { data: getFilteredLocalClients(categoryFilter, searchQuery), error: null };
      }
    }

    return { data: getFilteredLocalClients(categoryFilter, searchQuery), error: null };
  },

  /**
   * Crea un nuevo cliente en Supabase
   */
  async createClient(clientData: Partial<Client>): Promise<{ data: Client | null; error: string | null }> {
    let authUserId: string | null = null;
    try {
      const { data: authData } = await supabase.auth.getUser();
      authUserId = authData?.user?.id || null;
    } catch {
      // Ignorar si no está autenticado
    }

    const fullClientPayload: Record<string, any> = {
      business_name: clientData.business_name || 'Empresa Sin Nombre',
      rfc: (clientData.rfc || 'XAXX010101000').toUpperCase(),
      contact_name: clientData.contact_name || 'Contacto Comercial',
      contact_role: clientData.contact_role || 'Representante',
      email: clientData.email || 'contacto@empresa.com',
      phone: clientData.phone || '55 0000 0000',
      address: clientData.address || 'Ciudad de México',
      category: clientData.category || 'Corporativo',
      tags: clientData.tags || ['#Corporativo'],
      notes: clientData.notes || '',
      cfdi_use: clientData.cfdi_use || 'G03 Gastos en general',
      tax_regime: clientData.tax_regime || '601 General de Ley PM',
    };

    if (authUserId || (clientData.user_id && clientData.user_id !== '00000000-0000-0000-0000-000000000001')) {
      fullClientPayload.user_id = authUserId || clientData.user_id;
    }

    const createLocal = (): Client => {
      const newClient: Client = {
        id: crypto.randomUUID ? crypto.randomUUID() : `client-${Date.now()}`,
        business_name: fullClientPayload.business_name,
        rfc: fullClientPayload.rfc,
        contact_name: fullClientPayload.contact_name,
        contact_role: fullClientPayload.contact_role,
        email: fullClientPayload.email,
        phone: fullClientPayload.phone,
        address: fullClientPayload.address,
        category: fullClientPayload.category,
        tags: fullClientPayload.tags,
        notes: fullClientPayload.notes,
        cfdi_use: fullClientPayload.cfdi_use,
        tax_regime: fullClientPayload.tax_regime,
        user_id: fullClientPayload.user_id,
        total_billed: 0,
        quotes_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localClientsStore.unshift(newClient);
      return newClient;
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('clients')
          .insert([fullClientPayload])
          .select()
          .single();

        if (error) {
          if (isTableMissingError(error)) {
            setSupabaseTablesStatus(false);
          } else {
            console.warn('Nota createClient Supabase:', error.message);
          }
          const local = createLocal();
          return { data: local, error: null };
        }
        setSupabaseTablesStatus(true);
        return { data: data as Client, error: null };
      } catch (err: any) {
        if (isTableMissingError(err)) {
          setSupabaseTablesStatus(false);
        } else {
          console.warn('Nota createClient error:', err?.message || err);
        }
        const local = createLocal();
        return { data: local, error: null };
      }
    }

    // Modo local
    const local = createLocal();
    return { data: local, error: null };
  },

  /**
   * Actualiza un cliente existente en Supabase
   */
  async updateClient(id: string, clientData: Partial<Client>): Promise<{ data: Client | null; error: string | null }> {
    const updateLocal = (): { data: Client | null; error: string | null } => {
      const index = localClientsStore.findIndex((c) => c.id === id);
      if (index === -1) return { data: null, error: 'Cliente no encontrado' };

      const updated = {
        ...localClientsStore[index],
        ...clientData,
        updated_at: new Date().toISOString(),
      };
      localClientsStore[index] = updated;
      return { data: updated, error: null };
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('clients')
          .update({
            ...clientData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          if (isTableMissingError(error)) {
            setSupabaseTablesStatus(false);
          } else {
            console.warn('Nota updateClient Supabase:', error.message);
          }
          return updateLocal();
        }
        setSupabaseTablesStatus(true);
        return { data: data as Client, error: null };
      } catch (err: any) {
        if (isTableMissingError(err)) {
          setSupabaseTablesStatus(false);
        } else {
          console.warn('Nota updateClient error:', err?.message || err);
        }
        return updateLocal();
      }
    }

    return updateLocal();
  },

  /**
   * Elimina un cliente de Supabase
   */
  async deleteClient(id: string): Promise<{ success: boolean; error: string | null }> {
    const deleteLocal = (): { success: boolean; error: string | null } => {
      localClientsStore = localClientsStore.filter((c) => c.id !== id);
      return { success: true, error: null };
    };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', id);

        if (error) {
          if (isTableMissingError(error)) {
            setSupabaseTablesStatus(false);
          } else {
            console.warn('Nota deleteClient Supabase:', error.message);
          }
          return deleteLocal();
        }
        setSupabaseTablesStatus(true);
        return { success: true, error: null };
      } catch (err: any) {
        if (isTableMissingError(err)) {
          setSupabaseTablesStatus(false);
        } else {
          console.warn('Nota deleteClient error:', err?.message || err);
        }
        return deleteLocal();
      }
    }

    return deleteLocal();
  },
};
