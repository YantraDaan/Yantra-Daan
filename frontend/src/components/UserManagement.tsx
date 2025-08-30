import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Users, 
  Pencil, 
  Trash, 
  ToggleRight,
  ToggleLeft,
  Eye, 
  UserPlus, 
  Shield,
  Gift,
  GraduationCap,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  TrendingUp
} from "lucide-react";
import NoDataFound from './NoDataFound';
import { config } from "@/config/env";

interface User {
  _id: string;
  name: string;
  email: string;
  userRole: 'donor' | 'student' | 'admin' | 'requester';
  contact?: string;
  categoryType?: string;
  isOrganization?: boolean;
  about?: string;
  profession?: string;
  address?: string;
  createdAt: string;
  lastLogin?: string;
  isActive?: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);
  const [userDevices, setUserDevices] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;
  
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    userRole: "donor" as 'donor' | 'student' | 'admin' | 'requester',
    contact: "",
    categoryType: "",
    isOrganization: false,
    about: "",
    profession: "",
    address: "",
    isActive: true
  });
  
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    userRole: "donor",
    contact: "",
    categoryType: "individual",
    isOrganization: false,
    about: "",
    profession: "",
    address: ""
  });

  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    if (!currentUser || currentUser.userRole !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }
    fetchUsers();
  }, [currentPage, roleFilter, categoryFilter, statusFilter, currentUser]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, categoryFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: usersPerPage.toString(),
        search: searchTerm,
        role: roleFilter !== 'all' ? roleFilter : '',
        category: categoryFilter !== 'all' ? categoryFilter : ''
      });

      const response = await fetch(`${config.apiUrl}${config.endpoints.users}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotalUsers(data.total || 0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profession?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.userRole === roleFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(user => user.categoryType === categoryFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => {
        if (statusFilter === "active") return user.isActive !== false;
        if (statusFilter === "inactive") return user.isActive === false;
        return true;
      });
    }

    setFilteredUsers(filtered);
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}${config.endpoints.users}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) throw new Error('Failed to update user');

      toast({
        title: "Success",
        description: "User updated successfully"
      });

      fetchUsers();
      setShowEditDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}${config.endpoints.users}/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete user');

      toast({
        title: "Success",
        description: "User deleted successfully"
      });

      fetchUsers();
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const createUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}${config.endpoints.auth}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createForm)
      });

      if (!response.ok) throw new Error('Failed to create user');

      toast({
        title: "Success",
        description: "User created successfully"
      });

      setCreateForm({
        name: "",
        email: "",
        password: "",
        userRole: "donor",
        contact: "",
        categoryType: "individual",
        isOrganization: false,
        about: "",
        profession: "",
        address: ""
      });
      
      fetchUsers();
      setShowCreateDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}${config.endpoints.users}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) throw new Error('Failed to update user status');

      toast({
        title: "Success",
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const handleShowUserDetails = async (user) => {
    try {
      setSelectedUserForDetails(user);
      setShowUserDetails(true);
      
      // Fetch user's devices and requests from backend
      const token = localStorage.getItem('authToken');
      
      // Fetch user's devices
      const devicesResponse = await fetch(`${config.apiUrl}${config.endpoints.devices}/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (devicesResponse.ok) {
        const devicesData = await devicesResponse.json();
        setUserDevices(devicesData.devices || []);
      }
      
      // Fetch user's requests
      const requestsResponse = await fetch(`${config.apiUrl}${config.endpoints.requests}/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setUserRequests(requestsData.requests || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'donor': return <Gift className="w-4 h-4" />;
      case 'student': return <GraduationCap className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="flex items-center gap-1"><Shield className="w-3 h-3" /> Admin</Badge>;
      case 'donor':
        return <Badge variant="default" className="flex items-center gap-1"><Gift className="w-3 h-3" /> Donor</Badge>;
      case 'student':
        return <Badge variant="secondary" className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Student</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'individual': return <Users className="w-4 h-4" />;
      case 'organization': return <Building2 className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage all users and their roles</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)} className="bg-primary">
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
          <Button onClick={fetchUsers} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="donor">Donor</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Total Users</Label>
              <div className="text-2xl font-bold text-primary">
                {totalUsers}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user._id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.userRole)}
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                    </div>
                    <div className="flex gap-2">
                      {getRoleBadge(user.userRole)}
                      {user.categoryType && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getCategoryIcon(user.categoryType)}
                          {user.categoryType}
                        </Badge>
                      )}
                      <Badge variant={user.isActive !== false ? "default" : "destructive"} className="flex items-center gap-1">
                        {user.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      {user.contact && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {user.contact}
                        </div>
                      )}
                      {user.profession && (
                        <div className="text-muted-foreground">
                          <strong>Profession:</strong> {user.profession}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {user.address && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4 mt-0.5" />
                          {user.address}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      {user.about && (
                        <div className="text-muted-foreground">
                          <strong>About:</strong> {user.about.substring(0, 100)}...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleShowUserDetails(user)}
                    variant="outline"
                    size="sm"
                    title="View Details"
                    className="h-8 px-2"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Details
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowProfileDialog(true);
                    }}
                    variant="outline"
                    title="View Profile"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setSelectedUser(user);
                      setEditForm({
                        name: user.name,
                        email: user.email,
                        userRole: user.userRole,
                        contact: user.contact || "",
                        categoryType: user.categoryType || "",
                        isOrganization: user.isOrganization || false,
                        about: user.about || "",
                        profession: user.profession || "",
                        address: user.address || "",
                        isActive: user.isActive !== false
                      });
                      setShowEditDialog(true);
                    }}
                    variant="outline"
                    title="Edit User"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  {user._id !== currentUser?._id && (
                    <Button
                      onClick={() => toggleUserStatus(user._id, user.isActive !== false)}
                      variant={user.isActive !== false ? "destructive" : "default"}
                      size="sm"
                    >
                      {user.isActive !== false ? "Deactivate" : "Activate"}
                    </Button>
                  )}
                  
                  {user._id !== currentUser?._id && (
                    <Button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteDialog(true);
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <NoDataFound
          icon={Users}
          title="No users found"
          description="No users match your current search criteria. Try adjusting your filters or search terms."
          actionText="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setRoleFilter('all');
            setCategoryFilter('all');
            setStatusFilter('all');
          }}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Next
          </Button>
          
          <span className="text-sm text-muted-foreground ml-4">
            Page {currentPage} of {totalPages} ({totalUsers} total users)
          </span>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editName">Name</Label>
                <Input
                  id="editName"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editRole">Role</Label>
                <Select value={editForm.userRole} onValueChange={(value) => setEditForm(prev => ({ ...prev, userRole: value as 'donor' | 'student' | 'admin' | 'requester' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donor">Donor</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editCategory">Category</Label>
                <Select value={editForm.categoryType} onValueChange={(value) => setEditForm(prev => ({ ...prev, categoryType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editContact">Contact</Label>
                <Input
                  id="editContact"
                  value={editForm.contact}
                  onChange={(e) => setEditForm(prev => ({ ...prev, contact: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editProfession">Profession</Label>
                <Input
                  id="editProfession"
                  value={editForm.profession}
                  onChange={(e) => setEditForm(prev => ({ ...prev, profession: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editAbout">About</Label>
              <Textarea
                id="editAbout"
                value={editForm.about}
                onChange={(e) => setEditForm(prev => ({ ...prev, about: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="editAddress">Address</Label>
              <Textarea
                id="editAddress"
                value={editForm.address}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedUser) {
                    updateUser(selectedUser._id, editForm);
                  }
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete <strong>{selectedUser?.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedUser) {
                    deleteUser(selectedUser._id);
                  }
                }}
                variant="destructive"
              >
                Delete User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="createName">Name</Label>
                <Input
                  id="createName"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="createEmail">Email</Label>
                <Input
                  id="createEmail"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="createPassword">Password</Label>
                <Input
                  id="createPassword"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label htmlFor="createContact">Contact</Label>
                <Input
                  id="createContact"
                  value={createForm.contact}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="createRole">User Role</Label>
                <Select value={createForm.userRole} onValueChange={(value) => setCreateForm(prev => ({ ...prev, userRole: value as 'donor' | 'student' | 'admin' | 'requester' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donor">Donor</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="requester">Requester</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="createCategory">Category</Label>
                <Select value={createForm.categoryType} onValueChange={(value) => setCreateForm(prev => ({ ...prev, categoryType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="createProfession">Profession</Label>
              <Input
                id="createProfession"
                value={createForm.profession}
                onChange={(e) => setCreateForm(prev => ({ ...prev, profession: e.target.value }))}
                placeholder="Profession"
              />
            </div>

            <div>
              <Label htmlFor="createAbout">About</Label>
              <Textarea
                id="createAbout"
                value={createForm.about}
                onChange={(e) => setCreateForm(prev => ({ ...prev, about: e.target.value }))}
                placeholder="Brief description about the user"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="createAddress">Address</Label>
              <Textarea
                id="createAddress"
                value={createForm.address}
                onChange={(e) => setCreateForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full address"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={createUser}>
                Create User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4 pb-4 border-b">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  {selectedUser.userRole === 'admin' ? <Shield className="w-8 h-8 text-white" /> :
                   selectedUser.userRole === 'donor' ? <Gift className="w-8 h-8 text-white" /> :
                   selectedUser.userRole === 'student' ? <GraduationCap className="w-8 h-8 text-white" /> :
                   <User className="w-8 h-8 text-white" />}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground capitalize">{selectedUser.userRole}</p>
                  <Badge variant="outline" className="mt-1">
                    {selectedUser.categoryType || 'Individual'}
                  </Badge>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Contact Information</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedUser.email}</span>
                      </div>
                      {selectedUser.contact && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{selectedUser.contact}</span>
                        </div>
                      )}
                      {selectedUser.address && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{selectedUser.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Account Details</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                      </div>
                      {selectedUser.lastLogin && (
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Last login: {new Date(selectedUser.lastLogin).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Status:</span>
                        <Badge variant={selectedUser.isActive !== false ? "default" : "destructive"}>
                          {selectedUser.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedUser.profession && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Profession</Label>
                      <p className="text-sm mt-1">{selectedUser.profession}</p>
                    </div>
                  )}
                  
                  {selectedUser.about && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">About</Label>
                      <p className="text-sm mt-1">{selectedUser.about}</p>
                    </div>
                  )}
                  
                  {selectedUser.isOrganization && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Organization Type</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Organization Account</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Details & Activity
            </DialogTitle>
          </DialogHeader>
          {selectedUserForDetails && (
            <div className="space-y-6">
              {/* User Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500">Name</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{selectedUserForDetails.name}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{selectedUserForDetails.email}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500">Contact</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{selectedUserForDetails.contact || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500">Role</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        {getRoleIcon(selectedUserForDetails.userRole)}
                        <span className="font-medium capitalize">{selectedUserForDetails.userRole}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User's Devices */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Devices ({userDevices.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userDevices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No devices donated yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userDevices.map((device) => (
                        <div key={device._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Gift className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{device.title}</p>
                              <p className="text-xs text-gray-500">{device.deviceType} • {device.condition}</p>
                            </div>
                          </div>
                          <Badge 
                            variant={device.status === 'approved' ? 'default' : device.status === 'pending' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {device.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* User's Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Requests ({userRequests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No requests made yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userRequests.map((request) => (
                        <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">{request.deviceInfo?.deviceType || 'Unknown type'}</p>
                            </div>
                          </div>
                          <Badge 
                            variant={request.status === 'approved' ? 'default' : request.status === 'pending' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {request.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUserDetails(false)}
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

export default UserManagement;
