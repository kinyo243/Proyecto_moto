import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { Usuario } from '../types';
import { login as apiLogin, getMe } from '../api/endpoints/auth';

interface AuthContextValue {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('taller_usuario');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('taller_access_token')
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      const storedToken = localStorage.getItem('taller_access_token');
      if (storedToken) {
        try {
          const res = await getMe();
          setUsuario(res.data);
          localStorage.setItem('taller_usuario', JSON.stringify(res.data));
        } catch {
          cerrarSesion();
        }
      }
      setIsLoading(false);
    };

    verificarSesion();
  }, []);

  const iniciarSesion = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    const { access_token, usuario: user } = res.data;
    setToken(access_token);
    setUsuario(user);
    localStorage.setItem('taller_access_token', access_token);
    localStorage.setItem('taller_usuario', JSON.stringify(user));
  };

  const cerrarSesion = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('taller_access_token');
    localStorage.removeItem('taller_usuario');
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        isAuthenticated: !!usuario && !!token,
        isLoading,
        iniciarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

