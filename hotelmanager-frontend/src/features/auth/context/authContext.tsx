// src/auth/authContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";

export interface User {
  email: string;
  role: "MANAGER" | "EMPLOYE" | "CLIENT" | string;
  userId: number;
  hotelId: number;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
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

function decodeToUser(token: string): User {
  const decoded = jwtDecode<TokenClaims>(token);

  if (!decoded?.sub || !decoded?.role || !decoded?.userId || !decoded?.hotelId) {
    throw new Error("Token claims manquants");
  }

  return {
    email: decoded.sub,
    role: decoded.role,
    userId: Number(decoded.userId),
    hotelId: Number(decoded.hotelId),
  };
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Chargement initial depuis localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setUser(decodeToUser(token));
    } catch (err) {
      console.error("Token invalide :", err);
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    try {
      setUser(decodeToUser(token));
    } catch (err) {
      console.error("Token invalide :", err);
      localStorage.removeItem("token");
      setUser(null);
      window.location.replace("/login");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
