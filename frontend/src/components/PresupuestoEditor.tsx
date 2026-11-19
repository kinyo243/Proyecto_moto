import { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  Receipt,
  CreditCard,
  CheckCircle2,
  Loader2,
  Layers,
} from 'lucide-react';
import {
  getPresupuestoByOrden,
  createPresupuesto,
  addItemPresupuesto,
  deleteItemPresupuesto,
  updatePresupuesto,
  registrarPago,
  getBalanceOrden,
} from '../api/endpoints/presupuestos';
import { useToast } from '../context/ToastContext';
import type {
  Presupuesto,
  BalanceOrden,
  TipoItemPresupuesto,
  MetodoPago,
} from '../types';

interface PresupuestoEditorProps {
  ordenId: number;
}

const TIPOS_ITEM: TipoItemPresupuesto[] = ['Repuesto', 'Mano de Obra', 'Servicio Externo'];
const METODOS_PAGO: MetodoPago[] = [
  'Efectivo',
  'Transferencia',
  'Tarjeta Débito',
  'Tarjeta Crédito',
  'Otro',
];

export default function PresupuestoEditor({ ordenId }: PresupuestoEditorProps) {
  const toast = useToast();
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [balance, setBalance] = useState<BalanceOrden | null>(null);
  const [loading, setLoading] = useState(true);

  // Formulario nuevo ítem
  const [tipoItem, setTipoItem] = useState<TipoItemPresupuesto>('Repuesto');
  const [descripcionItem, setDescripcionItem] = useState('');
  const [cantidadItem, setCantidadItem] = useState('1');
  const [precioUnitarioItem, setPrecioUnitarioItem] = useState('');
  const [agregandoItem, setAgregandoItem] = useState(false);

  // Modal registrar pago
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [montoPago, setMontoPago] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo');
  const [referenciaPago, setReferenciaPago] = useState('');
  const [notasPago, setNotasPago] = useState('');
  const [guardandoPago, setGuardandoPago] = useState(false);

  // Cargar presupuesto y balance
  const cargarDatos = async () => {
    try {
      setLoading(true);
      try {
        const presRes = await getPresupuestoByOrden(ordenId);
        setPresupuesto(presRes.data);
      } catch (err: any) {
        // Si no existe, crear inicializado
        const nuevoRes = await createPresupuesto({
          orden_id: ordenId,
          impuesto_porcentaje: 16.0,
          descuento: 0.0,
          notas: 'Presupuesto inicial',
        });
        setPresupuesto(nuevoRes.data);
      }

      // Cargar balance de pagos
      const balRes = await getBalanceOrden(ordenId);
      setBalance(balRes.data);
    } catch (err: any) {
      console.error('Error cargando presupuesto:', err);
      toast.error('Error al cargar presupuesto', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ordenId) {
      cargarDatos();
    }
  }, [ordenId]);

  // Agregar nuevo ítem
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presupuesto) return;
    if (!descripcionItem.trim() || !precioUnitarioItem) {
      toast.error('Campos requeridos', 'Ingresa descripción y precio unitario.');
      return;
    }

    setAgregandoItem(true);
    try {
      await addItemPresupuesto(presupuesto.id, {
        tipo: tipoItem,
        descripcion: descripcionItem.trim(),
        cantidad: parseFloat(cantidadItem) || 1.0,
        precio_unitario: parseFloat(precioUnitarioItem) || 0.0,
      });

      // Refrescar presupuesto y balance
      const [presRes, balRes] = await Promise.all([
        getPresupuestoByOrden(ordenId),
        getBalanceOrden(ordenId),
      ]);
      setPresupuesto(presRes.data);
      setBalance(balRes.data);

      setDescripcionItem('');
      setCantidadItem('1');
      setPrecioUnitarioItem('');
      toast.success('Ítem Agregado', 'Se añadió el concepto al presupuesto.');
    } catch (err: any) {
      toast.error('Error al agregar ítem', err.message);
    } finally {
      setAgregandoItem(false);
    }
  };

  // Eliminar ítem
  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteItemPresupuesto(itemId);
      const [presRes, balRes] = await Promise.all([
        getPresupuestoByOrden(ordenId),
        getBalanceOrden(ordenId),
      ]);
      setPresupuesto(presRes.data);
      setBalance(balRes.data);
      toast.info('Ítem Eliminado', 'Se removió el concepto de la cotización.');
    } catch (err: any) {
      toast.error('Error al eliminar', err.message);
    }
  };

  // Modificar descuento o IVA
  const handleActualizarDescuento = async (nuevoDescuento: number) => {
    if (!presupuesto) return;
    try {
      const res = await updatePresupuesto(presupuesto.id, { descuento: nuevoDescuento });
      setPresupuesto(res.data);
      const balRes = await getBalanceOrden(ordenId);
      setBalance(balRes.data);
      toast.success('Descuento Actualizado', `Descuento fijado en $${nuevoDescuento}`);
    } catch (err: any) {
      toast.error('Error al actualizar', err.message);
    }
  };

  // Registrar abono / pago
  const handleRegistrarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(montoPago);
    if (isNaN(montoNum) || montoNum <= 0) {
      toast.error('Monto inválido', 'Ingresa una cantidad mayor a cero.');
      return;
    }

    setGuardandoPago(true);
    try {
      await registrarPago({
        orden_id: ordenId,
        monto: montoNum,
        metodo_pago: metodoPago,
        referencia: referenciaPago.trim() || undefined,
        notas: notasPago.trim() || undefined,
      });

      const balRes = await getBalanceOrden(ordenId);
      setBalance(balRes.data);
      setShowPagoModal(false);
      setMontoPago('');
      setReferenciaPago('');
      setNotasPago('');
      toast.success(
        '¡Pago Registrado!',
        `Se abonaron $${montoNum.toLocaleString('es-MX', { minimumFractionDigits: 2 })} a la orden #${ordenId}.`
      );
    } catch (err: any) {
      toast.error('Error al registrar pago', err.message);
    } finally {
      setGuardandoPago(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-slate-400 gap-2">
        <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
        <p className="text-xs font-semibold">Cargando presupuesto y balances...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen Superior Financiero */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Presupuestado
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
              ${presupuesto?.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Abonado / Pagado
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">
              ${balance?.total_pagado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              (balance?.saldo_pendiente ?? 0) > 0
                ? 'bg-amber-50 text-amber-600'
                : 'bg-slate-100 text-slate-600'
            }`}>
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Saldo Pendiente
              </p>
              <p className={`text-2xl font-extrabold mt-0.5 ${
                (balance?.saldo_pendiente ?? 0) > 0 ? 'text-amber-600' : 'text-slate-700'
              }`}>
                ${balance?.saldo_pendiente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setMontoPago(balance?.saldo_pendiente ? balance.saldo_pendiente.toString() : '');
              setShowPagoModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-card transition-colors cursor-pointer"
          >
            Abonar
          </button>
        </div>
      </div>

      {/* Editor de Ítems del Presupuesto */}
      <div className="card overflow-hidden">
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Layers className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Desglose de Repuestos y Mano de Obra
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700">
            {presupuesto?.items.length || 0} Conceptos
          </span>
        </div>

        {/* Formulario rápido para agregar ítem */}
        <form onSubmit={handleAddItem} className="p-6 border-b border-slate-100 bg-slate-50/40">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tipo de Concepto
              </label>
              <select
                value={tipoItem}
                onChange={(e) => setTipoItem(e.target.value as TipoItemPresupuesto)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-indigo-500"
              >
                {TIPOS_ITEM.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Descripción / Refacción
              </label>
              <input
                type="text"
                required
                value={descripcionItem}
                onChange={(e) => setDescripcionItem(e.target.value)}
                placeholder="Ej. Pastillas de freno Brembo / Cambio de aceite"
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Cant.
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={cantidadItem}
                onChange={(e) => setCantidadItem(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 text-center font-bold focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                P. Unitario ($)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                value={precioUnitarioItem}
                onChange={(e) => setPrecioUnitarioItem(e.target.value)}
                placeholder="0.00"
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 font-bold focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-1">
              <button
                type="submit"
                disabled={agregandoItem}
                className="w-full flex items-center justify-center p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-card transition-colors cursor-pointer disabled:opacity-50"
                title="Agregar concepto"
              >
                {agregandoItem ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </form>

        {/* Tabla de Conceptos */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Tipo</th>
                <th className="px-6 py-3.5">Descripción</th>
                <th className="px-6 py-3.5 text-center">Cant.</th>
                <th className="px-6 py-3.5 text-right">P. Unitario</th>
                <th className="px-6 py-3.5 text-right">Subtotal</th>
                <th className="px-6 py-3.5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {presupuesto?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-400">
                    Aún no hay repuestos o servicios agregados al presupuesto.
                  </td>
                </tr>
              ) : (
                presupuesto?.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        item.tipo === 'Repuesto'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : item.tipo === 'Mano de Obra'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-800">
                      {item.descripcion}
                    </td>
                    <td className="px-6 py-3.5 text-center font-bold text-slate-600">
                      {item.cantidad}
                    </td>
                    <td className="px-6 py-3.5 text-right text-slate-600 font-mono">
                      ${item.precio_unitario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold text-slate-900 font-mono">
                      ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Eliminar concepto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totales y Liquidación */}
        <div className="p-6 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Descuento Global ($):</span>
            <input
              type="number"
              min="0"
              defaultValue={presupuesto?.descuento || 0}
              onBlur={(e) => handleActualizarDescuento(parseFloat(e.target.value) || 0)}
              className="w-24 text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 font-bold bg-white"
            />
          </div>

          <div className="space-y-1.5 text-right text-xs">
            <div className="flex justify-between gap-8 text-slate-500">
              <span>Subtotal Bruto:</span>
              <span className="font-mono font-semibold">
                ${presupuesto?.subtotal_bruto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {Boolean(presupuesto?.descuento) && (
              <div className="flex justify-between gap-8 text-rose-600">
                <span>Descuento:</span>
                <span className="font-mono font-semibold">
                  -${presupuesto?.descuento.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-8 text-slate-500">
              <span>IVA ({presupuesto?.impuesto_porcentaje}%):</span>
              <span className="font-mono font-semibold">
                ${presupuesto?.monto_impuesto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between gap-8 text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>TOTAL NETO:</span>
              <span className="font-mono text-base text-emerald-600">
                ${presupuesto?.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Pagos Realizados */}
      {balance && balance.pagos.length > 0 && (
        <div className="card p-6 space-y-3">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Historial de Pagos y Abonos Registrados</span>
          </h4>
          <div className="divide-y divide-slate-100">
            {balance.pagos.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">{p.metodo_pago}</span>
                  {p.referencia && (
                    <span className="text-slate-500 ml-2">Ref: {p.referencia}</span>
                  )}
                  {p.notas && <p className="text-slate-400 text-[11px] mt-0.5">{p.notas}</p>}
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-emerald-600">
                    +${p.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(p.fecha_pago).toLocaleString('es-MX')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Registrar Pago */}
      {showPagoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Registrar Pago / Abono</span>
            </h3>

            <form onSubmit={handleRegistrarPago} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Monto a Pagar ($) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={montoPago}
                  onChange={(e) => setMontoPago(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-base font-bold py-2.5 px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Método de Pago *
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  {METODOS_PAGO.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Referencia / Folio Transacción (Opcional)
                </label>
                <input
                  type="text"
                  value={referenciaPago}
                  onChange={(e) => setReferenciaPago(e.target.value)}
                  placeholder="Ej. AUT-882910 o Folio Ticket"
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Notas / Observaciones
                </label>
                <input
                  type="text"
                  value={notasPago}
                  onChange={(e) => setNotasPago(e.target.value)}
                  placeholder="Ej. Anticipo del 50%"
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPagoModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoPago}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-card cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {guardandoPago && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirmar Pago</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
