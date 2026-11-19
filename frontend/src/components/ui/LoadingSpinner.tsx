export default function LoadingSpinner({ size = 24, label }: { size?: number; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8" role="status">
      <span
        className="inline-block animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600"
        style={{ width: size, height: size }}
      />
      {label && <span className="text-xs font-medium text-slate-500">{label}</span>}
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
