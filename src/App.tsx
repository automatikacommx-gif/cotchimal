import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Toast, ToastMessage } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { ClientList } from './components/clients/ClientList';
import { ClientModal } from './components/clients/ClientModal';
import { DeleteClientModal } from './components/clients/DeleteClientModal';
import { QuoteWizard } from './components/quotes/QuoteWizard';
import { QuoteTracker } from './components/quotes/QuoteTracker';
import { QuoteDetailModal } from './components/quotes/QuoteDetailModal';
import { SettingsHub } from './components/settings/SettingsHub';
import { CompanyWizard } from './components/settings/onboarding/CompanyWizard';
import { ImpositionCalculator } from './components/imposition/ImpositionCalculator';
import { Client, Quote, QuoteStatus } from './types';
import { clientService } from './services/clientService';
import { quoteService } from './services/quoteService';
import { isSupabaseConfigured, subscribeToTablesStatus } from './lib/supabase';
import { Database, Copy, X } from 'lucide-react';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('resumen');
  const [wizardInitialStep, setWizardInitialStep] = useState<number>(1);
  const [wizardStep3SubStep, setWizardStep3SubStep] = useState<1 | 2>(1);
  const [wizardNavTrigger, setWizardNavTrigger] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [tablesPending, setTablesPending] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Modales
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Estados de datos
  const [clients, setClients] = useState<Client[]>([]);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [quoteDetail, setQuoteDetail] = useState<Quote | null>(null);
  const [quoteInitialClient, setQuoteInitialClient] = useState<Client | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToTablesStatus((ready) => {
      setTablesPending(isSupabaseConfigured() && ready === false);
    });
    return unsubscribe;
  }, []);

  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) => {
    const newToast: ToastMessage = {
      id: Date.now() + Math.random(),
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cargar clientes iniciales para el selector del cotizador
  const refreshClients = async () => {
    const { data } = await clientService.getClients();
    setClients(data);
  };

  useEffect(() => {
    refreshClients();
  }, []);

  const handleQuickQuote = () => {
    setQuoteInitialClient(null);
    setActiveTab('cotizar');
  };

  const handleApplyImpositionToQuote = (params: {
    pieceWidth: number;
    pieceHeight: number;
    sheetWidth: number;
    sheetHeight: number;
    piecesPerSheet: number;
    layoutDescription: string;
  }) => {
    setActiveTab('cotizar');
    showNotification(
      `Acomodo de ${params.piecesPerSheet} piezas (${params.layoutDescription}) aplicado a tu cotización`,
      'success'
    );
  };

  const handleSelectClientForQuote = (client: Client) => {
    setQuoteInitialClient(client);
    setActiveTab('cotizar');
    showNotification(`Iniciando cotización para: ${client.business_name}`, 'info');
  };

  const handleOpenCreateClient = () => {
    setClientToEdit(null);
    setIsClientModalOpen(true);
  };

  const handleOpenEditClient = (client: Client) => {
    setClientToEdit(client);
    setIsClientModalOpen(true);
  };

  const handleOpenDeleteClient = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const handleSaveClient = async (clientData: Partial<Client>) => {
    if (clientToEdit) {
      const { data, error } = await clientService.updateClient(clientToEdit.id, clientData);
      if (error) {
        throw new Error(error);
      }
      showNotification('Cliente actualizado exitosamente en Supabase', 'success');
    } else {
      const { data, error } = await clientService.createClient(clientData);
      if (error) {
        throw new Error(error);
      }
      showNotification('Nuevo cliente registrado en la base de datos', 'success');
    }
    await refreshClients();
  };

  const handleConfirmDeleteClient = async (id: string) => {
    const { success, error } = await clientService.deleteClient(id);
    if (!success) {
      showNotification(error || 'Error al eliminar cliente', 'error');
    } else {
      showNotification('Expediente de cliente eliminado correctamente', 'success');
      await refreshClients();
    }
  };

  const handleQuoteCreated = (newQuote: Quote) => {
    showNotification(`Cotización ${newQuote.quote_number} registrada en Supabase`, 'success');
    setQuoteDetail(newQuote);
    setActiveTab('gestion');
  };

  const handleQuoteStatusUpdated = (id: string, newStatus: QuoteStatus) => {
    if (quoteDetail && quoteDetail.id === id) {
      setQuoteDetail({ ...quoteDetail, status: newStatus });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#0F172A] font-sans antialiased flex flex-col">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onClose={removeToast} />

      {/* Desktop Persistent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        onQuickQuote={handleQuickQuote}
      />

      {/* Top Main Navigation Header */}
      <Header
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSupabaseConfig={() => setIsConfigModalOpen(true)}
        onOpenSettings={() => {
          setWizardInitialStep(1);
          setWizardStep3SubStep(1);
          setWizardNavTrigger((prev) => prev + 1);
          setActiveTab('ajustes');
        }}
        onOpenConfigSummary={() => {
          setWizardInitialStep(6);
          setWizardStep3SubStep(1);
          setWizardNavTrigger((prev) => prev + 1);
          setActiveTab('ajustes');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onQuickQuote={handleQuickQuote}
      />

      {/* Main View Container */}
      <main className="flex-1 pt-20 lg:pl-72 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
        {tablesPending && !bannerDismissed && (
          <div className="mb-6 p-4 bg-amber-50/95 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shadow-sm animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100/80 text-amber-800 shrink-0 mt-0.5 sm:mt-0">
                <Database className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-amber-950">
                  Supabase conectado · Tablas de base de datos pendientes
                </p>
                <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                  La app opera con datos seguros en memoria. Para activar persistencia completa en PostgreSQL, copia el script de migración y ejecútalo en el SQL Editor de tu panel Supabase.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F5132] hover:bg-[#0c4128] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" />
                Ver Script SQL
              </button>
              <button
                onClick={() => setBannerDismissed(true)}
                className="p-1.5 text-amber-700 hover:text-amber-950 hover:bg-amber-100 rounded-lg transition-colors"
                title="Cerrar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'resumen' && (
          <OverviewDashboard
            onNavigateToQuotes={handleQuickQuote}
            onNavigateToClients={() => setActiveTab('clientes')}
            onNavigateToConfig={() => {
              setWizardInitialStep(1);
              setWizardStep3SubStep(1);
              setWizardNavTrigger((prev) => prev + 1);
              setActiveTab('ajustes');
            }}
            onNavigateToImposition={() => setActiveTab('imposicion')}
            onSelectQuote={(q) => setQuoteDetail(q)}
          />
        )}

        {activeTab === 'cotizar' && (
          <QuoteWizard
            clients={clients}
            initialClient={quoteInitialClient}
            onQuoteCreated={handleQuoteCreated}
            onCancel={() => setActiveTab('resumen')}
            onShowNotification={showNotification}
            onOpenImposition={() => setActiveTab('imposicion')}
            onConfigureMachines={() => {
              setWizardInitialStep(3);
              setWizardStep3SubStep(1);
              setWizardNavTrigger((prev) => prev + 1);
              setActiveTab('ajustes');
            }}
            onConfigureSubstrates={() => {
              setWizardInitialStep(4);
              setWizardStep3SubStep(1);
              setWizardNavTrigger((prev) => prev + 1);
              setActiveTab('ajustes');
            }}
            onConfigureClients={() => {
              setActiveTab('clientes');
            }}
            onViewConfigSummary={() => {
              setWizardInitialStep(6);
              setWizardStep3SubStep(1);
              setWizardNavTrigger((prev) => prev + 1);
              setActiveTab('ajustes');
            }}
          />
        )}

        {activeTab === 'imposicion' && (
          <ImpositionCalculator
            onApplyToQuote={handleApplyImpositionToQuote}
          />
        )}

        {activeTab === 'clientes' && (
          <ClientList
            onSelectClientForQuote={handleSelectClientForQuote}
            onOpenCreateModal={handleOpenCreateClient}
            onOpenEditModal={handleOpenEditClient}
            onOpenDeleteModal={handleOpenDeleteClient}
            onShowNotification={showNotification}
            externalSearchQuery={searchQuery}
          />
        )}

        {activeTab === 'gestion' && (
          <QuoteTracker
            onSelectQuote={(q) => setQuoteDetail(q)}
            onNewQuote={() => setActiveTab('cotizar')}
          />
        )}

        {activeTab === 'ajustes' && (
          <SettingsHub
            onGoToQuote={() => setActiveTab('cotizar')}
            onGoToClients={() => setActiveTab('clientes')}
            clientsCount={clients.length}
            initialWizardStep={wizardInitialStep}
            initialStep3SubStep={wizardStep3SubStep}
            wizardNavTrigger={wizardNavTrigger}
            onShowToast={(toast) => showNotification(toast.message, toast.type)}
          />
        )}
      </main>

      {/* Persistent Mobile Bottom Navigation (64px) */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onShowNotification={showNotification}
      />

      <SupabaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onShowNotification={showNotification}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setClientToEdit(null);
        }}
        onSave={handleSaveClient}
        clientToEdit={clientToEdit}
      />

      <DeleteClientModal
        isOpen={isDeleteModalOpen}
        client={clientToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setClientToDelete(null);
        }}
        onConfirm={handleConfirmDeleteClient}
      />

      <QuoteDetailModal
        quote={quoteDetail}
        isOpen={!!quoteDetail}
        onClose={() => setQuoteDetail(null)}
        onStatusUpdated={handleQuoteStatusUpdated}
        onShowNotification={showNotification}
      />
    </div>
  );
}

export default function App() {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  return (
    <AuthProvider>
      <ProtectedRoute onOpenSupabaseConfig={() => setIsConfigModalOpen(true)}>
        <AppContent />
      </ProtectedRoute>
      <SupabaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSaved={() => {
          setIsConfigModalOpen(false);
          window.location.reload();
        }}
      />
    </AuthProvider>
  );
}
