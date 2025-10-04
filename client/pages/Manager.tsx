import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Users,
  QrCode,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Download,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  ChefHat,
  Coffee,
  Star,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useAuth, hasPermission } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useWebSocketEvent } from "@/contexts/WebSocketContext";

type MenuItemRecord = {
  id: string;
  restaurantId?: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  currency?: string | null;
  available: boolean;
  special: boolean;
  preparationTime: number | null;
  tags: string[];
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
  lastUpdatedBy?: string | null;
};

type MenuFormState = {
  name: string;
  description: string;
  category: string;
  price: string;
  currency: string;
  available: boolean;
  special: boolean;
  preparationTime: string;
  tags: string;
  imageUrl: string;
};

const mockTables = [
  { id: 1, number: "T1", capacity: 4, status: "active", qrCode: "QR-T1" },
  { id: 2, number: "T2", capacity: 2, status: "available", qrCode: "QR-T2" },
  { id: 3, number: "T3", capacity: 6, status: "maintenance", qrCode: "QR-T3" },
  { id: 4, number: "T4", capacity: 4, status: "active", qrCode: "QR-T4" },
  { id: 5, number: "T5", capacity: 8, status: "available", qrCode: "QR-T5" },
];

const mockStaff = [
  {
    id: 1,
    username: "waiter1",
    role: "waiter",
    name: "John Doe",
    status: "active",
    shift: "Evening",
  },
  {
    id: 2,
    username: "waiter2",
    role: "waiter",
    name: "Jane Smith",
    status: "active",
    shift: "Day",
  },
  {
    id: 3,
    username: "kitchen1",
    role: "kitchen",
    name: "Mike Johnson",
    status: "active",
    shift: "Evening",
  },
  {
    id: 4,
    username: "bar1",
    role: "bar",
    name: "Sarah Wilson",
    status: "off-duty",
    shift: "Day",
  },
];

const mockOrderHistory = [
  {
    id: 1,
    orderNumber: "ORD-001",
    table: "T1",
    items: ["Grilled Salmon", "House Wine"],
    total: 33,
    waiter: "waiter1",
    timestamp: "2024-01-15T20:15:00Z",
    status: "completed",
  },
  {
    id: 2,
    orderNumber: "ORD-002",
    table: "T2",
    items: ["Beef Tenderloin", "Caesar Salad"],
    total: 46.5,
    waiter: "waiter2",
    timestamp: "2024-01-15T19:30:00Z",
    status: "completed",
  },
];

const mockAnalytics = {
  todayRevenue: 1250.5,
  weekRevenue: 8750.25,
  monthRevenue: 35240.75,
  todayOrders: 45,
  weekOrders: 312,
  monthOrders: 1456,
  avgOrderValue: 27.8,
  tableUtilization: 78,
  bestSellingItems: [
    { name: "Grilled Salmon", quantity: 23, revenue: 563.5 },
    { name: "Beef Tenderloin", quantity: 18, revenue: 576 },
    { name: "Caesar Salad", quantity: 31, revenue: 449.5 },
  ],
};

const emptyMenuForm = (currency: string): MenuFormState => ({
  name: "",
  description: "",
  category: "",
  price: "",
  currency,
  available: true,
  special: false,
  preparationTime: "",
  tags: "",
  imageUrl: "",
});

export default function Manager() {
  const { user, logout, authFetch } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [tables] = useState(mockTables);
  const [staff] = useState(mockStaff);
  const [menuItems, setMenuItems] = useState<MenuItemRecord[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [hideUnavailable, setHideUnavailable] = useState(false);
  const [onlySpecial, setOnlySpecial] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [formState, setFormState] = useState<MenuFormState>(() =>
    emptyMenuForm("INR"),
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyItems, setBusyItems] = useState<Record<string, boolean>>({});
  const [defaultCurrency, setDefaultCurrency] = useState("INR");

  const canManageMenu = useMemo(
    () =>
      !!user && (user.role === "manager" || hasPermission(user, "manage_menu")),
    [user],
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!canManageMenu) {
      navigate("/login");
    }
  }, [user, canManageMenu, navigate]);

  const setItemBusy = useCallback((id: string, busy: boolean) => {
    setBusyItems((prev) => {
      if (busy) {
        if (prev[id]) return prev;
        return { ...prev, [id]: true };
      }
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const isItemBusy = useCallback(
    (id: string) => Boolean(busyItems[id]),
    [busyItems],
  );

  const parseTags = useCallback((value: string) => {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }, []);

  const formatCurrency = useCallback(
    (amount: number, currency?: string | null) => {
      const code = (currency || defaultCurrency || "USD").toUpperCase();
      try {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: code,
        }).format(amount);
      } catch {
        return `${code} ${amount.toFixed(2)}`;
      }
    },
    [defaultCurrency],
  );

  const loadMenu = useCallback(async () => {
    if (!canManageMenu) return;
    setMenuLoading(true);
    setMenuError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", "500");
      const response = await authFetch(`/api/menu?${params.toString()}`);
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || `Request failed (${response.status})`);
      }
      const items: MenuItemRecord[] = Array.isArray(json.data) ? json.data : [];
      setMenuItems(items);
      const itemCurrency =
        items.find((item) => item.currency)?.currency || defaultCurrency;
      if (itemCurrency && itemCurrency !== defaultCurrency) {
        setDefaultCurrency(itemCurrency);
      }
    } catch (error: any) {
      console.error("Failed to load menu:", error);
      setMenuError(error?.message || "Unable to load menu");
    } finally {
      setMenuLoading(false);
    }
  }, [authFetch, canManageMenu, defaultCurrency]);

  const loadCategories = useCallback(async () => {
    if (!canManageMenu) return;
    try {
      const response = await authFetch("/api/menu/categories");
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || `Request failed (${response.status})`);
      }
      const names = Array.isArray(json.data)
        ? json.data
            .map((entry: any) => entry?.category)
            .filter((value: string) => typeof value === "string" && value.trim())
        : [];
      setCategories([...new Set(names.map((name) => name.trim()))].sort());
    } catch (error) {
      console.warn("Failed to load menu categories:", error);
    }
  }, [authFetch, canManageMenu]);

  useEffect(() => {
    if (!canManageMenu) return;
    loadMenu();
    loadCategories();
  }, [canManageMenu, loadMenu, loadCategories]);

  const handleMenuEvent = useCallback(() => {
    if (!canManageMenu) return;
    loadMenu();
    loadCategories();
  }, [canManageMenu, loadMenu, loadCategories]);

  useWebSocketEvent("menu_updated", handleMenuEvent);

  const filteredMenuItems = useMemo(() => {
    const search = menuSearch.trim().toLowerCase();
    return menuItems.filter((item) => {
      if (search) {
        const haystack = `${item.name} ${item.category} ${item.description ?? ""} ${item.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(search)) {
          return false;
        }
      }
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      if (onlySpecial && !item.special) {
        return false;
      }
      if (hideUnavailable && !item.available) {
        return false;
      }
      return true;
    });
  }, [menuItems, menuSearch, selectedCategory, onlySpecial, hideUnavailable]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      setDialogOpen(open);
      if (!open) {
        setEditingItemId(null);
        setFormState(emptyMenuForm(defaultCurrency));
        setSubmitting(false);
      }
    },
    [defaultCurrency],
  );

  const openCreateDialog = useCallback(() => {
    setDialogMode("create");
    setEditingItemId(null);
    setFormState(emptyMenuForm(defaultCurrency));
    setDialogOpen(true);
  }, [defaultCurrency]);

  const openEditDialog = useCallback(
    (item: MenuItemRecord) => {
      setDialogMode("edit");
      setEditingItemId(item.id);
      setFormState({
        name: item.name,
        description: item.description ?? "",
        category: item.category,
        price: item.price.toString(),
        currency: (item.currency || defaultCurrency || "USD").toUpperCase(),
        available: item.available,
        special: item.special,
        preparationTime: item.preparationTime ? String(item.preparationTime) : "",
        tags: item.tags.join(", "),
        imageUrl: item.imageUrl ?? "",
      });
      setDialogOpen(true);
    },
    [defaultCurrency],
  );

  const submitMenuForm = useCallback(async () => {
    if (!formState.name.trim() || !formState.category.trim()) {
      toast({ title: "Missing information", description: "Name and category are required" });
      return;
    }
    const priceValue = Number(formState.price);
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      toast({ title: "Invalid price", description: "Price must be greater than zero" });
      return;
    }
    const payload: Record<string, unknown> = {
      name: formState.name.trim(),
      category: formState.category.trim(),
      price: priceValue,
      available: formState.available,
      special: formState.special,
    };

    const trimmedDescription = formState.description.trim();
    if (trimmedDescription) payload.description = trimmedDescription;

    const trimmedCurrency = formState.currency.trim().toUpperCase();
    if (trimmedCurrency) payload.currency = trimmedCurrency;

    const prepTimeValue = Number(formState.preparationTime);
    if (formState.preparationTime && Number.isFinite(prepTimeValue)) {
      payload.preparationTime = prepTimeValue;
    }

    const parsedTags = parseTags(formState.tags);
    if (parsedTags.length > 0) {
      payload.tags = parsedTags;
    }

    const trimmedImage = formState.imageUrl.trim();
    if (trimmedImage) payload.imageUrl = trimmedImage;

    setSubmitting(true);
    try {
      if (dialogMode === "create") {
        const response = await authFetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error || `Request failed (${response.status})`);
        }
        toast({ title: "Menu item added", description: `${formState.name} is now available` });
      } else if (editingItemId) {
        const response = await authFetch(`/api/menu/${editingItemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error || `Request failed (${response.status})`);
        }
        toast({ title: "Menu item updated", description: `${formState.name} changes saved` });
      }
      handleDialogOpenChange(false);
      loadMenu();
      loadCategories();
    } catch (error: any) {
      console.error("Failed to save menu item:", error);
      toast({
        title: "Unable to save",
        description: error?.message || "Please try again",
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    authFetch,
    dialogMode,
    editingItemId,
    formState,
    handleDialogOpenChange,
    loadCategories,
    loadMenu,
    parseTags,
    toast,
  ]);

  const toggleMenuItemAvailability = useCallback(
    async (item: MenuItemRecord) => {
      if (isItemBusy(item.id)) return;
      setItemBusy(item.id, true);
      try {
        const response = await authFetch(`/api/menu/${item.id}/toggle`, {
          method: "PUT",
        });
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error || `Request failed (${response.status})`);
        }
        const updated: MenuItemRecord = json.data;
        setMenuItems((prev) =>
          prev.map((entry) => (entry.id === updated.id ? updated : entry)),
        );
        toast({
          title: updated.available ? "Item enabled" : "Item disabled",
          description: `${item.name} is ${updated.available ? "now" : "no longer"} available`,
        });
      } catch (error: any) {
        console.error("Failed to toggle availability:", error);
        toast({
          title: "Unable to update availability",
          description: error?.message || "Please try again",
        });
      } finally {
        setItemBusy(item.id, false);
      }
    },
    [authFetch, isItemBusy, setItemBusy, toast],
  );

  const toggleMenuItemSpecial = useCallback(
    async (item: MenuItemRecord) => {
      if (isItemBusy(item.id)) return;
      setItemBusy(item.id, true);
      try {
        const response = await authFetch(`/api/menu/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ special: !item.special }),
        });
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error || `Request failed (${response.status})`);
        }
        const updated: MenuItemRecord = json.data;
        setMenuItems((prev) =>
          prev.map((entry) => (entry.id === updated.id ? updated : entry)),
        );
        toast({
          title: updated.special ? "Marked as special" : "Special removed",
          description: `${item.name} has been ${updated.special ? "featured" : "updated"}`,
        });
      } catch (error: any) {
        console.error("Failed to toggle special status:", error);
        toast({
          title: "Unable to update",
          description: error?.message || "Please try again",
        });
      } finally {
        setItemBusy(item.id, false);
      }
    },
    [authFetch, isItemBusy, setItemBusy, toast],
  );

  const deleteMenuItem = useCallback(
    async (item: MenuItemRecord) => {
      if (isItemBusy(item.id)) return;
      if (!window.confirm(`Remove ${item.name} from the menu?`)) return;
      setItemBusy(item.id, true);
      try {
        const response = await authFetch(`/api/menu/${item.id}`, {
          method: "DELETE",
        });
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error || `Request failed (${response.status})`);
        }
        setMenuItems((prev) => prev.filter((entry) => entry.id !== item.id));
        toast({ title: "Menu item removed", description: `${item.name} has been deleted` });
      } catch (error: any) {
        console.error("Failed to delete menu item:", error);
        toast({
          title: "Unable to delete",
          description: error?.message || "Please try again",
        });
      } finally {
        setItemBusy(item.id, false);
      }
    },
    [authFetch, isItemBusy, setItemBusy, toast],
  );

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user || !canManageMenu) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-2xl font-bold text-gray-900">
                Manager Dashboard
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">Welcome, {user.username}</div>

              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Today&apos;s Revenue
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(mockAnalytics.todayRevenue, defaultCurrency)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Orders Today
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockAnalytics.todayOrders}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Active Staff
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {staff.filter((s) => s.status === "active").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Table Utilization
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockAnalytics.tableUtilization}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button onClick={() => downloadAllQRCodes()} className="h-20 flex-col space-y-2">
                    <QrCode className="h-6 w-6" />
                    <span>Download QR Codes</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Users className="h-6 w-6" />
                    <span>Add Staff</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={openCreateDialog}
                  >
                    <Plus className="h-6 w-6" />
                    <span>Add Menu Item</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Settings className="h-6 w-6" />
                    <span>Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tables" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Table Management</h2>
              <div className="space-x-2">
                <Button onClick={() => downloadAllQRCodes()}>
                  <Download className="h-4 w-4 mr-2" />
                  Download All QR Codes
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Table
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map((table) => (
                <Card key={table.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Table {table.number}</CardTitle>
                      <Badge
                        className={
                          table.status === "active"
                            ? "bg-green-100 text-green-800"
                            : table.status === "available"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {table.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{table.capacity} guests</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">QR Code:</span>
                        <span className="font-medium">{table.qrCode}</span>
                      </div>

                      <div className="flex space-x-2 pt-3">
                        <Button
                          size="sm"
                          onClick={() => generateQRCode(table.id)}
                          className="flex-1"
                        >
                          <QrCode className="h-3 w-3 mr-1" />
                          Generate QR
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="menu" className="mt-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={menuSearch}
                      onChange={(event) => setMenuSearch(event.target.value)}
                      placeholder="Search menu items"
                      className="w-64"
                    />
                    <Button
                      variant="outline"
                      onClick={loadMenu}
                      disabled={menuLoading}
                    >
                      {menuLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Refresh"
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-gray-600">Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <Switch
                      checked={onlySpecial}
                      onCheckedChange={setOnlySpecial}
                    />
                    Show specials only
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <Switch
                      checked={hideUnavailable}
                      onCheckedChange={setHideUnavailable}
                    />
                    Hide unavailable
                  </label>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Menu Item
                  </Button>
                </div>
              </div>

              {menuError && (
                <Alert variant="destructive">
                  <AlertDescription>{menuError}</AlertDescription>
                </Alert>
              )}

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tags
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredMenuItems.length === 0 && !menuLoading && (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                              No menu items found. Adjust filters or add a new item.
                            </td>
                          </tr>
                        )}
                        {menuLoading && (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                            </td>
                          </tr>
                        )}
                        {!menuLoading &&
                          filteredMenuItems.map((item) => (
                            <tr key={item.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.name}
                                  </div>
                                  {item.description && (
                                    <div className="text-xs text-gray-500 line-clamp-2">
                                      {item.description}
                                    </div>
                                  )}
                                  {item.special && (
                                    <Badge className="mt-1 bg-yellow-100 text-yellow-800">
                                      <Star className="h-3 w-3 mr-1" />
                                      Special
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.category}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(item.price, item.currency)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <div className="flex flex-wrap gap-1">
                                  {item.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {item.tags.length === 0 && (
                                    <span className="text-xs text-gray-400">—</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge
                                  className={
                                    item.available
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }
                                >
                                  {item.available ? "Available" : "Unavailable"}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleMenuItemAvailability(item)}
                                  disabled={isItemBusy(item.id)}
                                >
                                  {isItemBusy(item.id) ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : item.available ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleMenuItemSpecial(item)}
                                  disabled={isItemBusy(item.id)}
                                >
                                  {isItemBusy(item.id) ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Star className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditDialog(item)}
                                  disabled={isItemBusy(item.id)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteMenuItem(item)}
                                  disabled={isItemBusy(item.id)}
                                >
                                  {isItemBusy(item.id) ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Staff Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <Badge
                        className={
                          member.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {member.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Username:</span>
                        <span className="font-medium">{member.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Role:</span>
                        <Badge variant="outline">
                          {member.role === "waiter" && (
                            <Users className="h-3 w-3 mr-1" />
                          )}
                          {member.role === "kitchen" && (
                            <ChefHat className="h-3 w-3 mr-1" />
                          )}
                          {member.role === "bar" && (
                            <Coffee className="h-3 w-3 mr-1" />
                          )}
                          {member.role}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shift:</span>
                        <span className="font-medium">{member.shift}</span>
                      </div>

                      <div className="flex space-x-2 pt-3">
                        <Button size="sm" className="flex-1">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Order History (Last 30 Days)</h2>
              <div className="space-x-2">
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Filter by Date
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Table
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Waiter
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockOrderHistory.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.table}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {order.items.join(", ")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(order.total, defaultCurrency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.waiter}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTime(order.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Today:</span>
                      <span className="font-bold">
                        {formatCurrency(mockAnalytics.todayRevenue, defaultCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Week:</span>
                      <span className="font-bold">
                        {formatCurrency(mockAnalytics.weekRevenue, defaultCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Month:</span>
                      <span className="font-bold">
                        {formatCurrency(mockAnalytics.monthRevenue, defaultCurrency)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Today:</span>
                      <span className="font-bold">{mockAnalytics.todayOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Week:</span>
                      <span className="font-bold">{mockAnalytics.weekOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Order Value:</span>
                      <span className="font-bold">
                        {formatCurrency(mockAnalytics.avgOrderValue, defaultCurrency)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Best Selling Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAnalytics.bestSellingItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-600">
                            {item.quantity} sold
                          </div>
                        </div>
                        <div className="text-sm font-bold">
                          {formatCurrency(item.revenue, defaultCurrency)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <MenuItemDialog
        mode={dialogMode}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        formState={formState}
        onFormChange={setFormState}
        onSubmit={submitMenuForm}
        submitting={submitting}
        defaultCurrency={defaultCurrency}
      />
    </div>
  );
}

function generateQRCode(tableId: number) {
  alert(`QR Code generated for Table ${tableId}`);
}

function downloadAllQRCodes() {
  alert("All QR codes downloaded successfully!");
}

function MenuItemDialog({
  mode,
  open,
  onOpenChange,
  formState,
  onFormChange,
  onSubmit,
  submitting,
  defaultCurrency,
}: {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (value: boolean) => void;
  formState: MenuFormState;
  onFormChange: (value: MenuFormState) => void;
  onSubmit: () => void;
  submitting: boolean;
  defaultCurrency: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Menu Item" : "Edit Menu Item"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formState.name}
              onChange={(event) =>
                onFormChange({ ...formState, name: event.target.value })
              }
              placeholder="Item name"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              value={formState.category}
              onChange={(event) =>
                onFormChange({ ...formState, category: event.target.value })
              }
              placeholder="e.g. Main Course, Starter, Drinks"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formState.price}
                onChange={(event) =>
                  onFormChange({ ...formState, price: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input
                value={formState.currency}
                onChange={(event) =>
                  onFormChange({
                    ...formState,
                    currency: event.target.value || defaultCurrency,
                  })
                }
                placeholder={defaultCurrency}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formState.description}
              onChange={(event) =>
                onFormChange({ ...formState, description: event.target.value })
              }
              placeholder="Describe the dish, ingredients, or preparation"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preparation Time (minutes)</Label>
              <Input
                type="number"
                min="1"
                max="480"
                value={formState.preparationTime}
                onChange={(event) =>
                  onFormChange({
                    ...formState,
                    preparationTime: event.target.value,
                  })
                }
                placeholder="e.g. 15"
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={formState.imageUrl}
                onChange={(event) =>
                  onFormChange({ ...formState, imageUrl: event.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input
              value={formState.tags}
              onChange={(event) =>
                onFormChange({ ...formState, tags: event.target.value })
              }
              placeholder="Comma separated tags (e.g. Spicy, Vegan, Bestseller)"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <Switch
                checked={formState.available}
                onCheckedChange={(checked) =>
                  onFormChange({ ...formState, available: checked })
                }
              />
              Available for orders
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <Switch
                checked={formState.special}
                onCheckedChange={(checked) =>
                  onFormChange({ ...formState, special: checked })
                }
              />
              Mark as special
            </label>
          </div>

          <div className="pt-2">
            <Button
              className="w-full"
              disabled={submitting}
              onClick={onSubmit}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
