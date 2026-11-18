import { useState } from 'react';
import { Wrench, Lock, Mail, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { iniciarSesion } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleCargarDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4 text-white">
          <Wrench className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          TallerMoto Pro — Sistema de Gestión
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Inicia sesión para acceder a la recepción, DVI, cámaras y cotizaciones
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@taller.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Accesos rápidos Demo para pruebas */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Accesos Rápidos Demo (RBAC)</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleCargarDemo('admin@taller.com', 'admin123')}
                className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-indigo-600 transition-colors text-center cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleCargarDemo('recepcion@taller.com', 'recepcion123')}
                className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-indigo-600 transition-colors text-center cursor-pointer"
              >
                Recepción
              </button>
              <button
                type="button"
                onClick={() => handleCargarDemo('mecanico@taller.com', 'mecanico123')}
                className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-indigo-600 transition-colors text-center cursor-pointer"
              >
                Mecánico
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

