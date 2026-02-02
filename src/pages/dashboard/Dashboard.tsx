import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  UtensilsCrossed,
  CalendarDays,
  ArrowRight,
  Clock,
  CheckCircle2,
  Bell,
  Users,
  UserPlus,
} from 'lucide-react';
import { format } from 'date-fns';

const quickActions = [
  {
    title: 'Book Accommodation',
    description: 'Reserve a room or suite',
    icon: Building2,
    href: '/accommodation',
    color: 'bg-blue-500',
  },
  {
    title: 'Order Food',
    description: 'Browse menu & place orders',
    icon: UtensilsCrossed,
    href: '/food',
    color: 'bg-green-500',
  },
  {
    title: 'Book Facility',
    description: 'Reserve meeting rooms & more',
    icon: CalendarDays,
    href: '/facilities',
    color: 'bg-purple-500',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
    case 'delivered':
      return <Badge className="bg-success/10 text-success border-success/20">Approved</Badge>;
    case 'pending':
    case 'received':
      return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
    case 'declined':
    case 'cancelled':
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Declined</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const Dashboard: React.FC = () => {
  const { profile, isAdmin, user } = useAuth();

  // Combine related queries to reduce database calls
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-data', user?.id, isAdmin],
    queryFn: async () => {
      const results: any = {};
      
      // Get basic counts only
      if (isAdmin) {
        const { count: pendingUsersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('account_approved', false);
        results.pendingUsers = pendingUsersCount || 0;
      }

      // Get notifications count
      const { count: notificationsCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('is_read', false);
      results.notificationsCount = notificationsCount || 0;

      return results;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? "Here's an overview of all system activity." : "Here's what's happening with your bookings today."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Badge className="bg-accent/10 text-accent border-accent/20">
              Administrator
            </Badge>
          )}
          {profile?.department && (
            <Badge variant="secondary">{profile.department}</Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin && (
          <Card className="premium-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending User Approvals</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{isLoading ? '-' : dashboardData?.pendingUsers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-orange-500" />
                </div>
              </div>
              <Link to="/admin/approvals" className="text-sm text-accent hover:underline mt-2 inline-block">
                Review approvals →
              </Link>
            </CardContent>
          </Card>
        )}

        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread Notifications</p>
                <p className="text-3xl font-bold text-foreground mt-1">{isLoading ? '-' : dashboardData?.notificationsCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Bell className="h-6 w-6 text-accent" />
              </div>
            </div>
            <Link to="/notifications" className="text-sm text-accent hover:underline mt-2 inline-block">
              View notifications →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-display font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Card className="premium-card group cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {action.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center text-accent text-sm font-medium group-hover:gap-2 transition-all">
                    Get started
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity & Upcoming - Simplified */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="font-display">Quick Access</CardTitle>
            <CardDescription>Jump to your most used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/my-bookings">
                <Button variant="ghost" className="w-full justify-start">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  View My Bookings
                </Button>
              </Link>
              <Link to="/notifications">
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Check Notifications
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin/booking-approvals">
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Requests
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="font-display">System Status</CardTitle>
            <CardDescription>Everything is running smoothly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">All systems operational</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {format(new Date(), 'MMM d, yyyy • h:mm a')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
