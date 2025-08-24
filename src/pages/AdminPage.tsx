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
import { useAuth } from "@/contexts/AuthContext";
import DeviceManagement from "@/components/DeviceManagement";
import UserManagement from "@/components/UserManagement";
import AdminDashboard from "@/components/AdminDashboard";
import TeamMemberManagement from "@/components/TeamMemberManagement";
// import AnalyticsDashboard from "@/components/AnalyticsDashboard";
// import { 
//   BarChart, 
//   Bar, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell
// } from "recharts";
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
  UserPlus
} from "lucide-react";

const AdminPage = () => {
  const { user } = useAuth();
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

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/admin-login');
      return;
    }
    
    if (user.userRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard statistics
      const statsResponse = await fetch('http://localhost:5000/api/device-donations/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
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
      const donationsResponse = await fetch('http://localhost:5000/api/device-donations/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (donationsResponse.ok) {
        const donationsData = await donationsResponse.json();
        setRecentDonations(donationsData.donations || []);
      }
      
      // Fetch pending devices
      const pendingResponse = await fetch('http://localhost:5000/api/device-donations/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
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
    setSelectedTab(value);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/admin-login');
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
              {/* Quick Stats */}
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
                    <p className="text-xs text-green-100">All devices</p>
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
                    <p className="text-xs text-orange-100">Device posts awaiting review</p>
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
                    <p className="text-xs text-purple-100">All device requests</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Donations - Latest 5 Only */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                    <CardTitle className="text-white">Latest Device Donations (Latest 5)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {recentDonations.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No recent donations</p>
                        </div>
                      ) : (
                        recentDonations.slice(0, 5).map((donation: any) => (
                          <div key={donation._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                <Gift className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900">{donation.title}</p>
                                <p className="text-xs text-gray-500">{donation.deviceType}</p>
                              </div>
                            </div>
                            <Badge 
                              variant={donation.status === 'approved' ? 'default' : 'secondary'}
                              className={donation.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                            >
                              {donation.status}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Devices */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                    <CardTitle className="text-white">Pending Device Approvals</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {pendingDevices.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No pending approvals</p>
                        </div>
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
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              Pending
                            </Badge>
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
          {selectedTab === "devices" && <DeviceManagement />}

          {/* Users Tab */}
          {selectedTab === "users" && <UserManagement />}

          {/* Admin Dashboard Tab */}
          {selectedTab === "dashboard" && <AdminDashboard />}

          {/* Team Members Tab */}
          {selectedTab === "team" && <TeamMemberManagement />}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;