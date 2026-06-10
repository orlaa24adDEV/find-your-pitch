import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { setAccessToken, setOnUnauthorized } from "../services/api";
import { refreshSession, logoutSession } from "../services/auth.service";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  age?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
      setAccessToken(null);
    });
  }, []);

  useEffect(() => {
    const restore = async () => {
      try {
        const data = await refreshSession();
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch {
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = (user: User, accessToken: string) => {
    setAccessToken(accessToken);
    setUser(user);
  };

  const logout = async () => {
    try {
      await logoutSession();
    } catch {
      // Even if the request fails, clear local state
    }
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
