import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/ui/back-button';
import { useToast } from '@/hooks/use-toast';
import {
  AccommodationBooking,
  FacilityBooking,
  FoodOrder,
  STATUS_LABELS,
  ApprovalStatus,
} from '@/types/database';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  UtensilsCrossed,
  CalendarDays,
  Loader2,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';

type BookingType = 'accommodation' | 'facility' | 'food';

const BookingApprovals: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<BookingType>('accommodation');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const { data: allBookings, isLoading } = useQuery({
    queryKey: ['booking-approvals'],
    queryFn: async () => {
      const results = {
        accommodationBookings: [],
        facilityBookings: [],
        foodOrders: []
      };

      // Simplified queries without complex joins
      const [accData, facData, foodData] = await Promise.all([
        supabase.from('accommodation_bookings').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
        supabase.from('facility_bookings').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
        supabase.from('food_orders').select('*').eq('admin_approval', 'pending').order('created_at', { ascending: false }).limit(20)
      ]);

      results.accommodationBookings = accData.data || [];
      results.facilityBookings = facData.data || [];
      results.foodOrders = foodData.data || [];

      return results;
    },
    staleTime: 1 * 60 * 1000,
  });

  const [accommodationBookings, setAccommodationBookings] = useState<AccommodationBooking[]>([]);
  const [facilityBookings, setFacilityBookings] = useState<FacilityBooking[]>([]);
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>([]);

  useEffect(() => {
    if (allBookings) {
      setAccommodationBookings(allBookings.accommodationBookings);
      setFacilityBookings(allBookings.facilityBookings);
      setFoodOrders(allBookings.foodOrders);
    }
  }, [allBookings]);

  const handleApproval = async (
    id: string,
    type: BookingType,
    action: 'approve' | 'decline'
  ) => {
    setIsProcessing(true);
    const status: ApprovalStatus = action === 'approve' ? 'approved' : 'declined';

    try {
      if (type === 'accommodation') {
        await supabase
          .from('accommodation_bookings')
          .update({
            status,
            hr_approval: status,
            approved_by: user?.id,
            approval_notes: approvalNotes || null,
          })
          .eq('id', id);

        setAccommodationBookings((prev) => prev.filter((b) => b.id !== id));
      } else if (type === 'facility') {
        await supabase
          .from('facility_bookings')
          .update({
            status,
            club_manager_approval: status,
            approved_by: user?.id,
            approval_notes: approvalNotes || null,
          })
          .eq('id', id);

        setFacilityBookings((prev) => prev.filter((b) => b.id !== id));
      } else if (type === 'food') {
        await supabase
          .from('food_orders')
          .update({
            admin_approval: status,
            approved_by: user?.id,
          })
          .eq('id', id);

        setFoodOrders((prev) => prev.filter((o) => o.id !== id));
      }

      toast({
        title: `Booking ${action === 'approve' ? 'approved' : 'declined'}`,
        description: `The ${type} booking has been ${action === 'approve' ? 'approved' : 'declined'}.`,
      });

      setSelectedBooking(null);
      setApprovalNotes('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error processing booking',
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/10 text-success border-success/20">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case 'declined':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Declined</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalPending =
    accommodationBookings.length + facilityBookings.length + foodOrders.length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
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
            Booking Approvals
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and process pending booking requests
          </p>
        </div>
        <Badge className="bg-warning/10 text-warning border-warning/20 px-4 py-2">
          <Clock className="h-4 w-4 mr-2" />
          {totalPending} Total Pending
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BookingType)}>
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="accommodation" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Accommodation
            {accommodationBookings.length > 0 && (
              <Badge className="ml-1 bg-accent text-accent-foreground h-5 w-5 p-0 flex items-center justify-center">
                {accommodationBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="facility" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Facilities
            {facilityBookings.length > 0 && (
              <Badge className="ml-1 bg-accent text-accent-foreground h-5 w-5 p-0 flex items-center justify-center">
                {facilityBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="food" className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Food Orders
            {foodOrders.length > 0 && (
              <Badge className="ml-1 bg-accent text-accent-foreground h-5 w-5 p-0 flex items-center justify-center">
                {foodOrders.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Accommodation Bookings */}
        <TabsContent value="accommodation" className="mt-6">
          {accommodationBookings.length === 0 ? (
            <Card className="p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No pending accommodation bookings
              </h3>
              <p className="text-muted-foreground">
                All accommodation requests have been processed
              </p>
            </Card>
          ) : (
            <Card className="premium-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accommodationBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">Guest Name</p>
                          <p className="text-xs text-muted-foreground">Department</p>
                        </div>
                      </TableCell>
                      <TableCell>Room Name</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(booking.check_in_date), 'MMM d')}</p>
                          <p className="text-muted-foreground">
                            to {format(new Date(booking.check_out_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.guests}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() =>
                              handleApproval(booking.id, 'accommodation', 'approve')
                            }
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking({ ...booking, type: 'accommodation' });
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Facility Bookings */}
        <TabsContent value="facility" className="mt-6">
          {facilityBookings.length === 0 ? (
            <Card className="p-12 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No pending facility bookings
              </h3>
              <p className="text-muted-foreground">
                All facility requests have been processed
              </p>
            </Card>
          ) : (
            <Card className="premium-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requester</TableHead>
                    <TableHead>Facility</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facilityBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">Requester Name</p>
                          <p className="text-xs text-muted-foreground">Department</p>
                        </div>
                      </TableCell>
                      <TableCell>Facility Name</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(booking.booking_date), 'MMM d, yyyy')}</p>
                          <p className="text-muted-foreground">
                            {booking.start_time} - {booking.end_time}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {booking.purpose || '—'}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() =>
                              handleApproval(booking.id, 'facility', 'approve')
                            }
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking({ ...booking, type: 'facility' });
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Food Orders */}
        <TabsContent value="food" className="mt-6">
          {foodOrders.length === 0 ? (
            <Card className="p-12 text-center">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No pending food orders
              </h3>
              <p className="text-muted-foreground">
                All food orders have been processed
              </p>
            </Card>
          ) : (
            <Card className="premium-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requester</TableHead>
                    <TableHead>Meal Type</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foodOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">Requester Name</p>
                          <p className="text-xs text-muted-foreground">Department</p>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{order.meal_type}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(order.order_date), 'MMM d, yyyy')}</p>
                          <p className="text-muted-foreground">
                            {format(new Date(order.delivery_time), 'h:mm a')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${order.total_amount}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.admin_approval)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApproval(order.id, 'food', 'approve')}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking({ ...order, type: 'food' });
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Decline Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Decline Booking?</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this booking request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter reason for declining..."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBooking(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                handleApproval(selectedBooking.id, selectedBooking.type, 'decline')
              }
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Decline Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingApprovals;
