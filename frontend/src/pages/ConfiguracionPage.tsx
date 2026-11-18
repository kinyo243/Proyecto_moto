import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  ClipboardList,
  DollarSign,
  Database,
  Save,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Download,
  RefreshCw,
  Camera,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getTasasBCV, type TasasBCV } from '../api/endpoints/bcv';
import type { RolUsuario } from '../types';

type ConfigTab = 'taller' | 'usuarios' | 'bahias' | 'dvi' | 'finanzas' | 'respaldos';

interface EmpleadoMock {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  bahiaAsignada?: string;
  activo: boolean;
}

interface BahiaMock {
  id: number;
  nombre: string;
  descripcion: string;
  rtspUrl: string;
  protocolo: 'HLS' | 'WebRTC';
}

interface ItemDVIConfig {
  id: number;
  categoria: string;
  nombre: string;
  activo: boolean;
}

export default function ConfiguracionPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<ConfigTab>('taller');
  const [guardando, setGuardando] = useState(false);

  // 1. Datos del Taller y Marca (Adaptado a Venezuela: RIF, IVA 16%, USD/Bs)
  const [nombreTaller, setNombreTaller] = useState('MotoSport Garage & Servicio Técnico');
  const [rifTaller, setRifTaller] = useState('J-40123456-7');
  const [telefonoTaller, setTelefonoTaller] = useState('+58 412 1234567');
  const [emailTaller, setEmailTaller] = useState('contacto@motosport.com.ve');
  const [direccionTaller, setDireccionTaller] = useState('Av. Principal de Los Ruices, Galpón 4, Caracas, Venezuela');
  const [terminosLegales, setTerminosLegales] = useState(
    'El cliente declara haber recibido el diagnóstico técnico digital (DVI) y autoriza la ejecución de los trabajos y repuestos cotizados. El taller no se hace responsable por objetos de valor no declarados en el inventario inicial de recepción.'
  );

  // 2. Personal y Usuarios
  const [empleados, setEmpleados] = useState<EmpleadoMock[]>([
    { id: 1, nombre: 'Carlos Administrador', email: 'admin@taller.com', rol: 'administrador', activo: true },
    { id: 2, nombre: 'Mariana Recepción', email: 'recepcion@taller.com', rol: 'recepcionista', activo: true },
    { id: 3, nombre: 'Jesús Técnico Principal', email: 'mecanico@taller.com', rol: 'mecanico', bahiaAsignada: 'Bahía 1', activo: true },
    { id: 4, nombre: 'Alejandro Frenos y Suspensión', email: 'alejandro@taller.com', rol: 'mecanico', bahiaAsignada: 'Bahía 2', activo: true },
  ]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [nuevoRol, setNuevoRol] = useState<RolUsuario>('mecanico');
  const [nuevaBahia, setNuevaBahia] = useState('');

  // 3. Bahías y Cámaras IP
  const [bahias, setBahias] = useState<BahiaMock[]>([
    { id: 1, nombre: 'Bahía 1 - Mecánica General', descripcion: 'Elevador de motos 1', rtspUrl: 'rtsp://localhost:8554/bahia1', protocolo: 'HLS' },
    { id: 2, nombre: 'Bahía 2 - Frenos y Suspensión', descripcion: 'Elevador de motos 2', rtspUrl: 'rtsp://localhost:8554/bahia2', protocolo: 'HLS' },
    { id: 3, nombre: 'Elevador Principal - Diagnóstico', descripcion: 'Área de scanner e inspección DVI', rtspUrl: 'rtsp://localhost:8554/bahia3', protocolo: 'WebRTC' },
  ]);
  const [nombreNuevaBahia, setNombreNuevaBahia] = useState('');
  const [descNuevaBahia, setDescNuevaBahia] = useState('');
  const [rtspNuevaBahia, setRtspNuevaBahia] = useState('');

  // 4. Plantilla DVI Personalizada
  const [itemsDVI, setItemsDVI] = useState<ItemDVIConfig[]>([
    { id: 1, categoria: 'Frenos', nombre: 'Pastillas y zapatas de freno', activo: true },
    { id: 2, categoria: 'Frenos', nombre: 'Líquido de frenos y presión de maneta/pedal', activo: true },
    { id: 3, categoria: 'Frenos', nombre: 'Discos de freno y tambores', activo: true },
    { id: 4, categoria: 'Neumáticos', nombre: 'Presión y desgaste de neumático delantero', activo: true },
    { id: 5, categoria: 'Neumáticos', nombre: 'Presión y desgaste de neumático trasero', activo: true },
    { id: 6, categoria: 'Fluidos', nombre: 'Nivel y viscosidad de aceite de motor', activo: true },
    { id: 7, categoria: 'Fluidos', nombre: 'Líquido refrigerante / radiador', activo: true },
    { id: 8, categoria: 'Suspensión', nombre: 'Horquillas delanteras (retenes, botellas y fugas)', activo: true },
    { id: 9, categoria: 'Suspensión', nombre: 'Amortiguador trasero / Monoshock', activo: true },
    { id: 10, categoria: 'Transmisión', nombre: 'Tensión, lubricación y desgaste de cadena / piñones', activo: true },
  ]);
  const [exigirFotoRojo, setExigirFotoRojo] = useState(true);
  const [nuevaCatDVI, setNuevaCatDVI] = useState('Motor');
  const [nuevoNombreDVI, setNuevoNombreDVI] = useState('');

  // 5. Finanzas e Impuestos (con soporte BCV en vivo)
  const [monedaPrincipal, setMonedaPrincipal] = useState('USD ($)');
  const [monedaSecundaria, setMonedaSecundaria] = useState('VES (Bs)');
  const [tasaUsdBcv, setTasaUsdBcv] = useState<number>(0);
  const [tasaEurBcv, setTasaEurBcv] = useState<number>(0);
  const [fechaValorBcv, setFechaValorBcv] = useState<string | null>(null);
  const [cargandoBcv, setCargandoBcv] = useState(false);
  const [tasaCambioManual, setTasaCambioManual] = useState('916.65');
  const [ivaPorcentaje, setIvaPorcentaje] = useState('16.0');
  const [descuentoMaximo, setDescuentoMaximo] = useState('15.0');
  const [costoHoraManoObra, setCostoHoraManoObra] = useState('25.00');

  // Función para consultar las tasas oficiales del Banco Central de Venezuela
  const sincronizarTasasBCV = async (forceRefresh = false) => {
    setCargandoBcv(true);
    try {
      const res = await getTasasBCV(forceRefresh);
      const data: TasasBCV = res.data;
      setTasaUsdBcv(data.usd);
      setTasaEurBcv(data.eur);
      setFechaValorBcv(data.fecha_valor);
      setTasaCambioManual(data.usd.toFixed(2));
      toast.success(
        'Tasas BCV Actualizadas',
        `USD: Bs. ${data.usd.toLocaleString('es-VE', { minimumFractionDigits: 2 })} | EUR: Bs. ${data.eur.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`
      );
    } catch (err: any) {
      toast.error('Error consultando BCV', err.message || 'No se pudo conectar con el portal oficial');
    } finally {
      setCargandoBcv(false);
    }
  };

  useEffect(() => {
    sincronizarTasasBCV();
  }, []);

  // 6. Mensajería WhatsApp
  const [mensajeListoWA, setMensajeListoWA] = useState(
    '¡Hola {cliente}! 👋 Le informamos desde {taller} que su vehículo ({marca} {modelo}, placa {placa}) ya está LISTO para ser retirado. Saldo total: {total}. Puede descargar su informe de inspección aquí: {enlace_pdf}'
  );

  const handleGuardarCambios = () => {
    setGuardando(true);
    setTimeout(() => {
      setGuardando(false);
      toast.success('Configuración Guardada', 'Todos los parámetros del sistema se han actualizado correctamente.');
    }, 600);
  };

  const handleAgregarEmpleado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoEmail) return;
    const nuevo: EmpleadoMock = {
      id: Date.now(),
      nombre: nuevoNombre,
      email: nuevoEmail,
      rol: nuevoRol,
      bahiaAsignada: nuevaBahia || undefined,
      activo: true,
    };
    setEmpleados([...empleados, nuevo]);
    setNuevoNombre('');
    setNuevoEmail('');
    setNuevoPassword('');
    toast.success('Usuario Agregado', `Se registró a ${nuevo.nombre} con rol ${nuevo.rol}.`);
  };

  const handleEliminarEmpleado = (id: number) => {
    setEmpleados(empleados.filter((e) => e.id !== id));
    toast.info('Usuario Removido', 'El usuario fue eliminado del personal activo.');
  };

  const handleToggleEmpleado = (id: number) => {
    setEmpleados(
      empleados.map((e) => (e.id === id ? { ...e, activo: !e.activo } : e))
    );
  };

  const handleAgregarBahia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNuevaBahia) return;
    const b: BahiaMock = {
      id: Date.now(),
      nombre: nombreNuevaBahia,
      descripcion: descNuevaBahia || 'Puesto de trabajo',
      rtspUrl: rtspNuevaBahia || 'rtsp://localhost:8554/cam',
      protocolo: 'HLS',
    };
    setBahias([...bahias, b]);
    setNombreNuevaBahia('');
    setDescNuevaBahia('');
    setRtspNuevaBahia('');
    toast.success('Bahía Creada', `Se dio de alta "${b.nombre}".`);
  };

  const handleAgregarItemDVI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombreDVI) return;
    const item: ItemDVIConfig = {
      id: Date.now(),
      categoria: nuevaCatDVI,
      nombre: nuevoNombreDVI,
      activo: true,
    };
    setItemsDVI([...itemsDVI, item]);
    setNuevoNombreDVI('');
    toast.success('Ítem DVI Añadido', `Se agregó "${item.nombre}" a la categoría ${item.categoria}.`);
  };

  const handleToggleItemDVI = (id: number) => {
    setItemsDVI(
      itemsDVI.map((item) => (item.id === id ? { ...item, activo: !item.activo } : item))
    );
  };

  const handleDescargarBackup = () => {
    const backupData = {
      fecha: new Date().toISOString(),
      nombreTaller,
      rifTaller,
      ivaPorcentaje,
      tasaUsdBcv,
      tasaEurBcv,
      fechaValorBcv,
      empleados,
      bahias,
      itemsDVI,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_tallermoto_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Respaldo Generado', 'La copia de seguridad se descargó exitosamente.');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </span>
            Configuración del Taller y Parámetros
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Personaliza los datos comerciales, RIF, personal, bahías con cámaras IP, checklist DVI y cobranza.
          </p>
        </div>

        <button
          onClick={handleGuardarCambios}
          disabled={guardando}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
        >
          {guardando ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{guardando ? 'Guardando...' : 'Guardar Parámetros'}</span>
        </button>
      </div>

      {/* Barra de Pestañas */}
      <div className="flex bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300/80 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('taller')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'taller' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Taller & RIF</span>
        </button>

        <button
          onClick={() => setActiveTab('usuarios')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'usuarios' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Personal & Roles</span>
        </button>

        <button
          onClick={() => setActiveTab('bahias')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'bahias' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Bahías & Cámaras IP</span>
        </button>

        <button
          onClick={() => setActiveTab('dvi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'dvi' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Plantilla DVI</span>
        </button>

        <button
          onClick={() => setActiveTab('finanzas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'finanzas' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Moneda & IVA</span>
        </button>

        <button
          onClick={() => setActiveTab('respaldos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'respaldos' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Mensajes & Respaldo</span>
        </button>
      </div>

      {/* CONTENIDO 1: DATOS DEL TALLER Y RIF */}
      {activeTab === 'taller' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>Identidad Corporativa y RIF (Venezuela)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Estos datos se imprimen en los reportes de inspección DVI en PDF, presupuestos y mensajes al cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Razón Social / Nombre Comercial *
              </label>
              <input
                type="text"
                value={nombreTaller}
                onChange={(e) => setNombreTaller(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 font-semibold focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                RIF del Taller (Registro de Información Fiscal) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={rifTaller}
                  onChange={(e) => setRifTaller(e.target.value.toUpperCase())}
                  placeholder="J-12345678-9 / V-12345678-0"
                  className="w-full text-xs font-mono font-bold py-2.5 px-3 rounded-xl border border-slate-300 uppercase focus:ring-1 focus:ring-indigo-500 bg-amber-50/20"
                />
                <span className="text-[10px] font-bold text-slate-400 absolute right-3 top-3">
                  SENIAT
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Teléfono de Contacto / WhatsApp del Taller *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={telefonoTaller}
                  onChange={(e) => setTelefonoTaller(e.target.value)}
                  className="w-full text-xs py-2.5 pl-9 pr-3 rounded-xl border border-slate-300 font-medium focus:ring-1 focus:ring-indigo-500"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico de Notificaciones
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={emailTaller}
                  onChange={(e) => setEmailTaller(e.target.value)}
                  className="w-full text-xs py-2.5 pl-9 pr-3 rounded-xl border border-slate-300 font-medium focus:ring-1 focus:ring-indigo-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Dirección Física del Taller (Para el encabezado del PDF)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={direccionTaller}
                  onChange={(e) => setDireccionTaller(e.target.value)}
                  className="w-full text-xs py-2.5 pl-9 pr-3 rounded-xl border border-slate-300 font-medium focus:ring-1 focus:ring-indigo-500"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Términos Legales y Letra Pequeña al Pie de la Firma Digital
              </label>
              <textarea
                rows={3}
                value={terminosLegales}
                onChange={(e) => setTerminosLegales(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 resize-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO 2: PERSONAL Y ROLES (RBAC) */}
      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          {/* Formulario nuevo usuario */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Dar de Alta a un Nuevo Empleado</span>
            </h3>

            <form onSubmit={handleAgregarEmpleado} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Pedro Pérez"
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  placeholder="pedro@taller.com"
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Contraseña *</label>
                <input
                  type="password"
                  required
                  value={nuevoPassword}
                  onChange={(e) => setNuevoPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Rol en Taller *</label>
                <select
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value as RolUsuario)}
                  className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="mecanico">Mecánico</option>
                  <option value="recepcionista">Recepcionista</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Bahía Fija</label>
                <select
                  value={nuevaBahia}
                  onChange={(e) => setNuevaBahia(e.target.value)}
                  className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="">Sin Asignar</option>
                  <option value="Bahía 1">Bahía 1</option>
                  <option value="Bahía 2">Bahía 2</option>
                  <option value="Elevador 1">Elevador 1</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Usuario</span>
                </button>
              </div>
            </form>
          </div>

          {/* Lista de Empleados */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Personal del Taller Registrado ({empleados.length})
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {empleados.map((emp) => (
                <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                      {emp.nombre.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{emp.nombre}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          emp.rol === 'administrador'
                            ? 'bg-purple-100 text-purple-800'
                            : emp.rol === 'recepcionista'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {emp.rol}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{emp.email} {emp.bahiaAsignada && `• Asignado a: ${emp.bahiaAsignada}`}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleEmpleado(emp.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                        emp.activo
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {emp.activo ? 'Activo' : 'Inactivo'}
                    </button>
                    <button
                      onClick={() => handleEliminarEmpleado(emp.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO 3: BAHÍAS Y CÁMARAS IP */}
      {activeTab === 'bahias' && (
        <div className="space-y-6">
          {/* Formulario nueva bahía */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-600" />
              <span>Configurar Nueva Bahía o Elevador con Cámara IP</span>
            </h3>

            <form onSubmit={handleAgregarBahia} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nombre de la Bahía *</label>
                <input
                  type="text"
                  required
                  value={nombreNuevaBahia}
                  onChange={(e) => setNombreNuevaBahia(e.target.value)}
                  placeholder="Ej. Bahía 4 - Pintura"
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Descripción / Función</label>
                <input
                  type="text"
                  value={descNuevaBahia}
                  onChange={(e) => setDescNuevaBahia(e.target.value)}
                  placeholder="Área de detalle"
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">URL RTSP de la Cámara IP</label>
                <input
                  type="text"
                  value={rtspNuevaBahia}
                  onChange={(e) => setRtspNuevaBahia(e.target.value)}
                  placeholder="rtsp://admin:pass@192.168.1.50/live"
                  className="w-full text-xs font-mono py-2 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Bahía</span>
                </button>
              </div>
            </form>
          </div>

          {/* Grid de bahías activas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bahias.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    ID #{b.id}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                    {b.protocolo}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{b.nombre}</h4>
                  <p className="text-xs text-slate-500">{b.descripcion}</p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Stream RTSP:</p>
                  <p className="text-xs font-mono text-slate-700 truncate bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    {b.rtspUrl}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENIDO 4: PLANTILLA DVI PERSONALIZADA */}
      {activeTab === 'dvi' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                  <span>Puntos de Inspección Digital (DVI)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Configura qué puntos deben revisar los mecánicos en cada ingreso.
                </p>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exigirFotoRojo}
                  onChange={(e) => setExigirFotoRojo(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Exigir foto si el punto es ROJO o AMARILLO</span>
              </label>
            </div>

            {/* Agregar nuevo punto */}
            <form onSubmit={handleAgregarItemDVI} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-2 border-t border-slate-100">
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Categoría</label>
                <select
                  value={nuevaCatDVI}
                  onChange={(e) => setNuevaCatDVI(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Frenos">Frenos</option>
                  <option value="Neumáticos">Neumáticos</option>
                  <option value="Fluidos">Fluidos y Motor</option>
                  <option value="Suspensión">Suspensión</option>
                  <option value="Transmisión">Transmisión / Cadena</option>
                  <option value="Eléctrico">Sistema Eléctrico y Luces</option>
                  <option value="Chasis">Chasis y Estructura</option>
                </select>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nombre del Componente a Evaluar *</label>
                <input
                  type="text"
                  required
                  value={nuevoNombreDVI}
                  onChange={(e) => setNuevoNombreDVI(e.target.value)}
                  placeholder="Ej. Tensión de radios / Estado de batería"
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Punto</span>
                </button>
              </div>
            </form>
          </div>

          {/* Listado de puntos DVI configurados */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {itemsDVI.map((item) => (
                <div key={item.id} className="p-3.5 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {item.categoria}
                    </span>
                    <span className={`text-xs font-semibold ${item.activo ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                      {item.nombre}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleItemDVI(item.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                      item.activo
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    {item.activo ? 'Activo' : 'Omitir'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO 5: MONEDA, IVA Y COBRANZA */}
      {activeTab === 'finanzas' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <span>Moneda, Tasas BCV en Vivo y Política de Descuentos</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scraping en tiempo real del Banco Central de Venezuela para Dólar (USD) y Euro (EUR).
              </p>
            </div>

            <button
              type="button"
              onClick={() => sincronizarTasasBCV(true)}
              disabled={cargandoBcv}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cargandoBcv ? 'animate-spin' : ''}`} />
              <span>{cargandoBcv ? 'Consultando BCV...' : 'Sincronizar BCV Ahora'}</span>
            </button>
          </div>

          {/* Tarjetas Informativas de Tasas BCV Oficiales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tarjeta USD */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  $
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Dólar Oficial (USD / VES)
                  </span>
                  <p className="text-xl font-black text-slate-900 font-mono mt-0.5">
                    {tasaUsdBcv > 0 ? `Bs. ${tasaUsdBcv.toLocaleString('es-VE', { minimumFractionDigits: 4 })}` : 'Cargando...'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                BCV OFICIAL
              </span>
            </div>

            {/* Tarjeta EUR */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                  €
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Euro Oficial (EUR / VES)
                  </span>
                  <p className="text-xl font-black text-slate-900 font-mono mt-0.5">
                    {tasaEurBcv > 0 ? `Bs. ${tasaEurBcv.toLocaleString('es-VE', { minimumFractionDigits: 4 })}` : 'Cargando...'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                BCV OFICIAL
              </span>
            </div>
          </div>

          {fechaValorBcv && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>Fecha Valor oficial publicada por el BCV: <strong className="text-slate-800">{fechaValorBcv}</strong></span>
              <a
                href="https://www.bcv.org.ve/"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-0.5 ml-2 font-semibold"
              >
                <span>Verificar en bcv.org.ve</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Moneda Base del Sistema *
              </label>
              <select
                value={monedaPrincipal}
                onChange={(e) => {
                  setMonedaPrincipal(e.target.value);
                  if (e.target.value.includes('USD')) {
                    setMonedaSecundaria('VES (Bs)');
                  } else if (e.target.value.includes('EUR')) {
                    setMonedaSecundaria('VES (Bs)');
                  }
                }}
                className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 font-semibold bg-white"
              >
                <option value="USD ($)">USD ($) - Dólares Americanos (Moneda Base)</option>
                <option value="EUR (€)">EUR (€) - Euros (Moneda Base)</option>
                <option value="VES (Bs)">VES (Bs) - Bolívares (Moneda Base)</option>
                <option value="COP ($)">COP ($) - Pesos Colombianos</option>
                <option value="MXN ($)">MXN ($) - Pesos Mexicanos</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Moneda secundaria: {monedaSecundaria}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tasa de IVA Predeterminada (%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={ivaPorcentaje}
                  onChange={(e) => setIvaPorcentaje(e.target.value)}
                  className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-300"
                />
                <span className="text-xs font-bold text-slate-400 absolute right-3 top-2.5">
                  % (16% en Venezuela)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tasa Aplicada en Presupuestos (Bs / Divisa)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={tasaCambioManual}
                  onChange={(e) => setTasaCambioManual(e.target.value)}
                  className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-300 font-mono"
                />
                <span className="text-[11px] font-bold text-slate-400 absolute right-3 top-2.5">
                  Bs
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Costo Base Hora de Mano de Obra ($/€)
              </label>
              <input
                type="number"
                step="1"
                value={costoHoraManoObra}
                onChange={(e) => setCostoHoraManoObra(e.target.value)}
                className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Descuento Máximo Autorizado a Recepción (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={descuentoMaximo}
                  onChange={(e) => setDescuentoMaximo(e.target.value)}
                  className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-300"
                />
                <span className="text-xs font-bold text-slate-400 absolute right-3 top-2.5">%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO 6: MENSAJES WHATSAPP Y RESPALDO DE BASE DE DATOS */}
      {activeTab === 'respaldos' && (
        <div className="space-y-6">
          {/* Plantilla de WhatsApp */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>Plantilla de Mensaje Automatizado por WhatsApp</span>
            </h3>
            <p className="text-xs text-slate-500">
              Usa las variables {'{cliente}'}, {'{taller}'}, {'{marca}'}, {'{modelo}'}, {'{placa}'}, {'{total}'} y {'{enlace_pdf}'} para armar el mensaje automático de entrega.
            </p>

            <textarea
              rows={3}
              value={mensajeListoWA}
              onChange={(e) => setMensajeListoWA(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-500 font-sans"
            />
          </div>

          {/* Copia de Seguridad */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                <span>Copia de Seguridad y Exportación del Taller</span>
              </h4>
              <p className="text-xs text-slate-500">
                Descarga un archivo JSON consolidado con los parámetros, clientes, personal y configuraciones para respaldar en USB o Drive.
              </p>
            </div>

            <button
              onClick={handleDescargarBackup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Copia de Seguridad</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
