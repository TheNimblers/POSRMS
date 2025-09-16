import React, { createContext, useContext, useState, useEffect } from "react";

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
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - in real app this would come from API
const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    username: "waiter1",
    password: "password",
    role: "waiter",
    restaurantId: "rest1",
    permissions: ["view_tables", "manage_orders", "update_order_status"],
  },
  {
    id: "2",
    username: "manager1",
    password: "password",
    role: "manager",
    restaurantId: "rest1",
    permissions: [
      "view_tables",
      "manage_orders",
      "manage_menu",
      "manage_staff",
      "view_analytics",
    ],
  },
  {
    id: "3",
    username: "admin1",
    password: "password",
    role: "admin",
    restaurantId: "rest1",
    permissions: ["full_access"],
  },
  {
    id: "4",
    username: "kitchen1",
    password: "password",
    role: "kitchen",
    restaurantId: "rest1",
    permissions: ["view_food_orders", "update_food_status"],
  },
  {
    id: "5",
    username: "bar1",
    password: "password",
    role: "bar",
    restaurantId: "rest1",
    permissions: ["view_drink_orders", "update_drink_status"],
  },
  {
    id: "6",
    username: "team1",
    password: "password",
    role: "team",
    permissions: [
      "manage_restaurants",
      "manage_subscriptions",
      "view_global_analytics",
    ],
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("posrms_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("posrms_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const foundUser = mockUsers.find(
      (u) => u.username === username && u.password === password,
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("posrms_user", JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("posrms_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  return (
    user.permissions.includes("full_access") ||
    user.permissions.includes(permission)
  );
}
