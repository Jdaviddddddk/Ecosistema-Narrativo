import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { getUserProfile, saveUserProfile } from "@/lib/storage";

export interface GoogleUser {
  sub: string;
  name: string;
  email: string;
  picture: string;
  given_name: string;
  family_name: string;
}

export interface User {
  id: string;           // Google sub
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  joinedAt: string;
  role: "creator" | "viewer";
  googleData: GoogleUser;
  interests: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (googleCredential: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<Omit<User, 'id' | 'email' | 'googleData'>>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "nexo_auth_user";

function createUserFromGoogle(googleUser: GoogleUser): User {
  // Cargar perfil guardado si existe
  const savedProfile = getUserProfile(googleUser.sub);

  return {
    id: googleUser.sub,
    name: googleUser.name,
    email: googleUser.email,
    avatar: googleUser.picture,
    bio: savedProfile?.bio || "Creador visual apasionado por la narrativa inmersiva y la fotografía experimental.",
    location: savedProfile?.location || "Bogotá, CO",
    joinedAt: new Date().toISOString().split("T")[0],
    role: "creator",
    googleData: googleUser,
    interests: savedProfile?.interests || ["Diseño Visual", "Fotografía", "Branding", "UI/UX"],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Restaurar desde localStorage
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback((googleCredential: string) => {
    try {
      const googleUser = jwtDecode<GoogleUser>(googleCredential);
      
      if (!googleUser.email.endsWith("@universidadmayor.edu.co")) {
        throw new Error("Solo se permiten correos @universidadmayor.edu.co");
      }

      const newUser = createUserFromGoogle(googleUser);
      setUser(newUser);
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    if (window.google?.accounts?.oauth2 && user?.googleData.sub) {
      window.google.accounts.oauth2.revoke(user.googleData.sub, () => {
        console.log("Token de Google revocado");
      });
    }
  }, [user]);

  const updateProfile = useCallback((updates: Partial<Omit<User, 'id' | 'email' | 'googleData'>>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      // Guardar en storage también
      saveUserProfile(prev.id, {
        bio: updated.bio,
        location: updated.location,
        interests: updated.interests,
      });
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout,
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}