import "dotenv/config";
import bcrypt from "bcryptjs";
import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

const SALT_ROUNDS = 10;

interface RestaurantSeed {
  id: string;
  slug: string;
  name: string;
  subscription_status: string;
  subscription_plan: string;
  admins: string[];
  contact_email: string;
  timezone: string;
  currency: string;
  tax_rate: number;
  service_charge: number;
}

interface StaffSeed {
  id: string;
  username: string;
  password: string;
  role: "waiter" | "kitchen" | "bar" | "manager" | "admin" | "team";
  restaurant_id?: string;
  name: string;
  email?: string;
  permissions: string[];
  status?: "active" | "inactive";
}

interface TableSeed {
  number: string;
  capacity: number;
  qr_code: string;
}

interface MenuSeed {
  name: string;
  category: string;
  price: number;
  description?: string;
}

async function seedData() {
  console.log("🌱 Starting Supabase demo data seed...");

  try {
    // Check connection
    const { error: testError } = await supabase.from("restaurants").select("id").limit(1);
    if (testError) {
      throw new Error(`Supabase connection failed: ${testError.message}`);
    }
    console.log("✅ Supabase connection successful");

    // Seed restaurants
    const demoRestaurantId = uuidv4();
    const bajwaRestaurantId = uuidv4();

    const restaurants: RestaurantSeed[] = [
      {
        id: demoRestaurantId,
        slug: "demo-restaurant",
        name: "Demo Restaurant",
        subscription_status: "active",
        subscription_plan: "monthly",
        admins: ["admin1"],
        contact_email: "admin@demo-restaurant.com",
        timezone: "Europe/Amsterdam",
        currency: "EUR",
        tax_rate: 8.5,
        service_charge: 15,
      },
      {
        id: bajwaRestaurantId,
        slug: "bajwa-dhaba",
        name: "Bajwa Dhaba",
        subscription_status: "active",
        subscription_plan: "annual",
        admins: ["BajwaManager"],
        contact_email: "info@bajwadhaba.com",
        timezone: "Asia/Karachi",
        currency: "PKR",
        tax_rate: 5,
        service_charge: 10,
      },
    ];

    // Insert restaurants
    const { error: restaurantError } = await supabase
      .from("restaurants")
      .upsert(restaurants, { onConflict: "slug" });

    if (restaurantError) {
      console.error("❌ Error inserting restaurants:", restaurantError);
      throw restaurantError;
    }
    console.log("✅ Restaurants seeded");

    // Seed staff accounts
    const staffAccounts: StaffSeed[] = [
      {
        id: "waiter1-00000000-0000-0000-0000-000000000001",
        username: "waiter1",
        password: "password",
        role: "waiter",
        restaurant_id: demoRestaurantId,
        name: "John Doe",
        email: "waiter1@demo.com",
        permissions: ["view_tables", "manage_orders", "update_order_status"],
      },
      {
        id: "kitchen1-0000000-0000-0000-0000-000000000001",
        username: "kitchen1",
        password: "password",
        role: "kitchen",
        restaurant_id: demoRestaurantId,
        name: "Kitchen Team",
        email: "kitchen1@demo.com",
        permissions: ["view_food_orders", "update_food_status"],
      },
      {
        id: "bar1-0000000-0000-0000-0000-000000000001",
        username: "bar1",
        password: "password",
        role: "bar",
        restaurant_id: demoRestaurantId,
        name: "Bar Team",
        email: "bar1@demo.com",
        permissions: ["view_drink_orders", "update_drink_status"],
      },
      {
        id: "manager1-0000000-0000-0000-0000-000000000001",
        username: "manager1",
        password: "password",
        role: "manager",
        restaurant_id: demoRestaurantId,
        name: "Alice Johnson",
        email: "manager1@demo.com",
        permissions: [
          "view_tables",
          "manage_orders",
          "manage_menu",
          "manage_staff",
          "view_analytics",
        ],
      },
      {
        id: "admin1-0000000-0000-0000-0000-000000000001",
        username: "admin1",
        password: "password",
        role: "admin",
        restaurant_id: demoRestaurantId,
        name: "Bob Wilson",
        email: "admin1@demo.com",
        permissions: ["full_access"],
      },
      {
        id: "team1-0000000-0000-0000-0000-000000000001",
        username: "team1",
        password: "password",
        role: "team",
        name: "POSRMS Team Member",
        email: "team1@posrms.com",
        permissions: [
          "manage_restaurants",
          "manage_subscriptions",
          "view_global_analytics",
        ],
      },
      {
        id: "bajwa-waiter-1001-0000000-0000-000000000",
        username: "BW1001",
        password: "BW1001",
        role: "waiter",
        restaurant_id: bajwaRestaurantId,
        name: "Bajwa Dhaba Waiter",
        permissions: ["view_tables", "manage_orders", "update_order_status"],
      },
      {
        id: "bajwa-kitchen-000-0000000-0000-000000000",
        username: "BajwaKitchen",
        password: "BK-2025",
        role: "kitchen",
        restaurant_id: bajwaRestaurantId,
        name: "Bajwa Dhaba Kitchen",
        permissions: ["view_food_orders", "update_food_status"],
      },
      {
        id: "bajwa-manager-000-0000000-0000-000000000",
        username: "BajwaManager",
        password: "BM-2025",
        role: "manager",
        restaurant_id: bajwaRestaurantId,
        name: "Bajwa Dhaba Manager",
        permissions: [
          "view_tables",
          "manage_orders",
          "manage_menu",
          "manage_staff",
          "view_analytics",
        ],
      },
    ];

    // Hash passwords and insert staff
    const staffWithHashes = staffAccounts.map((staff) => ({
      ...staff,
      password_hash: bcrypt.hashSync(staff.password, SALT_ROUNDS),
      password: undefined,
    }));

    const { error: staffError } = await supabase
      .from("staff")
      .upsert(
        staffWithHashes.map(({ password, ...rest }) => rest),
        { onConflict: "username" }
      );

    if (staffError) {
      console.error("❌ Error inserting staff:", staffError);
      throw staffError;
    }
    console.log("✅ Staff accounts seeded");

    // Seed tables
    const tables: TableSeed[] = [
      { number: "T1", capacity: 4, qr_code: "QR-T1" },
      { number: "T2", capacity: 2, qr_code: "QR-T2" },
      { number: "T3", capacity: 6, qr_code: "QR-T3" },
      { number: "T4", capacity: 4, qr_code: "QR-T4" },
    ];

    const tablesWithIds = tables.map((table) => ({
      id: uuidv4(),
      restaurant_id: demoRestaurantId,
      ...table,
    }));

    const { error: tablesError } = await supabase
      .from("tables")
      .upsert(tablesWithIds, { onConflict: "qr_code" });

    if (tablesError) {
      console.error("❌ Error inserting tables:", tablesError);
      throw tablesError;
    }
    console.log("✅ Tables seeded");

    // Seed menu items
    const menuItems: MenuSeed[] = [
      {
        name: "Grilled Salmon",
        category: "main",
        price: 26.5,
        description: "Fresh Atlantic salmon with seasonal vegetables",
      },
      {
        name: "Caesar Salad",
        category: "starter",
        price: 14.5,
        description: "Crisp romaine, parmesan, and house dressing",
      },
      {
        name: "House Lemonade",
        category: "drink",
        price: 5.5,
        description: "Fresh lemon juice with mint",
      },
    ];

    const menuWithIds = menuItems.map((item) => ({
      id: uuidv4(),
      restaurant_id: demoRestaurantId,
      currency: "EUR",
      available: true,
      special: item.category === "main",
      preparation_time: item.category === "main" ? 25 : item.category === "starter" ? 10 : 3,
      ...item,
    }));

    const { error: menuError } = await supabase
      .from("menu_items")
      .upsert(menuWithIds, { onConflict: "restaurant_id,name,category" });

    if (menuError) {
      console.error("❌ Error inserting menu items:", menuError);
      throw menuError;
    }
    console.log("✅ Menu items seeded");

    console.log("\n✅ All demo data seeded successfully!");
    console.log("\n🚀 Demo Accounts Ready:");
    console.log("  waiter1 / password");
    console.log("  kitchen1 / password");
    console.log("  bar1 / password");
    console.log("  manager1 / password");
    console.log("  admin1 / password");
    console.log("  team1 / password");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedData();
