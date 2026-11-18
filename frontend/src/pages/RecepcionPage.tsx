import RecepcionVehiculo from './RecepcionVehiculo';

interface RecepcionPageProps {
  onOrdenCreated?: (ordenId: number) => void;
}

export default function RecepcionPage({ onOrdenCreated }: RecepcionPageProps) {
  return <RecepcionVehiculo onOrdenCreated={onOrdenCreated} />;
}
