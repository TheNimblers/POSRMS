import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type UserRole =
  | "waiter"
  | "manager"
  | "admin"
  | "kitchen"
  | "bar"
  | "team";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  restaurantId?: string;
  permissions: string[];
  name?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: (overrideToken?: string) => Promise<User | null>;
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

const STORAGE_KEY = "posrms_session";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapUser = (raw: any): User => ({
  id: raw?.id ?? raw?._id ?? "",
  username: raw?.username ?? "",
  role: raw?.role ?? "waiter",
  restaurantId: raw?.restaurant_id ?? raw?.restaurantId ?? undefined,
  permissions: Array.isArray(raw?.permissions) ? raw.permissions : [],
  name: raw?.name,
  status: raw?.status,
});

interface StoredSession {
  token: string;
  user: User;
}

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.token !== "string" || !parsed.token) {
      return null;
    }
    return {
      token: parsed.token,
      user: mapUser(parsed.user),
    };
  } catch (error) {
    console.error("Failed to read stored session", error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function persistSession(token: string, user: User) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ token, user }),
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const authFetch = useCallback(
    async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const authToken = token;
      const headers = new Headers(init.headers ?? {});
      if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`);
      }
      const response = await fetch(input, { ...init, headers });
      if (response.status === 401) {
        clearSession();
        throw new Error("Unauthorized");
      }
      return response;
    },
    [clearSession, token],
  );

  const refreshProfile = useCallback(
    async (overrideToken?: string) => {
      const authToken = overrideToken ?? token;
      if (!authToken) {
        setIsLoading(false);
        return null;
      }

      try {
        const response = await fetch("/api/auth/profile", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!response.ok) {
          throw new Error(`Profile request failed: ${response.status}`);
        }

        const payload = await response.json();
        if (!payload?.success || !payload?.data) {
          throw new Error(payload?.error || "Invalid profile response");
        }

        const mappedUser = mapUser(payload.data);
        setUser(mappedUser);
        setToken(authToken);
        persistSession(authToken, mappedUser);
        return mappedUser;
      } catch (error) {
        console.error("Failed to refresh profile", error);
        clearSession();
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [clearSession, token],
  );

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          return false;
        }

        const payload = await response.json();
        if (!payload?.success || !payload?.data?.token || !payload?.data?.user) {
          return false;
        }

        const mappedUser = mapUser(payload.data.user);
        const authToken = payload.data.token as string;

        setUser(mappedUser);
        setToken(authToken);
        persistSession(authToken, mappedUser);

        return true;
      } catch (error) {
        console.error("Login failed", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    const authToken = token;
    try {
      if (authToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
    } catch (error) {
      console.warn("Logout request failed", error);
    } finally {
      clearSession();
    }
  }, [clearSession, token]);

  useEffect(() => {
    const stored = readStoredSession();
    if (stored?.token) {
      setToken(stored.token);
      setUser(stored.user);
      refreshProfile(stored.token).catch((error) => {
        console.error("Initial profile refresh failed", error);
      });
    } else {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  const value = useMemo<AuthContextType>(
    () => ({ user, token, isLoading, login, logout, refreshProfile, authFetch }),
    [authFetch, isLoading, login, logout, refreshProfile, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  return (
    user.permissions.includes("full_access") ||
    user.permissions.includes(permission)
  );
}
