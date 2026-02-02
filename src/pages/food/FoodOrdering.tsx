import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/ui/back-button';
import { useToast } from '@/hooks/use-toast';
import { MenuItem, MealType, MEAL_LABELS } from '@/types/database';
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  UtensilsCrossed,
  Leaf,
  AlertTriangle,
  CalendarIcon,
  Clock,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

const FoodOrdering: React.FC = () => {
  const { user } = useAuth();
  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('name')
        .limit(100);

      if (error) throw error;
      return (data || []) as MenuItem[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDate, setOrderDate] = useState<Date>(new Date());
  const [deliveryTime, setDeliveryTime] = useState('12:00');
  const [specialRequests, setSpecialRequests] = useState('');
  const { toast } = useToast();

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMealType = item.meal_type === selectedMealType;
    return matchesSearch && matchesMealType;
  });

  const addToCart = (menuItem: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
    toast({
      title: 'Added to cart',
      description: `${menuItem.name} added to your order`,
    });
  };

  const updateCartQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const submitOrder = async () => {
    if (!user || cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const deliveryDateTime = new Date(orderDate);
      const [hours, minutes] = deliveryTime.split(':');
      deliveryDateTime.setHours(parseInt(hours), parseInt(minutes));

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('food_orders')
        .insert({
          user_id: user.id,
          order_date: format(orderDate, 'yyyy-MM-dd'),
          delivery_time: deliveryDateTime.toISOString(),
          meal_type: selectedMealType,
          total_amount: totalAmount,
          special_requests: specialRequests || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        price: item.menuItem.price,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase
        .from('food_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: 'Order placed successfully!',
        description: 'Your order is pending admin approval.',
      });

      setCart([]);
      setIsCartOpen(false);
      setSpecialRequests('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error placing order',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Food Ordering</h1>
          <p className="text-muted-foreground mt-1">
            Browse today's menu and place your order
          </p>
        </div>

        <Button
          variant="hero"
          className="relative"
          onClick={() => setIsCartOpen(true)}
          disabled={cart.length === 0}
        >
          <ShoppingCart className="h-5 w-5" />
          View Cart
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-primary text-primary-foreground">
              {totalItems}
            </Badge>
          )}
        </Button>
      </div>

      {/* Meal Type Tabs */}
      <Tabs
        value={selectedMealType}
        onValueChange={(value) => setSelectedMealType(value as MealType)}
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
          <TabsTrigger value="lunch">Lunch</TabsTrigger>
          <TabsTrigger value="supper">Supper</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <Card className="p-12 text-center">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No menu items found
          </h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? 'Try adjusting your search'
              : `No ${MEAL_LABELS[selectedMealType].toLowerCase()} items available`}
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="premium-card overflow-hidden">
              {/* Image */}
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 relative">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  {item.is_vegetarian && (
                    <Badge className="bg-green-500 text-white">
                      <Leaf className="h-3 w-3 mr-1" />
                      Vegetarian
                    </Badge>
                  )}
                  {item.is_vegan && (
                    <Badge className="bg-green-600 text-white">
                      <Leaf className="h-3 w-3 mr-1" />
                      Vegan
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display font-semibold text-lg text-foreground">
                    {item.name}
                  </h3>
                  <p className="text-lg font-bold text-accent">${item.price}</p>
                </div>

                {item.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {item.allergens && item.allergens.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-warning mb-4">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Contains: {item.allergens.join(', ')}</span>
                  </div>
                )}

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => addToCart(item)}
                >
                  <Plus className="h-4 w-4" />
                  Add to Order
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Your Order</DialogTitle>
            <DialogDescription>
              Review your items and schedule delivery
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.menuItem.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.menuItem.price} each
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateCartQuantity(item.menuItem.id, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateCartQuantity(item.menuItem.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(orderDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={orderDate}
                    onSelect={(date) => date && setOrderDate(date)}
                    disabled={(date) => date < new Date()}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Delivery Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery Time</label>
              <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                <SelectTrigger>
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="07:00">7:00 AM</SelectItem>
                  <SelectItem value="08:00">8:00 AM</SelectItem>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="12:30">12:30 PM</SelectItem>
                  <SelectItem value="13:00">1:00 PM</SelectItem>
                  <SelectItem value="18:00">6:00 PM</SelectItem>
                  <SelectItem value="18:30">6:30 PM</SelectItem>
                  <SelectItem value="19:00">7:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Special Requests */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Special Requests</label>
              <Textarea
                placeholder="Any dietary requirements or special instructions..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
              />
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
              <span className="font-semibold text-foreground">Total Amount</span>
              <span className="text-2xl font-bold text-accent">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCartOpen(false)}>
              Continue Ordering
            </Button>
            <Button variant="hero" onClick={submitOrder} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoodOrdering;
