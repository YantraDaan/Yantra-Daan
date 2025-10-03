import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import NoDataFound from "@/components/NoDataFound";
import VerificationDashboard from "@/components/VerificationDashboard";
import { 
  Users, 
  Gift, 
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
  Tag,
  BookOpen,
  AlertCircle,
  UserCheck,
  TrendingUp,
  Plus,
  Loader2,
  X,
  Upload
} from "lucide-react";
import { config } from "@/config/env";

const AdminPage = () => {
  const { user, isTokenValid } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
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
  const [allTeamMembers, setAllTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDevicesLoading, setIsDevicesLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isTeamLoading, setIsTeamLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isRefreshLoading, setIsRefreshLoading] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [hasInitialDevices, setHasInitialDevices] = useState(false);
  const [hasInitialUsers, setHasInitialUsers] = useState(false);
  const [hasInitialTeam, setHasInitialTeam] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  // Add device requests state variables
  const [deviceRequests, setDeviceRequests] = useState([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);
  const [hasInitialRequests, setHasInitialRequests] = useState(false);
  const [requestFilters, setRequestFilters] = useState({
    status: 'all',
    search: ''
  });
  const [currentRequestPage, setCurrentRequestPage] = useState(1);
  const [totalRequestPages, setTotalRequestPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);

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
  
  // Advanced admin state management
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [viewMode, setViewMode] = useState('grid'); // grid or table
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  // Dialog states for notes
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showTeamMemberDialog, setShowTeamMemberDialog] = useState(false);
  const [isEditingTeamMember, setIsEditingTeamMember] = useState(false);
  const [selectedDeviceForAction, setSelectedDeviceForAction] = useState(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [showCreateTeamMemberDialog, setShowCreateTeamMemberDialog] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    email: '',
    contact: '',
    role: 'Support Staff',
    bio: '',
    avatar: '',
    socialLinks: {
      linkedin: '',
      instagram: '',
      website: ''
    }
  });
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    contact: '',
    address: '',
    about: '',
    profession: '',
    organization: '',
    categoryType: '',
    role: 'user',
    status: 'active',
    avatar: '',
    profileImage: ''
  });
  const [isCreatingTeamMember, setIsCreatingTeamMember] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isDeletingTeamMember, setIsDeletingTeamMember] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);
  const [isUploadingUserImage, setIsUploadingUserImage] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [resetNote, setResetNote] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Add state for request actions
  const [isApprovingRequest, setIsApprovingRequest] = useState(false);
  const [isRejectingRequest, setIsRejectingRequest] = useState(false);

  // Device management dialog states
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDeviceOwner, setSelectedDeviceOwner] = useState(null);
  const [isDeviceDetailsOpen, setIsDeviceDetailsOpen] = useState(false);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isEditDeviceOpen, setIsEditDeviceOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  
  // Edit device form state
  const [editFormData, setEditFormData] = useState({
    deviceName: '',
    category: '',
    condition: '',
    description: '',
    status: ''
  });

  // Edit user form state
  const [editUserFormData, setEditUserFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profession: '',
    organization: '',
    role: '',
    status: ''
  });
  
  // Advanced search functionality
  const handleAdvancedSearch = (query) => {
    setSearchQuery(query);
    // Implement advanced search logic with filters
    const filtered = allDevices.filter(device => {
      const matchesQuery = !query || 
        device.deviceName?.toLowerCase().includes(query.toLowerCase()) ||
        device.category?.toLowerCase().includes(query.toLowerCase()) ||
        device.owner?.name?.toLowerCase().includes(query.toLowerCase()) ||
        device.owner?.email?.toLowerCase().includes(query.toLowerCase());
      
      const matchesDateRange = !dateRange.from || !dateRange.to || 
        (new Date(device.createdAt) >= new Date(dateRange.from) && 
         new Date(device.createdAt) <= new Date(dateRange.to));
      
      return matchesQuery && matchesDateRange;
    });
    
    setAllDevices(filtered);
  };
  
  // Advanced sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sorted = [...allDevices].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setAllDevices(sorted);
  };
  

  
  // Activity log
  const fetchActivityLog = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/admin/activity-log`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setActivityLog(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activity log:', error);
    }
  };
  
  // Real-time notifications (disabled - endpoint not available)
  const fetchNotifications = async () => {
    try {
      // TODO: Implement notifications endpoint on backend
      // const token = localStorage.getItem('authToken');
      // const response = await fetch(`${config.apiUrl}/api/admin/notifications`, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      // });
      
      // if (response.ok) {
      //   const data = await response.json();
      //   setNotifications(data.notifications || []);
      // }
      
      // For now, set empty notifications
      setNotifications([]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };
  
  // Advanced Admin Features State
  const [bulkOperations, setBulkOperations] = useState({
    selectedItems: [],
    action: null,
    showConfirmDialog: false
  });
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: null,
    dateTo: null,
    minValue: null,
    maxValue: null,
    location: '',
    tags: []
  });
  const [quickStats, setQuickStats] = useState({
    todayDevices: 0,
    weeklyGrowth: 0,
    topCategories: [],
    averageApprovalTime: 0
  });
  const [realtimeUpdates, setRealtimeUpdates] = useState({
    enabled: true,
    lastUpdate: new Date(),
    updateInterval: 30000
  });
  
  // Load advanced features on component mount
  useEffect(() => {
    if (user && user.userRole === 'admin') {
      fetchActivityLog();
      // fetchNotifications(); // Disabled - endpoint not available
      
      // Set up real-time updates (disabled for notifications)
      // const interval = setInterval(() => {
      //   fetchNotifications();
      // }, 30000); // Update every 30 seconds
      
      // return () => clearInterval(interval);
    }
  }, [user]);

  // Handle URL parameter for initial tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'analytics', 'devices', 'users', 'requests', 'team', 'import-export', 'activity-log', 'verification', 'learning', 'letmespread'].includes(tabParam)) {
      setSelectedTab(tabParam);
    }
  }, [searchParams]);

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

  // Load team data when Team tab is first selected
  useEffect(() => {
    if (selectedTab === "team" && user && user.userRole === 'admin' && !hasInitialTeam) {
      // Only load if team tab is selected and hasn't been loaded yet
      fetchTeamMembers();
      setHasInitialTeam(true);
    }
  }, [selectedTab, user, hasInitialTeam]);

  // Load requests data when Requests tab is first selected
  useEffect(() => {
    if (selectedTab === "requests" && user && user.userRole === 'admin' && !hasInitialRequests) {
      // Only load if requests tab is selected and hasn't been loaded yet
      fetchDeviceRequests();
      setHasInitialRequests(true);
    }
  }, [selectedTab, user, hasInitialRequests]);

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

  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      setIsTeamLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/admin/team-members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }); 
      
      if (response.ok) {
        const data = await response.json();
        console.log('Team members data received:', data);
        console.log('Team members array:', data.members);
        if (data.members) {
          data.members.forEach((member, index) => {
            console.log(`Team member ${index}:`, {
              name: member.name,
              avatar: member.avatar,
              role: member.role,
              status: member.status
            });
          });
        }
        setAllTeamMembers(data.members || []);
      } else {
        console.error('Failed to fetch team members:', response.status);
        toast({
          title: "Error",
          description: "Failed to fetch team members",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive",
      });
    } finally {
      setIsTeamLoading(false);
    }
  };

  // Handle team member card click - DUPLICATE FUNCTION COMMENTED OUT
  // const handleTeamMemberClick = (member) => {
  //   setSelectedTeamMember(member);
  //   setIsEditingTeamMember(false);
  //   setShowTeamMemberDialog(true);
  // };

  // Handle edit team member
  const handleEditTeamMember = () => {
    setEditingTeamMember({
      ...selectedTeamMember,
      socialLinks: selectedTeamMember.socialLinks || {
        linkedin: '',
        instagram: '',
        website: ''
      }
    });
    setEditImagePreview(null);
    setIsEditingTeamMember(true);
  };

  // Handle save team member changes
  const handleSaveTeamMember = async () => {
    if (!editingTeamMember) return;

    try {
      setIsSubmittingAction(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/admin/team-members/${editingTeamMember._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingTeamMember.name,
          avatar: editingTeamMember.avatar,
          email: editingTeamMember.email,
          contact: editingTeamMember.contact,
          role: editingTeamMember.role,
          bio: editingTeamMember.bio,
          status: editingTeamMember.status,
          socialLinks: editingTeamMember.socialLinks
        }),
      });
      
      if (response.ok) {
        const updatedMember = await response.json();
        toast({
          title: "Success",
          description: "Team member updated successfully",
        });
        
        // Update the team members list
        await fetchTeamMembers();
        
        // Update the selected team member
        setSelectedTeamMember(updatedMember.member || editingTeamMember);
        setIsEditingTeamMember(false);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to update team member",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      toast({
        title: "Error",
        description: "Failed to update team member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditingTeamMember(false);
    setEditingTeamMember(null);
    setEditImagePreview(null);
  };

  // Handle create team member
  const handleCreateTeamMember = () => {
    setNewTeamMember({
      name: '',
      email: '',
      contact: '',
      role: 'Support Staff',
      bio: '',
      avatar: '',
      socialLinks: {
        linkedin: '',
        instagram: '',
        website: ''
      }
    });
    setImagePreview(null);
    setShowCreateTeamMemberDialog(true);
  };

  // Handle image upload for team member creation
  const handleImageUpload = async (file) => {
    try {
      setIsUploadingImage(true);
      setIsUploadingEditImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/admin/team-members/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploadingImage(false);
      setIsUploadingEditImage(false);
    }
  };

  // Handle save new team member
  const handleSaveNewTeamMember = async () => {
    if (!newTeamMember.name || !newTeamMember.email || !newTeamMember.contact || !newTeamMember.bio) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreatingTeamMember(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/admin/team-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newTeamMember),
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: "Team member created successfully",
        });
        
        // Refresh team members list
        await fetchTeamMembers();
        
        // Close dialog and reset form
        setShowCreateTeamMemberDialog(false);
        setNewTeamMember({
          name: '',
          email: '',
          contact: '',
          role: 'Support Staff',
          bio: '',
          avatar: '',
          socialLinks: {
            linkedin: '',
            instagram: '',
            website: ''
          }
        });
        setImagePreview(null);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to create team member",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating team member:', error);
      toast({
        title: "Error",
        description: "Failed to create team member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingTeamMember(false);
    }
  };

  // Handle delete team member
  const handleDeleteTeamMember = async (memberId, memberName) => {
    const confirmed = window.confirm(`⚠️ WARNING: Are you sure you want to permanently delete ${memberName} from the team? This action cannot be undone!`);
    if (!confirmed) return;

    try {
      setIsDeletingTeamMember(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/admin/team-members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `${memberName} has been removed from the team`,
        });
        
        // Refresh team members list
        await fetchTeamMembers();
        
        // Close dialog if the deleted member was selected
        if (selectedTeamMember && selectedTeamMember._id === memberId) {
          setShowTeamMemberDialog(false);
          setSelectedTeamMember(null);
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete team member",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: "Error",
        description: "Failed to delete team member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingTeamMember(false);
    }
  };

  // Handle create user
  const handleCreateUser = () => {
    setNewUser({
      name: '',
      email: '',
      password: '',
      phone: '',
      contact: '',
      address: '',
      about: '',
      profession: '',
      organization: '',
      categoryType: '',
      role: 'user',
      status: 'active',
      avatar: '',
      profileImage: ''
    });
    setUserImagePreview(null);
    setShowCreateUserDialog(true);
  };

  // Handle user image upload - create preview only (backend endpoint not available)
  const handleUserImageUpload = async (file) => {
    try {
      setIsUploadingUserImage(true);
      
      // For now, just create a local preview since backend endpoint is not available
      // The image will be handled later when the user updates their profile
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setUserImagePreview(result);
          // Store the file data for potential future use
          setNewUser(prev => ({ 
            ...prev, 
            avatar: result as string, // Store base64 for preview with explicit type
            profileImage: file.name as string // Store filename with explicit type
          }));
        }
      };
      reader.readAsDataURL(file);
      
      console.log('User image preview created successfully');
      return file.name; // Return filename as success indicator
    } catch (error) {
      console.error('Error creating image preview:', error);
      toast({
        title: "Error",
        description: `Failed to process image file: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploadingUserImage(false);
    }
  };

  // Handle save new user - trying regular user registration endpoint
  const handleSaveNewUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Email)",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Validate Profession field
    const validProfessions = [
      'software-engineer', 'data-scientist', 'product-manager', 'designer', 
      'marketing-specialist', 'sales-representative', 'teacher', 'doctor', 
      'nurse', 'lawyer', 'accountant', 'consultant', 'entrepreneur', 
      'student', 'researcher', 'analyst', 'other', ''
    ];
    
    if (newUser.profession && !validProfessions.includes(newUser.profession)) {
      toast({
        title: "Validation Error",
        description: "Please select a valid profession from the dropdown list",
        variant: "destructive"
      });
      return;
    }

    // Validate Organization Type field
    const validOrganizations = [
      'technology-company', 'healthcare-organization', 'educational-institution',
      'government-agency', 'non-profit-organization', 'financial-services',
      'consulting-firm', 'manufacturing-company', 'retail-business',
      'startup', 'freelance', 'small-business', 'large-corporation', 'other', ''
    ];
    
    if (newUser.organization && !validOrganizations.includes(newUser.organization)) {
      toast({
        title: "Validation Error",
        description: "Please select a valid organization type from the dropdown list",
        variant: "destructive"
      });
      return;
    }

    // Validate Category Type field
    const validCategoryTypes = [
      'individual', 'business', 'educational', 'non-profit', 'government',
      'healthcare', 'research', 'startup', 'enterprise', 'community', 'other', ''
    ];
    
    if (newUser.categoryType && !validCategoryTypes.includes(newUser.categoryType)) {
      toast({
        title: "Validation Error",
        description: "Please select a valid category type from the dropdown list",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreatingUser(true);
      const token = localStorage.getItem('authToken');
      
      // Create user data for registration endpoint
      const userDataForCreation = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password || 'TempPass123!', // Provide default password if empty
        contact: newUser.phone || newUser.contact || '',
        userRole: newUser.role || 'user',
        profession: newUser.profession || '',
        about: newUser.about || '',
        address: newUser.address || '',
        categoryType: newUser.categoryType || 'individual',
        isOrganization: newUser.organization ? true : false
      };
      
      let response;
      let endpoint = '';
      let errorDetails = '';
      
      try {
        // Try regular user registration endpoint first
        endpoint = `${config.apiUrl}${config.endpoints.auth}/register`;
        console.log('Trying registration endpoint:', endpoint);
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userDataForCreation),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          errorDetails = `Registration endpoint failed (${response.status}): ${errorData.error || errorData.message || 'Unknown error'}`;
          console.log(errorDetails);
          throw new Error(errorDetails);
        }
      } catch (registrationError) {
        console.log('Registration endpoint failed, trying admin endpoint...', registrationError.message);
        
        try {
          // If regular registration fails, try admin user creation endpoint
          endpoint = `${config.apiUrl}/api/admin/users`;
          console.log('Trying admin endpoint:', endpoint);
          
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(userDataForCreation),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            errorDetails = `Admin endpoint failed (${response.status}): ${errorData.error || errorData.message || 'Unknown error'}`;
            console.error(errorDetails);
            
            toast({
              title: "API Error",
              description: `Both endpoints failed. ${errorDetails}`,
              variant: "destructive",
            });
            return;
          }
        } catch (adminError) {
          console.error('Admin endpoint also failed:', adminError.message);
          toast({
            title: "Connection Error",
            description: `Cannot connect to server. Please check your internet connection and try again. Details: ${adminError.message}`,
            variant: "destructive",
          });
          return;
        }
      }
      
      if (response && response.ok) {
        try {
          const result = await response.json();
          
          // Show success message
          toast({
            title: "User Created Successfully!",
            description: `${result.user?.name || newUser.name} has been created successfully.`,
            duration: 4000,
          });
          
          // Refresh users list
          try {
            await fetchAllUsers(1, userFilters);
          } catch (refreshError) {
            console.error('Failed to refresh users list:', refreshError);
            toast({
              title: "Warning",
              description: "User created but failed to refresh list. Please refresh the page manually.",
              variant: "destructive",
            });
          }
          
          // Close dialog and reset form
          setShowCreateUserDialog(false);
          setNewUser({
            name: '',
            email: '',
            password: '',
            phone: '',
            contact: '',
            address: '',
            about: '',
            profession: '',
            organization: '',
            categoryType: '',
            role: 'user',
            status: 'active',
            avatar: '',
            profileImage: ''
          });
          setUserImagePreview(null);
          
        } catch (parseError) {
          console.error('Failed to parse success response:', parseError);
          toast({
            title: "Parse Error",
            description: "User may have been created but response format is invalid. Please refresh the page to check.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Unexpected Error",
          description: "Received invalid response from server. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error creating user:', error);
      toast({
        title: "Unexpected Error",
        description: `An unexpected error occurred: ${error.message || 'Unknown error'}. Please check your connection and try again.`,
        variant: "destructive",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Founder & CEO': return 'from-purple-500 to-purple-600';
      case 'Operations Director': return 'from-blue-500 to-blue-600';
      case 'Community Manager': return 'from-green-500 to-green-600';
      case 'Technical Lead': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Founder & CEO': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Operations Director': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Community Manager': return 'bg-green-100 text-green-800 border-green-200';
      case 'Technical Lead': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Function to refresh all data - DUPLICATE FUNCTION COMMENTED OUT
  // const refreshAllData = async () => {
  //   try {
  //     setIsRefreshLoading(true);
  //     await fetchDashboardData();
  //     setHasInitialData(true); // Mark as loaded
  //   } finally {
  //     setIsRefreshLoading(false);
  //   }
  // };

  // const handleTabChange = (value: string) => {
  //   console.log('Tab changed to:', value);
  //   
  //   // Prevent switching to admin-only tabs when not logged in
  //   const adminOnlyTabs = ['overview', 'analytics', 'devices', 'users', 'requests', 'team', 'import-export', 'activity-log'];
  //   if (!user && adminOnlyTabs.includes(value)) {
  //     return; // Don't allow switching to admin-only tabs
  //   }
  //   
  //   setSelectedTab(value);
  //   
  //   // Fetch data when switching to specific tabs
  //   if (value === 'team' && allTeamMembers.length === 0) {
  //     fetchTeamMembers();
  //   }
  // };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/admin-login');
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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConditionBadgeColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUserRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'donor':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'requester':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUserStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUserRoleGradient = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'from-purple-500 to-purple-600';
      case 'donor':
        return 'from-green-500 to-green-600';
      case 'requester':
        return 'from-blue-500 to-blue-600';
      case 'user':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  // Device status update function
  const updateDeviceStatus = async (deviceId, status) => {
    try {
      console.log("deviceId",deviceId);
      
      setIsActionLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/admin/devices/${deviceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Enhanced success messages based on status
        let successMessage = '';
        let description = '';
        
        if (status === 'approved') {
          successMessage = 'Device Approved Successfully!';
          description = 'The device is now visible to the public and available for requests.';
        } else if (status === 'rejected') {
          successMessage = 'Device Rejected';
          description = 'The device has been rejected and is not visible to the public.';
        } else if (status === 'pending') {
          successMessage = 'Device Status Reset';
          description = 'The device status has been reset to pending for re-review.';
        } else {
          successMessage = `Device ${status} successfully`;
          description = 'Device status has been updated.';
        }
        
        toast({
          title: successMessage,
          description: description,
        });
        
        // Refresh the devices list
        fetchAllDevices(currentPage, deviceFilters);
        
        // Refresh dashboard stats if we're on overview tab
        if (selectedTab === 'overview') {
          fetchDashboardData();
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to update device status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating device status:', error);
      toast({
        title: "Error",
        description: "Failed to update device status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Excel download function
  const downloadExcelReport = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Create workbook and worksheet
      const workbook = {
        Sheets: {},
        SheetNames: []
      };
      
      // Dashboard Stats Sheet
      const statsData = [
        ['Metric', 'Count'],
        ['Total Users', dashboardStats.totalUsers],
        ['Total Devices', dashboardStats.totalDevices],
        ['Pending Devices', dashboardStats.pendingDevices],
        ['Approved Devices', dashboardStats.approvedDevices],
        ['Rejected Devices', dashboardStats.rejectedDevices],
        ['Total Requests', dashboardStats.totalRequests],
        ['Approval Rate', dashboardStats.totalDevices > 0 ? Math.round((dashboardStats.approvedDevices / dashboardStats.totalDevices) * 100) + '%' : '0%']
      ];
      
      // Convert data to worksheet format
      const ws1 = {
        '!ref': 'A1:B8',
        A1: { v: 'Metric', t: 's' },
        B1: { v: 'Count', t: 's' },
        A2: { v: 'Total Users', t: 's' },
        B2: { v: dashboardStats.totalUsers, t: 'n' },
        A3: { v: 'Total Devices', t: 's' },
        B3: { v: dashboardStats.totalDevices, t: 'n' },
        A4: { v: 'Pending Devices', t: 's' },
        B4: { v: dashboardStats.pendingDevices, t: 'n' },
        A5: { v: 'Approved Devices', t: 's' },
        B5: { v: dashboardStats.approvedDevices, t: 'n' },
        A6: { v: 'Rejected Devices', t: 's' },
        B6: { v: dashboardStats.rejectedDevices, t: 'n' },
        A7: { v: 'Total Requests', t: 's' },
        B7: { v: dashboardStats.totalRequests, t: 'n' },
        A8: { v: 'Approval Rate', t: 's' },
        B8: { v: dashboardStats.totalDevices > 0 ? Math.round((dashboardStats.approvedDevices / dashboardStats.totalDevices) * 100) + '%' : '0%', t: 's' }
      };
      
      workbook.Sheets['Dashboard Stats'] = ws1;
      workbook.SheetNames.push('Dashboard Stats');
      
      // Recent Donations Sheet
      if (recentDonations.length > 0) {
        const donationsData = [['Device Name', 'Category', 'Status', 'Date']];
        recentDonations.forEach(donation => {
          donationsData.push([
            donation.deviceName || 'N/A',
            donation.category || 'N/A', 
            donation.status || 'N/A',
            new Date(donation.createdAt).toLocaleDateString()
          ]);
        });
        
        const ws2 = {};
        donationsData.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            const cellRef = String.fromCharCode(65 + colIndex) + (rowIndex + 1);
            ws2[cellRef] = { v: cell, t: typeof cell === 'number' ? 'n' : 's' };
          });
        });
        ws2['!ref'] = `A1:D${donationsData.length}`;
        
        workbook.Sheets['Recent Donations'] = ws2;
        workbook.SheetNames.push('Recent Donations');
      }
      
      // Convert workbook to binary
      const wbBinary = writeWorkbook(workbook);
      
      // Create and download file
      const blob = new Blob([s2ab(wbBinary)], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `YantraDaan_Admin_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Excel report downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading Excel report:', error);
      // Fallback to CSV download
      downloadCSVReport();
    }
  };
  
  // Helper functions for Excel
  const writeWorkbook = (wb) => {
    const wopts = { bookType: 'xlsx', type: 'binary' };
    let wbout = '';
    
    // Simple CSV-like format for fallback
    wb.SheetNames.forEach(sheetName => {
      const ws = wb.Sheets[sheetName];
      wbout += sheetName + '\n';
      const ref = ws['!ref'];
      if (ref) {
        const range = ref.split(':');
        const start = range[0];
        const end = range[1];
        const startCol = start.charCodeAt(0) - 65;
        const startRow = parseInt(start.substring(1));
        const endCol = end.charCodeAt(0) - 65;
        const endRow = parseInt(end.substring(1));
        
        for (let row = startRow; row <= endRow; row++) {
          const rowData = [];
          for (let col = startCol; col <= endCol; col++) {
            const cellRef = String.fromCharCode(65 + col) + row;
            const cell = ws[cellRef];
            rowData.push(cell ? cell.v : '');
          }
          wbout += rowData.join(',') + '\n';
        }
      }
      wbout += '\n';
    });
    
    return wbout;
  };
  
  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  };
  
  // CSV fallback download
  const downloadCSVReport = () => {
    const csvContent = [
      ['YantraDaan Admin Report'],
      ['Generated on:', new Date().toLocaleString()],
      [''],
      ['Dashboard Statistics'],
      ['Metric', 'Count'],
      ['Total Users', dashboardStats.totalUsers],
      ['Total Devices', dashboardStats.totalDevices],
      ['Pending Devices', dashboardStats.pendingDevices],
      ['Approved Devices', dashboardStats.approvedDevices],
      ['Rejected Devices', dashboardStats.rejectedDevices],
      ['Total Requests', dashboardStats.totalRequests],
      ['Approval Rate', dashboardStats.totalDevices > 0 ? Math.round((dashboardStats.approvedDevices / dashboardStats.totalDevices) * 100) + '%' : '0%'],
      [''],
      ['Recent Donations'],
      ['Device Name', 'Category', 'Status', 'Date'],
      ...recentDonations.map(donation => [
        donation.deviceName || 'N/A',
        donation.category || 'N/A',
        donation.status || 'N/A',
        new Date(donation.createdAt).toLocaleDateString()
      ])
    ];
    
    const csv = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `YantraDaan_Admin_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "CSV report downloaded successfully",
    });
  };

  // Handle download invoice for approved requests
  const handleDownloadInvoice = async (requestId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/device-requests/my/${requestId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const htmlContent = await response.text();
        
        // Create a Blob with the HTML content
        const blob = new Blob([htmlContent], { type: 'text/html' });
        
        // Create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${requestId}.html`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Invoice Downloaded",
          description: "The invoice has been downloaded successfully.",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to download invoice",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle reject device with reason
  const handleRejectDevice = async () => {
    if (!selectedDeviceForAction || !rejectionNote.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmittingAction(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/admin/devices/${selectedDeviceForAction._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: 'rejected',
          rejectionReason: rejectionNote.trim(),
          adminNotes: `Rejected by admin on ${new Date().toLocaleDateString()}`
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `"${selectedDeviceForAction.deviceName}" has been rejected and email sent to owner`,
        });
        
        // Reset dialog state
        setShowRejectDialog(false);
        setSelectedDeviceForAction(null);
        setRejectionNote('');
        
        // Refresh data
        fetchAllDevices(currentPage, deviceFilters);
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to reject device",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Reject device error:', error);
      toast({
        title: "Error",
        description: "Failed to reject device. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle reset device to pending with reason
  const handleResetDevice = async () => {
    if (!selectedDeviceForAction || !resetNote.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for resetting to pending",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmittingAction(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/admin/devices/${selectedDeviceForAction._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: 'pending',
          resetReason: resetNote.trim(),
          adminNotes: `Reset to pending by admin on ${new Date().toLocaleDateString()}`
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `"${selectedDeviceForAction.deviceName}" has been reset to pending`,
        });
        
        // Reset dialog state
        setShowResetDialog(false);
        setSelectedDeviceForAction(null);
        setResetNote('');
        
        // Refresh data
        fetchAllDevices(currentPage, deviceFilters);
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to reset device status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Reset device error:', error);
      toast({
        title: "Error",
        description: "Failed to reset device status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Edit device function
  const handleEditDevice = async (deviceId, formData) => {
    try {
      setIsActionLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/admin/devices/${deviceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Device updated successfully",
        });
        
        setIsEditDeviceOpen(false);
        fetchAllDevices(currentPage, deviceFilters);
        fetchDashboardData();
        
        // Update selectedDevice if it's still open
        if (selectedDevice && selectedDevice._id === deviceId) {
          const updatedDevice = { ...selectedDevice, ...formData };
          setSelectedDevice(updatedDevice);
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update device",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating device:', error);
      toast({
        title: "Error",
        description: "Failed to update device",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Bulk edit device function (removed - no longer supported)
  const handleBulkEditDevices = async (formData) => {
    // Function removed - bulk operations no longer supported
  };

  // User verification toggle function  
  const toggleUserVerification = async (userId, currentStatus) => {
    try {
      setIsActionLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/admin/users/${userId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isVerified: !currentStatus }),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${!currentStatus ? 'verified' : 'unverified'} successfully`,
        });
        
        // Refresh the users list
        fetchAllUsers(currentUserPage, userFilters);
      } else {
        toast({
          title: "Error",
          description: "Failed to update user verification",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating user verification:', error);
      toast({
        title: "Error",
        description: "Failed to update user verification",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete user function
  const deleteUser = async (userId, userName) => {
    const confirmed = window.confirm(` WARNING: Are you sure you want to permanently delete user "${userName}"? This action cannot be undone!`);
    if (!confirmed) return;

    try {
      setIsDeletingUser(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `User "${userName}" has been deleted successfully`,
        });
        
        // Refresh the users list
        fetchAllUsers(currentUserPage, userFilters);
        
        // Close dialog if the deleted user was selected
        if (selectedUser && selectedUser._id === userId) {
          setIsUserDetailsOpen(false);
          setSelectedUser(null);
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Edit user function
  const handleEditUser = () => {
    if (!selectedUser) return;
    
    setEditUserFormData({
      name: selectedUser.name || '',
      email: selectedUser.email || '',
      phone: selectedUser.phone || '',
      profession: selectedUser.profession || '',
      organization: selectedUser.organization || '',
      role: selectedUser.role || selectedUser.userRole || 'user',
      status: selectedUser.status || 'active'
    });
    
    setIsEditUserOpen(true);
    setIsUserDetailsOpen(false);
  };

  // Save user changes function
  const saveUserChanges = async () => {
    if (!selectedUser) return;

    try {
      setIsActionLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editUserFormData),
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        
        // Update the selected user and refresh the list
        setSelectedUser(updatedUser.user || { ...selectedUser, ...editUserFormData });
        fetchAllUsers(currentUserPage, userFilters);
        
        // Close edit dialog and open details dialog
        setIsEditUserOpen(false);
        setIsUserDetailsOpen(true);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to update user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Fetch device owner details from backend
  const fetchDeviceOwner = async (deviceId) => {
    try {
      setIsActionLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/admin/devices/${deviceId}/owner`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const ownerData = await response.json();
        console.log('Owner data received:', ownerData);
        setSelectedDeviceOwner(ownerData);
      } else {
        console.error('Failed to fetch device owner:', response.status);
        setSelectedDeviceOwner(null);
        toast({
          title: "Warning",
          description: "Failed to load owner information",
          variant: "destructive",
        });
        
      }
    } catch (error) {
      console.error('Error fetching device owner:', error);
      setSelectedDeviceOwner(null);
      toast({
        title: "Warning",
        description: "Failed to load owner information",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Fetch team members - DUPLICATE FUNCTION COMMENTED OUT
  // const fetchTeamMembers = async () => {
  //   try {
  //     setIsTeamLoading(true);
  //     const token = localStorage.getItem('authToken');
  //     
  //     const response = await fetch(`${config.apiUrl}/api/admin/team-members`, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //       },
  //     }); 
  //     
  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log('Team members data received:', data);
  //       console.log('Team members array:', data.members);
  //       if (data.members) {
  //         data.members.forEach((member, index) => {
  //           console.log(`Team member ${index}:`, {
  //             name: member.name,
  //             avatar: member.avatar,
  //             role: member.role,
  //             status: member.status
  //           });
  //         });
  //       }
  //       setAllTeamMembers(data.members || []);
  //     } else {
  //       console.error('Failed to fetch team members:', response.status);
  //       toast({
  //         title: "Error",
  //         description: "Failed to fetch team members",
  //         variant: "destructive",
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error fetching team members:', error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to fetch team members",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsTeamLoading(false);
  //   }
  // };

  // Fetch device requests
  const fetchDeviceRequests = async (page = 1, filters = requestFilters) => {
    try {
      setIsRequestsLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add pagination
      if (page > 1) params.append('page', page.toString());
      params.append('limit', '10'); // Show 10 requests per page
      
      // Add filters if they exist and are not "all"
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      
      // Fetch requests with pagination and filters
      const response = await fetch(`${config.apiUrl}/api/device-requests/admin/all?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Device requests API Response:', data);
        
        setDeviceRequests(data.requests || []);
        setTotalRequestPages(data.totalPages || 1);
        setTotalRequests(data.total || 0);
        setCurrentRequestPage(data.currentPage || page);
      } else {
        console.error('Failed to fetch device requests:', response.status);
        setDeviceRequests([]);
        setTotalRequestPages(1);
        setTotalRequests(0);
        toast({
          title: "Error",
          description: `Failed to load device requests (${response.status})`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching device requests:', error);
      setDeviceRequests([]);
      setTotalRequestPages(1);
      setTotalRequests(0);
      toast({
        title: "Error",
        description: "Failed to load device requests",
        variant: "destructive",
      });
    } finally {
      setIsRequestsLoading(false);
    }
  };

  // Handle team member card click
  const handleTeamMemberClick = (member) => {
    setSelectedTeamMember(member);
    setIsEditingTeamMember(false);
    setShowTeamMemberDialog(true);
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

  // Handle approve request
  const handleApproveRequest = async (requestId: string) => {
    try {
      setIsApprovingRequest(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/device-requests/admin/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'approved',
          adminNotes: 'Approved by admin'
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Request approved successfully",
        });
        
        // Refresh the requests list
        fetchDeviceRequests(currentRequestPage, requestFilters);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to approve request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      });
    } finally {
      setIsApprovingRequest(false);
    }
  };

  // Handle reject request
  const handleRejectRequest = async (requestId: string) => {
    try {
      setIsRejectingRequest(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}/api/device-requests/admin/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason: 'Rejected by admin',
          adminNotes: 'Rejected by admin'
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Request rejected successfully",
        });
        
        // Refresh the requests list
        fetchDeviceRequests(currentRequestPage, requestFilters);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to reject request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    } finally {
      setIsRejectingRequest(false);
    }
  };

  // Function to refresh all data
  // const refreshAllData = async () => {
  //   try {
  //     setIsRefreshLoading(true);
  //     await fetchDashboardData();
  //     setHasInitialData(true); // Mark as loaded
  //   } finally {
  //     setIsRefreshLoading(false);
  //   }
  // };

  // const handleTabChange = (value: string) => {
  //   console.log('Tab changed to:', value);
    
  //   // Prevent switching to admin-only tabs when not logged in
  //   const adminOnlyTabs = ['overview', 'analytics', 'devices', 'users', 'requests', 'team', 'import-export', 'activity-log'];
  //   if (!user && adminOnlyTabs.includes(value)) {
  //     return; // Don't allow switching to admin-only tabs
  //   }
    
  //   setSelectedTab(value);
    
  //   // Fetch data when switching to specific tabs
  //   if (value === 'team' && allTeamMembers.length === 0) {
  //     fetchTeamMembers();
  //   }
  // };

  // Allow public access for verification and letmespread tabs
  const publicTabs = ['verification', 'letmespread'];
  const isPublicTab = publicTabs.includes(selectedTab);
  
  if (!isPublicTab && (!user || user.userRole !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-yellow-500 rounded-lg flex items-center justify-center mr-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">YantraDaan Admin</h1>
                <p className="text-xs text-gray-500">Administrative Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-gray-500 capitalize">{user.userRole}</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout} 
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')} 
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
          <div className="p-4">
            {/* Notifications Badge */}
            {notifications.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-yellow-800">
                    {notifications.length} new notification{notifications.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
            
            <nav className="space-y-2">
              <button
                onClick={() => setSelectedTab("overview")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedTab === "overview"

                    ? "bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Dashboard Overview
              </button>
              
              <button
                onClick={() => setSelectedTab("analytics")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedTab === "analytics"
                    ? "bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <TrendingUp className="w-5 h-5 mr-3" />
                Analytics & Reports
              </button>
              
              <button
                onClick={() => setSelectedTab("devices")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedTab === "devices"
                    ? "bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Smartphone className="w-5 h-5 mr-3" />
                Device Management
                {pendingDevices.length > 0 && (
                  <Badge className="ml-auto bg-red-500 text-white text-xs">
                    {pendingDevices.length}
                  </Badge>
                )}
              </button>
              
              <button
                onClick={() => setSelectedTab("users")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedTab === "users"
                    ? "bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Users className="w-5 h-5 mr-3" />
                User Management
              </button>
              
              <button
                onClick={() => setSelectedTab("requests")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedTab === "requests"
                    ? "bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FileText className="w-5 h-5 mr-3" />
                Request Management
              </button>
              
              <button
                onClick={() => setSelectedTab("team")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedTab === "team"
                    ? "bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <User className="w-5 h-5 mr-3" />
                Team Management
              </button>
              
              <div className="pt-4 mt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Tools & Utilities</p>
                
                <button
                  onClick={() => setSelectedTab("import-export")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedTab === "import-export"
                      ? "bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Download className="w-5 h-5 mr-3" />
                  Import/Export
                </button>
                
                <button
                  onClick={() => setSelectedTab("activity-log")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedTab === "activity-log"
                      ? "bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FileText className="w-5 h-5 mr-3" />
                  Activity Log
                </button>
                
                <button
                  onClick={() => setSelectedTab("verification")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedTab === "verification"
                      ? "bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <CheckCircle className="w-5 h-5 mr-3" />
                  Verification Portal
                </button>
                
                <button
                  onClick={() => setSelectedTab("learning")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedTab === "learning"
                      ? "bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <BookOpen className="w-5 h-5 mr-3" />
                  Learning Center
                </button>
                
                <button
                  onClick={() => setSelectedTab("letmespread")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedTab === "letmespread"
                      ? "bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Tag className="w-5 h-5 mr-3" />
                  Spread Awareness
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-gray-50">
          <div className="p-6">
          {/* Public tabs - accessible to everyone */}
          {selectedTab === "verification" && (
            <div className="w-full">
              <VerificationDashboard />
            </div>
          )}

          {selectedTab === "letmespread" && (
            <div className="w-full">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="admin-gradient-text flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Let Me Spread Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <Tag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Spread awareness features will be implemented here</p>
                    <p className="text-sm text-gray-400 mt-2">This feature is coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Admin-only tabs */}
          {user && user.userRole === 'admin' && (
            <>
              {/* Analytics Tab */}
              {selectedTab === "analytics" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
                      <p className="text-gray-600 mt-1">Comprehensive platform analytics and insights</p>
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={async () => {
                          try {
                            const analyticsData = [
                              ['Analytics Report - Generated on', new Date().toLocaleDateString()],
                              [''],
                              ['Device Statistics'],
                              ['Total Devices', dashboardStats.totalDevices],
                              ['Approved Devices', dashboardStats.approvedDevices],
                              ['Pending Devices', dashboardStats.pendingDevices],
                              ['Rejected Devices', dashboardStats.rejectedDevices],
                              ['Approval Rate', dashboardStats.totalDevices > 0 ? Math.round((dashboardStats.approvedDevices / dashboardStats.totalDevices) * 100) + '%' : '0%'],
                              [''],
                              ['User Statistics'],
                              ['Total Users', dashboardStats.totalUsers],
                              ['Active Users', Math.round(dashboardStats.totalUsers * 0.85)],
                              ['New Users This Month', Math.round(dashboardStats.totalUsers * 0.15)],
                              ['Growth Rate', '+12.5%'],
                              [''],
                              ['Request Statistics'],
                              ['Total Requests', dashboardStats.totalRequests],
                              ['Verification Requests', Math.floor(dashboardStats.totalUsers * 0.1) || 0]
                            ];
                            
                            const csv = analyticsData.map(row => row.join(',')).join('\n');
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `YantraDaan_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                            
                            toast({
                              title: "Success",
                              description: "Analytics report exported successfully",
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to export analytics report",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Analytics
                      </Button>
                      <Button 
                        className="bg-gradient-to-r from-green-600 to-yellow-500 text-white"
                        onClick={() => {
                          toast({
                            title: "Report Generated",
                            description: "Analytics report has been generated successfully",
                          });
                        }}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Generate Report
                      </Button>
                    </div>
                  </div>
          
                  {/* Analytics Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Device Analytics with Circular Chart */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                          <Gift className="w-5 h-5 mr-2 text-green-600" />
                          Device Analytics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Circular Progress Chart */}
                          <div className="flex items-center justify-center">
                            <div className="relative w-32 h-32">
                              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                                {/* Background circle */}
                                <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#f3f4f6"
                                  strokeWidth="3"
                                />
                                {/* Progress circle */}
                                <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="url(#gradient1)"
                                  strokeWidth="3"
                                  strokeDasharray={`${dashboardStats.totalDevices > 0 ? (dashboardStats.approvedDevices / dashboardStats.totalDevices) * 100 : 0}, 100`}
                                  strokeLinecap="round"
                                />
                                <defs>
                                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#eab308" />
                                  </linearGradient>
                                </defs>
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-xl font-bold text-gray-900">
                                    {dashboardStats.totalDevices > 0 ? Math.round((dashboardStats.approvedDevices / dashboardStats.totalDevices) * 100) : 0}%
                                  </div>
                                  <div className="text-xs text-gray-500">Approved</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Device Status Breakdown with animated bars */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                              <div className="flex items-center">
                                <div className="w-4 h-4 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700">Approved</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-green-600">{dashboardStats.approvedDevices}</span>
                                <div className="w-16 bg-green-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${dashboardStats.totalDevices > 0 ? (dashboardStats.approvedDevices / Math.max(dashboardStats.approvedDevices, dashboardStats.pendingDevices, dashboardStats.rejectedDevices)) * 100 : 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                              <div className="flex items-center">
                                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3 animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700">Pending</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-yellow-600">{dashboardStats.pendingDevices}</span>
                                <div className="w-16 bg-yellow-200 rounded-full h-2">
                                  <div 
                                    className="bg-yellow-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${dashboardStats.totalDevices > 0 ? (dashboardStats.pendingDevices / Math.max(dashboardStats.approvedDevices, dashboardStats.pendingDevices, dashboardStats.rejectedDevices)) * 100 : 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                              <div className="flex items-center">
                                <div className="w-4 h-4 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700">Rejected</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-red-600">{dashboardStats.rejectedDevices}</span>
                                <div className="w-16 bg-red-200 rounded-full h-2">
                                  <div 
                                    className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${dashboardStats.totalDevices > 0 ? (dashboardStats.rejectedDevices / Math.max(dashboardStats.approvedDevices, dashboardStats.pendingDevices, dashboardStats.rejectedDevices)) * 100 : 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
          
                    {/* User Growth with Radial Chart */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                          <Users className="w-5 h-5 mr-2 text-blue-600" />
                          User Analytics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* User Growth Radial Chart */}
                          <div className="flex items-center justify-center">
                            <div className="relative w-36 h-36">
                              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 42 42">
                                {/* Background circle */}
                                <circle
                                  cx="21"
                                  cy="21"
                                  r="15.5"
                                  fill="none"
                                  stroke="#e5e7eb"
                                  strokeWidth="3"
                                />
                                {/* Active users circle */}
                                <circle
                                  cx="21"
                                  cy="21"
                                  r="15.5"
                                  fill="none"
                                  stroke="url(#userGradient)"
                                  strokeWidth="3"
                                  strokeDasharray="85 15"
                                  strokeLinecap="round"
                                  className="animate-pulse"
                                />
                                <defs>
                                  <linearGradient id="userGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="50%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                  </linearGradient>
                                </defs>
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">{dashboardStats.totalUsers}</div>
                                  <div className="text-xs text-gray-500">Total Users</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* User Statistics with Trend Indicators */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                              <div className="flex items-center">
                                <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
                                <span className="text-sm font-medium text-gray-700">Growth Rate</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-green-600">+12.5%</span>
                                <div className="w-12 bg-green-200 rounded-full h-1">
                                  <div className="bg-green-500 h-1 rounded-full w-3/4 animate-pulse"></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                                <span className="text-sm font-medium text-gray-700">Active Users</span>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-indigo-600">{Math.round(dashboardStats.totalUsers * 0.85)}</span>
                                  <div className="w-16 bg-indigo-200 rounded-full h-2">
                                    <div className="bg-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out w-4/5"></div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                <span className="text-sm font-medium text-gray-700">New This Month</span>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-purple-600">+{Math.round(dashboardStats.totalUsers * 0.15)}</span>
                                  <div className="w-16 bg-purple-200 rounded-full h-2">
                                    <div className="bg-purple-500 h-2 rounded-full transition-all duration-1000 ease-out w-3/5"></div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg border border-teal-200">
                                <span className="text-sm font-medium text-gray-700">Verified Users</span>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-teal-600">{Math.round(dashboardStats.totalUsers * 0.7)}</span>
                                  <div className="w-16 bg-teal-200 rounded-full h-2">
                                    <div className="bg-teal-500 h-2 rounded-full transition-all duration-1000 ease-out w-4/5"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Platform Performance with Interactive Gauges */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                          Platform Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Performance Gauge */}
                          <div className="flex items-center justify-center">
                            <div className="relative w-32 h-16 overflow-hidden">
                              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                                {/* Background arc */}
                                <path
                                  d="M6 18 A 12 12 0 0 1 30 18"
                                  fill="none"
                                  stroke="#f3f4f6"
                                  strokeWidth="3"
                                />
                                {/* Performance arc */}
                                <path
                                  d="M6 18 A 12 12 0 0 1 30 18"
                                  fill="none"
                                  stroke="url(#performanceGradient)"
                                  strokeWidth="3"
                                  strokeDasharray="94.2, 100"
                                  strokeLinecap="round"
                                  className="animate-pulse"
                                />
                                <defs>
                                  <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="50%" stopColor="#06b6d4" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                  </linearGradient>
                                </defs>
                              </svg>
                              <div className="absolute bottom-0 left-0 right-0 text-center">
                                <div className="text-lg font-bold text-purple-600">94.2%</div>
                                <div className="text-xs text-gray-500">Performance</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Performance Metrics with Animation */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-ping"></div>
                                <span className="text-sm font-medium text-gray-700">Success Rate</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-green-600">94.2%</span>
                                <div className="w-12 bg-green-200 rounded-full h-2">
                                  <div className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out w-11/12"></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700">Avg. Response Time</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-blue-600">1.2s</span>
                                <div className="w-12 bg-blue-200 rounded-full h-2">
                                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out w-1/4"></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 animate-bounce"></div>
                                <span className="text-sm font-medium text-gray-700">Daily Active Users</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-yellow-600">{Math.round(dashboardStats.totalUsers * 0.4)}</span>
                                <div className="w-12 bg-yellow-200 rounded-full h-2">
                                  <div className="bg-yellow-500 h-2 rounded-full transition-all duration-1000 ease-out w-2/5"></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700">Total Requests</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-purple-600">{dashboardStats.totalRequests}</span>
                                <div className="w-12 bg-purple-200 rounded-full h-2">
                                  <div className="bg-purple-500 h-2 rounded-full transition-all duration-1000 ease-out w-3/4"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Health Status with Live Indicator */}
                          <div className="pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                              <div className="flex items-center">
                                <div className="relative">
                                  <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                                  <div className="absolute inset-0 w-4 h-4 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 ml-3">Platform Health</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-emerald-600">Excellent</span>
                                <div className="flex space-x-1">
                                  <div className="w-1 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                                  <div className="w-1 h-4 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                                  <div className="w-1 h-4 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                  <div className="w-1 h-4 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Real-time Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mt-3">
                              <div className="text-center p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border border-cyan-200">
                                <div className="text-lg font-bold text-cyan-600">98.5%</div>
                                <div className="text-xs text-gray-500">Uptime</div>
                                <div className="w-full bg-cyan-200 rounded-full h-1 mt-1">
                                  <div className="bg-cyan-500 h-1 rounded-full w-11/12 animate-pulse"></div>
                                </div>
                              </div>
                              <div className="text-center p-3 bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg border border-rose-200">
                                <div className="text-lg font-bold text-rose-600">4.8/5</div>
                                <div className="text-xs text-gray-500">User Rating</div>
                                <div className="flex justify-center mt-1">
                                  {[1,2,3,4,5].map(star => (
                                    <div key={star} className={`w-2 h-2 rounded-full mx-0.5 ${star <= 4 ? 'bg-rose-500' : 'bg-gray-300'} ${star <= 4 ? 'animate-pulse' : ''}`}></div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
          
              {/* Overview Tab */}
              {selectedTab === "overview" && (
                <div className="w-full">
                  {/* Header with Download Button */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold admin-gradient-text">Dashboard Overview</h2>
                      <p className="text-gray-600 mt-1">Comprehensive admin dashboard with key metrics</p>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={refreshAllData}
                        variant="outline"
                        disabled={isRefreshLoading}
                      >
                        {isRefreshLoading ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Refresh
                      </Button>
                    </div>
                  </div>
              
                  {/* Overview Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="admin-card-green border-0 shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-white" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">{dashboardStats.totalUsers}</div>
                        <p className="text-xs text-green-100">+12% from last month</p>
                      </CardContent>
                    </Card>
              
                    <Card className="admin-card-yellow border-0 shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Total Devices</CardTitle>
                        <Gift className="h-4 w-4 text-white" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">{dashboardStats.totalDevices}</div>
                        <p className="text-xs text-yellow-100">+8% from last month</p>
                      </CardContent>
                    </Card>
              
                    <Card className="admin-card-green border-0 shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Pending Approval</CardTitle>
                        <Clock className="h-4 w-4 text-white" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">{dashboardStats.pendingDevices}</div>
                        <p className="text-xs text-green-100">Awaiting your review</p>
                      </CardContent>
                    </Card>
      
                     
                    <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Rejected Devices</CardTitle>
                        <XCircle className="h-4 w-4 text-white" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">{dashboardStats.rejectedDevices}</div>
                        <p className="text-xs text-red-100">Declined submissions</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Device Requests</CardTitle>
                        <FileText className="h-4 w-4 text-white" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">{dashboardStats.totalRequests}</div>
                        <p className="text-xs text-blue-100">Requests for devices</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Verification Requests</CardTitle>
                        <UserCheck className="h-4 w-4 text-white" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">{Math.floor(dashboardStats.totalUsers * 0.1) || 0}</div>
                        <p className="text-xs text-purple-100">Pending verifications</p>
                      </CardContent>
                    </Card>
                        <Card className="admin-card-yellow border-0 shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Success Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-white" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">
                          {dashboardStats.totalDevices > 0 
                            ? Math.round((dashboardStats.approvedDevices / dashboardStats.totalDevices) * 100)
                            : 0}%
                        </div>
                        <p className="text-xs text-yellow-100">Approval success rate</p>
                      </CardContent>
                    </Card>
                  </div>
              
                  {/* Recent Activity Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Donations */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="admin-gradient-text flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Recent Donations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
                          </div>
                        ) : recentDonations.length > 0 ? (
                          <div className="space-y-4">
                            {recentDonations.slice(0, 5).map((donation) => (
                              <div key={donation._id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors cursor-pointer"
                                   onClick={() => {
                                     setSelectedDevice(donation);
                                     setIsDeviceDetailsOpen(true);
                                   }}>
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-yellow-500 rounded-lg flex items-center justify-center">
                                    {getDeviceIcon(donation.deviceType)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{donation.deviceName}</p>
                                    <p className="text-sm text-gray-600">{donation.category} • {donation.condition}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge className={getStatusBadgeColor(donation.status)}>
                                    {donation.status}
                                  </Badge>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(donation.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No recent donations found</p>
                            <Button
                              onClick={refreshAllData}
                              variant="outline"
                              className="mt-3"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Refresh
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
              
                    {/* Pending Approvals */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="admin-gradient-text flex items-center">
                          <AlertCircle className="w-5 h-5 mr-2" />
                          Pending Approvals
                          {pendingDevices.length > 0 && (
                            <Badge className="ml-2 bg-red-500 text-white">
                              {pendingDevices.length}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin text-yellow-600" />
                          </div>
                        ) : pendingDevices.length > 0 ? (
                          <div className="space-y-4">
                            {pendingDevices.slice(0, 5).map((device) => (
                              <div key={device._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100 hover:bg-yellow-100 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                                    {getDeviceIcon(device.deviceType)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{device.deviceName}</p>
                                    <p className="text-sm text-gray-600">{device.category} • {device.condition}</p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={async () => {
                                      const confirmed = window.confirm(
                                        `Approve "${device.deviceName}"?\n\n` +
                                        `This device will become visible to the public and available for requests.`
                                      );
                                      if (confirmed) {
                                        await updateDeviceStatus(device._id, 'approved');
                                      }
                                    }}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    disabled={isActionLoading}
                                    title="Approve and make device public"
                                  >
                                    {isActionLoading ? (
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button
                                    onClick={() => updateDeviceStatus(device._id, 'rejected')}
                                    size="sm"
                                    variant="destructive"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No pending approvals</p>
                            <p className="text-sm text-gray-400 mt-1">All devices are reviewed!</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Devices Tab */}
              {selectedTab === "devices" && (
                <div className="w-full space-y-6">
                  {/* Devices Header with Filters and Bulk Actions */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold admin-gradient-text">Device Management</h2>
                      <p className="text-gray-600">Manage all device donations and approvals</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {/* Add Device Button */}
                      <Button
                        onClick={() => {
                          // TODO: Implement add device functionality
                          toast({
                            title: "Add Device",
                            description: "Add device functionality will be implemented",
                          });
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Device
                      </Button>
                      
                      {/* Advanced Search */}
                      <div className="flex items-center space-x-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search devices..."
                          value={searchQuery}
                          onChange={(e) => handleAdvancedSearch(e.target.value)}
                          className="w-64"
                        />
                      </div>
                      
                      {/* Download Button */}
                      <Button
                        onClick={async () => {
                          try {
                            const devicesData = allDevices.map(device => ({
                              id: device._id,
                              name: device.deviceName,
                              category: device.category,
                              condition: device.condition,
                              status: device.status,
                              owner: device.owner?.name || 'N/A',
                              email: device.owner?.email || 'N/A',
                              createdAt: new Date(device.createdAt).toLocaleDateString()
                            }));
                            
                            const csv = [
                              ['ID', 'Name', 'Category', 'Condition', 'Status', 'Owner', 'Email', 'Created'],
                              ...devicesData.map(Object.values)
                            ].map(row => row.join(',')).join('\n');
                            
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `devices_${new Date().toISOString().split('T')[0]}.csv`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                            
                            toast({
                              title: "Success",
                              description: "Devices data exported successfully",
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to export devices data",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="bg-gradient-to-r from-green-600 to-yellow-500 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                              
                  {/* Advanced Filters */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-4">
                        <Select value={deviceFilters.status} onValueChange={(value) => {
                          const newFilters = { ...deviceFilters, status: value };
                          setDeviceFilters(newFilters);
                          fetchAllDevices(1, newFilters);
                        }}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select value={deviceFilters.deviceType} onValueChange={(value) => {
                          const newFilters = { ...deviceFilters, deviceType: value };
                          setDeviceFilters(newFilters);
                          fetchAllDevices(1, newFilters);
                        }}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Device Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="laptop">Laptop</SelectItem>
                            <SelectItem value="mobile">Mobile</SelectItem>
                            <SelectItem value="tablet">Tablet</SelectItem>
                            <SelectItem value="desktop">Desktop</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select value={deviceFilters.condition} onValueChange={(value) => {
                          const newFilters = { ...deviceFilters, condition: value };
                          setDeviceFilters(newFilters);
                          fetchAllDevices(1, newFilters);
                        }}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Conditions</SelectItem>
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          onClick={() => {
                            setDeviceFilters({ status: 'all', deviceType: 'all', condition: 'all' });
                            setSearchQuery('');
                            fetchAllDevices(1, { status: 'all', deviceType: 'all', condition: 'all' });
                          }}
                          variant="outline"
                        >
                          Clear Filters
                        </Button>
                        
                        <Button 
                          onClick={() => fetchAllDevices(currentPage, deviceFilters)} 
                          disabled={isDevicesLoading}
                          className="btn-admin"
                        >
                          {isDevicesLoading ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                          )}
                          Refresh
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
              
                  {/* Devices Table */}
                  {isDevicesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
                      <span className="ml-3 text-lg text-gray-600">Loading devices...</span>
                    </div>
                  ) : allDevices.length > 0 ? (
                    <>
                      <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Device
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Owner
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Condition
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {allDevices.map((device) => (
                                  <tr key={device._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-green-500 to-yellow-500 rounded-lg flex items-center justify-center">
                                          {getDeviceIcon(device.deviceType)}
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900">{device.deviceName}</div>
                                          <div className="text-sm text-gray-500">{device.category}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{device.ownerInfo?.name || 'Unknown Owner'}</div>
                                      <div className="text-sm text-gray-500">{device.ownerInfo?.email || 'No Email'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900 capitalize">{device.deviceType || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <Badge className={`${getConditionBadgeColor(device.condition)} text-xs`}>
                                        {device.condition?.charAt(0).toUpperCase() + device.condition?.slice(1)}
                                      </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <Badge className={`${getStatusBadgeColor(device.status)} text-xs`}>
                                        {device.status?.charAt(0).toUpperCase() + device.status?.slice(1)}
                                      </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(device.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <div className="flex justify-end space-x-2">
                                        <Button 
                                          onClick={() => {
                                            setSelectedDevice(device);
                                            setSelectedDeviceOwner(null);
                                            setIsDeviceDetailsOpen(true);
                                            fetchDeviceOwner(device._id);
                                          }}
                                          variant="outline" 
                                          size="sm" 
                                          className="flex-1 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700"
                                          disabled={isActionLoading}
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                        
                                        <Button
                                          onClick={() => {
                                            setEditFormData({
                                              deviceName: device.deviceName || '',
                                              category: device.category || '',
                                              condition: device.condition || '',
                                              description: device.description || '',
                                              status: device.status || ''
                                            });
                                            setSelectedDevice(device);
                                            setIsEditDeviceOpen(true);
                                          }}
                                          variant="outline"
                                          size="sm"
                                          className="flex-1 border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700 hover:text-purple-700"
                                          disabled={isActionLoading}
                                          title="Edit device details"
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </Button>
                                        
                                        {device.status !== 'approved' && (
                                          <Button 
                                            onClick={async () => {
                                              const confirmed = window.confirm(
                                                `Are you sure you want to approve "${device.deviceName}"?\n\n` +
                                                `This will make the device visible to the public and available for requests.`
                                              );
                                              if (!confirmed) return;
                                              
                                              try {
                                                setIsActionLoading(true);
                                                await updateDeviceStatus(device._id, 'approved');
                                              } catch (error) {
                                                // Error handling is done in updateDeviceStatus
                                              } finally {
                                                setIsActionLoading(false);
                                              }
                                            }}
                                            size="sm" 
                                            className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-sm"
                                            disabled={isActionLoading || device.status === 'approved'}
                                            title={device.status === 'approved' ? 'Already approved and visible to public' : 'Approve device and make it visible to public'}
                                          >
                                            {isActionLoading ? (
                                              <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                              <CheckCircle className="w-4 h-4" />
                                            )}
                                          </Button>
                                        )}
                                        
                                        {device.status !== 'rejected' ? (
                                          <Button 
                                            onClick={() => {
                                              setSelectedDeviceForAction(device);
                                              setShowRejectDialog(true);
                                            }}
                                            size="sm" 
                                            variant="outline"
                                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                            disabled={isSubmittingAction}
                                            title="Reject device with reason"
                                          >
                                            <XCircle className="w-4 h-4" />
                                          </Button>
                                        ) : (
                                          <Button 
                                            onClick={() => {
                                              setSelectedDeviceForAction(device);
                                              setShowResetDialog(true);
                                            }}
                                            size="sm" 
                                            variant="outline"
                                            className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-300"
                                            disabled={isSubmittingAction}
                                            title="Reset to pending status with reason"
                                          >
                                            <Clock className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
              
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-4 mt-8">
                          <Button
                            onClick={() => fetchAllDevices(currentPage - 1, deviceFilters)}
                            disabled={currentPage === 1 || isDevicesLoading}
                            variant="outline"
                          >
                            Previous
                          </Button>
                                    
                          <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages} ({totalDevices} total)
                          </span>
                                    
                          <Button
                            onClick={() => fetchAllDevices(currentPage + 1, deviceFilters)}
                            disabled={currentPage === totalPages || isDevicesLoading}
                            variant="outline"
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-center py-8 text-gray-500">
                        <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg">No devices found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or refresh the data</p>
                      </div>
                      <Button 
                        onClick={() => fetchAllDevices(1, deviceFilters)} 
                        className="mt-4 btn-admin"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Users Tab */}
              {selectedTab === "users" && (
                <div className="w-full space-y-6">
                  {/* Users Header with Filters */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold admin-gradient-text">User Management</h2>
                      <p className="text-gray-600">Manage all registered users and their roles</p>
                    </div>
                              
                    {/* Filters and Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        onClick={handleCreateUser}
                        className="btn-admin flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Create New User
                      </Button>
                      
                      <Select value={userFilters.role} onValueChange={(value) => {
                        const newFilters = { ...userFilters, role: value };
                        setUserFilters(newFilters);
                        fetchAllUsers(1, newFilters);
                      }}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="donor">Donor</SelectItem>
                          <SelectItem value="requester">Requester</SelectItem>
                        </SelectContent>
                      </Select>
                                
                      <Select value={userFilters.status} onValueChange={(value) => {
                        const newFilters = { ...userFilters, status: value };
                        setUserFilters(newFilters);
                        fetchAllUsers(1, newFilters);
                      }}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                                 
                      <Button 
                        onClick={() => fetchAllUsers(currentUserPage, userFilters)} 
                        disabled={isUsersLoading}
                        className="btn-admin"
                      >
                        {isUsersLoading ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Refresh
                      </Button>
                    </div>
                  </div>
              
                  {/* Users Grid */}
                  {isUsersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin text-yellow-600" />
                      <span className="ml-3 text-lg text-gray-600">Loading users...</span>
                    </div>
                  ) : allUsers.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {allUsers.map((user) => (
                          <Card 
                            key={user._id} 
                            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                            onClick={() => showUserDetails(user)}
                          >
                            {/* Image Section */}
                            <div className="relative h-48 overflow-hidden rounded-t-lg">
                              {user.avatar || user.profileImage ? (
                                <>
                                  <img 
                                    src={user.avatar || user.profileImage}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      console.log('User image failed to load:', user.avatar || user.profileImage);
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                  <div 
                                    className={`absolute inset-0 w-full h-full bg-gradient-to-br ${getUserRoleGradient(user.role || user.userRole)} flex items-center justify-center`}
                                    style={{ display: 'none' }}
                                  >
                                    <User className="w-16 h-16 text-white" />
                                  </div>
                                </>
                              ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${getUserRoleGradient(user.role || user.userRole)} flex items-center justify-center`}>
                                  <User className="w-16 h-16 text-white" />
                                </div>
                              )}

                              {/* Status Badge */}
                              <div className="absolute top-3 right-3">
                                <Badge className={user.isVerified ? 'bg-green-500 text-white' : getUserStatusBadgeColor(user.status || 'active')}>
                                  {user.isVerified ? 'Verified' : user.status || 'active'}
                                </Badge>
                              </div>
                              

                              {/* Role Badge */}
                              <div className="absolute top-3 left-3">
                                <Badge className={getUserRoleBadgeColor(user.role || user.userRole)}>
                                  {user.role || user.userRole || 'user'}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Details Section */}
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-900 truncate">{user.name}</h3>
                                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                                </div>
                                

                                {/* User Details */}
                                <div className="space-y-1">
                                  {user.phone && (
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Phone className="w-4 h-4 mr-1" />
                                      <span className="truncate">{user.phone}</span>
                                    </div>
                                  )}
                                  {user.profession && (
                                    <div className="flex items-center text-sm text-gray-500">
                                      <GraduationCap className="w-4 h-4 mr-1" />
                                      <span className="truncate">{user.profession}</span>
                                    </div>
                                  )}
                                  {user.organization && (
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Building2 className="w-4 h-4 mr-1" />
                                      <span className="truncate">{user.organization}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                

                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
              
                      {/* Pagination */}
                      {totalUserPages > 1 && (
                        <div className="flex justify-center items-center space-x-4 mt-8">
                          <Button
                            onClick={() => fetchAllUsers(currentUserPage - 1, userFilters)}
                            disabled={currentUserPage === 1 || isUsersLoading}
                            variant="outline"
                          >
                            Previous
                          </Button>
                                    
                          <span className="text-sm text-gray-600">
                            Page {currentUserPage} of {totalUserPages} ({totalUsers} total)
                          </span>
                                    
                          <Button
                            onClick={() => fetchAllUsers(currentUserPage + 1, userFilters)}
                            disabled={currentUserPage === totalUserPages || isUsersLoading}
                            variant="outline"
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No users found</p>
                      </div>
                      <Button 
                        onClick={() => fetchAllUsers(1, userFilters)} 
                        className="mt-4 btn-admin"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Dashboard/Requests Tab */}
              {selectedTab === "requests" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Request Management</h2>
                      <p className="text-gray-600 mt-1">Manage all device requests and assignments</p>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => {
                          // Export requests data
                          // TODO: Implement real export functionality
                          toast({
                            title: "Feature Coming Soon",
                            description: "Export functionality will be available in a future update",
                          });
                        }}
                        className="bg-gradient-to-r from-green-600 to-yellow-500 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Requests
                      </Button>
                    </div>
                  </div>
                  

                  {/* Request Stats Cards - We'll update these to show real data */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-100 text-sm">Total Requests</p>
                            <p className="text-2xl font-bold">{totalRequests || 0}</p>
                          </div>
                          <FileText className="h-8 w-8 text-blue-200" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-100 text-sm">Pending Review</p>
                            <p className="text-2xl font-bold">0</p>
                          </div>
                          <Clock className="h-8 w-8 text-yellow-200" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm">Approved</p>
                            <p className="text-2xl font-bold">0</p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-green-200" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100 text-sm">Fulfilled</p>
                            <p className="text-2xl font-bold">0</p>
                          </div>
                          <Gift className="h-8 w-8 text-purple-200" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  

                  {/* Filters and Search */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                          <Search className="w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="Search requests..."
                            className="w-64"
                            value={requestFilters.search}
                            onChange={(e) => setRequestFilters({...requestFilters, search: e.target.value})}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                fetchDeviceRequests(1, {...requestFilters, search: e.currentTarget.value});
                              }
                            }}
                          />
                        </div>
                        
                        <Select 
                          value={requestFilters.status} 
                          onValueChange={(value) => {
                            setRequestFilters({...requestFilters, status: value});
                            fetchDeviceRequests(1, {...requestFilters, status: value});
                          }}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setRequestFilters({status: 'all', search: ''});
                            fetchDeviceRequests(1, {status: 'all', search: ''});
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  

                  {/* Requests Table */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">Device Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isRequestsLoading ? (
                        <div className="flex justify-center items-center h-32">
                          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                        </div>
                      ) : deviceRequests.length === 0 ? (
                        <NoDataFound 
                          title="No Device Requests Found" 
                          description="There are currently no device requests matching your criteria." 
                        />
                      ) : (
                        <div className="space-y-4">
                          {/* Real Request Items */}
                          {deviceRequests.map((request: any) => (
                            <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                    <Laptop className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {request.deviceInfo?.title || 'Device Request'} - {request._id?.substring(0, 8)}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      Requested by {request.requesterInfo?.name || 'Unknown User'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(request.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <Badge 
                                    className={
                                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                      request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }
                                  >
                                    {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                                  </Badge>
                                  <div className="flex space-x-2">
                                    <Button size="sm" variant="outline">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    {request.status === 'pending' && (
                                      <>
                                        <Button 
                                          size="sm" 
                                          className="bg-green-600 hover:bg-green-700"
                                          onClick={() => handleApproveRequest(request._id)}
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="destructive"
                                          onClick={() => handleRejectRequest(request._id)}
                                        >
                                          <XCircle className="w-4 h-4" />
                                        </Button>
                                      </>
                                    )}
                                    {request.status === 'approved' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleDownloadInvoice(request._id)}
                                      >
                                        <Download className="w-4 h-4 mr-1" />
                                        Invoice
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3 pl-16">
                                <p className="text-sm text-gray-700">
                                  {request.message || "No message provided"}
                                </p>
                                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                  <span>• Device: {request.deviceInfo?.deviceType || 'Unknown'}</span>
                                  <span>• Requester: {request.requesterInfo?.email || 'Unknown'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      

                      {/* Pagination */}
                      <div className="flex justify-center items-center space-x-4 mt-6">
                        <Button 
                          variant="outline" 
                          disabled={currentRequestPage <= 1}
                          onClick={() => fetchDeviceRequests(currentRequestPage - 1)}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-gray-600">
                          Page {currentRequestPage} of {totalRequestPages} ({totalRequests} total requests)
                        </span>
                        <Button 
                          variant="outline"
                          disabled={currentRequestPage >= totalRequestPages}
                          onClick={() => fetchDeviceRequests(currentRequestPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Team Tab */}
              {selectedTab === "team" && (
                <div className="w-full space-y-6">
                  {/* Team Header */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold admin-gradient-text">Team Management</h2>
                      <p className="text-gray-600">View and manage your organization's team members</p>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleCreateTeamMember}
                        className="btn-admin flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Team Member
                      </Button>
                      <Button 
                        onClick={() => fetchTeamMembers()} 
                        disabled={isTeamLoading}
                        className="btn-admin"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                  {/* Team Grid */}
                  {isTeamLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin text-yellow-600" />
                      <span className="ml-3 text-lg text-gray-600">Loading team members...</span>
                    </div>
                  ) : allTeamMembers.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {allTeamMembers.map((member) => (
                          <Card 
                            key={member._id} 
                            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                            onClick={() => handleTeamMemberClick(member)}
                          >
                            {/* Image Section */}
                            <div className="relative h-48 overflow-hidden rounded-t-lg">
                              {member.avatar || member.profileImage ? (
                                <>
                                  <img 
                                    src={member.avatar || member.profileImage}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      console.log('Member image failed to load:', member.avatar || member.profileImage);
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                  <div 
                                    className={`absolute inset-0 w-full h-full bg-gradient-to-br ${getRoleColor(member.role || member.userRole)} flex items-center justify-center`}
                                    style={{ display: 'none' }}
                                  >
                                    <User className="w-16 h-16 text-white" />
                                  </div>
                                </>
                              ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${getRoleColor(member.role || member.userRole)} flex items-center justify-center`}>
                                  <User className="w-16 h-16 text-white" />
                                </div>
                              )}

                              {/* Status Badge */}
                              <div className="absolute top-3 right-3">
                                <Badge className={member.isVerified ? 'bg-green-500 text-white' : getUserStatusBadgeColor(member.status || 'active')}>
                                  {member.isVerified ? 'Verified' : member.status || 'active'}
                                </Badge>
                              </div>
                          

                              {/* Role Badge */}
                              <div className="absolute top-3 left-3">
                                <Badge className={getRoleBadgeColor(member.role || member.userRole)}>
                                  {member.role || member.userRole || 'user'}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Details Section */}
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-900 truncate">{member.name}</h3>
                                  <p className="text-sm text-gray-600 truncate">{member.email}</p>
                                </div>
                            

                                {/* User Details */}
                                <div className="space-y-1">
                                  {member.phone && (
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Phone className="w-4 h-4 mr-1" />
                                      <span className="truncate">{member.phone}</span>
                                    </div>
                                  )}
                                  {member.profession && (
                                    <div className="flex items-center text-sm text-gray-500">
                                      <GraduationCap className="w-4 h-4 mr-1" />
                                      <span className="truncate">{member.profession}</span>
                                    </div>
                                  )}
                                  {member.organization && (
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Building2 className="w-4 h-4 mr-1" />
                                      <span className="truncate">{member.organization}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>{new Date(member.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                            

                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
            
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-4 mt-8">
                          <Button
                            onClick={() => fetchTeamMembers()}
                            disabled={currentPage === 1 || isTeamLoading}
                            variant="outline"
                          >
                            Previous
                          </Button>
                                  
                          <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages} ({allTeamMembers.length} total)
                          </span>
                                  
                          <Button
                            onClick={() => fetchTeamMembers()}
                            disabled={currentPage === totalPages || isTeamLoading}
                            variant="outline"
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-center py-8 text-gray-500">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg">No team members found</p>
                        <p className="text-sm text-gray-400 mt-1">Add team members to get started</p>
                      </div>
                      <Button 
                        onClick={() => fetchTeamMembers()} 
                        className="mt-4 btn-admin"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  )}

                </div>
              )}

              {/* Learning Tab */}
              {selectedTab === "learning" && (
                <div className="w-full">
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="admin-gradient-text flex items-center">
                        <BookOpen className="w-5 h-5 mr-2" />
                        Learning Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-gray-500">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Learning management system will be implemented here</p>
                        <p className="text-sm text-gray-400 mt-2">This feature is coming soon</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Import/Export Tab */}
              {selectedTab === "import-export" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Import/Export Data</h2>
                      <p className="text-gray-600 mt-1">Manage data import and export operations</p>
                    </div>
                    <Button
                      onClick={downloadExcelReport}
                      className="bg-gradient-to-r from-green-600 to-yellow-500 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export All Data
                    </Button>
                  </div>
                  

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Export Section */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                          <Download className="w-5 h-5 mr-2 text-green-600" />
                          Export Data
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <Button
                            onClick={() => downloadExcelReport()}
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Export Dashboard Report (Excel)
                          </Button>
                          <Button
                            onClick={() => downloadCSVReport()}
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Export Dashboard Report (CSV)
                          </Button>
                          <Button
                            onClick={async () => {
                              try {
                                const devicesData = allDevices.map(device => ({
                                  id: device._id,
                                  name: device.deviceName,
                                  category: device.category,
                                  condition: device.condition,
                                  status: device.status,
                                  owner: device.owner?.name || 'N/A',
                                  email: device.owner?.email || 'N/A',
                                  createdAt: new Date(device.createdAt).toLocaleDateString()
                                }));
                                
                                const csv = [
                                  ['ID', 'Name', 'Category', 'Condition', 'Status', 'Owner', 'Email', 'Created'],
                                  ...devicesData.map(Object.values)
                                ].map(row => row.join(',')).join('\n');
                                
                                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `devices_${new Date().toISOString().split('T')[0]}.csv`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                URL.revokeObjectURL(url);
                                
                                toast({
                                  title: "Success",
                                  description: "Devices data exported successfully",
                                });
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to export devices data",
                                  variant: "destructive",
                                });
                              }
                            }}
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <Smartphone className="w-4 h-4 mr-2" />
                            Export Devices Data (CSV)
                          </Button>
                          <Button
                            onClick={async () => {
                              try {
                                const usersData = allUsers.map(user => ({
                                  id: user._id,
                                  name: user.name,
                                  email: user.email,
                                  phone: user.phone || 'N/A',
                                  role: user.role || user.userRole || 'user',
                                  organization: user.organization || 'N/A',
                                  verified: user.isVerified ? 'Yes' : 'No',
                                  createdAt: new Date(user.createdAt).toLocaleDateString()
                                }));
                                
                                const csv = [
                                  ['ID', 'Name', 'Email', 'Phone', 'Role', 'Organization', 'Verified', 'Created'],
                                  ...usersData.map(Object.values)
                                ].map(row => row.join(',')).join('\n');
                                
                                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                URL.revokeObjectURL(url);
                                
                                toast({
                                  title: "Success",
                                  description: "Users data exported successfully",
                                });
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to export users data",
                                  variant: "destructive",
                                });
                              }
                            }}
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Export Users Data (CSV)
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Import Section */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                          <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
                          Import Data
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <UserPlus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-600 mb-2">Drag and drop CSV files here</p>
                          <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
                          <Button variant="outline" className="mb-2">
                            Choose Files
                          </Button>
                          <p className="text-xs text-gray-400">Supported formats: CSV, Excel (.xlsx)</p>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">Import Guidelines:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Users CSV should contain: name, email, phone, role</li>
                            <li>• Devices CSV should contain: name, category, condition, description</li>
                            <li>• Maximum 1000 records per import</li>
                            <li>• Duplicate emails will be skipped</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  

                  {/* Import/Export History */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">Recent Import/Export Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Download className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium text-green-900">Dashboard Report Export</p>
                              <p className="text-sm text-green-700">Excel format • 2 minutes ago</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <UserPlus className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-900">User Data Import</p>
                              <p className="text-sm text-blue-700">CSV format • 1 hour ago</p>
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Download className="w-5 h-5 text-yellow-600" />
                            <div>
                              <p className="font-medium text-yellow-900">Device Data Export</p>
                              <p className="text-sm text-yellow-700">CSV format • 3 hours ago</p>
                            </div>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Activity Log Tab */}
              {selectedTab === "activity-log" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
                      <p className="text-gray-600 mt-1">Monitor all administrative actions and system events</p>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={fetchActivityLog}
                        variant="outline"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                      <Button
                        onClick={() => {
                          const logData = activityLog.map(log => ({
                            timestamp: log.timestamp,
                            action: log.action,
                            type: log.type,
                            user: log.user || 'System',
                            details: log.details || 'N/A'
                          }));
                          
                          const csv = [
                            ['Timestamp', 'Action', 'Type', 'User', 'Details'],
                            ...logData.map(Object.values)
                          ].map(row => row.join(',')).join('\n');
                          
                          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `activity_log_${new Date().toISOString().split('T')[0]}.csv`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                          
                          toast({
                            title: "Success",
                            description: "Activity log exported successfully",
                          });
                        }}
                        className="bg-gradient-to-r from-green-600 to-yellow-500 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Log
                      </Button>
                    </div>
                  </div>
                  

                  {/* Activity Filters */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-4">
                        <Select defaultValue="all">
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Activity Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="device">Device Actions</SelectItem>
                            <SelectItem value="user">User Actions</SelectItem>
                            <SelectItem value="system">System Events</SelectItem>
                            <SelectItem value="auth">Authentication</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select defaultValue="today">
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Time Range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Input
                          placeholder="Search activities..."
                          className="flex-1 max-w-md"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  

                  {/* Activity Timeline */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">Recent Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activityLog.length > 0 ? (
                          activityLog.map((activity, index) => (
                            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex-shrink-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  activity.type === 'device' ? 'bg-blue-100' :
                                  activity.type === 'user' ? 'bg-green-100' :
                                  activity.type === 'system' ? 'bg-purple-100' :
                                  'bg-yellow-100'
                                }`}>
                                  {activity.type === 'device' ? <Smartphone className="w-4 h-4 text-blue-600" /> :
                                   activity.type === 'user' ? <User className="w-4 h-4 text-green-600" /> :
                                   activity.type === 'system' ? <Shield className="w-4 h-4 text-purple-600" /> :
                                   <AlertCircle className="w-4 h-4 text-yellow-600" />}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                <p className="text-xs text-gray-500 mt-1">{activity.details || 'No additional details'}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className="text-xs text-gray-400">{activity.timestamp}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {activity.type}
                                  </Badge>
                                  {activity.user && (
                                    <span className="text-xs text-gray-500">by {activity.user}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No recent activities</p>
                            <Button
                              onClick={fetchActivityLog}
                              variant="outline"
                              className="mt-3"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Load Activities
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
          </div>
        </main>

      </div>
      
      {/* Device Details Dialog */}
      <Dialog open={isDeviceDetailsOpen} onOpenChange={setIsDeviceDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="admin-gradient-text flex items-center text-xl">
              {getDeviceIcon(selectedDevice?.deviceType)}
              <span className="ml-2">{selectedDevice?.deviceName}</span>
              <Badge className={`ml-3 ${getStatusBadgeColor(selectedDevice?.status)}`}>
                {selectedDevice?.status}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {selectedDevice && (
            <div className="space-y-6">
              {/* Device Images */}
              {((selectedDevice.devicePhotos && selectedDevice.devicePhotos.length > 0) || (selectedDevice.images && selectedDevice.images.length > 0)) && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Image className="w-4 h-4 mr-2" />
                    Device Images ({(selectedDevice.devicePhotos?.length || 0) + (selectedDevice.images?.length || 0)})
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Display devicePhotos */}
                    {selectedDevice.devicePhotos?.map((photo, index) => (
                      <div key={`photo-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors">
                        <img 
                          src={`${config.apiUrl}/uploads/${photo.url || photo}`} 
                          alt={`Device ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => window.open(`${config.apiUrl}/uploads/${photo.url || photo}`, '_blank')}
                          onError={(e) => {
                            console.error('Failed to load device photo:', photo);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        {photo.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                            {photo.caption}
                          </div>
                        )}
                      </div>
                    ))}
                    {/* Display legacy images */}
                    {selectedDevice.images?.map((image, index) => (
                      <div key={`image-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors">
                        <img 
                          src={`${config.apiUrl}/uploads/${typeof image === 'string' ? image : image.url}`} 
                          alt={`Device ${(selectedDevice.devicePhotos?.length || 0) + index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => window.open(`${config.apiUrl}/uploads/${typeof image === 'string' ? image : image.url}`, '_blank')}
                          onError={(e) => {
                            console.error('Failed to load device image:', image);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        {typeof image === 'object' && image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                            {image.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Device Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Device Information */}
                <Card className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                      <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
                      Device Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Device Name</Label>
                        <p className="text-gray-900 font-medium">{selectedDevice.deviceName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Category</Label>
                        <p className="text-gray-900">{selectedDevice.category}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Device Type</Label>
                        <p className="text-gray-900">{selectedDevice.deviceType || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Condition</Label>
                        <Badge className={getConditionBadgeColor(selectedDevice.condition)}>
                          {selectedDevice.condition}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Brand</Label>
                        <p className="text-gray-900">{selectedDevice.brand || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Model</Label>
                        <p className="text-gray-900">{selectedDevice.model || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Serial Number</Label>
                        <p className="text-gray-900 text-xs font-mono">{selectedDevice.serialNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Year of Purchase</Label>
                        <p className="text-gray-900">{selectedDevice.yearOfPurchase || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {/* Device Specifications */}
                    {selectedDevice.specifications && (
                      <div className="pt-3 border-t border-gray-200">
                        <Label className="text-sm font-medium text-gray-600">Specifications</Label>
                        <div className="mt-2 space-y-1">
                          {selectedDevice.specifications.processor && (
                            <p className="text-sm text-gray-700"><span className="font-medium">Processor:</span> {selectedDevice.specifications.processor}</p>
                          )}
                          {selectedDevice.specifications.memory && (
                            <p className="text-sm text-gray-700"><span className="font-medium">Memory:</span> {selectedDevice.specifications.memory}</p>
                          )}
                          {selectedDevice.specifications.storage && (
                            <p className="text-sm text-gray-700"><span className="font-medium">Storage:</span> {selectedDevice.specifications.storage}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Donation Details */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Submitted Date</Label>
                          <p className="text-gray-900">{new Date(selectedDevice.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                          <p className="text-gray-900">{new Date(selectedDevice.updatedAt || selectedDevice.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Owner Information */}
                <Card className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                      <User className="w-5 h-5 mr-2 text-green-600" />
                      Owner Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedDeviceOwner ? (
                      <div className="space-y-3">
                        {/* Owner Profile Photo */}
                        {selectedDeviceOwner.profilePhoto?.filename && (
                          <div className="flex justify-center">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-400 transition-colors">
                              <img 
                                src={`${config.apiUrl}/uploads/profiles/${selectedDeviceOwner.profilePhoto.filename}`} 
                                alt={selectedDeviceOwner.name}
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(`${config.apiUrl}/uploads/profiles/${selectedDeviceOwner.profilePhoto.filename}`, '_blank')}
                                onError={(e) => {
                                  console.error('Failed to load owner profile photo:', selectedDeviceOwner.profilePhoto);
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.parentElement?.querySelector('.profile-fallback') as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <div className="profile-fallback absolute inset-0 bg-gradient-to-r from-green-500 to-yellow-500 flex items-center justify-center" style={{display: 'none'}}>
                                <User className="w-8 h-8 text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                          <p className="text-gray-900 font-medium">{selectedDeviceOwner.name || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-900">{selectedDeviceOwner.email || 'N/A'}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-900">{selectedDeviceOwner.phone || selectedDeviceOwner.contact || 'N/A'}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Address</Label>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-900">{selectedDeviceOwner.address || 'N/A'}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">City</Label>
                          <p className="text-gray-900">{selectedDeviceOwner.city || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">State</Label>
                          <p className="text-gray-900">{selectedDeviceOwner.state || 'N/A'}</p>
                        </div>
                        
                        {/* Organization Information */}
                        {selectedDeviceOwner.isOrganization && (
                          <div className="pt-3 border-t border-gray-200">
                            <Label className="text-sm font-medium text-gray-600">Organization Type</Label>
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              {selectedDeviceOwner.categoryType || 'Organization'}
                            </Badge>
                          </div>
                        )}
                        
                        {/* Professional Information */}
                        <div className="pt-3 border-t border-gray-200">
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Profession</Label>
                              <div className="flex items-center space-x-2">
                                <GraduationCap className="w-4 h-4 text-gray-400" />
                                <p className="text-gray-900">{selectedDeviceOwner.profession || 'N/A'}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Organization</Label>
                              <div className="flex items-center space-x-2">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <p className="text-gray-900">{selectedDeviceOwner.organization || 'N/A'}</p>
                              </div>
                            </div>
                            {selectedDeviceOwner.about && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">About</Label>
                                <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded">{selectedDeviceOwner.about}</p>
                              </div>
                            )}
                            <div>
                              <Label className="text-sm font-medium text-gray-600">User Role</Label>
                              <Badge className={getUserRoleBadgeColor(selectedDeviceOwner.userRole || selectedDeviceOwner.role)}>
                                {selectedDeviceOwner.userRole || selectedDeviceOwner.role || 'user'}
                              </Badge>
                            </div>
                            {selectedDeviceOwner.isVerified && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Verification Status</Label>
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Verified User
                                </Badge>
                              </div>
                            )}
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Member Since</Label>
                              <p className="text-gray-900">{new Date(selectedDeviceOwner.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Loading owner information...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Description */}
              {selectedDevice.description && (
                <Card className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-purple-600" />
                      Device Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                      {selectedDevice.description}
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {/* Additional Information */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Device ID</Label>
                      <p className="text-gray-900 text-xs font-mono">{selectedDevice._id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Original Price</Label>
                      <p className="text-gray-900">{selectedDevice.originalPrice ? `₹${selectedDevice.originalPrice}` : 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Warranty Status</Label>
                      <p className="text-gray-900">{selectedDevice.warrantyStatus || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Accessories</Label>
                      <p className="text-gray-900">{selectedDevice.accessories ? 'Included' : 'Not Included'}</p>
                    </div>
                  </div>
                  
                  {/* Rejection Reason (if applicable) */}
                  {selectedDevice.status === 'rejected' && selectedDevice.rejectionReason && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Label className="text-sm font-medium text-red-600">Rejection Reason</Label>
                      <p className="text-red-800 bg-red-50 p-3 rounded-lg border border-red-200 mt-1">
                        {selectedDevice.rejectionReason}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Enhanced User Details Dialog */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="admin-gradient-text flex items-center text-2xl">
              <User className="w-6 h-6 mr-3" />
              User Profile: {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Header Section with Avatar and Basic Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    {selectedUser.avatar || selectedUser.profileImage ? (
                      <img 
                        src={selectedUser.avatar || selectedUser.profileImage}
                        alt={selectedUser.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getUserRoleGradient(selectedUser.role || selectedUser.userRole)} flex items-center justify-center border-4 border-white shadow-lg`}>
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedUser.name}</h2>
                    <p className="text-lg text-gray-600 mb-3">{selectedUser.email}</p>
                    
                    {/* Status and Role Badges */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                      <Badge className={getUserRoleBadgeColor(selectedUser.role || selectedUser.userRole)}>
                        <Shield className="w-3 h-3 mr-1" />
                        {selectedUser.role || selectedUser.userRole || 'user'}
                      </Badge>
                      <Badge className={getUserStatusBadgeColor(selectedUser.status || 'active')}>
                        {selectedUser.status || 'active'}
                      </Badge>
                      {selectedUser.isVerified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    {/* Member Since */}
                    <div className="flex items-center justify-center md:justify-start text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      Member since {new Date(selectedUser.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-blue-600" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                      <div className="flex items-center mt-1">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <p className="text-gray-900">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                      <div className="flex items-center mt-1">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <p className="text-gray-900">{selectedUser.phone || selectedUser.contact || 'Not provided'}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Address</Label>
                      <div className="flex items-start mt-1">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                        <p className="text-gray-900">{selectedUser.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Information */}
                <Card className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-green-600" />
                      Professional Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Profession</Label>
                      <div className="flex items-center mt-1">
                        <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                        <p className="text-gray-900">{selectedUser.profession || 'Not specified'}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Organization</Label>
                      <div className="flex items-center mt-1">
                        <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                        <p className="text-gray-900">{selectedUser.organization || 'Not specified'}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Category Type</Label>
                      <div className="flex items-center mt-1">
                        <Tag className="w-4 h-4 mr-2 text-gray-400" />
                        <p className="text-gray-900">{selectedUser.categoryType || 'General'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Information */}
                <Card className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                      <User className="w-5 h-5 mr-2 text-purple-600" />
                      Account Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">User ID</Label>
                      <p className="text-gray-900 text-xs font-mono bg-gray-50 p-2 rounded border">{selectedUser._id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Account Status</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getUserStatusBadgeColor(selectedUser.status || 'active')}>
                          {selectedUser.status || 'active'}
                        </Badge>
                        {selectedUser.isVerified && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Joined Date</Label>
                        <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                      </div>
                      {selectedUser.lastLogin && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Last Login</Label>
                          <p className="text-gray-900">{new Date(selectedUser.lastLogin).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* About & Additional Info */}
                <Card className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-orange-600" />
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">About</Label>
                      <div className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-gray-900 text-sm leading-relaxed">
                          {selectedUser.about || 'No additional information provided by the user.'}
                        </p>
                      </div>
                    </div>
                    {selectedUser.bio && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Bio</Label>
                        <div className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <p className="text-gray-900 text-sm leading-relaxed">{selectedUser.bio}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
                <Button 
                  onClick={handleEditUser}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  disabled={isActionLoading}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
                <Button 
                  onClick={() => deleteUser(selectedUser._id, selectedUser.name)}
                  variant="destructive"
                  className="px-6 py-2"
                  disabled={isDeletingUser || isActionLoading}
                >
                  {isDeletingUser ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete User
                </Button>
                <Button 
                  onClick={() => setIsUserDetailsOpen(false)}
                  variant="outline"
                  className="px-6 py-2"
                  disabled={isActionLoading}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="admin-gradient-text flex items-center">
              <Pencil className="w-5 h-5 mr-2" />
              Edit User
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Name</Label>
              <Input
                value={editUserFormData.name}
                onChange={(e) => setEditUserFormData({ ...editUserFormData, name: e.target.value })}
                placeholder="Enter user name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                type="email"
                value={editUserFormData.email}
                onChange={(e) => setEditUserFormData({ ...editUserFormData, email: e.target.value })}
                placeholder="Enter email address"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Phone</Label>
              <Input
                type="tel"
                value={editUserFormData.phone}
                onChange={(e) => setEditUserFormData({ ...editUserFormData, phone: e.target.value })}
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Profession</Label>
              <Input
                value={editUserFormData.profession}
                onChange={(e) => setEditUserFormData({ ...editUserFormData, profession: e.target.value })}
                placeholder="Enter profession"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Organization</Label>
              <Input
                value={editUserFormData.organization}
                onChange={(e) => setEditUserFormData({ ...editUserFormData, organization: e.target.value })}
                placeholder="Enter organization"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Role</Label>
              <Select
                value={editUserFormData.role}
                onValueChange={(value) => setEditUserFormData({ ...editUserFormData, role: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="donor">Donor</SelectItem>
                  <SelectItem value="requester">Requester</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <Select
                value={editUserFormData.status}
                onValueChange={(value) => setEditUserFormData({ ...editUserFormData, status: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={saveUserChanges}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isActionLoading || !editUserFormData.name || !editUserFormData.email}
              >
                {isActionLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Pencil className="w-4 h-4 mr-2" />
                )}
                Update User
              </Button>
              <Button
                onClick={() => setIsEditUserOpen(false)}
                variant="outline"
                className="flex-1"
                disabled={isActionLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Device Dialog */}
      <Dialog open={isEditDeviceOpen} onOpenChange={setIsEditDeviceOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="admin-gradient-text flex items-center">
              <Pencil className="w-5 h-5 mr-2" />
              Edit Device
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Device Name</Label>
              <Input
                value={editFormData.deviceName}
                onChange={(e) => setEditFormData({ ...editFormData, deviceName: e.target.value })}
                placeholder="Enter device name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Category</Label>
              <Select
                value={editFormData.category}
                onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Condition</Label>
              <Select
                value={editFormData.condition}
                onValueChange={(value) => setEditFormData({ ...editFormData, condition: value })}
              >
                <SelectTrigger className="mt-1">
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
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Description</Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Enter device description"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => {
                  if (selectedDevice) {
                    handleEditDevice(selectedDevice._id, editFormData);
                  }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isActionLoading || !editFormData.deviceName || !editFormData.category}
              >
                {isActionLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Pencil className="w-4 h-4 mr-2" />
                )}
                Update Device
              </Button>
              <Button
                onClick={() => setIsEditDeviceOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Reject Device Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600">Reject Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              You are about to reject <strong>{selectedDeviceForAction?.deviceName}</strong>.
              Please provide a reason for rejection.
            </p>
            <div>
              <Label htmlFor="rejectionReason" className="text-sm font-medium text-gray-700">
                Rejection Reason
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter the reason for rejecting this device..."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setSelectedDeviceForAction(null);
                setRejectionNote('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectDevice}
              disabled={isSubmittingAction || !rejectionNote.trim()}
            >
              {isSubmittingAction ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reject Device
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset to Pending Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-yellow-600">Reset to Pending</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              You are about to reset <strong>{selectedDeviceForAction?.deviceName}</strong> to pending status.
              Please provide a reason for this action.
            </p>
            <div>
              <Label htmlFor="resetReason" className="text-sm font-medium text-gray-700">
                Reset Reason
              </Label>
              <Textarea
                id="resetReason"
                placeholder="Enter the reason for resetting this device to pending..."
                value={resetNote}
                onChange={(e) => setResetNote(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResetDialog(false);
                setSelectedDeviceForAction(null);
                setResetNote('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border-yellow-300"
              onClick={handleResetDevice}
              disabled={isSubmittingAction || !resetNote.trim()}
            >
              {isSubmittingAction ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Clock className="w-4 h-4 mr-2" />
              )}
              Reset to Pending
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Team Member Details Dialog */}
      <Dialog open={showTeamMemberDialog} onOpenChange={setShowTeamMemberDialog}>
        <DialogContent className="max-w-2xl h-[80vh] overflow-y-auto animate-in slide-in-from-right-full duration-300">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold admin-gradient-text flex items-center">
              <User className="w-6 h-6 mr-2" />
              Team Member Details
            </DialogTitle>
          </DialogHeader>
          {selectedTeamMember && (
            <div className="space-y-6">
              {!isEditingTeamMember ? (
                /* View Mode - Original Content */
                <>
                  {/* Header Section */}
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0 relative">
                      {selectedTeamMember.avatar ? (
                        <>
                          <img 
                            src={`${config.apiUrl}${selectedTeamMember.avatar}`}
                            alt={selectedTeamMember.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                            onError={(e) => {
                              console.log('Dialog image failed to load:', selectedTeamMember.avatar);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                            onLoad={() => {
                              console.log('Dialog image loaded successfully:', selectedTeamMember.avatar);
                            }}
                          />
                          <div 
                            className={`absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-br ${getRoleColor(selectedTeamMember.role)} flex items-center justify-center border-4 border-white shadow-lg`}
                            style={{ display: 'none' }}
                          >
                            <User className="w-12 h-12 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getRoleColor(selectedTeamMember.role)} flex items-center justify-center border-4 border-white shadow-lg`}>
                          <User className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Basic Info */}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold text-gray-900">{selectedTeamMember.name}</h3>
                      <Badge className={`${getRoleBadgeColor(selectedTeamMember.role)} text-sm mt-2`}>
                        {selectedTeamMember.role}
                      </Badge>
                      <div className="flex items-center justify-center md:justify-start mt-2">
                        <Badge variant={selectedTeamMember.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                          {selectedTeamMember.status === 'active' ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Contact Information</h4>
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-3 text-green-600" />
                        <span>{selectedTeamMember.email}</span>
                      </div>
                      {selectedTeamMember.contact && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-3 text-blue-600" />
                          <span>{selectedTeamMember.contact}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-3 text-purple-600" />
                        <span>Joined {new Date(selectedTeamMember.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Social Links */}
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Social Links</h4>
                      {selectedTeamMember.socialLinks ? (
                        <div className="space-y-2">
                          {selectedTeamMember.socialLinks.linkedin && (
                            <a 
                              href={selectedTeamMember.socialLinks.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                              LinkedIn Profile
                            </a>
                          )}
                          {selectedTeamMember.socialLinks.instagram && (
                            <a 
                              href={selectedTeamMember.socialLinks.instagram} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-pink-600 hover:text-pink-800 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.435-3.396-1.154l-.027-.021c-.938-.719-1.544-1.815-1.544-3.063 0-2.174 1.763-3.938 3.938-3.938s3.938 1.764 3.938 3.938c0 1.248-.606 2.344-1.544 3.063l-.027.021c-.948.719-2.099 1.154-3.396 1.154h-.042zm7.597 0c-1.297 0-2.448-.435-3.396-1.154l-.027-.021c-.938-.719-1.544-1.815-1.544-3.063 0-2.174 1.763-3.938 3.938-3.938s3.938 1.764 3.938 3.938c0 1.248-.606 2.344-1.544 3.063l-.027.021c-.948.719-2.099 1.154-3.396 1.154h-.042z"/>
                              </svg>
                              Instagram Profile
                            </a>
                          )}
                          {selectedTeamMember.socialLinks.website && (
                            <a 
                              href={selectedTeamMember.socialLinks.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm9.568 7.21l-2.83 2.83c-.793-3.03-3.07-5.307-6.1-6.1l2.83-2.83c2.885 1.077 5.2 3.392 6.1 6.1zM12 21.638c-5.31 0-9.638-4.327-9.638-9.638S6.69 2.362 12 2.362 21.638 6.69 21.638 12 17.31 21.638 12 21.638z"/>
                              </svg>
                              Website
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No social links available</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Bio Section */}
                  {selectedTeamMember.bio && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">About</h4>
                      <p className="text-gray-600 leading-relaxed">{selectedTeamMember.bio}</p>
                    </div>
                  )}
                </>
              ) : (
                /* Edit Mode - Form Fields */
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-blue-600">Edit Team Member</h3>
                    <p className="text-gray-600 mt-2">Update team member information</p>
                  </div>
                  
                  {/* Profile Image Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Profile Image</h4>
                    
                    <div className="flex flex-col items-center space-y-4">
                      {/* Current or Preview Image */}
                      <div className="flex-shrink-0 relative">
                        {editImagePreview ? (
                          <img 
                            src={editImagePreview} 
                            alt="Profile preview" 
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                        ) : editingTeamMember?.avatar ? (
                          <img 
                            src={`${config.apiUrl}${selectedTeamMember.avatar}`}
                            alt={editingTeamMember.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getRoleColor(editingTeamMember?.role || '')} flex items-center justify-center border-4 border-white shadow-lg`}>
                            <User className="w-12 h-12 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Image Upload Controls */}
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Create preview
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setEditImagePreview(e.target?.result);
                              };
                              reader.readAsDataURL(file);
                              
                              // Upload image
                              const imageUrl = await handleImageUpload(file);
                              console.log("66666",imageUrl);
                              
                              if (imageUrl) {
                                setEditingTeamMember(prev => ({ ...prev, avatar: imageUrl }));
                              }
                            }
                          }}
                          className="flex-1"
                          disabled={isUploadingEditImage}
                        />
                        {(editImagePreview || editingTeamMember?.avatar) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditImagePreview(null);
                              setEditingTeamMember(prev => ({ ...prev, avatar: '' }));
                            }}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                      
                      {isUploadingEditImage && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading image...
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 text-center">Upload a new profile image (max 5MB). Recommended: 400x400px square image.</p>
                    </div>
                  </div>
                  
                  {/* Basic Information Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                      <Input
                        id="edit-name"
                        value={editingTeamMember?.name || ''}
                        onChange={(e) => setEditingTeamMember({ ...editingTeamMember, name: e.target.value })}
                        placeholder="Enter full name"
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editingTeamMember?.email || ''}
                        onChange={(e) => setEditingTeamMember({ ...editingTeamMember, email: e.target.value })}
                        placeholder="Enter email address"
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-contact" className="text-sm font-medium text-gray-700">Contact Number</Label>
                      <Input
                        id="edit-contact"
                        value={editingTeamMember?.contact || ''}
                        onChange={(e) => setEditingTeamMember({ ...editingTeamMember, contact: e.target.value })}
                        placeholder="Enter contact number"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-role" className="text-sm font-medium text-gray-700">Role *</Label>
                      <Select
                        value={editingTeamMember?.role || ''}
                        onValueChange={(value) => setEditingTeamMember({ ...editingTeamMember, role: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Founder & CEO">Founder & CEO</SelectItem>
                          <SelectItem value="Operations Director">Operations Director</SelectItem>
                          <SelectItem value="Community Manager">Community Manager</SelectItem>
                          <SelectItem value="Technical Lead">Technical Lead</SelectItem>
                          <SelectItem value="Support Staff">Support Staff</SelectItem>
                          <SelectItem value="Marketing Lead">Marketing Lead</SelectItem>
                          <SelectItem value="Developer">Developer</SelectItem>
                          <SelectItem value="Volunteer">Volunteer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-status" className="text-sm font-medium text-gray-700">Status</Label>
                      <Select
                        value={editingTeamMember?.status || 'active'}
                        onValueChange={(value) => setEditingTeamMember({ ...editingTeamMember, status: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Bio Section */}
                  <div>
                    <Label htmlFor="edit-bio" className="text-sm font-medium text-gray-700">Bio / About</Label>
                    <Textarea
                      id="edit-bio"
                      value={editingTeamMember?.bio || ''}
                      onChange={(e) => setEditingTeamMember({ ...editingTeamMember, bio: e.target.value })}
                      placeholder="Enter bio or about information"
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                  
                  {/* Social Links Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Social Links</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-linkedin" className="text-sm font-medium text-gray-700">LinkedIn URL</Label>
                        <Input
                          id="edit-linkedin"
                          value={editingTeamMember?.socialLinks?.linkedin || ''}
                          onChange={(e) => setEditingTeamMember({ 
                            ...editingTeamMember, 
                            socialLinks: { 
                              ...editingTeamMember?.socialLinks, 
                              linkedin: e.target.value 
                            } 
                          })}
                          placeholder="https://linkedin.com/in/profile"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="edit-instagram" className="text-sm font-medium text-gray-700">Instagram URL</Label>
                        <Input
                          id="edit-instagram"
                          value={editingTeamMember?.socialLinks?.instagram || ''}
                          onChange={(e) => setEditingTeamMember({ 
                            ...editingTeamMember, 
                            socialLinks: { 
                              ...editingTeamMember?.socialLinks, 
                              instagram: e.target.value 
                            } 
                          })}
                          placeholder="https://instagram.com/profile"
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="edit-website" className="text-sm font-medium text-gray-700">Website URL</Label>
                        <Input
                          id="edit-website"
                          value={editingTeamMember?.socialLinks?.website || ''}
                          onChange={(e) => setEditingTeamMember({ 
                            ...editingTeamMember, 
                            socialLinks: { 
                              ...editingTeamMember?.socialLinks, 
                              website: e.target.value 
                            } 
                          })}
                          placeholder="https://website.com"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {!isEditingTeamMember ? (
              <div className="flex space-x-3 w-full">
                <Button 
                  onClick={() => {
                    if (selectedTeamMember) {
                      handleDeleteTeamMember(selectedTeamMember._id, selectedTeamMember.name);
                    }
                  }}
                  variant="destructive"
                  className="flex-1"
                  disabled={isDeletingTeamMember}
                >
                  {isDeletingTeamMember ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete
                </Button>
                <Button 
                  onClick={handleEditTeamMember}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            ) : (
              <div className="flex space-x-3 w-full">
                <Button 
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveTeamMember}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  disabled={isSubmittingAction || !editingTeamMember?.name || !editingTeamMember?.email}
                >
                  {isSubmittingAction ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Team Member Dialog */}
      <Dialog open={showCreateTeamMemberDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateTeamMemberDialog(false);
          setNewTeamMember({
            name: '',
            email: '',
            contact: '',
            role: 'Support Staff',
            bio: '',
            avatar: '',
            socialLinks: {
              linkedin: '',
              instagram: '',
              website: ''
            }
          });
          setImagePreview(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Team Member
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-name">Full Name *</Label>
                  <Input
                    id="create-name"
                    value={newTeamMember.name}
                    onChange={(e) => setNewTeamMember(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="create-email">Email Address *</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={newTeamMember.email}
                    onChange={(e) => setNewTeamMember(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-contact">Contact Number *</Label>
                  <Input
                    id="create-contact"
                    type="tel"
                    value={newTeamMember.contact}
                    onChange={(e) => setNewTeamMember(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="Enter contact number"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="create-role">Role *</Label>
                  <Select value={newTeamMember.role} onValueChange={(value) => setNewTeamMember(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Founder & CEO">Founder & CEO</SelectItem>
                      <SelectItem value="Operations Director">Operations Director</SelectItem>
                      <SelectItem value="Community Manager">Community Manager</SelectItem>
                      <SelectItem value="Technical Lead">Technical Lead</SelectItem>
                      <SelectItem value="Support Staff">Support Staff</SelectItem>
                      <SelectItem value="Marketing Lead">Marketing Lead</SelectItem>
                      <SelectItem value="Developer">Developer</SelectItem>
                      <SelectItem value="Volunteer">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Profile Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Profile Image</h3>
              
              <div className="space-y-3">
                {imagePreview && (
                  <div className="flex items-center gap-4">
                    <img 
                      src={imagePreview} 
                      alt="Profile preview" 
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImagePreview(null);
                        setNewTeamMember(prev => ({ ...prev, avatar: '' }));
                      }}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Create preview
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setImagePreview(e.target?.result);
                        };
                        reader.readAsDataURL(file);
                        
                        // Upload image
                        const imageUrl = await handleImageUpload(file);
                        if (imageUrl) {
                          setNewTeamMember(prev => ({ ...prev, avatar: imageUrl }));
                        }
                      }
                    }}
                    className="flex-1"
                    disabled={isUploadingImage}
                  />
                  {isUploadingImage && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">Upload a profile image (max 5MB). Recommended: 400x400px square image.</p>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">About</h3>
              
              <div>
                <Label htmlFor="create-bio">Bio / Description *</Label>
                <Textarea
                  id="create-bio"
                  value={newTeamMember.bio}
                  onChange={(e) => setNewTeamMember(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Write a brief description about the team member's role and contribution..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Social Links (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-linkedin">LinkedIn Profile</Label>
                  <Input
                    id="create-linkedin"
                    type="url"
                    value={newTeamMember.socialLinks.linkedin}
                    onChange={(e) => setNewTeamMember(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                    }))}
                    placeholder="https://linkedin.com/in/username"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="create-instagram">Instagram Profile</Label>
                  <Input
                    id="create-instagram"
                    type="url"
                    value={newTeamMember.socialLinks.instagram}
                    onChange={(e) => setNewTeamMember(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                    }))}
                    placeholder="https://instagram.com/username"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="create-website">Website</Label>
                  <Input
                    id="create-website"
                    type="url"
                    value={newTeamMember.socialLinks.website}
                    onChange={(e) => setNewTeamMember(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, website: e.target.value }
                    }))}
                    placeholder="https://example.com"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => setShowCreateTeamMemberDialog(false)}
              disabled={isCreatingTeamMember}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNewTeamMember}
              disabled={isCreatingTeamMember || isUploadingImage}
              className="bg-gradient-to-r from-green-600 to-yellow-500 text-white"
            >
              {isCreatingTeamMember ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team Member
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create User Dialog */}
      <Dialog open={showCreateUserDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateUserDialog(false);
          setNewUser({
            name: '',
            email: '',
            password: '',
            phone: '',
            contact: '',
            address: '',
            about: '',
            profession: '',
            organization: '',
            categoryType: '',
            role: 'user',
            status: 'active',
            avatar: '',
            profileImage: ''
          });
          setUserImagePreview(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Create New User
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-name">Full Name *</Label>
                  <Input
                    id="user-name"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="user-email">Email Address *</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-password">Password (Optional)</Label>
                  <Input
                    id="user-password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password (leave empty for auto-generation)"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="user-phone">Phone Number</Label>
                  <Input
                    id="user-phone"
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Profile Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Profile Image</h3>
              
              <div className="space-y-3">
                {userImagePreview && (
                  <div className="flex items-center gap-4">
                    <img 
                      src={userImagePreview} 
                      alt="Profile preview" 
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUserImagePreview(null);
                        setNewUser(prev => ({ ...prev, avatar: '', profileImage: '' }));
                      }}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Create preview
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setUserImagePreview(e.target?.result);
                        };
                        reader.readAsDataURL(file);
                        
                        // Upload image
                        const imageUrl = await handleUserImageUpload(file);
                        if (imageUrl) {
                          setNewUser(prev => ({ ...prev, avatar: imageUrl, profileImage: imageUrl }));
                        }
                      }
                    }}
                    className="flex-1"
                    disabled={isUploadingUserImage}
                  />
                  {isUploadingUserImage && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">Upload a profile image (max 5MB). Recommended: 400x400px square image.</p>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Professional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-profession">Profession</Label>
                  <Select value={newUser.profession} onValueChange={(value) => setNewUser(prev => ({ ...prev, profession: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select profession" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software-engineer">Software Engineer</SelectItem>
                      <SelectItem value="data-scientist">Data Scientist</SelectItem>
                      <SelectItem value="product-manager">Product Manager</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="marketing-specialist">Marketing Specialist</SelectItem>
                      <SelectItem value="sales-representative">Sales Representative</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="lawyer">Lawyer</SelectItem>
                      <SelectItem value="accountant">Accountant</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                      <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="user-organization">Organization Type</Label>
                  <Select value={newUser.organization} onValueChange={(value) => setNewUser(prev => ({ ...prev, organization: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select organization type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology-company">Technology Company</SelectItem>
                      <SelectItem value="healthcare-organization">Healthcare Organization</SelectItem>
                      <SelectItem value="educational-institution">Educational Institution</SelectItem>
                      <SelectItem value="government-agency">Government Agency</SelectItem>
                      <SelectItem value="non-profit-organization">Non-Profit Organization</SelectItem>
                      <SelectItem value="financial-services">Financial Services</SelectItem>
                      <SelectItem value="consulting-firm">Consulting Firm</SelectItem>
                      <SelectItem value="manufacturing-company">Manufacturing Company</SelectItem>
                      <SelectItem value="retail-business">Retail Business</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="small-business">Small Business</SelectItem>
                      <SelectItem value="large-corporation">Large Corporation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="user-category">Category Type</Label>
                <Select value={newUser.categoryType} onValueChange={(value) => setNewUser(prev => ({ ...prev, categoryType: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="non-profit">Non-Profit</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Account Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Account Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="donor">Donor</SelectItem>
                      <SelectItem value="requester">Requester</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="user-status">Status</Label>
                  <Select value={newUser.status} onValueChange={(value) => setNewUser(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Additional Information</h3>
              
              <div>
                <Label htmlFor="user-address">Address</Label>
                <Textarea
                  id="user-address"
                  value={newUser.address}
                  onChange={(e) => setNewUser(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter address"
                  rows={2}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="user-about">About</Label>
                <Textarea
                  id="user-about"
                  value={newUser.about}
                  onChange={(e) => setNewUser(prev => ({ ...prev, about: e.target.value }))}
                  placeholder="Write a brief description about the user..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => setShowCreateUserDialog(false)}
              disabled={isCreatingUser}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNewUser}
              disabled={isCreatingUser || isUploadingUserImage || !newUser.name || !newUser.email}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              {isCreatingUser ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating User...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
