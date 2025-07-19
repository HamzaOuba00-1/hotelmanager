import React, { createContext, useContext } from "react";

interface AuthContextType {
  user: any;
  login: (userData: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
	throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
