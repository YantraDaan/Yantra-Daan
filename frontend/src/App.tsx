import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import DonationsPage from "./pages/DonationsPage";
import RequestsPage from "./pages/RequestsPage";
import DonatePage from "./pages/DonatePage";
import LoginPage from "./pages/LoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import DonorLoginPage from "./pages/DonorLoginPage";
import SignupPage from "./pages/SignupPage";
import EmailCheckPage from "./pages/EmailCheckPage";
import AdminPage from "./pages/AdminPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import TeamPage from "./pages/TeamPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import DevicePost from "./components/DevicePost";
import DeviceBrowse from "./components/DeviceBrowse";
import DeviceDetailPage from "./pages/DeviceDetailPage";
import { RequireAuth, RequireGuest, RequireAdmin } from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        {!isAdminPage && <Header />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/donations" element={<DonationsPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/donate" element={<DonatePage />} />
            
            {/* Public Auth Routes */}
            <Route path="/login" element={
              <RequireGuest>
                <LoginPage />
              </RequireGuest>
            } />
            <Route path="/donor-login" element={
              <RequireGuest>
                <DonorLoginPage />
              </RequireGuest>
            } />
            <Route path="/admin-login" element={
              <RequireGuest>
                <AdminLoginPage />
              </RequireGuest>
            } />
            <Route path="/email-check" element={
              <RequireGuest>
                <EmailCheckPage />
              </RequireGuest>
            } />
            <Route path="/signup" element={
              <RequireGuest>
                <SignupPage />
              </RequireGuest>
            } />
            <Route path="/forgot-password" element={
              <RequireGuest>
                <ForgotPasswordPage />
              </RequireGuest>
            } />
            <Route path="/reset-password" element={
              <RequireGuest>
                <ResetPasswordPage />
              </RequireGuest>
            } />
            
            {/* Protected Routes */}
            <Route path="/admin" element={
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            } />
            <Route path="/profile" element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            } />
            <Route path="/devices" element={
              <RequireAuth>
                <DeviceBrowse />
              </RequireAuth>
            } />
            <Route path="/devices/post" element={
              <RequireAuth>
                <DevicePost />
              </RequireAuth>
            } />
            <Route path="/devices/:deviceId" element={
              <RequireAuth>
                <DeviceDetailPage />
              </RequireAuth>
            } />
            
            {/* Public Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isAdminPage && <Footer />}
      </div>
    </ErrorBoundary>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;