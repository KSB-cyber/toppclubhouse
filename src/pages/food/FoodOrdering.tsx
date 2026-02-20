import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, UtensilsCrossed, Clock, Leaf, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const FoodOrdering = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedMealType, setSelectedMealType] = useState('lunch');

  const getAvailableMealTypes = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const time = hour * 60 + minute;
    
    const available: string[] = [];
    if (time >= 7 * 60 && time <= 9 * 60) available.push('breakfast');
    if (time >= 7 * 60 && time <= 9 * 60 + 30) available.push('lunch');
    if (time >= 7 * 60 && time <= 17 * 60) available.push('supper');
    
    return available;
  };

  const availableMealTypes = getAvailableMealTypes();

  useEffect(() => {
    loadMenu();
  }, [selectedMealType]);

  const loadMenu = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, description, meal_type, price, image_url, is_vegetarian, is_vegan, is_available')
        .eq('is_available', true)
        .eq('meal_type', selectedMealType)
        .order('name')
        .limit(30);
      
      if (error) throw error;
      setMenuItems(data || []);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast({ title: '✓ Added to cart', description: item.name });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = async () => {
    if (!user || cart.length === 0) return;
    
    if (!availableMealTypes.includes(selectedMealType)) {
      toast({ variant: 'destructive', title: 'Ordering time has passed' });
      return;
    }

    try {
      const { data: order, error: orderError } = await supabase
        .from('food_orders')
        .insert({
          user_id: user.id,
          order_date: format(new Date(), 'yyyy-MM-dd'),
          delivery_time: new Date().toISOString(),
          meal_type: selectedMealType,
          total_amount: totalAmount,
          status: 'received',
          admin_approval: 'approved',
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      const items = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));
      
      await supabase.from('food_order_items').insert(items);

      toast({ title: '🎉 Order placed successfully!', description: `Total: GH₵${totalAmount.toFixed(2)}` });
      setCart([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center gap-3">
              <UtensilsCrossed className="h-10 w-10 text-orange-600" />
              Food Ordering
            </h1>
            <p className="text-gray-600 mt-2">Order delicious meals from our menu</p>
          </div>
        </div>

        {/* Time Warning */}
        {availableMealTypes.length === 0 && (
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <CardContent className="py-6">
              <div className="flex items-center gap-3 text-orange-700">
                <Clock className="h-6 w-6" />
                <div>
                  <p className="font-semibold text-lg">All meal ordering times have passed</p>
                  <p className="text-sm text-orange-600">Breakfast: 7-9AM • Lunch: 7-9:30AM • Supper: 7AM-5PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meal Type Tabs */}
        <Tabs value={selectedMealType} onValueChange={setSelectedMealType}>
          <TabsList className="grid w-full max-w-2xl grid-cols-3 h-14 bg-white shadow-lg">
            <TabsTrigger value="breakfast" disabled={!availableMealTypes.includes('breakfast')} className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
              🌅 Breakfast
            </TabsTrigger>
            <TabsTrigger value="lunch" disabled={!availableMealTypes.includes('lunch')} className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
              ☀️ Lunch
            </TabsTrigger>
            <TabsTrigger value="supper" disabled={!availableMealTypes.includes('supper')} className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
              🌙 Supper
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Menu Items Grid */}
        {menuItems.length === 0 ? (
          <Card className="p-16 text-center bg-white/80 backdrop-blur">
            <UtensilsCrossed className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No items available for {selectedMealType}</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map(item => (
              <Card key={item.id} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white border-2 border-transparent hover:border-orange-200">
                <div className="aspect-video bg-gradient-to-br from-orange-100 to-amber-100 relative overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UtensilsCrossed className="h-16 w-16 text-orange-200" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {item.is_vegetarian && (
                      <Badge className="bg-green-500 text-white shadow-lg">
                        <Leaf className="h-3 w-3 mr-1" />
                        Veg
                      </Badge>
                    )}
                    {item.is_vegan && (
                      <Badge className="bg-green-600 text-white shadow-lg">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Vegan
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl text-gray-800">{item.name}</h3>
                    <p className="text-2xl font-bold text-orange-600">GH₵{item.price}</p>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                  )}
                  <Button 
                    onClick={() => addToCart(item)} 
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg" 
                    disabled={!availableMealTypes.includes(selectedMealType)}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Floating Cart */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Card className="w-80 shadow-2xl border-2 border-orange-200 bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-orange-600" />
                    Your Cart
                  </h3>
                  <Badge className="bg-orange-500 text-white">{totalItems} items</Badge>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">GH₵{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center font-bold">{item.quantity}</span>
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t-2 border-orange-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg">Total</span>
                    <span className="text-3xl font-bold text-orange-600">GH₵{totalAmount.toFixed(2)}</span>
                  </div>
                  <Button onClick={placeOrder} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-lg h-12 shadow-lg">
                    Place Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodOrdering;
