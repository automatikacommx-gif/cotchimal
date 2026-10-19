import { supabase, isSupabaseConfigured, isTableMissingError, setSupabaseTablesStatus } from '../lib/supabase';
import { Quote, QuoteItem, QuoteStatus, TrackingCommitment } from '../types';
import { INITIAL_SEED_CLIENTS } from './clientService';

export const INITIAL_SEED_QUOTES: Quote[] = [
  {
    id: '11111111-aaaa-4111-aaaa-111111111111',
    user_id: '00000000-0000-0000-0000-000000000001',
    quote_number: 'CHM-2026-084',
    client_id: 'a1111111-1111-4111-a111-111111111111',
    project_title: 'Rotulación Integral de Flotilla 2026 (12 Pick-ups) y Manuales',
    project_type: 'gran_formato',
    status: 'enviada',
    subtotal: 116850.00,
    tax_rate: 16.00,
    tax_amount: 18696.00,
    discount_amount: 0.00,
    total: 135546.00,
    currency: 'MXN',
    valid_until: '2026-09-20',
    technical_notes: 'Requiere vinil fundido 3M microperforado en medallón e impresión látex HD.',
    created_at: '2026-09-05T14:30:00Z',
    updated_at: '2026-09-05T14:30:00Z',
    client: INITIAL_SEED_CLIENTS[0],
    items: [
      {
        id: 'item-1',
        quote_id: '11111111-aaaa-4111-aaaa-111111111111',
        description: 'Rotulación de flotilla con vinil fundido 3M y laminado UV Antipiedras',
        quantity: 12,
        unit: 'Vehículo',
        unit_price: 7500.00,
        substrate_finishing: 'Laminado UV 3M Especial',
        subtotal: 90000.00,
      },
      {
        id: 'item-2',
        quote_id: '11111111-aaaa-4111-aaaa-111111111111',
        description: 'Manuales de Póliza de Garantía en Couché mate 130g grapados a caballo',
        quantity: 2000,
        unit: 'Ejemplar',
        unit_price: 13.425,
        substrate_finishing: 'Couché 130g + Grapa',
        subtotal: 26850.00,
      },
    ],
  },
  {
    id: '22222222-bbbb-4222-bbbb-222222222222',
    user_id: '00000000-0000-0000-0000-000000000001',
    quote_number: 'CHM-2026-083',
    client_id: 'b2222222-2222-4222-b222-222222222222',
    project_title: 'Cajas Plegadizas Suplemento Quimex Plus con Barniz UV a Registro',
    project_type: 'empaque',
    status: 'aceptada',
    subtotal: 42000.00,
    tax_rate: 16.00,
    tax_amount: 6720.00,
    discount_amount: 0.00,
    total: 48720.00,
    currency: 'MXN',
    valid_until: '2026-09-18',
    technical_notes: 'Cartulina sulfatada 16pts 1 cara, pegado lineal automático y suaje troquelado.',
    created_at: '2026-09-04T11:00:00Z',
    updated_at: '2026-09-04T11:00:00Z',
    client: INITIAL_SEED_CLIENTS[1],
    items: [
      {
        id: 'item-3',
        quote_id: '22222222-bbbb-4222-bbbb-222222222222',
        description: 'Cajas plegadizas con suaje, plecado y Barniz UV a registro',
        quantity: 15000,
        unit: 'Pza',
        unit_price: 2.80,
        substrate_finishing: 'Sulfatada 16pts + UV',
        subtotal: 42000.00,
      },
    ],
  },
  {
    id: '33333333-cccc-4333-cccc-333333333333',
    user_id: '00000000-0000-0000-0000-000000000001',
    quote_number: 'CHM-2026-082',
    client_id: 'c3333333-3333-4333-c333-333333333333',
    project_title: 'Tiraje Especial: "Crónicas del Arte Prehispánico" (Pasta Dura)',
    project_type: 'editorial',
    status: 'negociacion',
    subtotal: 84180.17,
    tax_rate: 16.00,
    tax_amount: 13468.83,
    discount_amount: 0.00,
    total: 97649.00,
    currency: 'MXN',
    valid_until: '2026-09-25',
    technical_notes: 'Interiores en papel couché 150g, guardas en cartulina texcoco y lomo recto con cabezada.',
    created_at: '2026-09-03T16:20:00Z',
    updated_at: '2026-09-03T16:20:00Z',
    client: INITIAL_SEED_CLIENTS[2],
    items: [
      {
        id: 'item-4',
        quote_id: '33333333-cccc-4333-cccc-333333333333',
        description: 'Libro de arte 240 páginas a color en couché 150g encuadernación rústica cosida',
        quantity: 1200,
        unit: 'Libro',
        unit_price: 70.15,
        substrate_finishing: 'Pasta dura holandesa + barniz',
        subtotal: 84180.17,
      },
    ],
  },
  {
    id: '44444444-dddd-4444-dddd-444444444444',
    user_id: '00000000-0000-0000-0000-000000000001',
    quote_number: 'CHM-2026-081',
    client_id: 'd4444444-4444-4444-d444-444444444444',
    project_title: 'Menús Plastificados Soft Touch y Señalética COVID/STPS',
    project_type: 'general',
    status: 'borrador',
    subtotal: 17779.31,
    tax_rate: 16.00,
    tax_amount: 2844.69,
    discount_amount: 0.00,
    total: 20625.00,
    currency: 'MXN',
    valid_until: '2026-09-15',
    technical_notes: 'Plastificado mate tacto sedoso en cartulina sulfatada 14pts con despunte de esquinas.',
    created_at: '2026-09-06T10:10:00Z',
    updated_at: '2026-09-06T10:10:00Z',
    client: INITIAL_SEED_CLIENTS[3],
    items: [
      {
        id: 'item-5',
        quote_id: '44444444-dddd-4444-dddd-444444444444',
        description: 'Menú tamaño carta plastificado Soft Touch 2 caras',
        quantity: 450,
        unit: 'Pza',
        unit_price: 39.51,
        substrate_finishing: 'Sulfatada 14pts + Soft Touch',
        subtotal: 17779.31,
      },
    ],
  },
  {
    id: '55555555-eeee-4555-eeee-555555555555',
    user_id: '00000000-0000-0000-0000-000000000001',
    quote_number: 'CHM-2026-080',
    client_id: 'e5555555-5555-4555-e555-555555555555',
    project_title: 'Tótem Exterior Luminoso y Rotulación Caseta Hábitat Coyoacán',
    project_type: 'gran_formato',
    status: 'rechazada',
    subtotal: 46319.83,
    tax_rate: 16.00,
    tax_amount: 7411.17,
    discount_amount: 0.00,
    total: 53731.00,
    currency: 'MXN',
    valid_until: '2026-09-10',
    technical_notes: 'Lona translúcida panaflex para caja de luz y acrílico termoformado.',
    created_at: '2026-09-01T08:50:00Z',
    updated_at: '2026-09-01T08:50:00Z',
    client: INITIAL_SEED_CLIENTS[4],
    items: [
      {
        id: 'item-6',
        quote_id: '55555555-eeee-4555-eeee-555555555555',
        description: 'Caja de luz exterior con perfil de aluminio y rotulación en vinil traslúcido 3M',
        quantity: 1,
        unit: 'Estructura',
        unit_price: 46319.83,
        substrate_finishing: 'Aluminio anodizado + LEDs',
        subtotal: 46319.83,
      },
    ],
  },
];

export const INITIAL_TRACKING_TASKS: TrackingCommitment[] = [
  {
    id: 't-1',
    quote_id: '11111111-aaaa-4111-aaaa-111111111111',
    quote_number: 'CHM-2026-084',
    client_name: 'Distribuidora Automotriz del Valle',
    description: 'Llamar para confirmar recepción de muestras de vinil 3M para flotilla (12 pick-ups).',
    priority: 'ALTA',
    due_date_label: 'Hoy, 16:00 hrs',
    phone: '5556781234',
    completed: false,
    action_type: 'call',
  },
  {
    id: 't-2',
    quote_id: '33333333-cccc-4333-cccc-333333333333',
    quote_number: 'CHM-2026-082',
    client_name: 'Editorial Raíces de México',
    description: 'Enviar comparativa técnica de costos entre papel couché 150g vs bond ahuesado 90g (Pasta Dura).',
    priority: 'MEDIA',
    due_date_label: 'Mañana, 11:30 hrs',
    phone: '5588997766',
    completed: false,
    action_type: 'file',
  },
  {
    id: 't-3',
    quote_id: '44444444-dddd-4444-dddd-444444444444',
    quote_number: 'CHM-2026-081',
    client_name: 'Restaurantes Fogón & Brasa',
    description: 'Solicitar comprobante de pago de anticipo (50%) para liberar tiraje de menús soft-touch en prensa.',
    priority: 'ALTA',
    due_date_label: '07 Sep, 10:00 hrs',
    phone: '5533221100',
    completed: false,
    action_type: 'whatsapp',
  },
  {
    id: 't-4',
    quote_id: '22222222-bbbb-4222-bbbb-222222222222',
    quote_number: 'CHM-2026-083',
    client_name: 'Lab. Farmacéuticos Quimex',
    description: 'Dummies autorizados con Barniz UV a registro. Lista para formación de placas CTP y suaje.',
    priority: 'BAJA',
    due_date_label: 'En producción prensa',
    phone: '5543218765',
    completed: true,
    action_type: 'file',
  },
];

const LOCAL_QUOTES_KEY = 'CHIMAL_QUOTES_STORE_V1';

const loadLocalQuotes = (): Quote[] => {
  try {
    const raw = localStorage.getItem(LOCAL_QUOTES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
};

const saveLocalQuotes = (quotes: Quote[]) => {
  try {
    localStorage.setItem(LOCAL_QUOTES_KEY, JSON.stringify(quotes));
  } catch {
    // ignore
  }
};

let localQuotesStore: Quote[] = loadLocalQuotes();
let localTrackingTasks: TrackingCommitment[] = [...INITIAL_TRACKING_TASKS];

export const quoteService = {
  /**
   * Obtiene todas las cotizaciones con cliente asociado
   */
  async getQuotes(
    statusFilter?: QuoteStatus | 'all' | 'TODOS',
    searchQuery?: string
  ): Promise<{ data: Quote[]; error: string | null }> {
    const getFilteredLocal = (): Quote[] => {
      let filtered = [...localQuotesStore];
      if (statusFilter && statusFilter !== 'all' && statusFilter !== 'TODOS') {
        filtered = filtered.filter((q) => q.status === statusFilter);
      }
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.quote_number?.toLowerCase().includes(q) ||
            item.project_title?.toLowerCase().includes(q) ||
            item.client?.business_name?.toLowerCase().includes(q)
        );
      }
      return filtered;
    };

    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('quotes')
          .select(`
            *,
            client:clients(*),
            items:quote_items(*)
          `)
          .order('created_at', { ascending: false });

        if (statusFilter && statusFilter !== 'all' && statusFilter !== 'TODOS') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;
        if (error) {
          if (isTableMissingError(error)) {
            setSupabaseTablesStatus(false);
          } else {
            console.warn('Nota Supabase quotes:', error.message);
          }
          return { data: getFilteredLocal(), error: null };
        }

        setSupabaseTablesStatus(true);
        let list = (data as Quote[]) || [];

        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          list = list.filter(
            (item) =>
              item.quote_number?.toLowerCase().includes(q) ||
              item.project_title?.toLowerCase().includes(q) ||
              item.client?.business_name?.toLowerCase().includes(q)
          );
        }

        return { data: list, error: null };
      } catch (err: any) {
        if (isTableMissingError(err)) {
          setSupabaseTablesStatus(false);
        } else {
          console.warn('Nota Supabase query error quotes:', err?.message || err);
        }
        return { data: getFilteredLocal(), error: null };
      }
    }

    return { data: getFilteredLocal(), error: null };
  },

  /**
   * Obtiene cotizaciones de un cliente específico
   */
  async getQuotesByClientId(clientId: string): Promise<Quote[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select('*, items:quote_items(*)')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });

        if (!error && data) return data as Quote[];
      } catch (e: any) {
        if (!isTableMissingError(e)) {
          console.warn('Nota fetching client quotes:', e?.message || e);
        }
      }
    }

    return localQuotesStore.filter((q) => q.client_id === clientId);
  },

  /**
   * Guarda una cotización real con sus partidas
   */
  async createQuote(
    quoteData: Omit<Quote, 'id' | 'quote_number' | 'created_at' | 'updated_at'>,
    items: Omit<QuoteItem, 'id' | 'quote_id'>[]
  ): Promise<{ data: Quote | null; error: string | null }> {
    const timestamp = Date.now().toString().slice(-4);
    const generatedNumber = `CHM-2026-0${timestamp}`;

    const createLocalQuote = (): Quote => {
      const newQuoteId = crypto.randomUUID ? crypto.randomUUID() : `quote-${Date.now()}`;
      const client = INITIAL_SEED_CLIENTS.find((c) => c.id === quoteData.client_id) || {
        id: quoteData.client_id,
        user_id: '',
        business_name: 'Cliente Asignado',
        rfc: 'XAXX010101000',
        contact_name: 'Contacto Comercial',
        contact_role: 'Gerente',
        email: 'contacto@cliente.com',
        phone: '55 0000 0000',
        address: 'Ciudad de México',
        category: 'Corporativo',
        tags: [],
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newQuote: Quote = {
        ...quoteData,
        id: newQuoteId,
        quote_number: generatedNumber,
        client,
        items: items.map((it, idx) => ({ ...it, id: `item-${newQuoteId}-${idx}`, quote_id: newQuoteId })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      localQuotesStore.unshift(newQuote);
      saveLocalQuotes(localQuotesStore);

      localTrackingTasks.unshift({
        id: `task-${newQuoteId}`,
        quote_id: newQuoteId,
        quote_number: generatedNumber,
        client_name: client.business_name,
        description: `Enviar confirmación técnica de ${newQuote.project_title} y verificar anticipo.`,
        priority: 'ALTA',
        due_date_label: 'Hoy, 18:00 hrs',
        phone: client.phone,
        completed: false,
        action_type: 'call',
      });

      return newQuote;
    };

    if (isSupabaseConfigured()) {
      try {
        let authUserId: string | null = null;
        try {
          const { data: authData } = await supabase.auth.getUser();
          authUserId = authData?.user?.id || null;
        } catch {
          // Ignorar
        }

        const payloadToInsert: Record<string, any> = {
          ...quoteData,
          quote_number: generatedNumber,
        };

        if (authUserId) {
          payloadToInsert.user_id = authUserId;
        } else if (payloadToInsert.user_id === '00000000-0000-0000-0000-000000000001' || !payloadToInsert.user_id) {
          delete payloadToInsert.user_id;
        }

        // 1. Insertar cotización
        const { data: quoteRecord, error: quoteError } = await supabase
          .from('quotes')
          .insert([payloadToInsert])
          .select('*, client:clients(*)')
          .single();

        if (quoteError) {
          if (isTableMissingError(quoteError)) {
            setSupabaseTablesStatus(false);
          } else {
            console.warn('Nota createQuote Supabase:', quoteError.message);
          }
          const local = createLocalQuote();
          return { data: local, error: null };
        }

        setSupabaseTablesStatus(true);

        // 2. Insertar partidas vinculadas
        if (items && items.length > 0) {
          const itemsToInsert = items.map((item) => ({
            ...item,
            quote_id: quoteRecord.id,
          }));

          const { data: insertedItems, error: itemsError } = await supabase
            .from('quote_items')
            .insert(itemsToInsert)
            .select();

          if (!itemsError && insertedItems) {
            quoteRecord.items = insertedItems;
          }
        }

        return { data: quoteRecord as Quote, error: null };
      } catch (err: any) {
        if (isTableMissingError(err)) {
          setSupabaseTablesStatus(false);
        } else {
          console.warn('Nota createQuote error:', err?.message || err);
        }
        const local = createLocalQuote();
        return { data: local, error: null };
      }
    }

    // Modo demostración
    const local = createLocalQuote();
    return { data: local, error: null };
  },

  /**
   * Actualiza el estatus de la cotización
   */
  async updateQuoteStatus(id: string, status: QuoteStatus): Promise<{ success: boolean; error: string | null }> {
    const updateLocal = (): { success: boolean; error: string | null } => {
      const index = localQuotesStore.findIndex((q) => q.id === id);
      if (index !== -1) {
        localQuotesStore[index].status = status;
        localQuotesStore[index].updated_at = new Date().toISOString();
        saveLocalQuotes(localQuotesStore);
        return { success: true, error: null };
      }
      return { success: false, error: 'Cotización no encontrada' };
    };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('quotes')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) {
          if (isTableMissingError(error)) {
            setSupabaseTablesStatus(false);
          } else {
            console.warn('Nota updateQuoteStatus Supabase:', error.message);
          }
          return updateLocal();
        }
        setSupabaseTablesStatus(true);
        return { success: true, error: null };
      } catch (err: any) {
        if (isTableMissingError(err)) {
          setSupabaseTablesStatus(false);
        } else {
          console.warn('Nota updateQuoteStatus error:', err?.message || err);
        }
        return updateLocal();
      }
    }

    return updateLocal();
  },

  /**
   * Elimina una cotización
   */
  async deleteQuote(id: string): Promise<{ success: boolean; error: string | null }> {
    const deleteLocal = (): { success: boolean; error: string | null } => {
      localQuotesStore = localQuotesStore.filter((q) => q.id !== id);
      saveLocalQuotes(localQuotesStore);
      return { success: true, error: null };
    };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('quotes')
          .delete()
          .eq('id', id);

        if (error) {
          if (isTableMissingError(error)) {
            setSupabaseTablesStatus(false);
          } else {
            console.warn('Nota deleteQuote Supabase:', error.message);
          }
          return deleteLocal();
        }
        setSupabaseTablesStatus(true);
        return { success: true, error: null };
      } catch (err: any) {
        if (isTableMissingError(err)) {
          setSupabaseTablesStatus(false);
        } else {
          console.warn('Nota deleteQuote error:', err?.message || err);
        }
        return deleteLocal();
      }
    }

    return deleteLocal();
  },

  /**
   * Obtiene tareas de seguimiento
   */
  getTrackingTasks(): TrackingCommitment[] {
    return localTrackingTasks;
  },

  /**
   * Alterna estado completado de tarea de seguimiento
   */
  toggleTaskCompleted(taskId: string): boolean {
    const task = localTrackingTasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      return task.completed;
    }
    return false;
  },
};
