import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Camera,
  Settings,
  X,
  LogOut,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import BrandMark from '../ui/BrandMark';

export type ViewName =
  | 'dashboard'
  | 'recepcion'
  | 'ordenes'
  | 'camaras'
  | 'configuracion';

export const NAV_ITEMS: Array<{
  key: ViewName;
  icon: typeof LayoutDashboard;
  group: 'operacion' | 'sistema';
  roles?: string[];
}> = [
  { key: 'dashboard', icon: LayoutDashboard, group: 'operacion' },
  { key: 'recepcion', icon: ClipboardList, group: 'operacion', roles: ['administrador', 'recepcionista'] },
  { key: 'ordenes', icon: Wrench, group: 'operacion' },
  { key: 'camaras', icon: Camera, group: 'operacion' },
  { key: 'configuracion', icon: Settings, group: 'sistema', roles: ['administrador'] },
];

export const VIEW_LABEL_KEY: Record<ViewName, `nav.${string}`> = {
  dashboard: 'nav.dashboard',
  recepcion: 'nav.recepcion',
  ordenes: 'nav.ordenes',
  camaras: 'nav.camaras',
  configuracion: 'nav.configuracion',
} as const;

const GROUP_LABEL = { operacion: 'Operación', sistema: 'Sistema' } as const;

interface SidebarProps {
  activeView: ViewName;
  onNavigate: (view: ViewName) => void;
  isOpen: boolean;
  onClose: () => void;
}

function initials(name?: string) {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
}

export default function Sidebar({ activeView, onNavigate, isOpen, onClose }: SidebarProps) {
  const { t } = useLanguage();
  const { usuario, cerrarSesion } = useAuth();

  const navFiltrados = NAV_ITEMS.filter((item) => {
    if (!item.roles || !usuario) return true;
    return item.roles.includes(usuario.rol);
  });

  const groups = (['operacion', 'sistema'] as const)
    .map((g) => ({ g, items: navFiltrados.filter((i) => i.group === g) }))
    .filter((x) => x.items.length > 0);

  const sidebarContent = (
    <div className="relative flex h-full w-[264px] flex-col overflow-hidden bg-ink-950 text-white">
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full bg-brand-600/20 blur-3xl" />

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-5 pt-6 pb-5">
        <BrandMark size={38} />
        <div className="leading-tight">
          <p className="text-[15px] font-bold tracking-tight">
            TallerMoto <span className="text-brand-400">Pro</span>
          </p>
          <p className="text-[11px] text-slate-400">Gestión de taller</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {groups.map(({ g, items }) => (
          <div key={g}>
            <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
              {GROUP_LABEL[g]}
            </p>
            <div className="space-y-0.5">
              {items.map(({ key, icon: Icon }) => {
                const isActive = activeView === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      onNavigate(key);
                      onClose();
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white/[0.07] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
                    }`}
                  >
                    <span
                      className={`absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-500 transition-opacity ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                          : 'bg-white/[0.04] text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      <Icon size={16} strokeWidth={2.2} />
                    </span>
                    {t(VIEW_LABEL_KEY[key] as Parameters<typeof t>[0])}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Usuario activo y logout */}
      <div className="relative m-3 flex items-center justify-between gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-xs font-bold text-white">
            {initials(usuario?.nombre_completo)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-100">
              {usuario?.nombre_completo || 'Usuario'}
            </p>
            <p className="text-[10px] font-semibold tracking-wider text-brand-400 uppercase">
              {usuario?.rol || 'Rol'}
            </p>
          </div>
        </div>

        <button
          onClick={cerrarSesion}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen flex-shrink-0 lg:flex">{sidebarContent}</aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 animate-fade-in bg-ink-950/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative z-50 flex animate-fade-in">
            {sidebarContent}
            <button
              onClick={onClose}
              className="absolute top-5 right-3 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
