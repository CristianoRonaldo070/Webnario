import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types/project";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("webnario_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* invalid JSON */ }
    }
    setLoading(false);
  }, []);

  const isAdmin = user?.isAdmin === true;

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await api.post("/auth/login", { email, password });
      localStorage.setItem("webnario_token", data.token);
      localStorage.setItem("webnario_user", JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const data = await api.post("/auth/signup", { name, email, password });
      localStorage.setItem("webnario_token", data.token);
      localStorage.setItem("webnario_user", JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("webnario_token");
    localStorage.removeItem("webnario_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
