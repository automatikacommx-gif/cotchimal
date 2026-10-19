import React, { useState } from 'react';
import { 
  activeSupabaseUrl, 
  activeSupabaseAnonKey, 
  isSupabaseConfigured, 
  setRuntimeSupabaseConfig, 
  clearRuntimeSupabaseConfig,
  supabase,
  isTableMissingError,
  setSupabaseTablesStatus
} from '../lib/supabase';
import { SUPABASE_SQL_MIGRATION } from '../lib/database-sql';
import { 
  Database, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowNotification: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onShowNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');
  const [customUrl, setCustomUrl] = useState(activeSupabaseUrl || '');
  const [customKey, setCustomKey] = useState(activeSupabaseAnonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; isPgrst205?: boolean } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleSaveRuntime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !customKey.trim()) {
      onShowNotification('Por favor ingresa tanto la URL como la Anon Key de Supabase', 'error');
      return;
    }
    setRuntimeSupabaseConfig(customUrl, customKey);
    onShowNotification('Credenciales guardadas y cliente reiniciado', 'success');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.from('clients').select('id').limit(1);

      if (error) {
        if (isTableMissingError(error)) {
          setSupabaseTablesStatus(false);
          setTestResult({
            success: false,
            isPgrst205: true,
            message: 'Tu proyecto de Supabase responde correctamente, pero aún no tiene creadas las tablas (Error PGRST205: Could not find the table in the schema cache). Pasa a la pestaña "Script SQL de Migración" aquí arriba, copia el script y pégalo en el SQL Editor de Supabase.',
          });
          onShowNotification('Proyecto Supabase conectado. Tablas pendientes de crear vía SQL.', 'warning');
        } else {
          setTestResult({
            success: false,
            message: `Error de respuesta: ${error.message}. Verifica que la URL y Anon Key sean correctas.`,
          });
          onShowNotification('No se pudo conectar a la tabla de clientes', 'error');
        }
      } else {
        setSupabaseTablesStatus(true);
        setTestResult({
          success: true,
          message: '¡Conexión y tablas de base de datos verificadas con éxito en PostgreSQL / Supabase!',
        });
        onShowNotification('Conexión con Supabase verificada correctamente', 'success');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Fallo de conexión: ${err.message || 'Error de red'}`,
      });
      onShowNotification('Error al conectar con Supabase', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_MIGRATION);
    setCopiedSql(true);
    onShowNotification('Script SQL copiado al portapapeles. Pégalo en el SQL Editor de Supabase.', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F8FAF8] border-b border-[#E4EAE5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F5132] text-white flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Conexión y Migración Supabase
              </h3>
              <p className="text-xs text-slate-500">
                PostgreSQL Transaccional • RLS Security • Autenticación
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'config'
                ? 'border-[#0F5132] text-[#0F5132]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Credenciales y Conexión
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-[#0F5132] text-[#0F5132]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Script SQL de Migración (5 Clientes)</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'config' ? (
            <div className="flex flex-col gap-5">
              {/* Connection Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  isConfigured
                    ? 'bg-[#E8F5E9] border-[#198754]/30 text-[#0F5132]'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {isConfigured ? (
                  <CheckCircle2 className="w-5 h-5 text-[#198754] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="text-sm font-bold">
                    {isConfigured ? 'Supabase Vinculado' : 'Modo Demostración Activo'}
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {isConfigured
                      ? 'Tu aplicación está conectada al cliente oficial de Supabase. Todas las lecturas y escrituras se ejecutan en PostgreSQL.'
                      : 'Puedes explorar la interfaz con los 5 clientes iniciales pre-cargados. Para conectar tu base de datos Supabase real, ingresa tus credenciales abajo o agrégalas a tu archivo .env.'}
                  </p>
                </div>
              </div>

              {/* Form to update runtime credentials */}
              <form onSubmit={handleSaveRuntime} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">
                    Project URL (VITE_SUPABASE_URL)
                  </label>
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://abcdefghijklm.supabase.co"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-[#D9531E]"
                  />
                  <span className="text-[10px] text-slate-400">
                    Encuéntralo en tu Dashboard de Supabase &gt; Project Settings &gt; API
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">
                    Anon / Public Key (VITE_SUPABASE_ANON_KEY)
                  </label>
                  <input
                    type="password"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-[#D9531E]"
                  />
                  <span className="text-[10px] text-slate-400">
                    La clave pública ("anon public") segura para el navegador
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#D9531E] hover:bg-[#C84B15] text-white text-xs font-bold rounded-xl shadow transition-all"
                    >
                      Guardar y Conectar
                    </button>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting || !customUrl}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'Probando...' : 'Probar Conexión'}</span>
                    </button>
                  </div>

                  {sessionStorage.getItem('CUSTOM_SUPABASE_URL') && (
                    <button
                      type="button"
                      onClick={clearRuntimeSupabaseConfig}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Restablecer a variables .env
                    </button>
                  )}
                </div>

                {testResult && (
                  <div
                    className={`p-3.5 rounded-xl text-xs flex flex-col gap-2 border ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : testResult.isPgrst205
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : testResult.isPgrst205 ? (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <span className="leading-relaxed">{testResult.message}</span>
                    </div>
                    {testResult.isPgrst205 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('sql')}
                        className="self-start mt-1 px-3 py-1.5 bg-[#0F5132] hover:bg-[#0c4128] text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Ir a pestaña "Script SQL de Migración" y copiar
                      </button>
                    )}
                  </div>
                )}
              </form>

              {/* Step by step guide */}
              <div className="bg-[#F8FAF8] p-4 rounded-xl border border-[#DEE4DF] flex flex-col gap-2">
                <span className="text-xs font-bold text-[#0F5132] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Pasos para configurar tu base de datos Supabase:
                </span>
                <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1 pl-1 leading-relaxed">
                  <li>Crea un proyecto gratuito en <strong className="text-slate-800">Supabase.com</strong>.</li>
                  <li>Ve a <strong className="text-slate-800">SQL Editor</strong> en Supabase.</li>
                  <li>Abre la pestaña <strong className="text-slate-800">"Script SQL de Migración"</strong> arriba y haz clic en <strong className="text-slate-800">Copiar SQL</strong>.</li>
                  <li>Pega el script y ejecútalo (creará las tablas <code className="bg-slate-200 px-1 rounded">profiles</code>, <code className="bg-slate-200 px-1 rounded">clients</code>, <code className="bg-slate-200 px-1 rounded">quotes</code>, <code className="bg-slate-200 px-1 rounded">quote_items</code>, políticas RLS y los 5 clientes de Grupo Chimal).</li>
                  <li>Copia tu <strong className="text-slate-800">URL</strong> y <strong className="text-slate-800">Anon Key</strong> aquí o en tu archivo <code className="bg-slate-200 px-1 rounded">.env</code>.</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Ejecuta este script en el <strong className="text-slate-800">SQL Editor</strong> de Supabase para inicializar la estructura y los 5 clientes iniciales:
                </p>
                <button
                  onClick={copySqlToClipboard}
                  className="px-3 py-1.5 bg-[#0F5132] hover:bg-[#107C41] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 text-slate-100 p-4 font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto">
                <pre>{SUPABASE_SQL_MIGRATION}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#F8FAF8] border-t border-[#E4EAE5] flex items-center justify-between">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#0F5132] hover:underline font-semibold flex items-center gap-1"
          >
            <span>Ir a Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
