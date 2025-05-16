import { ReactNode, createContext, useContext } from "react";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Schema for login form
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Schema for registration form
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Types for the auth context
interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  username: string | null;
}

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  loginMutation: ReturnType<typeof useLoginMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
};

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook for login mutation
function useLoginMutation(queryClient: QueryClient) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      return response.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Custom hook for registration mutation
function useRegisterMutation(queryClient: QueryClient) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      
      return response.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Custom hook for logout mutation
function useLogoutMutation(queryClient: QueryClient) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// AuthProvider component
export function AuthProvider({ children, queryClient }: { children: ReactNode, queryClient: QueryClient }) {
  const { toast } = useToast();
  
  // Query to get the current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error("Failed to fetch user");
        }
        return response.json();
      } catch (err) {
        console.error("Error fetching user:", err);
        return null;
      }
    },
    retry: false,
  });
  
  const loginMutation = useLoginMutation(queryClient);
  const registerMutation = useRegisterMutation(queryClient);
  const logoutMutation = useLogoutMutation(queryClient);
  
  const contextValue: AuthContextType = {
    user: user || null,
    isLoading,
    error: error as Error | null,
    isAuthenticated: !!user,
    loginMutation,
    registerMutation,
    logoutMutation,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}