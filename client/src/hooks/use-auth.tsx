import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  credits: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hasAttemptedAutoLogin, setHasAttemptedAutoLogin] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query to check current user
  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/me"],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/me");
        return response.json();
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (userData && !userData.error) {
      setUser(userData);
    } else if (!hasAttemptedAutoLogin && !isLoading) {
      // Auto-login as jmkuczynski for testing (only once)
      console.log("No user authenticated, attempting auto-login as jmkuczynski...");
      setHasAttemptedAutoLogin(true);
      loginMutation.mutate({ username: "jmkuczynski", password: "test123" });
    }
  }, [userData, hasAttemptedAutoLogin, isLoading]);

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password?: string }) => {
      const response = await apiRequest("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setUser(data.user);
        queryClient.invalidateQueries({ queryKey: ["/api/me"] });
        // Only show toast for manual logins, not auto-login
        if (data.user.username !== "jmkuczynski") {
          toast({ title: "Welcome back!", description: `Logged in successfully. Credits: ${data.user.credits}` });
        } else {
          console.log("Auto-logged in as jmkuczynski with unlimited credits");
        }
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ username, password, email }: { username: string; password: string; email?: string }) => {
      const response = await apiRequest("/api/register", {
        method: "POST",
        body: JSON.stringify({ username, password, email }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setUser(data.user);
        queryClient.invalidateQueries({ queryKey: ["/api/me"] });
        toast({ title: "Welcome!", description: "Account created successfully. Start with 0 credits - purchase credits to access all features." });
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/logout", {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: () => {
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      toast({ title: "Goodbye!", description: "Logged out successfully" });
    },
  });

  const login = async (username: string, password?: string) => {
    try {
      const result = await loginMutation.mutateAsync({ username, password });
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: "Login failed" };
    }
  };

  const register = async (username: string, password: string, email?: string) => {
    try {
      const result = await registerMutation.mutateAsync({ username, password, email });
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: "Registration failed" };
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if server logout fails
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
    }
  };

  const refreshUser = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      const response = await apiRequest("/api/me");
      const userData = await response.json();
      if (userData && !userData.error) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}