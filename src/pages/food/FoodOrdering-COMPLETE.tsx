import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Clock } from 'lucide-react';
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
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, description, meal_type, price, is_available')
        .eq('is_available', true)
        .eq('meal_type', selectedMealType)
        .order('name')
        .limit(30);
      
      if (error) throw error;
      setMenuItems(data || []);
    } catch (e: any) {
      console.error(e);
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
    toast({ title: 'Added to cart' });
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

      toast({ title: 'Order placed!' });
      setCart([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Food Ordering</h1>
        <Button onClick={placeOrder} disabled={cart.length === 0}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Order ({totalItems})
        </Button>
      </div>

      {availableMealTypes.length === 0 && (
        <Card className="border-warning bg-warning/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-warning">
              <Clock className="h-5 w-5" />
              <p>All meal ordering times have passed</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedMealType} onValueChange={setSelectedMealType}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="breakfast" disabled={!availableMealTypes.includes('breakfast')}>
            Breakfast
          </TabsTrigger>
          <TabsTrigger value="lunch" disabled={!availableMealTypes.includes('lunch')}>
            Lunch
          </TabsTrigger>
          <TabsTrigger value="supper" disabled={!availableMealTypes.includes('supper')}>
            Supper
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid md:grid-cols-3 gap-4">
        {menuItems.map(item => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-lg font-bold">GH₵{item.price}</p>
              <Button onClick={() => addToCart(item)} className="w-full mt-2" disabled={!availableMealTypes.includes(selectedMealType)}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FoodOrdering;
