import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus } from 'lucide-react';
import { format } from 'date-fns';

const FoodOrdering = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cart, setCart] = useState<any[]>([]);

  React.useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const { data } = await supabase
        .from('menu_items')
        .select('id, name, price')
        .eq('is_available', true)
        .limit(20);
      setMenuItems(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: any) => {
    setCart(prev => [...prev, item]);
    toast({ title: 'Added to cart' });
  };

  const placeOrder = async () => {
    if (!user || cart.length === 0) return;
    
    try {
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      
      const { data: order } = await supabase
        .from('food_orders')
        .insert({
          user_id: user.id,
          order_date: format(new Date(), 'yyyy-MM-dd'),
          delivery_time: new Date().toISOString(),
          meal_type: 'lunch',
          total_amount: total,
          status: 'received',
          admin_approval: 'approved',
        })
        .select()
        .single();

      if (order) {
        const items = cart.map(item => ({
          order_id: order.id,
          menu_item_id: item.id,
          quantity: 1,
          price: item.price,
        }));
        
        await supabase.from('food_order_items').insert(items);
        
        toast({ title: 'Order placed!' });
        setCart([]);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Food Ordering</h1>
        <Button onClick={placeOrder} disabled={cart.length === 0}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Order ({cart.length})
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {menuItems.map(item => (
          <Card key={item.id} className="p-4">
            <h3 className="font-bold">{item.name}</h3>
            <p className="text-lg">GH₵{item.price}</p>
            <Button onClick={() => addToCart(item)} className="w-full mt-2">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FoodOrdering;
