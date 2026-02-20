import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import AccommodationList from "./pages/accommodation/AccommodationList";
import AccommodationRequest from "./pages/accommodation/AccommodationRequest";
import FoodOrdering from "./pages/food/FoodOrdering";
import FacilitiesList from "./pages/facilities/FacilitiesList";
import FacilityRequest from "./pages/facilities/FacilityRequest";
import UserApprovals from "./pages/admin/UserApprovals";
import BookingApprovals from "./pages/admin/BookingApprovals";
import UserManagement from "./pages/admin/UserManagement";
import ManageAccommodations from "./pages/admin/ManageAccommodations";
import ManageMenu from "./pages/admin/ManageMenu";
import ManageFacilities from "./pages/admin/ManageFacilities";
import AdminRoleManagement from "./pages/admin/AdminRoleManagement";
import Reports from "./pages/admin/Reports";
import FoodOrders from "./pages/admin/FoodOrders";
import MyBookings from "./pages/bookings/MyBookings";
import Notifications from "./pages/notifications/Notifications";
import Profile from "./pages/profile/Profile";
import HRDashboard from "./pages/hr/HRDashboard";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/accommodation" element={<AccommodationList />} />
              <Route path="/accommodation/request" element={<AccommodationRequest />} />
              <Route path="/food" element={<FoodOrdering />} />
              <Route path="/facilities" element={<FacilitiesList />} />
              <Route path="/facilities/request" element={<FacilityRequest />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/bookings" element={<MyBookings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/hr" element={<HRDashboard />} />
              
              {/* Admin Routes */}
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/approvals" element={<UserApprovals />} />
              <Route path="/admin/food-orders" element={<FoodOrders />} />
              <Route path="/admin/roles" element={<AdminRoleManagement />} />
              <Route path="/admin/accommodations" element={<ManageAccommodations />} />
              <Route path="/admin/menu" element={<ManageMenu />} />
              <Route path="/admin/facilities" element={<ManageFacilities />} />
              <Route path="/admin/booking-approvals" element={<BookingApprovals />} />
              <Route path="/admin/reports" element={<Reports />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
