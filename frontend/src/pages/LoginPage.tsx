import { useState } from 'react';
import {
  Lock,
  Mail,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ClipboardCheck,
  Camera,
  Receipt,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BrandMark from '../components/ui/BrandMark';

const FEATURES = [
  { icon: ClipboardCheck, title: 'Recepción e inspección DVI', text: 'Checklist digital con evidencias y firma del cliente.' },
  { icon: Camera, title: 'Cámaras por bahía', text: 'Supervisa cada puesto de trabajo en vivo.' },
  { icon: Receipt, title: 'Cotizaciones en USD y Bs', text: 'Tasa oficial BCV aplicada automáticamente.' },
];

const DEMO_USERS = [
  { label: 'Admin', email: 'admin@taller.com', pass: 'admin123' },
  { label: 'Recepción', email: 'recepcion@taller.com', pass: 'recepcion123' },
  { label: 'Mecánico', email: 'mecanico@taller.com', pass: 'mecanico123' },
];

export default function LoginPage() {
  const { iniciarSesion } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Campos requeridos', 'Por favor ingresa correo y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      await iniciarSesion(email, password);
      toast.success('¡Bienvenido!', 'Has iniciado sesión correctamente.');
    } catch (err: any) {
      toast.error('Error de autenticación', err.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-slate-300 bg-white py-3 pr-4 pl-11 text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-400';

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_1fr]">
      {/* Panel de marca */}
      <aside className="relative hidden overflow-hidden bg-ink-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-brand-600/30 blur-[120px]" />
        <div className="pointer-events-none absolute -right-24 -bottom-40 h-[24rem] w-[24rem] rounded-full bg-brand-500/10 blur-[100px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'radial-gradient(ellipse at 30% 30%, black 20%, transparent 70%)',
          }}
        />

        <div className="relative flex items-center gap-3">
          <BrandMark size={44} />
          <div className="leading-tight">
            <p className="text-lg font-bold tracking-tight">
              TallerMoto <span className="text-brand-400">Pro</span>
            </p>
            <p className="text-xs text-slate-400">Sistema de gestión de taller</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl leading-[1.1] font-extrabold tracking-tight">
            Tu taller, bajo control
            <span className="block text-brand-400">de la recepción a la entrega.</span>
          </h1>
          <ul className="mt-10 space-y-5">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-brand-400">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-sm text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} TallerMoto Pro</p>
      </aside>

      {/* Formulario */}
      <main className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark size={40} />
            <p className="text-lg font-bold tracking-tight text-slate-900">
              TallerMoto <span className="text-brand-600">Pro</span>
            </p>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Inicia sesión</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Accede a recepción, DVI, cámaras y cotizaciones.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@taller.com"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-700"
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verificando…</span>
                </>
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Accesos rápidos demo */}
          <div className="mt-10">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" />
              <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-500" />
                Accesos demo
              </p>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {DEMO_USERS.map((u) => {
                const active = email === u.email;
                return (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => {
                      setEmail(u.email);
                      setPassword(u.pass);
                    }}
                    className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                      active
                        ? 'border-brand-300 bg-brand-50 text-brand-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {u.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
