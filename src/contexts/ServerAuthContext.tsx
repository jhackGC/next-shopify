"use client";

import type { Customer } from "@/types/shopify";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  customer: Customer | null;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      setIsAuthenticated(data.authenticated);
      setCustomer(data.customer);
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    // Redirect to server-side login route
    window.location.href = "/api/auth/login";
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout");

      if (response.ok) {
        setIsAuthenticated(false);
        setCustomer(null);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshCustomer = async () => {
    await checkAuthStatus();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        customer,
        isLoading,
        login,
        logout,
        refreshCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
