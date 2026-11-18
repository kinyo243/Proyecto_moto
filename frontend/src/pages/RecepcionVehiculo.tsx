import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Car,
  Gauge,
  Fuel,
  FileText,
  Search,
  Check,
  Loader2,
  Wrench,
  AlertTriangle,
  Flame,
  BatteryCharging,
  Cog,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { buscarClientes, createCliente } from '../api/endpoints/clientes';
import { createVehiculo, getHistorialVehiculo } from '../api/endpoints/vehiculos';
import { createOrden } from '../api/endpoints/ordenes';
import { useToast } from '../context/ToastContext';
import type { Cliente, NivelCombustible } from '../types';

// Opciones de combustible con su porcentaje aproximado y color
const NIVELES_COMBUSTIBLE: { label: string; value: NivelCombustible; pct: number }[] = [
  { label: 'Vacío (0%)', value: 'Vacio', pct: 0 },
  { label: 'Reserva (10%)', value: 'Reserva', pct: 10 },
  { label: '1/4 (25%)', value: '1/4', pct: 25 },
  { label: '1/2 (50%)', value: '1/2', pct: 50 },
  { label: '3/4 (75%)', value: '3/4', pct: 75 },
  { label: 'Lleno (100%)', value: 'Lleno', pct: 100 },
];

const MOTIVOS_RAPIDOS = [
  { id: 'mantenimiento', label: 'Mantenimiento Preventivo', icon: Cog },
  { id: 'frenos', label: 'Frenos / Pastillas', icon: ShieldAlert },
  { id: 'ruido_motor', label: 'Ruido / Falla de Motor', icon: Flame },
  { id: 'electrico', label: 'Sistema Eléctrico / Batería', icon: BatteryCharging },
  { id: 'aceite', label: 'Cambio de Aceite y Filtro', icon: Sparkles },
  { id: 'diagnostico', label: 'Diagnóstico General / Scanner', icon: AlertTriangle },
];

interface RecepcionVehiculoProps {
  onOrdenCreated?: (ordenId: number) => void;
}

export default function RecepcionVehiculo({ onOrdenCreated }: RecepcionVehiculoProps) {
  const toast = useToast();

  // --- Estado de búsqueda y Cliente ---
  const [queryCliente, setQueryCliente] = useState('');
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [clientesEncontrados, setClientesEncontrados] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  // Formulario nuevo cliente
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');

  // --- Estado de Vehículo ---
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState(new Date().getFullYear().toString());
  const [placa, setPlaca] = useState('');
  const [vin, setVin] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [sliderCombustible, setSliderCombustible] = useState<number>(50);

  // Historial clínico del vehículo
  const [historialPrevio, setHistorialPrevio] = useState<any | null>(null);
  const [buscandoHistorial, setBuscandoHistorial] = useState(false);

  // --- Motivos y Notas de Recepción ---
  const [motivosSeleccionados, setMotivosSeleccionados] = useState<string[]>([]);
  const [reporteFallas, setReporteFallas] = useState('');

  // --- Loading general de guardado ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mapear valor del slider (0-100) al NivelCombustible enum
  const getNivelCombustibleFromSlider = (pct: number): NivelCombustible => {
    if (pct <= 5) return 'Vacio';
    if (pct <= 18) return 'Reserva';
    if (pct <= 38) return '1/4';
    if (pct <= 63) return '1/2';
    if (pct <= 88) return '3/4';
    return 'Lleno';
  };

  const nivelActual = getNivelCombustibleFromSlider(sliderCombustible);

  // Búsqueda en vivo de clientes al tipear (con debounce simple)
  useEffect(() => {
    if (!queryCliente.trim() || queryCliente.length < 2) {
      setClientesEncontrados([]);
      return;
    }

    const timer = setTimeout(async () => {
      setBuscandoCliente(true);
      try {
        const res = await buscarClientes(queryCliente.trim());
        setClientesEncontrados(res.data);
      } catch (err) {
        console.error('Error buscando clientes:', err);
      } finally {
        setBuscandoCliente(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [queryCliente]);

  const seleccionarCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setClienteNombre(cliente.nombre);
    setClienteTelefono(cliente.telefono || '');
    setClienteEmail(cliente.email || '');
    setClientesEncontrados([]);
    setQueryCliente('');
  };

  const limpiarCliente = () => {
    setClienteSeleccionado(null);
    setClienteNombre('');
    setClienteTelefono('');
    setClienteEmail('');
    setQueryCliente('');
  };

  const toggleMotivo = (label: string) => {
    setMotivosSeleccionados((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  // Buscar historial del vehículo por placa
  const handleVerificarPlaca = async (placaAconsultar: string) => {
    const clean = placaAconsultar.trim().toUpperCase();
    if (clean.length < 3) return;

    setBuscandoHistorial(true);
    try {
      const res = await getHistorialVehiculo(clean);
      const v = res.data;
      setHistorialPrevio(v);
      setMarca(v.marca);
      setModelo(v.modelo);
      setAnio(v.anio.toString());
      if (v.vin) setVin(v.vin);
      if (v.kilometraje_actual) setKilometraje(v.kilometraje_actual.toString());

      // Si el vehículo ya tiene cliente, asociarlo
      if (v.cliente && !clienteSeleccionado) {
        seleccionarCliente(v.cliente);
      }
      toast.info('Vehículo Recurrente Encontrado', `Cargado historial con ${v.ordenes_reparacion?.length || 0} visitas previas.`);
    } catch {
      setHistorialPrevio(null);
    } finally {
      setBuscandoHistorial(false);
    }
  };

  // Validación y Envío Completo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validaciones básicas
    if (!clienteNombre.trim() || !clienteTelefono.trim()) {
      toast.error('Datos incompletos', 'Nombre y Teléfono del cliente son obligatorios.');
      return;
    }

    if (!marca.trim() || !modelo.trim() || !placa.trim()) {
      toast.error('Datos del vehículo incompletos', 'Marca, Modelo y Placa son obligatorios.');
      return;
    }

    const parsedAnio = parseInt(anio, 10);
    if (isNaN(parsedAnio) || parsedAnio < 1950 || parsedAnio > 2100) {
      toast.error('Año inválido', 'Por favor ingresa un año válido de fabricación.');
      return;
    }

    const parsedKm = parseInt(kilometraje, 10) || 0;

    setIsSubmitting(true);

    try {
      // Paso 1: Crear o recuperar Cliente
      let clienteId = clienteSeleccionado?.id;
      if (!clienteId) {
        toast.info('Registrando cliente...', 'Validando datos en el sistema.');
        const clienteRes = await createCliente(
          {
            nombre: clienteNombre.trim(),
            telefono: clienteTelefono.trim(),
            email: clienteEmail.trim() || undefined,
            tipo: 'regular',
          },
          true // get_if_exists = true
        );
        clienteId = clienteRes.data.id;
      }

      // Paso 2: Registrar o actualizar Vehículo asociado
      toast.info('Asociando vehículo...', 'Guardando odómetro y combustible.');
      const vehiculoRes = await createVehiculo(
        {
          cliente_id: clienteId,
          marca: marca.trim(),
          modelo: modelo.trim(),
          anio: parsedAnio,
          placa: placa.trim().toUpperCase(),
          vin: vin.trim().toUpperCase() || undefined,
          kilometraje_actual: parsedKm,
          nivel_combustible: nivelActual,
        },
        true // update_if_exists = true
      );

      const vehiculoId = vehiculoRes.data.id;

      // Paso 3: Construir reporte inicial y crear Orden de Reparación
      const notasList: string[] = [];
      if (motivosSeleccionados.length > 0) {
        notasList.push(`Motivos: ${motivosSeleccionados.join(', ')}`);
      }
      if (reporteFallas.trim()) {
        notasList.push(`Observaciones: ${reporteFallas.trim()}`);
      }
      notasList.push(`Ingreso con Combustible: ${nivelActual} (~${sliderCombustible}%)`);

      const ordenRes = await createOrden({
        vehiculo_id: vehiculoId,
        notas_recepcion: notasList.join(' | ') || 'Ingreso a taller para inspección inicial.',
      });

      toast.success(
        '¡Recepción Completada con Éxito!',
        `Se ha generado la Orden de Reparación #${ordenRes.data.id} para la placa ${placa.toUpperCase()}.`
      );

      // Limpiar formulario o notificar
      if (onOrdenCreated) {
        onOrdenCreated(ordenRes.data.id);
      } else {
        // Reset campos
        limpiarCliente();
        setMarca('');
        setModelo('');
        setPlaca('');
        setVin('');
        setKilometraje('');
        setSliderCombustible(50);
        setMotivosSeleccionados([]);
        setReporteFallas('');
      }
    } catch (err: any) {
      console.error('Error al procesar recepción:', err);
      toast.error('Error al guardar recepción', err.message || 'Ocurrió un error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Wrench className="w-6 h-6" />
            </span>
            Recepción y Registro de Ingreso
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Módulo optimizado para tablet o recepción táctil de motocicletas y vehículos.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Recepción Activa
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECCIÓN 1: CLIENTE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-900 font-semibold">
              <User className="w-5 h-5 text-indigo-600" />
              <span>1. Datos del Propietario / Cliente</span>
            </div>
            {clienteSeleccionado && (
              <button
                type="button"
                onClick={limpiarCliente}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
              >
                Cambiar cliente
              </button>
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* Buscador de clientes existentes */}
            {!clienteSeleccionado && (
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Búsqueda rápida (Teléfono o Nombre)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={queryCliente}
                    onChange={(e) => setQueryCliente(e.target.value)}
                    placeholder="Escribe teléfono o nombre para autocompletar..."
                    className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  {buscandoCliente && (
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin absolute right-3.5 top-3.5" />
                  )}
                </div>

                {/* Dropdown de resultados de búsqueda */}
                {clientesEncontrados.length > 0 && (
                  <div className="absolute z-20 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {clientesEncontrados.map((cli) => (
                      <div
                        key={cli.id}
                        onClick={() => seleccionarCliente(cli)}
                        className="p-3.5 hover:bg-indigo-50/80 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{cli.nombre}</p>
                          <p className="text-xs text-slate-500">
                            {cli.telefono || 'Sin tel.'} • {cli.email || 'Sin correo'}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Seleccionar
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {clienteSeleccionado && (
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
                    Cliente Seleccionado
                  </span>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    {clienteSeleccionado.nombre}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tel: {clienteSeleccionado.telefono} | Correo: {clienteSeleccionado.email || 'N/A'}
                  </p>
                </div>
                <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                  ✓
                </div>
              </div>
            )}

            {/* Inputs editables del cliente */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    disabled={!!clienteSeleccionado}
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-600 transition-all"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Teléfono de Contacto (WhatsApp) *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    disabled={!!clienteSeleccionado}
                    value={clienteTelefono}
                    onChange={(e) => setClienteTelefono(e.target.value)}
                    placeholder="Ej. +52 55 1234 5678"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-600 transition-all"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Correo Electrónico (Para DVI/PDF)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled={!!clienteSeleccionado}
                    value={clienteEmail}
                    onChange={(e) => setClienteEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-600 transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: DATOS DEL VEHÍCULO Y COMBUSTIBLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-900 font-semibold">
              <Car className="w-5 h-5 text-indigo-600" />
              <span>2. Especificaciones del Vehículo / Moto</span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Banner de Historial Clínico Previo si el vehículo ya ha visitado el taller */}
            {historialPrevio && (
              <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-indigo-600" />
                    <span>Expediente Clínico: {historialPrevio.marca} {historialPrevio.modelo} ({historialPrevio.placa})</span>
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white text-indigo-800 border border-indigo-200">
                    {historialPrevio.ordenes_reparacion?.length || 0} Visitas Anteriores
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Último kilometraje registrado: <strong className="text-slate-800">{historialPrevio.kilometraje_actual} km</strong>. Propietario en sistema: <strong className="text-slate-800">{historialPrevio.cliente?.nombre || 'Registrado'}</strong>.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  required
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  placeholder="Ej. Yamaha, Honda, Bajaj"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Modelo *
                </label>
                <input
                  type="text"
                  required
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  placeholder="Ej. MT-07, Pulsar NS200"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Año *
                </label>
                <input
                  type="number"
                  required
                  min="1950"
                  max="2100"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  placeholder="2023"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Placa / Matrícula *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    onBlur={(e) => handleVerificarPlaca(e.target.value)}
                    placeholder="Ej. ABC123D"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-semibold uppercase text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-amber-50/30"
                  />
                  {buscandoHistorial && (
                    <Loader2 className="w-4 h-4 text-indigo-500 animate-spin absolute right-3 top-3" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  VIN / Número Chasis
                </label>
                <input
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  placeholder="Opcional"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all uppercase"
                />
              </div>
            </div>

            {/* Kilometraje y Slider Táctil de Combustible */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Kilometraje de Ingreso (Odómetro) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    required
                    value={kilometraje}
                    onChange={(e) => setKilometraje(e.target.value)}
                    placeholder="Ej. 18500"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-300 text-base font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                  <Gauge className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <span className="text-xs font-bold text-slate-400 absolute right-3.5 top-4">
                    KM
                  </span>
                </div>
              </div>

              {/* Slider Visual de Combustible táctil */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Nivel de Combustible
                    </span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-slate-900 border border-slate-200 shadow-xs">
                    {nivelActual} ({sliderCombustible}%)
                  </span>
                </div>

                {/* Slider interactivo táctil */}
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={sliderCombustible}
                    onChange={(e) => setSliderCombustible(parseInt(e.target.value, 10))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 touch-pan-x"
                  />

                  {/* Barra de progreso de color táctil */}
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                    <div
                      className={`transition-all duration-200 rounded-full ${
                        sliderCombustible <= 15
                          ? 'bg-rose-500'
                          : sliderCombustible <= 40
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${sliderCombustible}%` }}
                    />
                  </div>

                  {/* Marcadores rápidos táctiles */}
                  <div className="grid grid-cols-6 gap-1 pt-1">
                    {NIVELES_COMBUSTIBLE.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSliderCombustible(item.pct)}
                        className={`text-[10px] font-medium py-1 rounded-md border text-center transition-all ${
                          nivelActual === item.value
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {item.value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: MOTIVO DE INGRESO Y REPORTE DE FALLAS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-900 font-semibold">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>3. Diagnóstico Inicial y Motivo de Recepción</span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Botones de selección rápida táctiles */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5">
                Selección Rápida de Motivos Comunes
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {MOTIVOS_RAPIDOS.map((motivo) => {
                  const Icon = motivo.icon;
                  const isSelected = motivosSeleccionados.includes(motivo.label);
                  return (
                    <button
                      key={motivo.id}
                      type="button"
                      onClick={() => toggleMotivo(motivo.label)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all text-xs font-semibold touch-manipulation ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm ring-1 ring-indigo-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="flex-1">{motivo.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Observaciones detalladas */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Reporte de Fallas / Observaciones del Cliente
              </label>
              <textarea
                rows={3}
                value={reporteFallas}
                onChange={(e) => setReporteFallas(e.target.value)}
                placeholder="Describe detalles adicionales: ruidos al frenar, fallas en frío, testigo encendido en tablero, golpes o rayones previos..."
                className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* BOTÓN FINAL DE GUARDAR */}
        <div className="sticky bottom-4 z-10 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-xs text-slate-500">
              Al guardar, se creará la Orden en estado <strong className="text-slate-800">"En Espera"</strong>.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto ml-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all disabled:opacity-50 touch-manipulation cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Guardando Orden en Sistema...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Generar Orden de Recepción</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
