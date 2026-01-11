# Supabase Migration Guide

This guide walks you through migrating POSRMS from MongoDB to Supabase.

## ✅ Completed Steps

- ✅ Created Supabase project: `gxqwtdafwtlbfsaaxhpb`
- ✅ Installed `@supabase/supabase-js` client library
- ✅ Set environment variables in Builder.io
- ✅ Created Supabase client files (`server/supabase.ts`, `client/lib/supabase.ts`)
- ✅ Created authentication routes (`server/routes/supabaseAuth.ts`)
- ✅ Created seed script (`server/seed-supabase.ts`)

## ⏳ Remaining Steps

### Step 1: Create Database Schema in Supabase Dashboard

1. Go to your Supabase dashboard: https://app.supabase.com/
2. Select your project: **POSRMS** (gxqwtdafwtlbfsaaxhpb)
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase/schema.sql`
6. Paste it into the SQL Editor
7. Click **Run** (the ▶ button)
8. Wait for the confirmation: "Success. No rows returned"

This will create all necessary tables with indexes and demo data placeholders.

### Step 2: Seed Demo Data

Run the seed script to populate the database with demo accounts, restaurants, tables, and menu items:

```bash
pnpm seed:supabase
```

This will create demo accounts with properly hashed passwords:

- **waiter1** / password
- **kitchen1** / password
- **bar1** / password
- **manager1** / password
- **admin1** / password
- **team1** / password

### Step 3: Update Server to Use Supabase Auth

The server currently uses MongoDB auth. We need to switch to Supabase auth:

**Edit `server/index.ts`:**

1. Remove MongoDB imports and initialization (lines 7-19)
2. Change the auth routes import to use Supabase instead of Mongo

Replace:

```typescript
const mongoOnly = process.env.USE_MONGODB_ONLY === "true";
if (mongoOnly) {
  const mongoAuth = await import("./routes/mongoAuth");
  // ... MongoDB routes
}
```

With:

```typescript
const supabaseAuth = await import("./routes/supabaseAuth");

// Public Routes
app.post("/api/auth/login", supabaseAuth.handleLogin);
app.post("/api/auth/logout", supabaseAuth.handleLogout);

// Protected Routes (add authenticateToken middleware)
app.get(
  "/api/auth/profile",
  supabaseAuth.authenticateToken,
  supabaseAuth.handleProfile,
);
```

### Step 4: Update Other API Routes

Update all routes that query the database to use Supabase instead of MongoDB:

**Example pattern:**

**Old (MongoDB):**

```typescript
const db = getMongoDb();
const user = await db.collection("staff").findOne({ username });
```

**New (Supabase):**

```typescript
const { data: user } = await supabase
  .from("staff")
  .select("*")
  .eq("username", username)
  .single();
```

Routes to update:

- `server/routes/public.ts` - Menu, sessions, orders
- `server/routes/orders.ts` - Order management
- `server/routes/tables.ts` - Table management
- `server/routes/menu.ts` - Menu management

### Step 5: Update Frontend AuthContext

Create a new `client/contexts/SupabaseAuthContext.tsx`:

```typescript
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  username: string;
  role: string;
  name: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.success && data.data?.token && data.data?.user) {
        setToken(data.data.token);
        setUser(data.data.user);
        localStorage.setItem("posrms_token", data.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("posrms_token");
  };

  useEffect(() => {
    // Load token from localStorage on mount
    const savedToken = localStorage.getItem("posrms_token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within SupabaseAuthProvider");
  }
  return context;
}
```

### Step 6: Test the Migration

1. Stop the dev server (if running): `Ctrl+C`
2. Build and start the server:
   ```bash
   pnpm dev
   ```
3. Navigate to http://localhost:5173/login
4. Try logging in with: **waiter1** / **password**
5. Verify you can access the waiter dashboard

## Troubleshooting

### Issue: "DB not ready" error

- Ensure Supabase credentials are set in environment variables
- Check that the schema was created successfully in Supabase dashboard

### Issue: "Invalid credentials"

- Verify demo accounts were seeded: `pnpm seed:supabase`
- Check password hashes were created correctly

### Issue: "Unauthorized" on protected routes

- Ensure JWT token is being sent in Authorization header
- Verify JWT_SECRET matches between client and server

## Database Schema

The following tables have been created:

- **restaurants** - Restaurant data
- **staff** - Staff accounts (users)
- **tables** - Restaurant tables/seats
- **menu_items** - Menu items/dishes
- **sessions** - Customer dining sessions
- **orders** - Food/drink orders

All tables include:

- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- Proper foreign key relationships
- Indexes for performance

## Environment Variables

Ensure these are set in your environment:

```
VITE_SUPABASE_URL=https://gxqwtdafwtlbfsaaxhpb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=posrms-demo-secret-key
JWT_EXPIRES_IN=24h
```

## Next Steps

After completing all steps:

1. Deploy to production (Netlify/Vercel)
2. Set up real restaurant data
3. Configure Supabase Row-Level Security (RLS) for multi-tenant support
4. Set up real-time subscriptions for kitchen/waiter notifications
5. Configure payment processing (Stripe integration)

## Support

For issues or questions:

- Check Supabase documentation: https://supabase.com/docs
- Review Supabase dashboard logs: Settings → Database → Query Logs
- Check browser console for frontend errors
