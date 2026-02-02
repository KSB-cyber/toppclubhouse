import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BackButton from '@/components/ui/back-button';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  DollarSign, 
  Users, 
  Building2,
  UtensilsCrossed,
  CalendarDays,
  TrendingUp
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const Reports: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [reportType, setReportType] = useState('all');
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    accommodationBookings: 0,
    foodOrders: 0,
    facilityBookings: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, [dateFrom, dateTo]);

  const fetchStats = async () => {
    try {
      // Fetch accommodation bookings
      const { data: accommodations } = await supabase
        .from('accommodation_bookings')
        .select('*, accommodation:accommodations(price_per_night)')
        .eq('status', 'approved')
        .gte('created_at', dateFrom)
        .lte('created_at', dateTo + 'T23:59:59');

      // Fetch food orders
      const { data: foodOrders } = await supabase
        .from('food_orders')
        .select('total_amount')
        .in('status', ['delivered', 'ready'])
        .gte('created_at', dateFrom)
        .lte('created_at', dateTo + 'T23:59:59');

      // Fetch facility bookings
      const { data: facilities } = await supabase
        .from('facility_bookings')
        .select('*, facility:facilities(hourly_rate)')
        .eq('status', 'approved')
        .gte('created_at', dateFrom)
        .lte('created_at', dateTo + 'T23:59:59');

      // Fetch total users
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .eq('account_approved', true);

      const accommodationRevenue = (accommodations || []).reduce((sum, booking) => {
        const nights = Math.ceil((new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) / (1000 * 60 * 60 * 24));
        return sum + (booking.accommodation?.price_per_night || 0) * nights;
      }, 0);

      const foodRevenue = (foodOrders || []).reduce((sum, order) => sum + order.total_amount, 0);

      const facilityRevenue = (facilities || []).reduce((sum, booking) => {
        const hours = Math.ceil((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60 * 60));
        return sum + (booking.facility?.hourly_rate || 0) * hours;
      }, 0);

      setStats({
        totalBookings: (accommodations?.length || 0) + (foodOrders?.length || 0) + (facilities?.length || 0),
        totalRevenue: accommodationRevenue + foodRevenue + facilityRevenue,
        totalUsers: users?.length || 0,
        accommodationBookings: accommodations?.length || 0,
        foodOrders: foodOrders?.length || 0,
        facilityBookings: facilities?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const downloadReport = async (type: string) => {
    setIsLoading(true);
    try {
      let data = [];
      let filename = '';
      let headers = [];

      switch (type) {
        case 'accommodations':
          const { data: accommodationData } = await supabase
            .from('accommodation_bookings')
            .select(`
              *,
              accommodation:accommodations(name, price_per_night),
              profile:profiles(full_name, email, department)
            `)
            .gte('created_at', dateFrom)
            .lte('created_at', dateTo + 'T23:59:59');
          
          data = accommodationData || [];
          filename = `accommodation_bookings_${dateFrom}_to_${dateTo}.csv`;
          headers = ['Date', 'Guest Name', 'Email', 'Department', 'Room', 'Check In', 'Check Out', 'Guests', 'Status', 'Revenue'];
          break;

        case 'food':
          const { data: foodData } = await supabase
            .from('food_orders')
            .select(`
              *,
              profile:profiles(full_name, email, department)
            `)
            .gte('created_at', dateFrom)
            .lte('created_at', dateTo + 'T23:59:59');
          
          data = foodData || [];
          filename = `food_orders_${dateFrom}_to_${dateTo}.csv`;
          headers = ['Date', 'Customer Name', 'Email', 'Department', 'Meal Type', 'Amount', 'Status'];
          break;

        case 'facilities':
          const { data: facilityData } = await supabase
            .from('facility_bookings')
            .select(`
              *,
              facility:facilities(name, hourly_rate),
              profile:profiles(full_name, email, department)
            `)
            .gte('created_at', dateFrom)
            .lte('created_at', dateTo + 'T23:59:59');
          
          data = facilityData || [];
          filename = `facility_bookings_${dateFrom}_to_${dateTo}.csv`;
          headers = ['Date', 'User Name', 'Email', 'Department', 'Facility', 'Booking Date', 'Start Time', 'End Time', 'Purpose', 'Status'];
          break;

        default:
          // Combined report
          const [accData, foodOrderData, facData] = await Promise.all([
            supabase.from('accommodation_bookings').select('*, accommodation:accommodations(name), profile:profiles(full_name, department)').gte('created_at', dateFrom).lte('created_at', dateTo + 'T23:59:59'),
            supabase.from('food_orders').select('*, profile:profiles(full_name, department)').gte('created_at', dateFrom).lte('created_at', dateTo + 'T23:59:59'),
            supabase.from('facility_bookings').select('*, facility:facilities(name), profile:profiles(full_name, department)').gte('created_at', dateFrom).lte('created_at', dateTo + 'T23:59:59')
          ]);
          
          data = [
            ...(accData.data || []).map(item => ({ ...item, type: 'Accommodation' })),
            ...(foodOrderData.data || []).map(item => ({ ...item, type: 'Food Order' })),
            ...(facData.data || []).map(item => ({ ...item, type: 'Facility' }))
          ];
          filename = `all_bookings_${dateFrom}_to_${dateTo}.csv`;
          headers = ['Date', 'Type', 'User Name', 'Department', 'Status'];
      }

      // Convert to CSV
      const csvContent = [
        headers.join(','),
        ...data.map(row => {
          switch (type) {
            case 'accommodations':
              const nights = Math.ceil((new Date(row.check_out_date).getTime() - new Date(row.check_in_date).getTime()) / (1000 * 60 * 60 * 24));
              const revenue = (row.accommodation?.price_per_night || 0) * nights;
              return [
                format(new Date(row.created_at), 'yyyy-MM-dd'),
                row.profile?.full_name || '',
                row.profile?.email || '',
                row.profile?.department || '',
                row.accommodation?.name || '',
                format(new Date(row.check_in_date), 'yyyy-MM-dd'),
                format(new Date(row.check_out_date), 'yyyy-MM-dd'),
                row.guests,
                row.status,
                                `₵${revenue.toFixed(2)}`
              ].join(',');
            case 'food':
              return [
                format(new Date(row.created_at), 'yyyy-MM-dd'),
                row.profile?.full_name || '',
                row.profile?.email || '',
                row.profile?.department || '',
                row.meal_type,
                                `₵${row.total_amount.toFixed(2)}`,
                row.status
              ].join(',');
            case 'facilities':
              return [
                format(new Date(row.created_at), 'yyyy-MM-dd'),
                row.profile?.full_name || '',
                row.profile?.email || '',
                row.profile?.department || '',
                row.facility?.name || '',
                format(new Date(row.booking_date), 'yyyy-MM-dd'),
                row.start_time,
                row.end_time,
                row.purpose || '',
                row.status
              ].join(',');
            default:
              return [
                format(new Date(row.created_at), 'yyyy-MM-dd'),
                row.type,
                row.profile?.full_name || '',
                row.profile?.department || '',
                row.status
              ].join(',');
          }
        })
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Report Downloaded',
        description: `${filename} has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Failed to generate report. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <BackButton />
      
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-display font-bold">Reports & Analytics</h1>
      </div>

      {/* Date Range Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="accommodations">Accommodations</SelectItem>
                  <SelectItem value="food">Food Orders</SelectItem>
                  <SelectItem value="facilities">Facilities</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₵{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="text-green-500 text-2xl font-bold">₵</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accommodations</p>
                <p className="text-2xl font-bold">{stats.accommodationBookings}</p>
              </div>
              <Building2 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Download Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => downloadReport('accommodations')}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Building2 className="h-4 w-4" />
              Accommodation Report
            </Button>
            
            <Button
              onClick={() => downloadReport('food')}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <UtensilsCrossed className="h-4 w-4" />
              Food Orders Report
            </Button>
            
            <Button
              onClick={() => downloadReport('facilities')}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              Facilities Report
            </Button>
            
            <Button
              onClick={() => downloadReport('all')}
              disabled={isLoading}
              variant="hero"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Complete Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;