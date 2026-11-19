import { useState, type ReactNode } from 'react';
import Sidebar, { type ViewName } from './Sidebar';
import Navbar from './Navbar';

interface LayoutProps {
  activeView: ViewName;
  onNavigate: (view: ViewName) => void;
  children: ReactNode;
}

export default function Layout({ activeView, onNavigate, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar
        activeView={activeView}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar activeView={activeView} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div
            key={activeView}
            className="mx-auto w-full max-w-[1600px] animate-fade-in p-4 md:p-6 lg:p-8"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
