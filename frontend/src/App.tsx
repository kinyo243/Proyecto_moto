import { useState } from 'react';
import Layout from './components/layout/Layout';
import type { ViewName } from './components/layout/Sidebar';
import DashboardPage from './pages/DashboardPage';
import OrdenesPage from './pages/OrdenesPage';
import RecepcionPage from './pages/RecepcionPage';
import CamarasPage from './pages/CamarasPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/ui/LoadingSpinner';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeView, setActiveView] = useState<ViewName>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <LoadingSpinner size={36} label="Cargando TallerMoto Pro…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleOrdenCreated = (_ordenId: number) => {
    setActiveView('dashboard');
  };

  const PAGE_MAP: Record<ViewName, React.ReactNode> = {
    dashboard: <DashboardPage />,
    ordenes: <OrdenesPage />,
    recepcion: <RecepcionPage onOrdenCreated={handleOrdenCreated} />,
    camaras: <CamarasPage />,
    configuracion: <ConfiguracionPage />,
  };

  return (
    <Layout activeView={activeView} onNavigate={setActiveView}>
      {PAGE_MAP[activeView]}
    </Layout>
  );
}
