import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  joinedAt: string;
  role: "creator" | "viewer";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createMockUser = (email: string): User => {
  const nameFromEmail = email.split("@")[0].replace(".", " ");
  const capitalized = nameFromEmail.replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    id: "usr_" + Math.random().toString(36).substr(2, 6),
    name: capitalized,
    email,
    avatar: "/images/avatar_default.jpg",
    bio: "Creador visual apasionado por la narrativa inmersiva y la fotografía experimental.",
    location: "Bogotá, CO",
    joinedAt: new Date().toISOString().split("T")[0],
    role: "creator",
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string) => {
    setUser(createMockUser(email));
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}