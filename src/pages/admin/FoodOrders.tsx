import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/ui/back-button';
import { FoodOrder, MEAL_LABELS } from '@/types/database';
import {
  UtensilsCrossed,
  Clock,
  TrendingUp,
  Users,
  CalendarIcon,
  CheckCircle,
  Printer,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const FoodOrders: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'orders' | 'items'>('orders');
  const [selectedMealType, setSelectedMealType] = useState<'all' | 'breakfast' | 'lunch' | 'supper'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Issue Order Mutation
  const issueOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('food_orders')
        .update({ status: 'delivered' })
        .eq('id', orderId);
      
      if (error) throw error;
      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-food-orders'] });
      toast({ title: 'Order delivered successfully', description: 'Receipt is now available for download' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Print Receipt Function
  const printReceipt = async (order: any) => {
    // Get order items
    const { data: orderItems } = await supabase
      .from('food_order_items')
      .select('*, menu_item:menu_items(name, price)')
      .eq('order_id', order.id);

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Food Order Receipt</title>
        <style>
          body { font-family: Arial; max-width: 600px; margin: 20px auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f2f2f2; }
          .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>TOPP Club House</h1>
          <h2>Food Order Receipt</h2>
        </div>
        <p><strong>Order ID:</strong> #${order.id.slice(0, 8)}</p>
        <p><strong>Customer:</strong> ${order.profile?.full_name}</p>
        <p><strong>Department:</strong> ${order.profile?.department || 'N/A'}</p>
        <p><strong>Order Date:</strong> ${format(new Date(order.order_date), 'PPP')}</p>
        <p><strong>Meal Type:</strong> ${order.meal_type.toUpperCase()}</p>
        <table>
          <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
          <tbody>
            ${orderItems?.map(item => `
              <tr>
                <td>${item.menu_item?.name}</td>
                <td>${item.quantity}</td>
                <td>GH₵${item.price.toFixed(2)}</td>
                <td>GH₵${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">Total: GH₵${order.total_amount.toFixed(2)}</div>
        <p style="text-align:center; margin-top:30px;">Thank you!</p>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow?.document.write(receiptHTML);
    printWindow?.document.close();
    printWindow?.print();
  };

  const { data: foodOrders = [], isLoading } = useQuery({
    queryKey: ['admin-food-orders', selectedDate],
    queryFn: async () => {
      let query = supabase
        .from('food_orders')
        .select('id, user_id, order_date, delivery_time, meal_type, total_amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (selectedDate) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        query = query.eq('order_date', dateStr);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Get profiles separately for better performance
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(o => o.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, department')
          .in('user_id', userIds);
        
        // Map profiles to orders
        return data.map(order => ({
          ...order,
          profile: profiles?.find(p => p.user_id === order.user_id)
        })) as FoodOrder[];
      }
      
      return (data || []) as FoodOrder[];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch menu item statistics
  const { data: menuItemStats = [], isLoading: isLoadingStats } = useQuery({
    queryKey: ['menu-item-stats', selectedDate, selectedMealType],
    queryFn: async () => {
      let orderQuery = supabase
        .from('food_orders')
        .select('id, meal_type, order_date');

      if (selectedDate) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        orderQuery = orderQuery.eq('order_date', dateStr);
      }

      const { data: orders, error: orderError } = await orderQuery;
      if (orderError) throw orderError;
      if (!orders || orders.length === 0) return [];

      const orderIds = orders.map(o => o.id);

      // Get order items with menu item details
      const { data: orderItems, error: itemsError } = await supabase
        .from('food_order_items')
        .select('menu_item_id, quantity, menu_item:menu_items(id, name, meal_type)')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;
      if (!orderItems) return [];

      // Group by menu item and calculate totals
      const statsMap = new Map();
      orderItems.forEach(item => {
        if (!item.menu_item) return;
        
        // Filter by meal type if selected
        if (selectedMealType !== 'all' && item.menu_item.meal_type !== selectedMealType) return;

        const key = item.menu_item_id;
        if (statsMap.has(key)) {
          const existing = statsMap.get(key);
          existing.totalQuantity += item.quantity;
          existing.orderCount += 1;
        } else {
          statsMap.set(key, {
            menuItemId: item.menu_item_id,
            menuItemName: item.menu_item.name,
            mealType: item.menu_item.meal_type,
            totalQuantity: item.quantity,
            orderCount: 1,
          });
        }
      });

      return Array.from(statsMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity);
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-success/10 text-success border-success/20">Delivered</Badge>;
      case 'approved':
        return <Badge className="bg-success/10 text-success border-success/20">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case 'declined':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Declined</Badge>;
      case 'received':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Received</Badge>;
      case 'preparing':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Preparing</Badge>;
      case 'ready':
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Ready</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredOrders = foodOrders.filter(order => 
    selectedMealType === 'all' || order.meal_type === selectedMealType
  );

  const orderStats = {
    total: foodOrders.length,
    breakfast: foodOrders.filter(o => o.meal_type === 'breakfast').length,
    lunch: foodOrders.filter(o => o.meal_type === 'lunch').length,
    supper: foodOrders.filter(o => o.meal_type === 'supper').length,
    totalAmount: foodOrders.reduce((sum, order) => sum + order.total_amount, 0),
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <BackButton />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Food Orders Management
          </h1>
          <p className="text-muted-foreground mt-1">
            {selectedDate 
              ? `Showing orders for ${format(selectedDate, 'MMMM d, yyyy')}`
              : 'Showing all orders'}
          </p>
        </div>
        
        {/* Date Filter */}
        <div className="flex gap-2">
          <Button 
            variant={selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'default' : 'outline'}
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 border-b">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setSelectedDate(undefined)}
                >
                  Show All Orders
                </Button>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date)}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="premium-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                    ? 'Total Orders Today'
                    : selectedDate
                    ? `Orders on ${format(selectedDate, 'MMM d')}`
                    : 'Total Orders'}
                </p>
                <p className="text-2xl font-bold text-foreground">{orderStats.total}</p>
              </div>
              <UtensilsCrossed className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Breakfast</p>
                <p className="text-2xl font-bold text-foreground">{orderStats.breakfast}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lunch</p>
                <p className="text-2xl font-bold text-foreground">{orderStats.lunch}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Supper</p>
                <p className="text-2xl font-bold text-foreground">{orderStats.supper}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="orders">
            <UtensilsCrossed className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="items">
            <TrendingUp className="h-4 w-4 mr-2" />
            Menu Items Summary
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-6 space-y-4">
          {/* Meal Type Filter */}
          <div className="flex gap-2">
            <Button
              variant={selectedMealType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMealType('all')}
            >
              All ({orderStats.total})
            </Button>
            <Button
              variant={selectedMealType === 'breakfast' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMealType('breakfast')}
            >
              Breakfast ({orderStats.breakfast})
            </Button>
            <Button
              variant={selectedMealType === 'lunch' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMealType('lunch')}
            >
              Lunch ({orderStats.lunch})
            </Button>
            <Button
              variant={selectedMealType === 'supper' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMealType('supper')}
            >
              Supper ({orderStats.supper})
            </Button>
          </div>
          {filteredOrders.length === 0 ? (
            <Card className="p-12 text-center">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No food orders found
              </h3>
              <p className="text-muted-foreground">
                {activeTab === 'orders' 
                  ? selectedDate 
                    ? `No orders found for ${format(selectedDate, 'MMM d, yyyy')}`
                    : 'No orders found'
                  : selectedDate
                    ? `No ${selectedMealType} orders found for ${format(selectedDate, 'MMM d, yyyy')}`
                    : `No ${selectedMealType} orders found`
                }
              </p>
            </Card>
          ) : (
            <Card className="premium-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Meal Type</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Delivery Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        #{order.id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.profile?.full_name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{order.profile?.department || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {order.meal_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.order_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.delivery_time), 'h:mm a')}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${order.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.status !== 'delivered' ? (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => issueOrderMutation.mutate(order.id)}
                              disabled={issueOrderMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Issue Order
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => printReceipt(order)}
                            >
                              <Printer className="h-4 w-4 mr-1" />
                              Print Receipt
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Menu Items Summary Tab */}
        <TabsContent value="items" className="mt-6 space-y-4">
          {/* Meal Type Filter */}
          <div className="flex gap-2">
            <Button
              variant={selectedMealType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMealType('all')}
            >
              All
            </Button>
            <Button
              variant={selectedMealType === 'breakfast' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMealType('breakfast')}
            >
              Breakfast
            </Button>
            <Button
              variant={selectedMealType === 'lunch' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMealType('lunch')}
            >
              Lunch
            </Button>
            <Button
              variant={selectedMealType === 'supper' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMealType('supper')}
            >
              Supper
            </Button>
          </div>

          {isLoadingStats ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Loading menu item statistics...</p>
            </Card>
          ) : menuItemStats.length === 0 ? (
            <Card className="p-12 text-center">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No menu items ordered
              </h3>
              <p className="text-muted-foreground">
                {selectedDate
                  ? `No items ordered for ${format(selectedDate, 'MMM d, yyyy')}`
                  : 'No items ordered yet'}
              </p>
            </Card>
          ) : (
            <Card className="premium-card">
              <CardHeader>
                <CardTitle>Menu Items Ordered</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedDate
                    ? `Summary for ${format(selectedDate, 'MMM d, yyyy')}`
                    : 'All time summary'}
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Menu Item</TableHead>
                      <TableHead>Meal Type</TableHead>
                      <TableHead className="text-right">Total Quantity</TableHead>
                      <TableHead className="text-right">Number of Orders</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItemStats.map((stat) => (
                      <TableRow key={stat.menuItemId}>
                        <TableCell className="font-medium">{stat.menuItemName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {stat.mealType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-accent text-accent-foreground">
                            {stat.totalQuantity} {stat.totalQuantity === 1 ? 'item' : 'items'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">
                            {stat.orderCount} {stat.orderCount === 1 ? 'person' : 'people'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FoodOrders;