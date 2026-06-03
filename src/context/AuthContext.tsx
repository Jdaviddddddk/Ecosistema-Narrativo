import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { getUserProfile, saveUserProfile } from "@/lib/storage";
import type { ContactInfo } from "@/lib/storage";
import { usersAPI } from "@/lib/api";

export interface GoogleUser {
  sub: string;
  name: string;
  email: string;
  picture: string;
  given_name: string;
  family_name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  joinedAt: string;
  role: "creator" | "viewer";
  googleData: GoogleUser;
  interests: string[];
  isCommunityMember: boolean;
  contact?: ContactInfo;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isCommunityMember: boolean;
  isAdmin: boolean;
  login: (googleCredential: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<Omit<User, 'id' | 'email' | 'googleData'>>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = "nexo_auth_user";
const UNIVERSITY_DOMAIN = "@universidadmayor.edu.co";
const ADMIN_EMAILS = ["jdarenas@universidadmayor.edu.co"];

function isCommunity(email: string) {
  return email.endsWith(UNIVERSITY_DOMAIN);
}

function createUserFromGoogle(googleUser: GoogleUser): User {
  const savedProfile = getUserProfile(googleUser.sub);
  return {
    id: googleUser.sub,
    name: googleUser.name,
    email: googleUser.email,
    avatar: googleUser.picture,
    bio: savedProfile?.bio || "Creador visual apasionado por la narrativa inmersiva.",
    location: savedProfile?.location || "Colombia",
    joinedAt: new Date().toISOString().split("T")[0],
    role: "creator",
    googleData: googleUser,
    interests: savedProfile?.interests || ["Diseño Visual", "Fotografía"],
    isCommunityMember: isCommunity(googleUser.email),
    isAdmin: ADMIN_EMAILS.includes(googleUser.email),
    contact: savedProfile?.contact || {},
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); }
      catch { return null; }
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
      const newUser = createUserFromGoogle(googleUser);
      setUser(newUser);
      // Guardar perfil público en backend
      usersAPI.save({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        bio: newUser.bio,
        location: newUser.location,
        interests: newUser.interests,
        isCommunityMember: newUser.isCommunityMember,
        joinedAt: newUser.joinedAt,
        contact: newUser.contact || {},
      }).catch(console.error);
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateProfile = useCallback((updates: Partial<Omit<User, 'id' | 'email' | 'googleData'>>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      saveUserProfile(prev.id, {
        bio: updated.bio,
        location: updated.location,
        interests: updated.interests,
        contact: updated.contact,
      });
      // Sincronizar con backend
      usersAPI.save({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        avatar: updated.avatar,
        bio: updated.bio,
        location: updated.location,
        interests: updated.interests,
        isCommunityMember: updated.isCommunityMember,
        joinedAt: updated.joinedAt,
        contact: updated.contact || {},
      }).catch(console.error);
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isCommunityMember: !!user?.isCommunityMember,
      isAdmin: !!(user && ADMIN_EMAILS.includes(user.email)),
      login,
      logout,
      updateProfile,
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
