import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as api from "@/lib/api";

export type UserRole = "researcher" | "admin";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  institution: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  institution: string;
  researchPurpose: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

function toUser(u: api.LoginResponse["user"]): User {
  return {
    id: String(u.id),
    fullName: u.fullName,
    email: u.email,
    role: u.role as UserRole,
    institution: u.institution ?? "",
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("iot_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = api.getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    api.setAuthToken(token);
    api
      .authMe()
      .then((u) => {
        setUser(toUser(u));
      })
      .catch(() => {
        api.setAuthToken(null);
        localStorage.removeItem("iot_token");
        localStorage.removeItem("iot_user");
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.authLogin(email, password);
      api.setAuthToken(res.token);
      localStorage.setItem("iot_token", res.token);
      const u = toUser(res.user);
      setUser(u);
      localStorage.setItem("iot_user", JSON.stringify(u));
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Invalid email or password";
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      await api.authRegister(data);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Registration failed";
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    api.setAuthToken(null);
    localStorage.removeItem("iot_token");
    localStorage.removeItem("iot_user");
    setUser(null);
    api.authLogout().catch(() => {});
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
