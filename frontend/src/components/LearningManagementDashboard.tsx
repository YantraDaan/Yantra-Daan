import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Users, 
  BookOpen, 
  Plus,
  Edit,
  Trash2,
  CheckCircle, 
  XCircle, 
  Loader2,
  Eye,
  Clock,
  AlertCircle,
  ExternalLink,
  GraduationCap,
  Target,
  Calendar,
  Star
} from 'lucide-react';
import NoDataFound from './NoDataFound';
import { config } from "@/config/env";

interface LearningResource {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  resourceType: string;
  url: string;
  duration: string;
  cost: string;
  language: string;
  prerequisites: string[];
  skills: string[];
  tags: string[];
  isActive: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rating: number | null;
  difficulty: string;
  targetAudience: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  approvedBy: {
    _id: string;
    name: string;
    email: string;
  } | null;
  approvedAt: string | null;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

interface UserLearningAssignment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profession: string;
    verificationStatus: string;
  };
  learningResourceId: LearningResource;
  assignedBy: {
    _id: string;
    name: string;
    email: string;
  };
  assignmentReason: string;
  priority: string;
  dueDate: string | null;
  status: 'assigned' | 'in_progress' | 'completed' | 'skipped' | 'expired';
  progress: number;
  completionDate: string | null;
  userNotes: string;
  adminNotes: string;
  rating: number | null;
  feedback: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const LearningManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('resources');
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [assignments, setAssignments] = useState<UserLearningAssignment[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Resource management states
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    resourceType: '',
    url: '',
    duration: 'Self-paced',
    cost: 'free',
    language: 'English',
    prerequisites: [] as string[],
    skills: [] as string[],
    tags: [] as string[],
    difficulty: 'medium',
    targetAudience: 'all'
  });
  
  // Assignment management states
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    assignmentReason: '',
    priority: 'medium',
    dueDate: '',
    adminNotes: ''
  });

  const itemsPerPage = 10;

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // STRICT ADMIN ROLE CHECK
  useEffect(() => {
    if (!user) {
      toast({
        title: 'Access Denied',
        description: 'You must be logged in to access this page.',
        variant: 'destructive',
      });
      navigate('/admin-login');
      return;
    }
    
    if (user.userRole !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Only admin users can access this page. Your role: ' + user.userRole,
        variant: 'destructive',
      });
      navigate('/');
      return;
    }
    
    if (user.userRole === 'admin' && !isLoading) {
      fetchData();
    }
  }, [activeTab, currentPage, categoryFilter, statusFilter, user, isLoading, toast, navigate]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (activeTab === 'resources') {
        await fetchResources(token);
      } else if (activeTab === 'assignments') {
        await fetchAssignments(token);
      } else if (activeTab === 'users') {
        await fetchUsers(token);
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to load data', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResources = async (token: string) => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: itemsPerPage.toString(),
      category: categoryFilter !== 'all' ? categoryFilter : '',
      status: statusFilter !== 'all' ? statusFilter : '',
      search: searchTerm
    });
    
    const response = await fetch(`${config.apiUrl}/api/admin/learning/resources?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to fetch resources');
    
    const data = await response.json();
    setResources(data.resources || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
  };

  const fetchAssignments = async (token: string) => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: itemsPerPage.toString(),
      status: statusFilter !== 'all' ? statusFilter : '',
      search: searchTerm
    });
    
    const response = await fetch(`${config.apiUrl}/api/admin/learning/assignments?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to fetch assignments');
    
    const data = await response.json();
    setAssignments(data.assignments || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
  };

  const fetchUsers = async (token: string) => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: itemsPerPage.toString(),
      search: searchTerm,
      role: 'requester'
    });
    
    const response = await fetch(`${config.apiUrl}/api/admin/users?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to fetch users');
    
    const data = await response.json();
    setUsers(data.users || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
  };

  const handleCreateResource = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/admin/learning/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resourceForm)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Learning resource created successfully',
        });
        setShowResourceDialog(false);
        resetResourceForm();
        fetchData();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to create resource',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create resource',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateResource = async () => {
    if (!editingResource) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/admin/learning/resources/${editingResource._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resourceForm)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Learning resource updated successfully',
        });
        setShowResourceDialog(false);
        setEditingResource(null);
        resetResourceForm();
        fetchData();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update resource',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update resource',
        variant: 'destructive'
      });
    }
  };

  const handleAssignLearning = async () => {
    if (!selectedUser || !selectedResource) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/admin/learning/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          learningResourceId: selectedResource._id,
          ...assignmentForm
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Learning assignment created successfully',
        });
        setShowAssignmentDialog(false);
        resetAssignmentForm();
        fetchData();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to create assignment',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create assignment',
        variant: 'destructive'
      });
    }
  };

  const resetResourceForm = () => {
    setResourceForm({
      title: '',
      description: '',
      category: '',
      level: '',
      resourceType: '',
      url: '',
      duration: 'Self-paced',
      cost: 'free',
      language: 'English',
      prerequisites: [],
      skills: [],
      tags: [],
      difficulty: 'medium',
      targetAudience: 'all'
    });
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      assignmentReason: '',
      priority: 'medium',
      dueDate: '',
      adminNotes: ''
    });
    setSelectedUser(null);
    setSelectedResource(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'skipped': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Learning Management Dashboard</h2>
          <p className="text-muted-foreground">Manage learning resources and user assignments</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{total}</div>
          <p className="text-sm text-muted-foreground">Total Items</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resources">Learning Resources</TabsTrigger>
          <TabsTrigger value="assignments">User Assignments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Learning Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="search" 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      placeholder="Search resources..." 
                      className="pl-10" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="language">Language</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="soft_skills">Soft Skills</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Actions</Label>
                  <Button onClick={() => setShowResourceDialog(true)} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Resource
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources List */}
          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading resources...</p>
              </div>
            ) : resources.length > 0 ? (
              resources.map((resource) => (
                <Card key={resource._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{resource.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {resource.category} • {resource.level} • {resource.resourceType}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(resource.status)}>
                              {resource.status}
                            </Badge>
                            {resource.cost === 'free' && (
                              <Badge variant="outline">Free</Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">{resource.description}</p>

                        <div className="flex flex-wrap gap-2">
                          {resource.skills.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {resource.skills.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{resource.skills.length - 5} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{resource.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            <span>{resource.targetAudience}</span>
                          </div>
                          {resource.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{resource.rating}/5</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(resource.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingResource(resource);
                              setResourceForm({
                                title: resource.title,
                                description: resource.description,
                                category: resource.category,
                                level: resource.level,
                                resourceType: resource.resourceType,
                                url: resource.url,
                                duration: resource.duration,
                                cost: resource.cost,
                                language: resource.language,
                                prerequisites: resource.prerequisites,
                                skills: resource.skills,
                                tags: resource.tags,
                                difficulty: resource.difficulty,
                                targetAudience: resource.targetAudience
                              });
                              setShowResourceDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <NoDataFound
                icon={BookOpen}
                title="No learning resources found"
                description="Create your first learning resource to get started"
                actionText="Add Resource"
                onAction={() => setShowResourceDialog(true)}
              />
            )}
          </div>
        </TabsContent>

        {/* User Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="search" 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      placeholder="Search assignments..." 
                      className="pl-10" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="skipped">Skipped</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Actions</Label>
                  <Button onClick={() => setShowAssignmentDialog(true)} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Learning
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignments List */}
          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading assignments...</p>
              </div>
            ) : assignments.length > 0 ? (
              assignments.map((assignment) => (
                <Card key={assignment._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                              <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{assignment.learningResourceId.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                Assigned to: {assignment.userId.name} ({assignment.userId.profession})
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(assignment.status)}>
                              {assignment.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(assignment.priority)}>
                              {assignment.priority}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">{assignment.assignmentReason}</p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Assigned {new Date(assignment.createdAt).toLocaleDateString()}</span>
                          </div>
                          {assignment.dueDate && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            <span>{assignment.progress}% Complete</span>
                          </div>
                        </div>

                        {assignment.userNotes && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="font-medium text-blue-900 mb-1">User Notes:</div>
                            <div className="text-sm text-blue-700">{assignment.userNotes}</div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(assignment.learningResourceId.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Resource
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <NoDataFound
                icon={GraduationCap}
                title="No learning assignments found"
                description="Assign learning resources to users to track their progress"
                actionText="Assign Learning"
                onAction={() => setShowAssignmentDialog(true)}
              />
            )}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="search" 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      placeholder="Search users..." 
                      className="pl-10" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Actions</Label>
                  <Button onClick={() => setShowAssignmentDialog(true)} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Learning
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <Card key={user._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{user.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {user.profession} • {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(user.verificationStatus)}>
                              {user.verificationStatus}
                            </Badge>
                            {user.isVerified && (
                              <Badge variant="outline">Verified</Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">{user.about}</p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            <span>{user.userRole}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowAssignmentDialog(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Assign Learning
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <NoDataFound
                icon={Users}
                title="No users found"
                description="No users available for learning assignments"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button 
            variant="outline" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            return (
              <Button 
                key={pageNum} 
                variant={currentPage === pageNum ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          
          <Button 
            variant="outline" 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Resource Dialog */}
      <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? 'Edit Learning Resource' : 'Create Learning Resource'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({...resourceForm, title: e.target.value})}
                  placeholder="Resource title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={resourceForm.category} onValueChange={(value) => setResourceForm({...resourceForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="language">Language</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="soft_skills">Soft Skills</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={resourceForm.description}
                onChange={(e) => setResourceForm({...resourceForm, description: e.target.value})}
                placeholder="Resource description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select value={resourceForm.level} onValueChange={(value) => setResourceForm({...resourceForm, level: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resourceType">Resource Type *</Label>
                <Select value={resourceForm.resourceType} onValueChange={(value) => setResourceForm({...resourceForm, resourceType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="podcast">Podcast</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                value={resourceForm.url}
                onChange={(e) => setResourceForm({...resourceForm, url: e.target.value})}
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={resourceForm.duration}
                  onChange={(e) => setResourceForm({...resourceForm, duration: e.target.value})}
                  placeholder="e.g., 2 hours, 4 weeks"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost</Label>
                <Select value={resourceForm.cost} onValueChange={(value) => setResourceForm({...resourceForm, cost: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowResourceDialog(false);
                  setEditingResource(null);
                  resetResourceForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingResource ? handleUpdateResource : handleCreateResource}
                disabled={!resourceForm.title || !resourceForm.description || !resourceForm.category || !resourceForm.level || !resourceForm.resourceType || !resourceForm.url}
              >
                {editingResource ? 'Update Resource' : 'Create Resource'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Learning Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">Select User *</Label>
              <Select value={selectedUser?._id || ''} onValueChange={(value) => {
                const user = users.find(u => u._id === value);
                setSelectedUser(user);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} ({user.profession})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource">Select Resource *</Label>
              <Select value={selectedResource?._id || ''} onValueChange={(value) => {
                const resource = resources.find(r => r._id === value);
                setSelectedResource(resource);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.filter(r => r.status === 'approved').map((resource) => (
                    <SelectItem key={resource._id} value={resource._id}>
                      {resource.title} ({resource.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Assignment Reason *</Label>
              <Textarea
                id="reason"
                value={assignmentForm.assignmentReason}
                onChange={(e) => setAssignmentForm({...assignmentForm, assignmentReason: e.target.value})}
                placeholder="Why is this resource being assigned?"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={assignmentForm.priority} onValueChange={(value) => setAssignmentForm({...assignmentForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm({...assignmentForm, dueDate: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                value={assignmentForm.adminNotes}
                onChange={(e) => setAssignmentForm({...assignmentForm, adminNotes: e.target.value})}
                placeholder="Additional notes for the user"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignmentDialog(false);
                  resetAssignmentForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignLearning}
                disabled={!selectedUser || !selectedResource || !assignmentForm.assignmentReason}
              >
                Assign Learning
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LearningManagementDashboard;
