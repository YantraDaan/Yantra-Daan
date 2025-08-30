import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import DeviceManagement from "@/components/DeviceManagement";
import UserManagement from "@/components/UserManagement";
import AdminDashboard from "@/components/AdminDashboard";
import TeamMemberManagement from "@/components/TeamMemberManagement";
import NoDataFound from "@/components/NoDataFound";
import { 
  Users, 
  Gift, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  XCircle,
  Shield,
  BarChart3,
  Smartphone,
  RefreshCw,
  LogOut,
  UserPlus,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  GraduationCap,
  User,
  Search
} from "lucide-react";
import { config } from "@/config/env";

const AdminPage = () => {
  const { user, isTokenValid } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalDevices: 0,
    totalRequests: 0,
    pendingDevices: 0,
    approvedDevices: 0,
    rejectedDevices: 0,
  });
  
  const [recentUsers, setRecentUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  
  // Device details dialog state
  const [isDeviceDetailsOpen, setIsDeviceDetailsOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Check if user is admin
  useEffect(() => {
    // Add a small delay to allow auth state to stabilize
    const authCheckTimer = setTimeout(() => {
      // Only redirect if we're absolutely sure there's no valid user
      if (!user) {
        console.log('No user found, redirecting to admin login');
        navigate('/admin-login');
        return;
      }
      
      // Check if user is admin
      if (user.userRole !== 'admin') {
        console.log('User is not admin, redirecting to home');
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
      
      // Only fetch data if user is admin and not already loading
      if (user && user.userRole === 'admin' && !isLoading) {
        fetchDashboardData();
      }
    }, 500); // 500ms delay to allow auth state to stabilize

    return () => clearTimeout(authCheckTimer);
  }, [user, navigate, isLoading, toast]);

  // Auto-refresh filtered data when search terms change
  useEffect(() => {
    if (user && user.userRole === 'admin') {
      const debounceTimer = setTimeout(() => {
        // No search terms to filter, so no specific data fetching here
      }, 500);

      return () => clearTimeout(debounceTimer);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.userRole === 'admin') {
      const debounceTimer = setTimeout(() => {
        // No search terms to filter, so no specific data fetching here
      }, 500);

      return () => clearTimeout(debounceTimer);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('authToken');
      
      // Fetch dashboard statistics from admin endpoint
      const statsResponse = await fetch(`${config.apiUrl}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDashboardStats({
          totalUsers: statsData.totalUsers || 0,
          totalDevices: statsData.totalDevices || 0,
          totalRequests: statsData.totalRequests || 0,
          pendingDevices: statsData.pendingDevices || 0,
          approvedDevices: statsData.approvedDevices || 0,
          rejectedDevices: statsData.rejectedDevices || 0,
        });
      } else {
        console.error('Failed to fetch admin stats:', statsResponse.status);
        toast({
          title: "Warning",
          description: "Failed to load statistics data",
          variant: "destructive",
        });
      }
      
      // Fetch recent users (registered users)
      const usersResponse = await fetch(`${config.apiUrl}/api/admin/users?page=1&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setRecentUsers(usersData.users || []);
      } else {
        console.error('Failed to fetch recent users:', usersResponse.status);
        setRecentUsers([]);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch filtered data based on search terms
  const fetchFilteredData = async (type: 'donations' | 'pending', searchTerm: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const status = type === 'donations' ? 'approved' : 'pending';
      
      const response = await fetch(`${config.apiUrl}/api/admin/devices?page=1&limit=5&status=${status}&search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (type === 'donations') {
          // setRecentDonations(data.devices || []); // This state was removed
        } else {
          // setPendingDevices(data.devices || []); // This state was removed
        }
      } else {
        console.error(`Failed to fetch filtered ${type}:`, response.status);
        if (type === 'donations') {
          // setRecentDonations([]); // This state was removed
        } else {
          // setPendingDevices([]); // This state was removed
        }
      }
    } catch (error) {
      console.error(`Error fetching filtered ${type}:`, error);
      if (type === 'donations') {
        // setRecentDonations([]); // This state was removed
      } else {
        // setPendingDevices([]); // This state was removed
      }
    }
  };

  // Function to refresh all data
  const refreshAllData = async () => {
    await fetchDashboardData();
    // Also refresh filtered data if search terms exist
    // No search terms to refresh, so this is empty
  };

  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value);
    setSelectedTab(value);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/admin-login');
  };

  const showDonorInfo = (donor) => {
    // This function is no longer needed as recentDonations is removed
    // setSelectedDonor(donor);
    // setShowDonorDetails(true);
  };

  const showDeviceDetails = (device) => {
    // Show device details in popup instead of redirecting
    setSelectedDevice(device);
    setIsDeviceDetailsOpen(true);
  };

  if (!user || user.userRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-lg border-b sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">YANTRADAAN</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-white/90">
                Welcome, <span className="font-semibold text-white">{user.name}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                size="sm"
                className="border-white/20 text-white bg-white/10 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed Tabs Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-16 z-40 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-16 bg-transparent border-0">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-blue-50"
              >
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="devices" 
                className="flex items-center gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-green-50"
              >
                <Smartphone className="w-4 h-4" />
                Devices
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex items-center gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-orange-50"
              >
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-purple-50"
              >
                <BarChart3 className="w-4 h-4" />
                Requests
              </TabsTrigger>
              <TabsTrigger 
                value="team" 
                className="flex items-center gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-indigo-50"
              >
                <UserPlus className="w-4 h-4" />
                Team
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Refresh Button - Only for Overview */}
        {selectedTab === "overview" && (
          <div className="mb-6 flex justify-end">
            <Button 
              onClick={refreshAllData} 
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        )}
        
        {/* Tab Content */}
        <div className="w-full">
          {/* Overview Tab */}
          {selectedTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-100">Total Users</CardTitle>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{dashboardStats.totalUsers}</div>
                    <p className="text-xs text-blue-100">Registered users</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 bg-white/20 border-white/30 text-white hover:bg-white/30"
                      onClick={() => setSelectedTab("users")}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-100">Total Devices</CardTitle>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Gift className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{dashboardStats.totalDevices}</div>
                    <p className="text-xs text-green-100">Donated items</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 bg-white/20 border-white/30 text-white hover:bg-white/30"
                      onClick={() => setSelectedTab("devices")}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-100">Total Requests</CardTitle>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{dashboardStats.totalRequests}</div>
                    <p className="text-xs text-purple-100">Device requests</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 bg-white/20 border-white/30 text-white hover:bg-white/30"
                      onClick={() => setSelectedTab("dashboard")}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-100">Pending Approvals</CardTitle>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{dashboardStats.pendingDevices}</div>
                    <p className="text-xs text-orange-100">Awaiting review</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 bg-white/20 border-white/30 text-white hover:bg-white/30"
                      onClick={() => setSelectedTab("devices")}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-100">Approved Devices</CardTitle>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.approvedDevices}</div>
                    <p className="text-xs text-emerald-100">Successfully approved</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-100">Rejected Devices</CardTitle>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.rejectedDevices}</div>
                    <p className="text-xs text-red-100">Not approved</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-indigo-100">Success Rate</CardTitle>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardStats.totalDevices > 0 
                        ? Math.round((dashboardStats.approvedDevices / dashboardStats.totalDevices) * 100)
                        : 0}%
                    </div>
                    <p className="text-xs text-indigo-100">Approval rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Direct Data Display */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users Card */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                    <CardTitle className="text-white">Recent Users</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {recentUsers.length === 0 ? (
                        <NoDataFound
                          title="No recent users"
                          description="No new users have registered recently"
                          imageType="users"
                          variant="compact"
                        />
                      ) : (
                        recentUsers.slice(0, 5).map((user: any) => (
                          <div key={user._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900">{user.name || 'Anonymous'}</p>
                                <p className="text-xs text-gray-500">{user.userRole || 'User'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {user.userRole || 'User'}
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => showDonorInfo(user)}
                                className="h-8 px-2"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Platform Activity Card */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                    <CardTitle className="text-white">Platform Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="text-2xl font-bold text-purple-600">{dashboardStats.totalUsers}</div>
                          <p className="text-sm text-purple-600">Total Users</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="text-2xl font-bold text-purple-600">{dashboardStats.totalDevices}</div>
                          <p className="text-sm text-purple-600">Total Devices</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="text-2xl font-bold text-purple-600">{dashboardStats.totalRequests}</div>
                          <p className="text-sm text-purple-600">Total Requests</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="text-2xl font-bold text-purple-600">{dashboardStats.pendingDevices}</div>
                          <p className="text-sm text-purple-600">Pending Approvals</p>
                        </div>
                      </div>

                      <div className="text-center">
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedTab("dashboard")}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          View All Activity
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Devices Tab */}
          {selectedTab === "devices" && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Device Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6">Manage all device donations and approvals</p>
                <DeviceManagement />
              </CardContent>
            </Card>
          )}

          {/* Users Tab */}
          {selectedTab === "users" && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6">Manage user accounts and roles</p>
                <UserManagement />
              </CardContent>
            </Card>
          )}

          {/* Admin Dashboard Tab */}
          {selectedTab === "dashboard" && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Request Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6">Review and manage device requests</p>
                <AdminDashboard />
              </CardContent>
            </Card>
          )}

          {/* Team Members Tab */}
          {selectedTab === "team" && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Team Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6">Manage team members and roles</p>
                <TeamMemberManagement />
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Device Details Dialog */}
      <Dialog open={isDeviceDetailsOpen} onOpenChange={setIsDeviceDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Device Details
            </DialogTitle>
          </DialogHeader>
          {selectedDevice && (
            <div className="space-y-6">
              {/* Device Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Device Title</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-lg">{selectedDevice.title}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Device Type</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{selectedDevice.deviceType}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Condition</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{selectedDevice.condition}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {selectedDevice.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Device Description */}
              {selectedDevice.description && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm leading-relaxed">{selectedDevice.description}</p>
                  </div>
                </div>
              )}

              {/* Device Owner Information */}
              {selectedDevice.ownerInfo && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Device Owner</Label>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{selectedDevice.ownerInfo.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{selectedDevice.ownerInfo.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{selectedDevice.ownerInfo.contact || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Device Location */}
              {selectedDevice.location && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Location</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {selectedDevice.location.city}, {selectedDevice.location.state}
                    </span>
                  </div>
                </div>
              )}

              {/* Device Images */}
              {selectedDevice.images && selectedDevice.images.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Device Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedDevice.images.map((image: any, index: number) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Device ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Device Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Created Date</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {selectedDevice.createdAt ? new Date(selectedDevice.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {selectedDevice.updatedAt ? new Date(selectedDevice.updatedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeviceDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setIsDeviceDetailsOpen(false);
                    setSelectedTab("devices");
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  View in Devices Tab
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;