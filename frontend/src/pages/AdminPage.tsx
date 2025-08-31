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
  Search,
  Download,
  Pencil,
  Trash2,
  Laptop,
  Tablet,
  FileText,
  Image,
  Tag
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
  const [allDevices, setAllDevices] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDevicesLoading, setIsDevicesLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isRefreshLoading, setIsRefreshLoading] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [hasInitialDevices, setHasInitialDevices] = useState(false);
  const [hasInitialUsers, setHasInitialUsers] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  
  // Device tab pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDevices, setTotalDevices] = useState(0);
  const [deviceFilters, setDeviceFilters] = useState({
    status: 'all',
    deviceType: 'all',
    condition: 'all'
  });
  
  // User tab pagination and filter states
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userFilters, setUserFilters] = useState({
    role: 'all',
    status: 'all',
    organization: 'all'
  });
  
  // Device details dialog state
  const [isDeviceDetailsOpen, setIsDeviceDetailsOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  
  // User details dialog state
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Team member details dialog state
  const [isTeamMemberDetailsOpen, setIsTeamMemberDetailsOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  
  // Edit device dialog state
  const [isEditDeviceOpen, setIsEditDeviceOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    deviceType: '',
    condition: '',
    status: '',
    description: '',
    location: {
      city: '',
      state: ''
    },
    brand: '',
    model: '',
    year: '',
    specifications: ''
  });
  
  // Edit user dialog state
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserFormData, setEditUserFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    profession: '',
    userRole: '',
    isActive: true,
    isOrganization: false,
    emailUpdates: true,
    location: {
      city: '',
      state: ''
    }
  });
  
  // Delete confirmation dialog state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  
  // Delete user confirmation dialog state
  const [isDeleteUserConfirmOpen, setIsDeleteUserConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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
    }, 500); // 500ms delay to allow auth state to stabilize

    return () => clearTimeout(authCheckTimer);
  }, [user, navigate, toast]);

  // Load data automatically on first visit
  useEffect(() => {
    if (user && user.userRole === 'admin' && !hasInitialData) {
      // Auto-load data on first visit only
      fetchDashboardData();
      setHasInitialData(true);
    }
  }, [user, hasInitialData]);

  // Load devices data when Devices tab is first selected
  useEffect(() => {
    if (selectedTab === "devices" && user && user.userRole === 'admin' && !hasInitialDevices) {
      // Only load if devices tab is selected and hasn't been loaded yet
      fetchAllDevices();
      setHasInitialDevices(true);
    }
  }, [selectedTab, user, hasInitialDevices]);

  // Load users data when Users tab is first selected
  useEffect(() => {
    if (selectedTab === "users" && user && user.userRole === 'admin' && !hasInitialUsers) {
      // Only load if users tab is selected and hasn't been loaded yet
      fetchAllUsers();
      setHasInitialUsers(true);
    }
  }, [selectedTab, user, hasInitialUsers]);

  // No search functionality needed - data loads directly

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
      
      // Fetch recent device donations
      const donationsResponse = await fetch(`${config.apiUrl}/api/admin/devices?page=1&limit=5&status=approved`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (donationsResponse.ok) {
        const donationsData = await donationsResponse.json();
        setRecentDonations(donationsData.devices || []);
      } else {
        console.error('Failed to fetch recent donations:', donationsResponse.status);
        setRecentDonations([]);
      }
      
      // Fetch pending device approvals
      const pendingResponse = await fetch(`${config.apiUrl}/api/admin/devices?page=1&limit=5&status=pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingDevices(pendingData.devices || []);
      } else {
        console.error('Failed to fetch pending devices:', pendingResponse.status);
        setPendingDevices([]);
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

  const fetchAllDevices = async (page = 1, filters = deviceFilters) => {
    try {
      setIsDevicesLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Build query parameters - start with basic parameters
      const params = new URLSearchParams();
      
      // Add pagination if supported
      if (page > 1) params.append('page', page.toString());
      params.append('limit', '12'); // Show 12 devices per page (4 rows of 3)
      
      // Add filters if they exist and are not "all"
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.deviceType && filters.deviceType !== 'all') params.append('deviceType', filters.deviceType);
      if (filters.condition && filters.condition !== 'all') params.append('condition', filters.condition);
      
      // Fetch devices with pagination and filters
      const response = await fetch(`${config.apiUrl}/api/admin/devices?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        
        // Handle different response structures
        const devices = data.devices || data.data || [];
        const total = data.total || data.count || devices.length;
        const totalPages = data.totalPages || Math.ceil(total / 12) || 1;
        
        setAllDevices(devices);
        setTotalPages(totalPages);
        setTotalDevices(total);
        setCurrentPage(page);
        console.log('Fetched devices:', devices);
      } else {
        console.error('Failed to fetch all devices:', response.status);
        setAllDevices([]);
        setTotalPages(1);
        setTotalDevices(0);
        toast({
          title: "Error",
          description: `Failed to load devices (${response.status})`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching all devices:', error);
      setAllDevices([]);
      setTotalPages(1);
      setTotalDevices(0);
      toast({
        title: "Error",
        description: "Failed to load devices",
        variant: "destructive",
      });
    } finally {
      setIsDevicesLoading(false);
    }
  };

  const fetchAllUsers = async (page = 1, filters = userFilters) => {
    try {
      setIsUsersLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add pagination
      if (page > 1) params.append('page', page.toString());
      params.append('limit', '12'); // Show 12 users per page (4 rows of 3)
      
      // Add filters if they exist and are not "all"
      if (filters.role && filters.role !== 'all') params.append('role', filters.role);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.organization && filters.organization !== 'all') params.append('organization', filters.organization);
      
      // Fetch users with pagination and filters
      const response = await fetch(`${config.apiUrl}/api/admin/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Users API Response:', data);
        
        // Handle different response structures
        const users = data.users || data.data || [];
        const total = data.total || data.count || users.length;
        const totalPages = data.totalPages || Math.ceil(total / 12) || 1;
        
        setAllUsers(users);
        setTotalUserPages(totalPages);
        setTotalUsers(total);
        setCurrentUserPage(page);
        console.log('Fetched users:', users);
      } else {
        console.error('Failed to fetch all users:', response.status);
        setAllUsers([]);
        setTotalUserPages(1);
        setTotalUsers(0);
        toast({
          title: "Error",
          description: `Failed to load users (${response.status})`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
      setAllUsers([]);
      setTotalUserPages(1);
      setTotalUsers(0);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsUsersLoading(false);
    }
  };



  // Function to refresh all data
  const refreshAllData = async () => {
    try {
      setIsRefreshLoading(true);
      await fetchDashboardData();
      setHasInitialData(true); // Mark as loaded
    } finally {
      setIsRefreshLoading(false);
    }
  };

  // Function to refresh users tab
  const refreshUsersTab = () => {
    // Reset flag and refresh users data
    setHasInitialUsers(false);
    fetchAllUsers(currentUserPage, userFilters);
  };

  // Function to refresh requests tab
  const refreshRequestsTab = () => {
    // Force re-render of AdminDashboard component
    setSelectedTab("dashboard");
  };

  // Function to refresh team tab
  const refreshTeamTab = () => {
    // Force re-render of TeamMemberManagement component
    setSelectedTab("team");
  };

  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value);
    setSelectedTab(value);
    
    // Debug logging for devices tab
    if (value === "devices") {
      console.log('Devices tab selected, user:', user);
      console.log('User role:', user?.userRole);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/admin-login');
  };

  const exportUsersToExcel = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Fetch all users data
      const response = await fetch(`${config.apiUrl}/api/admin/users?page=1&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const users = data.users || [];
        
        // Prepare data for Excel
        const excelData = users.map((user: any) => ({
          'User ID': user._id || '',
          'Name': user.name || 'Anonymous',
          'Email': user.email || '',
          'Phone': user.contact || '',
          'Role': user.userRole || 'User',
          'Location': user.location ? `${user.location.city || ''}, ${user.location.state || ''}` : '',
          'Registration Date': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
          'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
          'Status': user.isActive ? 'Active' : 'Inactive',
          'isOrganization': user.isOrganization ? 'Yes' : 'No',
          'emailUpdates' : user.emailUpdates ? 'Yes' : 'No',
          'profession' : user.profession || ''
        }));
        
        // Create CSV content
        const headers = Object.keys(excelData[0]);
        const csvContent = [
          headers.join(','),
          ...excelData.map(row => 
            headers.map(header => {
              const value = row[header];
              // Escape commas and quotes in CSV
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            }).join(',')
          )
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export Successful",
          description: `Exported ${users.length} users to Excel file`,
          variant: "default",
        });
      } else {
        throw new Error('Failed to fetch users data');
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export users data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportDevicesToExcel = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Fetch all devices data
      const response = await fetch(`${config.apiUrl}/api/admin/devices?page=1&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const devices = data.devices || [];
        
        // Prepare data for Excel
        const excelData = devices.map((device: any) => ({
          'Device ID': device._id || '',
          'Title': device.title || 'Untitled',
          'Device Type': device.deviceType || 'Unknown',
          'Condition': device.condition || 'Unknown',
          'Status': device.status || 'Unknown',
          'Description': device.description || '',
          'Owner Name': device.ownerInfo?.name || 'Anonymous',
          'Owner Email': device.ownerInfo?.email || '',
          'Owner Phone': device.ownerInfo?.contact || '',
          'Location': device.location ? `${device.location.city || ''}, ${device.location.state || ''}` : '',
          'Donation Date': device.createdAt ? new Date(device.createdAt).toLocaleDateString() : '',
          'Last Updated': device.updatedAt ? new Date(device.updatedAt).toLocaleDateString() : ''
        }));
        
        // Create CSV content
        const headers = Object.keys(excelData[0]);
        const csvContent = [
          headers.join(','),
          ...excelData.map(row => 
            headers.map(header => {
              const value = row[header];
              // Escape commas and quotes in CSV
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            }).join(',')
          )
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `devices_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export Successful",
          description: `Exported ${devices.length} devices to Excel file`,
          variant: "default",
        });
      } else {
        throw new Error('Failed to fetch devices data');
      }
    } catch (error) {
      console.error('Error exporting devices:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export devices data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportRequestsToExcel = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Fetch all device requests data
      const response = await fetch(`${config.apiUrl}/api/device-requests/admin/all?page=1&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const requests = data.requests || [];
        
        // Prepare data for Excel
        const excelData = requests.map((request: any) => ({
          'Request ID': request._id || '',
          'Requester Name': request.requesterInfo?.name || 'Anonymous',
          'Requester Email': request.requesterInfo?.email || '',
          'Requester Phone': request.requesterInfo?.contact || '',
          'Device Title': request.deviceInfo?.title || 'Unknown Device',
          'Device Type': request.deviceInfo?.deviceType || 'Unknown',
          'Device Condition': request.deviceInfo?.condition || 'Unknown',
          'Request Message': request.message || '',
          'Status': request.status || 'Pending',
          'Request Date': request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '',
          'Last Updated': request.updatedAt ? new Date(request.updatedAt).toLocaleDateString() : ''
        }));
        
        // Create CSV content
        const headers = Object.keys(excelData[0]);
        const csvContent = [
          headers.join(','),
          ...excelData.map(row => 
            headers.map(header => {
              const value = row[header];
              // Escape commas and quotes in CSV
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            }).join(',')
          )
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `requests_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export Successful",
          description: `Exported ${requests.length} requests to Excel file`,
          variant: "default",
        });
      } else {
        throw new Error('Failed to fetch requests data');
      }
    } catch (error) {
      console.error('Error exporting requests:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export requests data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  const showUserDetails = (user) => {
    // Show user details in popup
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  const showTeamMemberDetails = (teamMember) => {
    // Show team member details in popup
    setSelectedTeamMember(teamMember);
    setIsTeamMemberDetailsOpen(true);
  };

  const handleEditDevice = (device) => {
    console.log('Editing device:', device);
    setEditingDevice(device);
    const formData = {
      title: device.title || '',
      deviceType: device.deviceType || '',
      condition: device.condition || '',
      status: device.status || '',
      description: device.description || '',
      location: {
        city: device.location?.city || '',
        state: device.location?.state || ''
      },
      brand: device.brand || '',
      model: device.model || '',
      year: device.year || '',
      specifications: device.specifications || ''
    };
    console.log('Setting form data:', formData);
    setEditFormData(formData);
    setIsEditDeviceOpen(true);
  };

  const handleSaveDevice = async () => {
    if (!editingDevice) return;
    
    console.log('Saving device with data:', editFormData);
    console.log('Original device:', editingDevice);
    
    try {
      setIsActionLoading(true);
      const token = localStorage.getItem('authToken');
      
      // First update the device status if it changed
      if (editFormData.status !== editingDevice.status) {
        const statusResponse = await fetch(`${config.apiUrl}/api/devices/${editingDevice._id}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            status: editFormData.status,
            adminNotes: `Device updated by admin. New status: ${editFormData.status}`
          }),
        });

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json();
          throw new Error(errorData.error || 'Failed to update device status');
        }
      }
      
      // Now update device details using the admin-specific endpoint
      const updateData = {
        title: editFormData.title,
        deviceType: editFormData.deviceType,
        condition: editFormData.condition,
        description: editFormData.description,
        location: editFormData.location,
        brand: editFormData.brand,
        model: editFormData.model,
        year: editFormData.year,
        specifications: editFormData.specifications
      };
      
      const updateResponse = await fetch(`${config.apiUrl}/api/devices/admin/${editingDevice._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (updateResponse.ok) {
        toast({
          title: "Success",
          description: "Device details updated successfully",
          variant: "default",
        });
      } else {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update device details');
      }
      
      console.log('Saving device:', editingDevice._id, editFormData);
      
      setIsEditDeviceOpen(false);
      setEditingDevice(null);
      setEditFormData({
        title: '',
        deviceType: '',
        condition: '',
        status: '',
        description: '',
        location: {
          city: '',
          state: ''
        },
        brand: '',
        model: '',
        year: '',
        specifications: ''
      });
      
      // Refresh devices data
      if (selectedTab === "devices") {
        fetchAllDevices();
      }
    } catch (error) {
      console.error('Error saving device:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save device",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...deviceFilters, [filterType]: value };
    setDeviceFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    fetchAllDevices(1, newFilters);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAllDevices(page, deviceFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { status: 'all', deviceType: 'all', condition: 'all' };
    setDeviceFilters(clearedFilters);
    setCurrentPage(1);
    fetchAllDevices(1, clearedFilters);
  };

  const handleUserFilterChange = (filterType, value) => {
    const newFilters = { ...userFilters, [filterType]: value };
    setUserFilters(newFilters);
    setCurrentUserPage(1); // Reset to first page when filters change
    fetchAllUsers(1, newFilters);
  };

  const handleUserPageChange = (page) => {
    setCurrentUserPage(page);
    fetchAllUsers(page, userFilters);
  };

  const clearUserFilters = () => {
    const clearedFilters = { role: 'all', status: 'all', organization: 'all' };
    setUserFilters(clearedFilters);
    setCurrentUserPage(1);
    fetchAllUsers(1, clearedFilters);
  };

  const handleApproveDevice = async (device) => {
    try {
      setIsActionLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/devices/${device._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'approved',
          adminNotes: 'Device approved by admin'
        }),
      });

      if (response.ok) {
        toast({
          title: "Device Approved",
          description: `Device "${device.title}" has been approved successfully`,
          variant: "default",
        });
        // Refresh devices data
        if (selectedTab === "devices") {
          fetchAllDevices();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve device');
      }
    } catch (error) {
      console.error('Error approving device:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve device",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectDevice = async (device) => {
    try {
      setIsActionLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/devices/${device._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'rejected',
          adminNotes: 'Device rejected by admin'
        }),
      });

      if (response.ok) {
        toast({
          title: "Device Rejected",
          description: `Device "${device.title}" has been rejected`,
          variant: "default",
        });
        // Refresh devices data
        if (selectedTab === "devices") {
          fetchAllDevices();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject device');
      }
    } catch (error) {
      console.error('Error rejecting device:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject device",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteDevice = (device) => {
    setDeviceToDelete(device);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteDevice = async () => {
    if (!deviceToDelete) return;
    
    try {
      setIsActionLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/devices/admin/${deviceToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Device Deleted",
          description: `Device "${deviceToDelete.title}" has been deleted successfully`,
          variant: "default",
        });
        
        // Close dialog and reset state
        setIsDeleteConfirmOpen(false);
        setDeviceToDelete(null);
        
        // Refresh devices data
        if (selectedTab === "devices") {
          fetchAllDevices();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete device');
      }
          } catch (error) {
        console.error('Error deleting device:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete device",
          variant: "destructive",
        });
      } finally {
        setIsActionLoading(false);
      }
  };

  // User action functions
  const handleEditUser = (user) => {
    console.log('Editing user:', user);
    setEditingUser(user);
    const formData = {
      name: user.name || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      contact: user.contact || '',
      profession: user.profession || '',
      userRole: user.userRole || '',
      isActive: user.isActive !== undefined ? user.isActive : true,
      isOrganization: user.isOrganization || false,
      emailUpdates: user.emailUpdates !== undefined ? user.emailUpdates : true,
      location: {
        city: user.location?.city || '',
        state: user.location?.state || ''
      }
    };
    console.log('Setting user form data:', formData);
    setEditUserFormData(formData);
    setIsEditUserOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    console.log('Saving user with data:', editUserFormData);
    console.log('Original user:', editingUser);
    
    try {
      setIsActionLoading(true);
      const token = localStorage.getItem('authToken');
      
      const updateData = {
        name: editUserFormData.name,
        firstName: editUserFormData.firstName,
        lastName: editUserFormData.lastName,
        email: editUserFormData.email,
        contact: editUserFormData.contact,
        profession: editUserFormData.profession,
        userRole: editUserFormData.userRole,
        isActive: editUserFormData.isActive,
        isOrganization: editUserFormData.isOrganization,
        emailUpdates: editUserFormData.emailUpdates,
        location: editUserFormData.location
      };
      
      const response = await fetch(`${config.apiUrl}/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User details updated successfully",
          variant: "default",
        });
        
        setIsEditUserOpen(false);
        setEditingUser(null);
        setEditUserFormData({
          name: '',
          firstName: '',
          lastName: '',
          email: '',
          contact: '',
          profession: '',
          userRole: '',
          isActive: true,
          isOrganization: false,
          emailUpdates: true,
          location: {
            city: '',
            state: ''
          }
        });
        
        // Refresh users data
        if (selectedTab === "users") {
          fetchAllUsers();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      setIsActionLoading(true);
      const token = localStorage.getItem('authToken');
      
      const newStatus = !user.isActive;
      
      const response = await fetch(`${config.apiUrl}/api/admin/users/${user._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isActive: newStatus,
          adminNotes: `User status ${newStatus ? 'activated' : 'deactivated'} by admin`
        }),
      });

      if (response.ok) {
        toast({
          title: `User ${newStatus ? 'Activated' : 'Deactivated'}`,
          description: `User "${user.name || user.firstName + ' ' + user.lastName}" has been ${newStatus ? 'activated' : 'deactivated'}`,
          variant: "default",
        });
        
        // Refresh users data
        if (selectedTab === "users") {
          fetchAllUsers();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteUserConfirmOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsActionLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/admin/users/${userToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "User Deleted",
          description: `User "${userToDelete.name || userToDelete.firstName + ' ' + userToDelete.lastName}" has been deleted successfully`,
          variant: "default",
        });
        
        // Close dialog and reset state
        setIsDeleteUserConfirmOpen(false);
        setUserToDelete(null);
        
        // Refresh users data
        if (selectedTab === "users") {
          fetchAllUsers();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUserInputChange = (field, value) => {
    setEditUserFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'laptop':
        return <Laptop className="w-5 h-5 text-white" />;
      case 'mobile':
      case 'smartphone':
        return <Smartphone className="w-5 h-5 text-white" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-white" />;
      default:
        return <Gift className="w-5 h-5 text-white" />;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionBadgeColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'donor':
        return 'bg-blue-100 text-blue-800';
      case 'requester':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
                className="flex items-center gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-emerald-400 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-green-50"
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
              disabled={isRefreshLoading}
              variant="outline"
              size="sm"
              className="bg-white/80 backdrop-blur-sm border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        )}

        {/* Refresh Button - Only for Devices */}
        {selectedTab === "devices" && (
          <div className="mb-6 flex justify-end">
            <Button 
              onClick={() => {
                setHasInitialDevices(false); // Reset flag to allow fresh load
                fetchAllDevices(currentPage, deviceFilters);
              }} 
              disabled={isDevicesLoading}
              variant="outline"
              size="sm"
              className="bg-white/80 backdrop-blur-sm border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isDevicesLoading ? 'animate-spin' : ''}`} />
              Refresh Devices
            </Button>
          </div>
        )}

        {/* Refresh Button - Only for Users */}
        {selectedTab === "users" && (
          <div className="mb-6 flex justify-end">
            <Button 
              onClick={refreshUsersTab} 
              variant="outline"
              size="sm"
              className="bg-white/80 backdrop-blur-sm border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Users
            </Button>
          </div>
        )}

        {/* Refresh Button - Only for Requests */}
        {selectedTab === "dashboard" && (
          <div className="mb-6 flex justify-end">
            <Button 
              onClick={refreshRequestsTab} 
              variant="outline"
              size="sm"
              className="bg-white/80 backdrop-blur-sm border-purple-200 hover:border-purple-300 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Requests
            </Button>
          </div>
        )}

        {/* Refresh Button - Only for Team */}
        {selectedTab === "team" && (
          <div className="mb-6 flex justify-end">
            <Button 
              onClick={refreshTeamTab} 
              variant="outline"
              size="sm"
              className="bg-white/80 backdrop-blur-sm border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Team
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
                <Card className="bg-gradient-to-br from-green-200 to-emerald-300 text-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">Total Users</CardTitle>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-800">{dashboardStats.totalUsers}</div>
                    <p className="text-xs text-gray-600">Registered users</p>
                                                                                     <Button 
                         variant="outline" 
                         size="sm" 
                         className="mt-3 bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                         onClick={exportUsersToExcel}
                         disabled={isRefreshLoading}
                       >
                         <Download className="w-3 h-3 mr-1" />
                         Export Users
                       </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-200 to-blue-300 text-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">Total Devices</CardTitle>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Gift className="h-4 w-4 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-800">{dashboardStats.totalDevices}</div>
                    <p className="text-xs text-gray-600">Donated items</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
                      onClick={exportDevicesToExcel}
                      disabled={isRefreshLoading}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export Devices
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-200 to-purple-300 text-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">Total Requests</CardTitle>
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-800">{dashboardStats.totalRequests}</div>
                    <p className="text-xs text-gray-600">Device requests</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200"
                      onClick={exportRequestsToExcel}
                      disabled={isRefreshLoading}
                    >
                      <Download className="w-3 h-3 mr-1" /> 
                      Export Requests
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-200 to-orange-300 text-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">Pending Approvals</CardTitle>
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-800">{dashboardStats.pendingDevices}</div>
                    <p className="text-xs text-gray-600">Awaiting review</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200"
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
                {/* Recent Device Donations Card */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      Recent Device Donations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Donations List */}
                      {recentDonations.length === 0 ? (
                        <NoDataFound
                          title="No recent donations"
                          description="No device donations found"
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
                                <p className="font-medium text-sm text-gray-900">{donation.title || 'Untitled Device'}</p>
                                <p className="text-xs text-gray-500">{donation.deviceType || 'Unknown Type'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {donation.condition || 'Unknown'}
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => showDeviceDetails(donation)}
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

                {/* Pending Device Approvals Card */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Pending Device Approvals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Pending Devices List */}
                      {pendingDevices.length === 0 ? (
                        <NoDataFound
                          title="No pending approvals"
                          description="No devices awaiting approval"
                          imageType="devices"
                          variant="compact"
                        />
                      ) : (
                        pendingDevices.slice(0, 5).map((device: any) => (
                          <div key={device._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100 hover:border-orange-200 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                <Smartphone className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900">{device.title || 'Untitled Device'}</p>
                                <p className="text-xs text-gray-500">{device.deviceType || 'Unknown Type'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                {device.condition || 'Unknown'}
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => showDeviceDetails(device)}
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
            <div className="space-y-6">
              {/* Device Details Grid */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="text-white flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Device Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                  {/* Filter Controls */}
                  <div className="mb-6 space-y-4">
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Status:</Label>
                        <Select value={deviceFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Type:</Label>
                        <Select value={deviceFilters.deviceType} onValueChange={(value) => handleFilterChange('deviceType', value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="laptop">Laptop</SelectItem>
                            <SelectItem value="mobile">Mobile</SelectItem>
                            <SelectItem value="tablet">Tablet</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Condition:</Label>
                        <Select value={deviceFilters.condition} onValueChange={(value) => handleFilterChange('condition', value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button onClick={clearFilters} variant="outline" size="sm">
                        Clear Filters
                      </Button>
                    </div>
                    
                    {/* Results Summary */}
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>
                        Showing {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, totalDevices)} of {totalDevices} devices
                      </span>
                      <span>Page {currentPage} of {totalPages}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allDevices.length > 0 ? (
                      allDevices.map((device: any) => (
                        <Card key={device._id} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:border-green-300 transition-all duration-200 hover:shadow-md">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                {getDeviceIcon(device.deviceType)}
                              </div>
                              <Badge variant="secondary" className={getStatusBadgeColor(device.status)}>
                                {device.status || 'Approved'}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900 text-sm">{device.title || 'Untitled Device'}</h4>
                              <p className="text-xs text-gray-600">{device.deviceType || 'Unknown Type'}</p>
                              <p className="text-xs text-gray-600">Condition: {device.condition || 'Unknown'}</p>
                              {device.ownerInfo && (
                                <p className="text-xs text-gray-600">Owner: {device.ownerInfo.name || 'Anonymous'}</p>
                              )}
                            </div>
                            <div className="mt-3 flex justify-between items-center">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => showDeviceDetails(device)}
                                className="h-8 px-2 text-xs"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <div className="flex gap-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditDevice(device)}
                                  disabled={isActionLoading}
                                  className="h-8 px-2 text-xs bg-blue-50 border-blue-200 hover:bg-blue-100 disabled:opacity-50"
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleApproveDevice(device)}
                                  disabled={isActionLoading}
                                  className="h-8 px-2 text-xs bg-green-50 border-green-200 hover:bg-green-100 disabled:opacity-50"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRejectDevice(device)}
                                  disabled={isActionLoading}
                                  className="h-8 px-2 text-xs bg-red-50 border-red-200 hover:bg-red-100 disabled:opacity-50"
                                >
                                  <XCircle className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteDevice(device)}
                                  disabled={isActionLoading}
                                  className="h-8 px-2 text-xs bg-red-50 border-red-200 hover:bg-red-100 disabled:opacity-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
              </CardContent>
            </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center text-gray-500 py-8">
                        <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>{isDevicesLoading ? 'Loading devices...' : allDevices.length === 0 ? 'No devices found' : 'No devices match current filters'}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-center items-center gap-2">
                      <Button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isDevicesLoading}
                        variant="outline"
                        size="sm"
                      >
                        Previous
                      </Button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              disabled={isDevicesLoading}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isDevicesLoading}
                        variant="outline"
                        size="sm"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Tab */}
          {selectedTab === "users" && (
            <div className="space-y-6">
              {/* User Details Grid */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Filter Controls */}
                  <div className="mb-6 space-y-4">
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Role:</Label>
                        <Select value={userFilters.role} onValueChange={(value) => handleUserFilterChange('role', value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="donor">Donor</SelectItem>
                            <SelectItem value="requester">Requester</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Status:</Label>
                        <Select value={userFilters.status} onValueChange={(value) => handleUserFilterChange('status', value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Organization:</Label>
                        <Select value={userFilters.organization} onValueChange={(value) => handleUserFilterChange('organization', value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button onClick={clearUserFilters} variant="outline" size="sm">
                        Clear Filters
                      </Button>
                    </div>
                    
                    {/* Results Summary */}
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>
                        Showing {((currentUserPage - 1) * 12) + 1}-{Math.min(currentUserPage * 12, totalUsers)} of {totalUsers} users
                      </span>
                      <span>Page {currentUserPage} of {totalUserPages}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allUsers.length > 0 ? (
                      allUsers.map((user: any) => (
                        <Card key={user._id} className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 hover:border-orange-300 transition-all duration-200 hover:shadow-md">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex gap-1">
                                <Badge variant="secondary" className={getUserRoleBadgeColor(user.userRole)}>
                                  {user.userRole || 'User'}
                                </Badge>
                                <Badge variant="secondary" className={getUserStatusBadgeColor(user.isActive ? 'active' : 'inactive')}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900 text-sm">{user.name || user.firstName + ' ' + user.lastName || 'Anonymous User'}</h4>
                              <p className="text-xs text-gray-600">{user.email || 'No email'}</p>
                              {user.contact && (
                                <p className="text-xs text-gray-600">Phone: {user.contact}</p>
                              )}
                              {user.profession && (
                                <p className="text-xs text-gray-600">Profession: {user.profession}</p>
                              )}
                              {user.isOrganization && (
                                <p className="text-xs text-gray-600 text-orange-600 font-medium">Organization Account</p>
                              )}
                            </div>
                            <div className="mt-3 flex justify-between items-center">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => showUserDetails(user)}
                                className="h-8 px-2 text-xs bg-orange-50 border-orange-200 hover:bg-orange-100"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <div className="flex gap-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                  disabled={isActionLoading}
                                  className="h-8 px-2 text-xs bg-blue-50 border-blue-200 hover:bg-blue-100 disabled:opacity-50"
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleToggleUserStatus(user)}
                                  disabled={isActionLoading}
                                  className={`h-8 px-2 text-xs disabled:opacity-50 ${
                                    user.isActive 
                                      ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                                      : 'bg-green-50 border-green-200 hover:bg-green-100'
                                  }`}
                                >
                                  {user.isActive ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteUser(user)}
                                  disabled={isActionLoading}
                                  className="h-8 px-2 text-xs bg-red-50 border-red-200 hover:bg-red-100 disabled:opacity-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center text-gray-500 py-8">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>{isUsersLoading ? 'Loading users...' : allUsers.length === 0 ? 'No users found' : 'No users match current filters'}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalUserPages > 1 && (
                    <div className="mt-6 flex justify-center items-center gap-2">
                      <Button 
                        onClick={() => handleUserPageChange(currentUserPage - 1)}
                        disabled={currentUserPage === 1 || isUsersLoading}
                        variant="outline"
                        size="sm"
                      >
                        Previous
                      </Button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalUserPages) }, (_, i) => {
                          let pageNum;
                          if (totalUserPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentUserPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentUserPage >= totalUserPages - 2) {
                            pageNum = totalUserPages - 4 + i;
                          } else {
                            pageNum = currentUserPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              onClick={() => handleUserPageChange(pageNum)}
                              disabled={isUsersLoading}
                              variant={currentUserPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button 
                        onClick={() => handleUserPageChange(currentUserPage + 1)}
                        disabled={currentUserPage === totalUserPages || isUsersLoading}
                        variant="outline"
                        size="sm"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
                <TeamMemberManagement onShowMemberDetails={showTeamMemberDetails} />
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Device Details Dialog */}
      <Dialog open={isDeviceDetailsOpen} onOpenChange={setIsDeviceDetailsOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Smartphone className="w-6 h-6" />
              Device Details - {selectedDevice?.title || 'Unknown Device'}
            </DialogTitle>
          </DialogHeader>
          {selectedDevice && (
            <div className="space-y-6">
              {/* Device Basic Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Device Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-700">Device Title</Label>
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <span className="font-medium text-lg text-gray-800">{selectedDevice.title || 'Untitled'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-700">Device Type</Label>
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(selectedDevice.deviceType)}
                        <span className="font-medium text-gray-800 capitalize">{selectedDevice.deviceType || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-700">Condition</Label>
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <Badge variant="secondary" className={getConditionBadgeColor(selectedDevice.condition)}>
                        {selectedDevice.condition || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-700">Status</Label>
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <Badge variant="secondary" className={getStatusBadgeColor(selectedDevice.status)}>
                        {selectedDevice.status || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Additional Device Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-700">Device ID</Label>
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <span className="font-mono text-sm text-gray-600">{selectedDevice._id || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-700">Category</Label>
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <span className="font-medium text-gray-800 capitalize">{selectedDevice.category || 'General'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Description */}
              {selectedDevice.description && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Device Description
                  </h3>
                  <div className="p-4 bg-white rounded-lg border border-green-100">
                    <p className="text-sm leading-relaxed text-gray-700">{selectedDevice.description}</p>
                  </div>
                </div>
              )}

              {/* Additional Device Specifications */}
              {(selectedDevice.specifications || selectedDevice.brand || selectedDevice.model || selectedDevice.year) && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                  <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Additional Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedDevice.brand && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-amber-700">Brand</Label>
                        <div className="p-3 bg-white rounded-lg border border-amber-100">
                          <span className="font-medium text-gray-800">{selectedDevice.brand}</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedDevice.model && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-amber-700">Model</Label>
                        <div className="p-3 bg-white rounded-lg border border-amber-100">
                          <span className="font-medium text-gray-800">{selectedDevice.model}</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedDevice.year && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-amber-700">Year</Label>
                        <div className="p-3 bg-white rounded-lg border border-amber-100">
                          <span className="font-medium text-gray-800">{selectedDevice.year}</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedDevice.specifications && (
                      <div className="space-y-2 md:col-span-2 lg:col-span-3">
                        <Label className="text-sm font-medium text-amber-700">Technical Specifications</Label>
                        <div className="p-3 bg-white rounded-lg border border-amber-100">
                          <p className="text-sm text-gray-700">{selectedDevice.specifications}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comprehensive Owner Information */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Owner Information
                </h3>
                {selectedDevice.ownerInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-purple-700">Full Name</Label>
                      <div className="p-3 bg-white rounded-lg border border-purple-100">
                        <span className="font-medium text-gray-800">{selectedDevice.ownerInfo.name || selectedDevice.ownerInfo.firstName + ' ' + selectedDevice.ownerInfo.lastName || 'Anonymous'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-purple-700">Email Address</Label>
                      <div className="p-3 bg-white rounded-lg border border-purple-100">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-gray-800">{selectedDevice.ownerInfo.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-purple-700">Phone Number</Label>
                      <div className="p-3 bg-white rounded-lg border border-purple-100">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-gray-800">{selectedDevice.ownerInfo.contact || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedDevice.ownerInfo.firstName && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-purple-700">First Name</Label>
                        <div className="p-3 bg-white rounded-lg border border-purple-100">
                          <span className="font-medium text-gray-800">{selectedDevice.ownerInfo.firstName}</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedDevice.ownerInfo.lastName && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-purple-700">Last Name</Label>
                        <div className="p-3 bg-white rounded-lg border border-purple-100">
                          <span className="font-medium text-gray-800">{selectedDevice.ownerInfo.lastName}</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedDevice.ownerInfo.profession && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-purple-700">Profession</Label>
                        <div className="p-3 bg-white rounded-lg border border-purple-100">
                          <span className="font-medium text-gray-800">{selectedDevice.ownerInfo.profession}</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedDevice.ownerInfo.isOrganization && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-purple-700">Organization</Label>
                        <div className="p-3 bg-white rounded-lg border border-purple-100">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-purple-600" />
                            <span className="font-medium text-gray-800">Yes</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedDevice.ownerInfo.location && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-purple-700">Owner Location</Label>
                        <div className="p-3 bg-white rounded-lg border border-purple-100">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-purple-600" />
                            <span className="font-medium text-gray-800">
                              {selectedDevice.ownerInfo.location.city && selectedDevice.ownerInfo.location.state 
                                ? `${selectedDevice.ownerInfo.location.city}, ${selectedDevice.ownerInfo.location.state}`
                                : 'N/A'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-lg border border-purple-100">
                    <p className="text-gray-500 text-center">No owner information available</p>
                  </div>
                )}
              </div>

              {/* Device Location */}
              {selectedDevice.location && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-orange-700">City</Label>
                      <div className="p-3 bg-white rounded-lg border border-orange-100">
                        <span className="font-medium text-gray-800">{selectedDevice.location.city || 'N/A'}</span>
                  </div>
                </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-orange-700">State</Label>
                      <div className="p-3 bg-white rounded-lg border border-orange-100">
                        <span className="font-medium text-gray-800">{selectedDevice.location.state || 'N/A'}</span>
                      </div>
                    </div>
                    
                    {selectedDevice.location.country && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-orange-700">Country</Label>
                        <div className="p-3 bg-white rounded-lg border border-orange-100">
                          <span className="font-medium text-gray-800">{selectedDevice.location.country}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Device Images */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Device Images ({selectedDevice.images && selectedDevice.images.length > 0 ? selectedDevice.images.length : 0})
                </h3>
                {selectedDevice.images && selectedDevice.images.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedDevice.images.map((image: any, index: number) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-indigo-100 hover:border-indigo-300 transition-colors group">
                          <img 
                            src={image} 
                            alt={`Device ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-full items-center justify-center bg-gray-200 text-gray-500 text-sm">
                            <div className="text-center">
                              <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p>Image {index + 1}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-sm text-indigo-600">
                      <p>Click on images to view larger versions</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Image className="w-16 h-16 mx-auto mb-4 text-indigo-300" />
                    <p className="text-gray-500">No images available for this device</p>
                    <p className="text-sm text-gray-400 mt-2">Images will appear here when uploaded by the owner</p>
                  </div>
                )}
              </div>

              {/* Device Metadata */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Device Metadata
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Created Date</Label>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-800">
                        {selectedDevice.createdAt ? new Date(selectedDevice.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-800">
                        {selectedDevice.updatedAt ? new Date(selectedDevice.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeviceDetailsOpen(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setIsDeviceDetailsOpen(false);
                    handleEditDevice(selectedDevice);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Device
                </Button>
                <Button 
                  onClick={() => {
                    setIsDeviceDetailsOpen(false);
                    setSelectedTab("devices");
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View in Devices Tab
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <User className="w-6 h-6" />
              User Details - {selectedUser?.name || selectedUser?.firstName + ' ' + selectedUser?.lastName || 'Unknown User'}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Basic Information */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-orange-700">Full Name</Label>
                    <div className="p-3 bg-white rounded-lg border border-orange-100">
                      <span className="font-medium text-lg text-gray-800">
                        {selectedUser.name || selectedUser.firstName + ' ' + selectedUser.lastName || 'Anonymous User'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-orange-700">User Role</Label>
                    <div className="p-3 bg-white rounded-lg border border-orange-100">
                      <Badge variant="secondary" className={getUserRoleBadgeColor(selectedUser.userRole)}>
                        {selectedUser.userRole || 'User'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-orange-700">Status</Label>
                    <div className="p-3 bg-white rounded-lg border border-orange-100">
                      <Badge variant="secondary" className={getUserStatusBadgeColor(selectedUser.isActive ? 'active' : 'inactive')}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-orange-700">User ID</Label>
                    <div className="p-3 bg-white rounded-lg border border-orange-100">
                      <span className="font-mono text-sm text-gray-600">{selectedUser._id || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-700">Email Address</Label>
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-800">{selectedUser.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-700">Phone Number</Label>
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-800">{selectedUser.contact || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedUser.firstName && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-blue-700">First Name</Label>
                      <div className="p-3 bg-white rounded-lg border border-blue-100">
                        <span className="font-medium text-gray-800">{selectedUser.firstName}</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedUser.lastName && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-blue-700">Last Name</Label>
                      <div className="p-3 bg-white rounded-lg border border-blue-100">
                        <span className="font-medium text-gray-800">{selectedUser.lastName}</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedUser.profession && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-blue-700">Profession</Label>
                      <div className="p-3 bg-white rounded-lg border border-blue-100">
                        <span className="font-medium text-gray-800">{selectedUser.profession}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">Organization Account</Label>
                    <div className="p-3 bg-white rounded-lg border border-green-100">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-800">
                          {selectedUser.isOrganization ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">Email Updates</Label>
                    <div className="p-3 bg-white rounded-lg border border-green-100">
                      <span className="font-medium text-gray-800">
                        {selectedUser.emailUpdates ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">Account Status</Label>
                    <div className="p-3 bg-white rounded-lg border border-green-100">
                      <Badge variant="secondary" className={getUserStatusBadgeColor(selectedUser.isActive ? 'active' : 'inactive')}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              {selectedUser.location && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-purple-700">City</Label>
                      <div className="p-3 bg-white rounded-lg border border-purple-100">
                        <span className="font-medium text-gray-800">{selectedUser.location.city || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-purple-700">State</Label>
                      <div className="p-3 bg-white rounded-lg border border-purple-100">
                        <span className="font-medium text-gray-800">{selectedUser.location.state || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Metadata */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Account Metadata
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Registration Date</Label>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-800">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Last Login</Label>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-800">
                        {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setIsUserDetailsOpen(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setIsUserDetailsOpen(false);
                    setSelectedTab("users");
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View in Users Tab
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Device Dialog */}
      <Dialog open={isEditDeviceOpen} onOpenChange={setIsEditDeviceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Edit Device (Admin)
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              You can edit all device details including title, type, condition, status, description, and location.
            </p>
          </DialogHeader>
          {editingDevice && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Device Title</Label>
                  <Input 
                    id="edit-title"
                    value={editFormData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter device title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Device Type</Label>
                  <Select value={editFormData.deviceType} onValueChange={(value) => handleInputChange('deviceType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laptop">Laptop</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-condition">Condition</Label>
                  <Select value={editFormData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editFormData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter device description"
                  rows={4}
                />
              </div>

              {/* Additional Device Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-brand">Brand</Label>
                  <Input 
                    id="edit-brand"
                    value={editFormData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Enter device brand"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-model">Model</Label>
                  <Input 
                    id="edit-model"
                    value={editFormData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="Enter device model"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-year">Year</Label>
                  <Input 
                    id="edit-year"
                    type="number"
                    value={editFormData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    placeholder="Enter manufacturing year"
                    min="1990"
                    max={new Date().getFullYear()}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-specifications">Technical Specifications</Label>
                  <Textarea 
                    id="edit-specifications"
                    value={editFormData.specifications}
                    onChange={(e) => handleInputChange('specifications', e.target.value)}
                    placeholder="Enter technical specifications"
                    rows={3}
                  />
                </div>
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input 
                    id="edit-city"
                    value={editFormData.location.city}
                    onChange={(e) => handleInputChange('location', { ...editFormData.location, city: e.target.value })}
                    placeholder="Enter city"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-state">State</Label>
                  <Input 
                    id="edit-state"
                    value={editFormData.location.state}
                    onChange={(e) => handleInputChange('location', { ...editFormData.location, state: e.target.value })}
                    placeholder="Enter state"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDeviceOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveDevice}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete the device{" "}
              <span className="font-semibold text-gray-900">
                "{deviceToDelete?.title || 'Unknown Device'}"?
              </span>
            </p>
            <p className="text-sm text-gray-500">
              This action cannot be undone. The device will be permanently removed from the system.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDeleteDevice}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Device
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Edit User (Admin)
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              You can edit all user details including name, contact information, role, and account settings.
            </p>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-user-name">Full Name</Label>
                  <Input 
                    id="edit-user-name"
                    value={editUserFormData.name}
                    onChange={(e) => handleUserInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-user-email">Email Address</Label>
                  <Input 
                    id="edit-user-email"
                    type="email"
                    value={editUserFormData.email}
                    onChange={(e) => handleUserInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-user-firstName">First Name</Label>
                  <Input 
                    id="edit-user-firstName"
                    value={editUserFormData.firstName}
                    onChange={(e) => handleUserInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-user-lastName">Last Name</Label>
                  <Input 
                    id="edit-user-lastName"
                    value={editUserFormData.lastName}
                    onChange={(e) => handleUserInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-user-contact">Phone Number</Label>
                  <Input 
                    id="edit-user-contact"
                    value={editUserFormData.contact}
                    onChange={(e) => handleUserInputChange('contact', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-user-profession">Profession</Label>
                  <Input 
                    id="edit-user-profession"
                    value={editUserFormData.profession}
                    onChange={(e) => handleUserInputChange('profession', e.target.value)}
                    placeholder="Enter profession"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-user-role">User Role</Label>
                  <Select value={editUserFormData.userRole} onValueChange={(value) => handleUserInputChange('userRole', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="donor">Donor</SelectItem>
                      <SelectItem value="requester">Requester</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-user-status">Account Status</Label>
                  <Select value={editUserFormData.isActive.toString()} onValueChange={(value) => handleUserInputChange('isActive', value === 'true')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-user-organization">Organization Account</Label>
                  <Select value={editUserFormData.isOrganization.toString()} onValueChange={(value) => handleUserInputChange('isOrganization', value === 'true')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-user-emailUpdates">Email Updates</Label>
                  <Select value={editUserFormData.emailUpdates.toString()} onValueChange={(value) => handleUserInputChange('emailUpdates', value === 'true')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select email updates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Enabled</SelectItem>
                      <SelectItem value="false">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-user-city">City</Label>
                  <Input 
                    id="edit-user-city"
                    value={editUserFormData.location.city}
                    onChange={(e) => handleUserInputChange('location', { ...editUserFormData.location, city: e.target.value })}
                    placeholder="Enter city"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-user-state">State</Label>
                  <Input 
                    id="edit-user-state"
                    value={editUserFormData.location.state}
                    onChange={(e) => handleUserInputChange('location', { ...editUserFormData.location, state: e.target.value })}
                    placeholder="Enter state"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditUserOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveUser}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteUserConfirmOpen} onOpenChange={setIsDeleteUserConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Confirm User Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete the user{" "}
              <span className="font-semibold text-gray-900">
                "{userToDelete?.name || userToDelete?.firstName + ' ' + userToDelete?.lastName || 'Unknown User'}"?
              </span>
            </p>
            <p className="text-sm text-gray-500">
              This action cannot be undone. The user account will be permanently removed from the system.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteUserConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDeleteUser}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Member Details Dialog */}
      <Dialog open={isTeamMemberDetailsOpen} onOpenChange={setIsTeamMemberDetailsOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <UserPlus className="w-6 h-6" />
              Team Member Details - {selectedTeamMember?.name || 'Unknown Member'}
            </DialogTitle>
          </DialogHeader>
          {selectedTeamMember && (
            <div className="space-y-6">
              {/* Team Member Basic Information */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Team Member Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-indigo-700">Full Name</Label>
                    <div className="p-3 bg-white rounded-lg border border-indigo-100">
                      <span className="font-medium text-lg text-gray-800">{selectedTeamMember.name || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-indigo-700">Role</Label>
                    <div className="p-3 bg-white rounded-lg border border-indigo-100">
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                        {selectedTeamMember.role || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-indigo-700">Status</Label>
                    <div className="p-3 bg-white rounded-lg border border-indigo-100">
                      <Badge variant="secondary" className={selectedTeamMember.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {selectedTeamMember.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-indigo-700">Member ID</Label>
                    <div className="p-3 bg-white rounded-lg border border-indigo-100">
                      <span className="font-mono text-sm text-gray-600">{selectedTeamMember._id || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-700">Email Address</Label>
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-800">{selectedTeamMember.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-700">Phone Number</Label>
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-800">{selectedTeamMember.contact || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio and Description */}
              {selectedTeamMember.bio && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Biography & Description
                  </h3>
                  <div className="p-4 bg-white rounded-lg border border-green-100">
                    <p className="text-sm leading-relaxed text-gray-700">{selectedTeamMember.bio}</p>
                  </div>
                </div>
              )}

              {/* Social Links */}
              {selectedTeamMember.socialLinks && Object.values(selectedTeamMember.socialLinks).some(link => link) && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Social Media & Links
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedTeamMember.socialLinks.linkedin && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-purple-700">LinkedIn</Label>
                        <div className="p-3 bg-white rounded-lg border border-purple-100">
                          <a 
                            href={selectedTeamMember.socialLinks.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                          >
                            View LinkedIn Profile
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {selectedTeamMember.socialLinks.instagram && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-purple-700">Instagram</Label>
                        <div className="p-3 bg-white rounded-lg border border-purple-100">
                          <a 
                            href={selectedTeamMember.socialLinks.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-800 transition-colors font-medium"
                          >
                            View Instagram Profile
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {selectedTeamMember.socialLinks.website && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-purple-700">Website</Label>
                        <div className="p-3 bg-white rounded-lg border border-purple-100">
                          <a 
                            href={selectedTeamMember.socialLinks.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 transition-colors font-medium"
                          >
                            Visit Website
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Avatar/Profile Image */}
              {selectedTeamMember.avatar && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                  <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Profile Image
                  </h3>
                  <div className="flex justify-center">
                    <div className="w-32 h-32 bg-white rounded-lg border border-amber-100 overflow-hidden shadow-lg">
                      <img 
                        src={selectedTeamMember.avatar} 
                        alt={selectedTeamMember.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Metadata */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Account Metadata
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Created Date</Label>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-800">
                        {selectedTeamMember.createdAt ? new Date(selectedTeamMember.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-800">
                        {selectedTeamMember.updatedAt ? new Date(selectedTeamMember.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setIsTeamMemberDetailsOpen(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setIsTeamMemberDetailsOpen(false);
                    setSelectedTab("team");
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View in Team Tab
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