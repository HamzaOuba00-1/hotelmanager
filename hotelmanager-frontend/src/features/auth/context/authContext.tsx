import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";

/* ================== TYPES ================== */

export interface User {
  email: string;
  role: "MANAGER" | "EMPLOYE" | "CLIENT" | string;
  userId: number;
  hotelId: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

interface Props {
  children: ReactNode;
}

type TokenClaims = JwtPayload & {
  sub?: string;
  role?: string;
  userId?: number;
  hotelId?: number;
};

/* ================== HELPERS ================== */

function decodeToUser(token: string): User {
  const decoded = jwtDecode<TokenClaims>(token);

  if (
    !decoded.sub ||
    !decoded.role ||
    !decoded.userId ||
    !decoded.hotelId
  ) {
    throw new Error("Missing token claims");
  }

  return {
    email: decoded.sub,
    role: decoded.role,
    userId: Number(decoded.userId),
    hotelId: Number(decoded.hotelId),
  };
}

/* ================== PROVIDER ================== */

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 🔑 RESTORE AUTH ON REFRESH
   */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const restoredUser = decodeToUser(token);
      setUser(restoredUser);
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🔐 LOGIN
   */
  const login = (token: string) => {
    localStorage.setItem("token", token);
    try {
      const loggedUser = decodeToUser(token);
      setUser(loggedUser);
    } catch (err) {
      console.error("Invalid token on login:", err);
      localStorage.removeItem("token");
      setUser(null);
      window.location.replace("/login");
    }
  };

  /**
   * 🚪 LOGOUT
   */
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
