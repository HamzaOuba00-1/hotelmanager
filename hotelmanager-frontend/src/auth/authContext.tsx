import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {jwtDecode} from "jwt-decode";

interface User {
  email: string;
  role: string;
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface Props {
  children: ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // ➕ Charger le user depuis localStorage au démarrage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          email: decoded.sub,
          role: decoded.role,
          userId: decoded.userId,
          hotelId: decoded.hotelId,
        });
      } catch (err) {
        console.error("Token invalide");
        setUser(null);
      }
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    const decoded: any = jwtDecode(token);
    setUser({
      email: decoded.sub,
      role: decoded.role,
      userId: decoded.userId,
      hotelId: decoded.hotelId,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
      <AuthContext.Provider value={{ user, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
};
