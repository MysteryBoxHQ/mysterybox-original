import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: async () => {
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });
      
      if (res.status === 401) {
        return null; // Return null for 401 instead of throwing
      }
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    },
  });

  // Check if user is logged out based on username or if we got null from 401
  const isLoggedOut = user?.username === "LOGGED_OUT" || user?.username === "GUEST_USER";
  const isAuthenticated = !!user && !isLoggedOut;

  return {
    user: isAuthenticated ? user : null,
    isLoading,
    isAuthenticated: isAuthenticated && !error,
  };
}