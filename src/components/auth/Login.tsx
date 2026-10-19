import React, { useState } from 'react';
import { useAuth, AUTHORIZED_ADMIN_EMAIL, getAssignedRoleForEmail } from '../../context/AuthContext';
import { Lock, Mail, User, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onSuccess?: () => void;
  onOpenSupabaseConfig?: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onSuccess,
  onOpenSupabaseConfig,
  isModal = false,
  onClose,
}) => {
  const { signIn, signInWithGoogle, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState(AUTHORIZED_ADMIN_EMAIL);
  const [password, setPassword] = useState('EditorialAdmin2026*');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('Luis Enrique Jiménez');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setIsSubmitting(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        const msg = error.message || '';
        if (msg.includes('provider is not enabled') || msg.includes('validation_failed')) {
          setEmail(AUTHORIZED_ADMIN_EMAIL);
          setPassword('EditorialAdmin2026*');
          setErrorMsg(
            'El proveedor de Google OAuth aún no está activado en tu panel de Supabase (Authentication > Providers > Google). Puedes ingresar con tus credenciales de acceso.'
          );
        } else {
          setErrorMsg(error.message || 'Error al conectar con Google OAuth');
        }
      } else {
        onSuccess?.();
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('provider is not enabled') || msg.includes('validation_failed')) {
        setEmail(AUTHORIZED_ADMIN_EMAIL);
        setPassword('EditorialAdmin2026*');
        setErrorMsg(
          'El proveedor de Google OAuth aún no está activado en tu panel de Supabase (Authentication > Providers > Google). Puedes ingresar con tus credenciales de acceso.'
        );
      } else {
        setErrorMsg(err?.message || 'Error inesperado con Google');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === 'login') {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          onSuccess?.();
        }
      } else {
        if (!fullName.trim()) {
          setErrorMsg('Por favor ingresa tu nombre completo');
          setIsSubmitting(false);
          return;
        }

        const calculatedRole = getAssignedRoleForEmail(email);
        const { error } = await signUp(email.trim(), password, fullName.trim());
        if (error) {
          setErrorMsg(error.message);
        } else {
          setInfoMsg(
            calculatedRole === 'admin'
              ? 'Cuenta de Administrador registrada. Verifica tu correo si confirmación está activa o inicia sesión.'
              : 'Cuenta de Vendedor registrada exitosamente con acceso al cotizador.'
          );
          setActiveTab('login');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardContent = (
    <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Header matching image.png */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0F5132] text-white flex items-center justify-center shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 font-heading">
              Iniciar Sesión
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              Supabase Auth PostgreSQL
            </p>
          </div>
        </div>
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            ✕
          </button>
        )}
      </div>

      {/* Google OAuth Button */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 flex items-center justify-center gap-3 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
        >
          {/* Google multicolored G SVG icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Ingresar con Google</span>
        </button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-bold tracking-wider text-[10px]">
              o con tu correo
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Tab Switch matching image.png */}
      <div className="bg-[#F1F5F9] p-1 rounded-xl grid grid-cols-2 gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setActiveTab('login');
            setErrorMsg('');
          }}
          className={`py-2 rounded-lg transition-all ${
            activeTab === 'login'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('register');
            setErrorMsg('');
          }}
          className={`py-2 rounded-lg transition-all ${
            activeTab === 'register'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Registrarse
        </button>
      </div>

      {/* Notification Messages */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {infoMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{infoMsg}</span>
        </div>
      )}

      {/* Main Form matching image.png */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {activeTab === 'register' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Nombre Completo *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Luis Jiménez / Mariana Soto"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Correo Electrónico *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@grupochimal.com.mx"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Contraseña *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 outline-none transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Role Enforcement Notice */}
        {activeTab === 'register' && (
          <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Política de Control de Accesos:</p>
              <p className="mt-0.5">
                La cuenta <span className="font-mono font-bold text-amber-900">{AUTHORIZED_ADMIN_EMAIL}</span> recibe rol de <span className="font-bold">Administrador</span>. Cualquier otro correo se registra automáticamente como <span className="font-bold">Vendedor</span>.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button matching image.png (Orange/Rust #D9531E) */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 bg-[#D9531E] hover:bg-[#C84518] active:scale-[0.98] text-white text-sm font-black rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all mt-1"
        >
          {isSubmitting ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>
                {activeTab === 'login' ? 'Entrar al Sistema' : 'Crear Cuenta'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );

  if (isModal) {
    return cardContent;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0F5132]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D9531E]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-6 text-center z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Cotizador Industrial & CRM · Grupo Chimal</span>
        </div>
      </div>

      <div className="z-10 w-full flex justify-center">{cardContent}</div>
    </div>
  );
};
