import React, { createContext, useContext, useState, useEffect } from "react";
import { AdminUser } from "@workspace/api-client-react/src/generated/api.schemas";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (user: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const { data: serverUser, isLoading: serverLoading, isError } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
    }
  });

  useEffect(() => {
    if (serverLoading) return;
    if (serverUser && !isError) {
      setUser(serverUser);
      localStorage.setItem("user", JSON.stringify(serverUser));
    } else {
      const localUser = localStorage.getItem("user");
      if (localUser) {
        setUser(JSON.parse(localUser));
      } else {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, [serverUser, serverLoading, isError]);

  const login = (newUser: AdminUser) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    queryClient.setQueryData(getGetMeQueryKey(), newUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    queryClient.setQueryData(getGetMeQueryKey(), null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
