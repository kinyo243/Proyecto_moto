import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Camera,
  Settings,
  X,
  Bike,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export type ViewName =
  | 'dashboard'
  | 'recepcion'
  | 'ordenes'
  | 'camaras'
  | 'configuracion';

const NAV_ITEMS: Array<{
  key: ViewName;
  icon: typeof LayoutDashboard;
  roles?: string[];
}> = [
  { key: 'dashboard', icon: LayoutDashboard },
  { key: 'recepcion', icon: ClipboardList, roles: ['administrador', 'recepcionista'] },
  { key: 'ordenes', icon: Wrench },
  { key: 'camaras', icon: Camera },
  { key: 'configuracion', icon: Settings, roles: ['administrador'] },
];

const VIEW_LABEL_KEY: Record<ViewName, `nav.${string}`> = {
  dashboard: 'nav.dashboard',
  recepcion: 'nav.recepcion',
  ordenes: 'nav.ordenes',
  camaras: 'nav.camaras',
  configuracion: 'nav.configuracion',
} as const;

interface SidebarProps {
  activeView: ViewName;
  onNavigate: (view: ViewName) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  activeView,
  onNavigate,
  isOpen,
  onClose,
}: SidebarProps) {
  const { t } = useLanguage();
  const { usuario, cerrarSesion } = useAuth();

  const navFiltrados = NAV_ITEMS.filter((item) => {
    if (!item.roles || !usuario) return true;
    return item.roles.includes(usuario.rol);
  });

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-900 text-white w-64">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
        <div className="rounded-lg bg-indigo-600 p-2">
          <Bike size={20} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">TallerMoto Pro</p>
          <p className="text-xs text-slate-400">Sistema de Gestión</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navFiltrados.map(({ key, icon: Icon }) => {
          const isActive = activeView === key;
          return (
            <button
              key={key}
              onClick={() => {
                onNavigate(key);
                onClose();
              }}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {t(VIEW_LABEL_KEY[key] as Parameters<typeof t>[0])}
            </button>
          );
        })}
      </nav>

      {/* Usuario Activo y Logout */}
      <div className="border-t border-slate-800 px-4 py-3 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0">
            <UserCheck size={16} />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-200 truncate">
              {usuario?.nombre_completo || 'Usuario'}
            </p>
            <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
              {usuario?.rol || 'Rol'}
            </p>
          </div>
        </div>

        <button
          onClick={cerrarSesion}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="relative z-50 flex">
            {sidebarContent}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </aside>
        </div>
      )}
    </>
  );
}

