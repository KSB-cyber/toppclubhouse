import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Home,
  Building2,
  UtensilsCrossed,
  CalendarDays,
  Users,
  Settings,
  Bell,
  LogOut,
  ShieldCheck,
  ClipboardList,
  ChefHat,
  Building,
  UserCheck,
  Shield,
  BarChart3,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/permissions';
import Logo from './Logo';

const userMenuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Accommodation', url: '/accommodation', icon: Building2 },
  { title: 'Food Ordering', url: '/food', icon: UtensilsCrossed },
  { title: 'Facilities', url: '/facilities', icon: CalendarDays },
  { title: 'My Bookings', url: '/my-bookings', icon: ClipboardList },
  { title: 'Notifications', url: '/notifications', icon: Bell },
];

const adminMenuItems = [
  { title: 'User Management', url: '/admin/users', icon: Users },
  { title: 'Account Approvals', url: '/admin/approvals', icon: UserCheck },
  { title: 'Manage Accommodations', url: '/admin/accommodations', icon: Building },
  { title: 'Manage Menu', url: '/admin/menu', icon: ChefHat },
  { title: 'Manage Facilities', url: '/admin/facilities', icon: Building2 },
  { title: 'Booking Approvals', url: '/admin/booking-approvals', icon: ShieldCheck },
];

const AppSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut, isAdmin, profile, roles } = useAuth();
  const collapsed = state === 'collapsed';
  const currentRole = roles[0];

  // Debug logging
  console.log('Sidebar Debug:', { isAdmin, roles, currentRole, profile });

  const isActive = (path: string) => location.pathname === path;

  const getAdminMenuItems = () => {
    const items = [];
    
    // Force HR items for William Danso (temporary fix)
    if (profile?.full_name === 'William Danso' || profile?.email?.includes('william')) {
      items.push({ title: 'Account Approvals', url: '/admin/approvals', icon: UserCheck });
      items.push({ title: 'Booking Approvals', url: '/admin/booking-approvals', icon: ShieldCheck });
      items.push({ title: 'Manage Accommodations', url: '/admin/accommodations', icon: Building });
      return items;
    }
    
    // Force Club House Manager items for Ama Pokuas (temporary fix)
    if (profile?.full_name === 'Ama Pokuas' || profile?.email?.includes('ama')) {
      items.push({ title: 'Account Approvals', url: '/admin/approvals', icon: UserCheck });
      items.push({ title: 'Food Orders', url: '/admin/food-orders', icon: UtensilsCrossed });
      items.push({ title: 'Booking Approvals', url: '/admin/booking-approvals', icon: ShieldCheck });
      items.push({ title: 'Manage Accommodations', url: '/admin/accommodations', icon: Building });
      items.push({ title: 'Manage Facilities', url: '/admin/facilities', icon: Building2 });
      items.push({ title: 'Manage Menu', url: '/admin/menu', icon: ChefHat });
      return items;
    }
    
    // Managing Director - final approvals, reports, unlimited access + admin role management
    if (currentRole === 'managing_director') {
      items.push({ title: 'Admin Roles', url: '/admin/roles', icon: Shield });
      items.push({ title: 'Account Approvals', url: '/admin/approvals', icon: UserCheck });
      items.push({ title: 'Booking Approvals', url: '/admin/booking-approvals', icon: ShieldCheck });
      items.push({ title: 'Manage Facilities', url: '/admin/facilities', icon: Building2 });
      items.push({ title: 'Reports', url: '/admin/reports', icon: BarChart3 });
      return items;
    }
    
    // Superadmin (IT) - can approve admins, users, third party
    if (currentRole === 'superadmin') {
      items.push({ title: 'User Management', url: '/admin/users', icon: Users });
      items.push({ title: 'Account Approvals', url: '/admin/approvals', icon: UserCheck });
      items.push({ title: 'Admin Roles', url: '/admin/roles', icon: Shield });
      return items;
    }
    
    // HR Office - user approvals, guest room first approvals, accommodation management
    if (currentRole === 'hr_office' || roles.includes('hr_office')) {
      items.push({ title: 'Account Approvals', url: '/admin/approvals', icon: UserCheck });
      items.push({ title: 'Booking Approvals', url: '/admin/booking-approvals', icon: ShieldCheck });
      items.push({ title: 'Manage Accommodations', url: '/admin/accommodations', icon: Building });
      return items;
    }
    
    // Club House Manager - user approvals, guest rooms, menu, room availability
    if (currentRole === 'club_house_manager' || roles.includes('club_house_manager')) {
      items.push({ title: 'Account Approvals', url: '/admin/approvals', icon: UserCheck });
      items.push({ title: 'Food Orders', url: '/admin/food-orders', icon: UtensilsCrossed });
      items.push({ title: 'Booking Approvals', url: '/admin/booking-approvals', icon: ShieldCheck });
      items.push({ title: 'Manage Accommodations', url: '/admin/accommodations', icon: Building });
      items.push({ title: 'Manage Facilities', url: '/admin/facilities', icon: Building2 });
      items.push({ title: 'Manage Menu', url: '/admin/menu', icon: ChefHat });
      return items;
    }
    
    // Fallback for legacy admin roles
    if (!currentRole || ['admin', 'hr_head', 'department_head'].includes(currentRole)) {
      items.push({ title: 'User Management', url: '/admin/users', icon: Users });
      items.push({ title: 'Account Approvals', url: '/admin/approvals', icon: UserCheck });
      items.push({ title: 'Admin Roles', url: '/admin/roles', icon: Shield });
      items.push({ title: 'Manage Accommodations', url: '/admin/accommodations', icon: Building });
      items.push({ title: 'Manage Menu', url: '/admin/menu', icon: ChefHat });
      items.push({ title: 'Manage Facilities', url: '/admin/facilities', icon: Building2 });
      items.push({ title: 'Booking Approvals', url: '/admin/booking-approvals', icon: ShieldCheck });
      items.push({ title: 'Reports', url: '/admin/reports', icon: BarChart3 });
    }
    
    return items;
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        {!collapsed && <Logo variant="light" size="md" />}
        {collapsed && (
          <img 
            src="/TOPP club house new logo.jpeg" 
            alt="TC" 
            className="w-10 h-10 rounded-lg object-contain"
          />
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-xs tracking-wider">
            {!collapsed && 'Main Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(isAdmin || ['managing_director', 'hr_office', 'club_house_manager', 'superadmin'].includes(currentRole) || roles.includes('hr_office')) && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-xs tracking-wider">
              {!collapsed && 'Administration'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {getAdminMenuItems().map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                      >
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/profile')}>
              <NavLink
                to="/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
              >
                <Settings className="h-5 w-5" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={signOut}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>Sign Out</span>}
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {!collapsed && profile && (
          <div className="mt-4 px-3 py-3 bg-sidebar-accent/50 rounded-lg">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile.full_name}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {profile.department || profile.email}
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
