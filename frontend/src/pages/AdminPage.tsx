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
  User
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
  
  const [recentDonations, setRecentDonations] = useState([]);
  const [pendingDevices, setPendingDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  
  // Donor details dialog state
  const [showDonorDetails, setShowDonorDetails] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);

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

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard statistics
      const token = localStorage.getItem('authToken');
      const statsResponse = await fetch(`${config.apiUrl}${config.endpoints.donations}/stats`, {
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
      }
      
      // Fetch recent donations
      const donationsResponse = await fetch(`${config.apiUrl}${config.endpoints.donations}/recent`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (donationsResponse.ok) {
        const donationsData = await donationsResponse.json();
        setRecentDonations(donationsData.donations || []);
      }
      
      // Fetch pending devices
      const pendingResponse = await fetch(`${config.apiUrl}${config.endpoints.donations}/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingDevices(pendingData.devices || []);
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
    setSelectedDonor(donor);
    setShowDonorDetails(true);
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
              onClick={fetchDashboardData} 
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

              {/* Recent Activity Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Donations Card */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                    <CardTitle className="text-white">Recent Device Donations</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {recentDonations.length === 0 ? (
                        <NoDataFound
                          title="No recent donations"
                          description="No new devices have been donated recently"
                          imageType="devices"
                          variant="compact"
                        />
                      ) : (
                        recentDonations.slice(0, 5).map((donation: any) => (
                          <div key={donation._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 hover:border-green-200 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                <Gift className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900">{donation.title}</p>
                                <p className="text-xs text-gray-500">{donation.deviceType}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {donation.status}
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => showDonorInfo(donation.ownerInfo)}
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

                {/* Pending Devices Card */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                    <CardTitle className="text-white">Pending Device Approvals</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {pendingDevices.length === 0 ? (
                        <NoDataFound
                          title="No pending approvals"
                          description="All devices have been reviewed and processed"
                          imageType="devices"
                          variant="compact"
                        />
                      ) : (
                        pendingDevices.map((device: any) => (
                          <div key={device._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100 hover:border-orange-200 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                <Smartphone className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900">{device.title}</p>
                                <p className="text-xs text-gray-500">{device.deviceType}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                Pending
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => showDonorInfo(device.ownerInfo)}
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

      {/* Donor Details Dialog */}
      <Dialog open={showDonorDetails} onOpenChange={setShowDonorDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Donor Information
            </DialogTitle>
          </DialogHeader>
          {selectedDonor && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{selectedDonor.name || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{selectedDonor.email || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Contact</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{selectedDonor.contact || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">User Type</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    {selectedDonor.isOrganization ? (
                      <Building2 className="w-4 h-4 text-gray-400" />
                    ) : (
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="font-medium">
                      {selectedDonor.isOrganization ? 'Organization' : 'Individual'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {selectedDonor.profession && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Profession</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{selectedDonor.profession}</span>
                  </div>
                </div>
              )}

              {selectedDonor.address && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{selectedDonor.address}</span>
                  </div>
                </div>
              )}

              {selectedDonor.about && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">About</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm leading-relaxed">{selectedDonor.about}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDonorDetails(false)}
                >
                  Close
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