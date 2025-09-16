import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  Bell, 
  CreditCard, 
  Star,
  Clock,
  ChefHat,
  Coffee,
  Utensils,
  DollarSign,
  Euro
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

// Mock menu data - in real app this would come from API
const mockMenu = {
  food: [
    {
      id: 1,
      name: "Grilled Salmon",
      description: "Fresh Atlantic salmon with herbs and lemon",
      price: { eur: 24.50, usd: 26.50 },
      category: "main",
      available: true,
      special: false,
      image: "/api/placeholder/300/200"
    },
    {
      id: 2,
      name: "Beef Tenderloin",
      description: "Premium beef with seasonal vegetables",
      price: { eur: 32.00, usd: 35.00 },
      category: "main",
      available: true,
      special: true,
      image: "/api/placeholder/300/200"
    },
    {
      id: 3,
      name: "Truffle Pasta",
      description: "Handmade pasta with black truffle and parmesan",
      price: { eur: 28.00, usd: 30.50 },
      category: "main",
      available: true,
      special: true,
      image: "/api/placeholder/300/200"
    },
    {
      id: 4,
      name: "Caesar Salad",
      description: "Classic Caesar with crispy croutons and parmesan",
      price: { eur: 14.50, usd: 16.00 },
      category: "starter",
      available: true,
      special: false,
      image: "/api/placeholder/300/200"
    }
  ],
  drinks: [
    {
      id: 5,
      name: "House Wine Red",
      description: "Smooth red wine from local vineyard",
      price: { eur: 8.50, usd: 9.50 },
      category: "wine",
      available: true,
      special: false,
      image: "/api/placeholder/300/200"
    },
    {
      id: 6,
      name: "Craft Beer IPA",
      description: "Local brewery hoppy IPA",
      price: { eur: 6.50, usd: 7.00 },
      category: "beer",
      available: true,
      special: false,
      image: "/api/placeholder/300/200"
    },
    {
      id: 7,
      name: "Signature Cocktail",
      description: "Chef's special cocktail with premium spirits",
      price: { eur: 12.00, usd: 13.50 },
      category: "cocktail",
      available: true,
      special: true,
      image: "/api/placeholder/300/200"
    }
  ],
  specials: [
    {
      id: 8,
      name: "Today's Special",
      description: "Fresh catch of the day with chef's choice sides",
      price: { eur: 26.00, usd: 28.50 },
      category: "special",
      available: true,
      special: true,
      image: "/api/placeholder/300/200"
    }
  ]
};

type Currency = 'eur' | 'usd';
type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export default function Order() {
  const [searchParams] = useSearchParams();
  const tableToken = searchParams.get('token') || 'QR-T1';
  
  const [currency, setCurrency] = useState<Currency>('eur');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState('food');
  const [sessionActive, setSessionActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicMenu, setPublicMenu] = useState<any | null>(null);

  // Load public menu by QR token if present
  useEffect(() => {
    const token = tableToken;
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/menu/public?token=${encodeURIComponent(token)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Failed to load menu');
        if (!cancelled) {
          setPublicMenu(json.data);
          const cur = (json.data.restaurant?.currency || 'eur').toLowerCase();
          setCurrency(cur === 'usd' ? 'usd' : 'eur');
        }
      } catch (e: any) {
        console.warn('Public menu fetch failed, using demo menu:', e?.message || e);
        if (!cancelled) setError('Loading demo menu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tableToken]);

  // Compute menu source (public or fallback)
  const menuSource = useMemo(() => {
    if (publicMenu?.menu) {
      const categories = Object.keys(publicMenu.menu);
      return {
        categories,
        byCategory: publicMenu.menu
      };
    }
    return {
      categories: ['food', 'drinks', 'specials'],
      byCategory: {
        food: mockMenu.food,
        drinks: mockMenu.drinks,
        specials: mockMenu.specials
      }
    };
  }, [publicMenu]);

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Add item to cart
  const addToCart = (item: any) => {
    const price = item.price[currency];
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { 
        id: item.id, 
        name: item.name, 
        price: price, 
        quantity: 1 
      }]);
    }
    
    if (!sessionActive) {
      setSessionActive(true);
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId: number) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem => 
        cartItem.id === itemId 
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
  };

  // Place order
  const placeOrder = async () => {
    if (cart.length === 0) return;

    if (publicMenu) {
      try {
        const payload = {
          token: tableToken,
          items: cart.map(ci => ({ menuItemId: String(ci.id), quantity: ci.quantity })),
          currency: (publicMenu.restaurant?.currency || 'EUR').toUpperCase(),
          notes: undefined as string | undefined,
        };
        const res = await fetch('/api/orders/public', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || `HTTP ${res.status}`);
        setCart([]);
        setSessionActive(true);
        alert(`Order ${json.data.order_number || ''} placed successfully!`);
      } catch (e: any) {
        alert(`Failed to place order: ${e?.message || e}`);
      }
      return;
    }
    // Fallback demo
    alert(`Order placed for Table ${tableToken}!\nTotal: ${currency === 'eur' ? '€' : '$'}${cartTotal.toFixed(2)}`);
    setCart([]);
    setSessionActive(true);
  };

  // Customer actions
  const callWaiter = async () => {
    if (publicMenu) {
      try {
        const res = await fetch('/api/tables/public/call-waiter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tableToken })
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || `HTTP ${res.status}`);
        alert('Waiter notified.');
        return;
      } catch (e: any) {
        alert(`Failed to notify waiter: ${e?.message || e}`);
        return;
      }
    }
    alert('Waiter has been notified and will be with you shortly!');
  };

  const requestPayment = async () => {
    if (publicMenu) {
      try {
        const res = await fetch('/api/tables/public/request-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tableToken })
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || `HTTP ${res.status}`);
        alert('Payment request sent.');
        return;
      } catch (e: any) {
        alert(`Failed to request payment: ${e?.message || e}`);
        return;
      }
    }
    alert('Payment request sent to staff!');
  };

  const getItemQuantityInCart = (itemId: number) => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const renderMenuItem = (item: any) => (
    <Card key={item.id} className="overflow-hidden">
      <div className="aspect-video bg-gray-200 flex items-center justify-center">
        <Utensils className="h-12 w-12 text-gray-400" />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{item.name}</h3>
            {item.special && (
              <Badge variant="secondary" className="mt-1">
                Special
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">
              {currency === 'eur' ? '€' : '$'}{item.price[currency].toFixed(2)}
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getItemQuantityInCart(item.id) > 0 && (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => removeFromCart(item.id)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="min-w-[2rem] text-center font-semibold">
                  {getItemQuantityInCart(item.id)}
                </span>
              </>
            )}
            <Button 
              size="sm" 
              onClick={() => addToCart(item)}
              disabled={!item.available}
            >
              <Plus className="h-3 w-3 mr-1" />
              {getItemQuantityInCart(item.id) === 0 ? 'Add' : ''}
            </Button>
          </div>
          
          {!item.available && (
            <Badge variant="destructive">Unavailable</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🍽️ Menu</h1>
              <p className="text-sm text-gray-600">Table {tableToken}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Currency Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={currency === 'eur' ? 'default' : 'ghost'}
                  onClick={() => setCurrency('eur')}
                  className="px-3"
                >
                  <Euro className="h-4 w-4 mr-1" />
                  EUR
                </Button>
                <Button
                  size="sm"
                  variant={currency === 'usd' ? 'default' : 'ghost'}
                  onClick={() => setCurrency('usd')}
                  className="px-3"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  USD
                </Button>
              </div>

              {/* Cart */}
              <div className="relative">
                <Button variant="outline" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {currency === 'eur' ? '€' : '$'}{cartTotal.toFixed(2)}
                  {cartItemCount > 0 && (
                    <Badge className="ml-2 px-1.5 py-0.5 text-xs">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading && <div className="mb-4 text-sm text-gray-600">Loading menu...</div>}
        {error && <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">{error}</div>}
        {/* Menu Categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="food" className="flex items-center">
              <ChefHat className="h-4 w-4 mr-2" />
              Food
            </TabsTrigger>
            <TabsTrigger value="drinks" className="flex items-center">
              <Coffee className="h-4 w-4 mr-2" />
              Drinks
            </TabsTrigger>
            <TabsTrigger value="specials" className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Specials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="food" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(menuSource.byCategory.food || []).map(renderMenuItem)}
            </div>
          </TabsContent>

          <TabsContent value="drinks" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(menuSource.byCategory.drinks || menuSource.byCategory.drink || []).map(renderMenuItem)}
            </div>
          </TabsContent>

          <TabsContent value="specials" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(menuSource.byCategory.specials || menuSource.byCategory.special || []).map(renderMenuItem)}
            </div>
          </TabsContent>
        </Tabs>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Your Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-600 ml-2">x{item.quantity}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">
                        {currency === 'eur' ? '€' : '$'}{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-3 flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span>{currency === 'eur' ? '€' : '$'}{cartTotal.toFixed(2)}</span>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={placeOrder}
                >
                  Place Order
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="flex items-center justify-center py-6"
            onClick={callWaiter}
          >
            <Bell className="h-5 w-5 mr-2" />
            Call Waiter
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-center py-6"
            onClick={requestPayment}
            disabled={!sessionActive}
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Request Payment
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-center py-6"
          >
            <Star className="h-5 w-5 mr-2" />
            Leave Review
          </Button>
        </div>

        {/* Session Status */}
        {sessionActive && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center text-green-800">
                <Clock className="h-5 w-5 mr-2" />
                <span className="font-medium">Session Active</span>
                <span className="ml-2 text-sm">- You can continue adding items or request assistance</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
