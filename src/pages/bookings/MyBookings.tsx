import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/ui/back-button';
import { Building2, UtensilsCrossed, CalendarDays, Clock, Download } from 'lucide-react';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
};

const MyBookings: React.FC = () => {
  const { user } = useAuth();

  // Function to download receipt
  const downloadReceipt = async (order: any) => {
    try {
      // Get order items
      const { data: orderItems } = await supabase
        .from('food_order_items')
        .select(`
          *,
          menu_item:menu_items(name, price)
        `)
        .eq('order_id', order.id);

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', user!.id)
        .single();

      // Generate receipt HTML
      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Food Order Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .order-info { margin-bottom: 20px; }
            .items { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items th { background-color: #f2f2f2; }
            .total { text-align: right; font-size: 18px; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TOPP Club House</h1>
            <h2>Food Order Receipt</h2>
          </div>
          
          <div class="order-info">
            <p><strong>Order ID:</strong> ${order.id.slice(0, 8)}</p>
            <p><strong>Customer:</strong> ${profile?.full_name}</p>
            <p><strong>Email:</strong> ${profile?.email}</p>
            <p><strong>Order Date:</strong> ${format(new Date(order.order_date), 'PPP')}</p>
            <p><strong>Delivery Time:</strong> ${format(new Date(order.delivery_time), 'PPP p')}</p>
            <p><strong>Meal Type:</strong> ${order.meal_type.charAt(0).toUpperCase() + order.meal_type.slice(1)}</p>
            <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
          </div>
          
          <table class="items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems?.map(item => `
                <tr>
                  <td>${item.menu_item?.name}</td>
                  <td>${item.quantity}</td>
                  <td>GH₵ ${item.price.toFixed(2)}</td>
                  <td>GH₵ ${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p>Total Amount: GH₵ ${order.total_amount.toFixed(2)}</p>
          </div>
          
          ${order.special_requests ? `<p><strong>Special Requests:</strong> ${order.special_requests}</p>` : ''}
          
          <div class="footer">
            <p>Thank you for your order!</p>
            <p>TOPP Club House - ${format(new Date(), 'PPP')}</p>
          </div>
        </body>
        </html>
      `;

      // Create and download the receipt
      const blob = new Blob([receiptHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${order.id.slice(0, 8)}-${format(new Date(order.order_date), 'yyyy-MM-dd')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  // Combine all queries into one optimized query
  const { data: allBookings, isLoading } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      const results = {
        accommodationRequests: [],
        facilityRequests: [],
        foodOrders: []
      };

      // Get accommodation requests (simplified)
      const { data: accData } = await supabase
        .from('accommodation_requests')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);
      results.accommodationRequests = accData || [];

      // Get facility requests (simplified)
      const { data: facData } = await supabase
        .from('facility_requests')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);
      results.facilityRequests = facData || [];

      // Get food orders (simplified)
      const { data: foodData } = await supabase
        .from('food_orders')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);
      results.foodOrders = foodData || [];

      return results;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">My Bookings</h1>
        <p className="text-muted-foreground">View all your bookings and orders</p>
      </div>

      <Tabs defaultValue="accommodation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accommodation" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Accommodation ({allBookings?.accommodationRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="facilities" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Facilities ({allBookings?.facilityRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="food" className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Food Orders ({allBookings?.foodOrders?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accommodation" className="space-y-4">
          {allBookings?.accommodationRequests?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No accommodation requests yet
              </CardContent>
            </Card>
          ) : (
            allBookings?.accommodationRequests?.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Accommodation Request</CardTitle>
                      <CardDescription>{request.guest_name}</CardDescription>
                    </div>
                    <Badge className={statusColors[request.status || 'pending']}>
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Arrival:</span>
                      <p className="font-medium">{format(new Date(request.check_in_date), 'PPP')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Departure:</span>
                      <p className="font-medium">{format(new Date(request.check_out_date), 'PPP')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Guests:</span>
                      <p className="font-medium">{request.guests}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Billing:</span>
                      <p className="font-medium capitalize">{request.billing_to}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="facilities" className="space-y-4">
          {allBookings?.facilityRequests?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No facility requests yet
              </CardContent>
            </Card>
          ) : (
            allBookings?.facilityRequests?.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Facility Request</CardTitle>
                      <CardDescription>{format(new Date(request.booking_date), 'PPP')}</CardDescription>
                    </div>
                    <Badge className={statusColors[request.status || 'pending']}>
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Time:</span>
                      <p className="font-medium">{request.start_time} - {request.end_time}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Attendees:</span>
                      <p className="font-medium">{request.attendees}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="food" className="space-y-4">
          {allBookings?.foodOrders?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No food orders yet
              </CardContent>
            </Card>
          ) : (
            allBookings?.foodOrders?.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="capitalize">{order.meal_type}</CardTitle>
                      <CardDescription>{format(new Date(order.order_date), 'PPP')}</CardDescription>
                    </div>
                    <Badge className={statusColors[order.status || 'pending']}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>GH₵ {order.total_amount?.toFixed(2)}</span>
                      </div>
                    </div>
                    {(order.status === 'approved' || order.status === 'received' || order.status === 'delivered') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReceipt(order)}
                        className="ml-4"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Receipt
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyBookings;
