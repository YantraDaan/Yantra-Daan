import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import NoDataFound from './NoDataFound';
import { 
  UserPlus, 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Shield,
  UserCheck,
  UserX,
  Loader2,
  Plus,
  Eye,
  MoreHorizontal,
  User
} from 'lucide-react';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  contact: string;
  role: 'Founder & CEO' | 'Operations Director' | 'Community Manager' | 'Technical Lead' | 'Support Staff';
  bio: string;
  status: 'active' | 'inactive';
  createdAt: string;
  avatar?: string;
  socialLinks?: {
    linkedin: string;
    instagram: string;
    website: string;
  };
}

const TeamMemberManagement = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedMemberForDetails, setSelectedMemberForDetails] = useState<TeamMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const membersPerPage = 12;

  const { toast } = useToast();
  const { user } = useAuth();

  // Form state for add/edit
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    contact: string;
    role: TeamMember['role'];
    bio: string;
    avatar: string;
    socialLinks: {
      linkedin: string;
      instagram: string;
      website: string;
    };
  }>({
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

  useEffect(() => {
    fetchTeamMembers();
  }, [currentPage, roleFilter, statusFilter]);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: membersPerPage.toString(),
        role: roleFilter !== 'all' ? roleFilter : '',
        status: statusFilter !== 'all' ? statusFilter : ''
      });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/team-members?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch team members');
      
      const data = await response.json();
      setTeamMembers(data.members || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = () => {
    setFormData({
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
    setShowAddDialog(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      contact: member.contact,
      role: member.role,
      bio: member.bio,
      avatar: member.avatar || '',
      socialLinks: member.socialLinks || {
        linkedin: '',
        instagram: '',
        website: ''
      }
    });
    setShowEditDialog(true);
  };

  const handleViewMember = (member: TeamMember) => {
    setSelectedMember(member);
    setShowViewDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const url = showEditDialog 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/team-members/${selectedMember?._id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/team-members`;
      
      const method = showEditDialog ? 'PUT' : 'POST';
      
      // Prepare the data to send with proper formatting
      const dataToSend = {
        ...formData,
        avatar: formData.avatar || '',
        socialLinks: {
          linkedin: formData.socialLinks.linkedin || '',
          instagram: formData.socialLinks.instagram || '',
          website: formData.socialLinks.website || ''
        }
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      toast({
        title: "Success",
        description: showEditDialog ? "Team member updated successfully" : "Team member added successfully",
      });

      setShowAddDialog(false);
      setShowEditDialog(false);
      // Reset form data
      setFormData({
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
      fetchTeamMembers();
    } catch (error) {
      console.error('Error saving team member:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save team member",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/team-members/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/team-members/${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete team member');

      toast({
        title: "Success",
        description: "Team member deleted successfully",
      });

      fetchTeamMembers();
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: "Error",
        description: "Failed to delete team member",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (memberId: string, newStatus: 'active' | 'inactive') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/team-members/${memberId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast({
        title: "Success",
        description: "Status updated successfully",
      });

      fetchTeamMembers();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleShowMemberDetails = (member: TeamMember) => {
    setSelectedMemberForDetails(member);
    setShowMemberDetails(true);
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Founder & CEO': return 'from-purple-500 to-purple-600';
      case 'Operations Director': return 'from-blue-500 to-blue-600';
      case 'Community Manager': return 'from-green-500 to-green-600';
      case 'Technical Lead': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleBgColor = (role: string) => {
    switch (role) {
      case 'Founder & CEO': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Operations Director': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Community Manager': return 'bg-green-100 text-green-800 border-green-200';
      case 'Technical Lead': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Team Management
          </h2>
          <p className="text-gray-600">Manage your organization's team members</p>
        </div>
        <Button 
          onClick={handleAddMember} 
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Founder & CEO">Founder & CEO</SelectItem>
                <SelectItem value="Operations Director">Operations Director</SelectItem>
                <SelectItem value="Community Manager">Community Manager</SelectItem>
                <SelectItem value="Technical Lead">Technical Lead</SelectItem>
                <SelectItem value="Support Staff">Support Staff</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading team members...</p>
          </div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <NoDataFound
          title="No team members found"
          description="Get started by adding your first team member."
          imageType="users"
          variant="full"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member._id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group min-w-[300px]">
              <CardContent className="p-6">
                <div className="text-center">
                  {/* Avatar */}
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 border-2 border-white"
                      onError={(e) => {
                        // Fallback to avatar if image fails to load
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* Fallback Avatar (hidden by default if image exists) */}
                  <div 
                    className={`w-20 h-20 bg-gradient-to-r ${getRoleColor(member.role)} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 ${member.avatar ? 'hidden' : ''}`}
                  >
                    <User className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* Name and Role */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <Badge className={`mb-3 ${getRoleBgColor(member.role)} border`}>
                    {member.role}
                  </Badge>
                  
                  {/* Bio */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{member.bio}</p>
                  
                  {/* Contact Info */}
                  <div className="space-y-2 mb-4 text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{member.contact}</span>
                    </div> 
                  </div>

                  {/* Social Links */}
                  {member.socialLinks && Object.values(member.socialLinks).some(link => link) && (
                    <div className="flex justify-center gap-2 mb-4">
                      {member.socialLinks.linkedin && (
                        <a 
                          href={member.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="LinkedIn"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                      
                      {member.socialLinks.instagram && (
                        <a 
                          href={member.socialLinks.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-800 transition-colors"
                          title="Instagram"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.928-.875-1.418-2.026-1.418-3.323s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.323z"/>
                          </svg>
                        </a>
                      )}
                      
                      {member.socialLinks.website && (
                        <a 
                          href={member.socialLinks.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Website"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-2 16.5v-9l6 4.5-6 4.5z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                  
                  {/* Status */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status === 'active' ? (
                        <>
                          <UserCheck className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                                              onClick={() => handleShowMemberDetails(member)}
                      className="border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewMember(member)}
                      className="border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMember(member)}
                      className="border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMember(member._id)}
                      className="text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setShowEditDialog(false);
          // Reset form data when closing
          setFormData({
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
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {showEditDialog ? 'Edit Team Member' : 'Add New Team Member'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
              />
            </div>
            <div>
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                required
                className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Founder & CEO">Founder & CEO</SelectItem>
                  <SelectItem value="Operations Director">Operations Director</SelectItem>
                  <SelectItem value="Community Manager">Community Manager</SelectItem>
                  <SelectItem value="Technical Lead">Technical Lead</SelectItem>
                  <SelectItem value="Support Staff">Support Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="avatar">Profile Image</Label>
              <div className="space-y-2">
                {formData.avatar && (
                  <div className="flex items-center gap-2">
                    <img 
                      src={formData.avatar} 
                      alt="Profile preview" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                )}
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const imageUrl = await handleImageUpload(file);
                      if (imageUrl) {
                        setFormData(prev => ({ ...prev, avatar: imageUrl }));
                      }
                    }
                  }}
                  className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                />
                <p className="text-xs text-gray-500">Upload a profile image (max 1MB)</p>
              </div>
            </div>

            <div>
              <Label>Social Links</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                    }))}
                    placeholder="https://linkedin.com/in/username"
                    className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram" className="text-sm">Instagram</Label>
                  <Input
                    id="instagram"
                    type="url"
                    value={formData.socialLinks.instagram}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                    }))}
                    placeholder="https://instagram.com/username"
                    className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <Label htmlFor="website" className="text-sm">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.socialLinks.website}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, website: e.target.value }
                    }))}
                    placeholder="https://example.com"
                    className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Brief description of the team member's role and contribution..."
                rows={3}
                required
                className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="border-gray-200 hover:border-gray-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  showEditDialog ? 'Update' : 'Add'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Team Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="text-center">
                {selectedMember.avatar ? (
                  <img 
                    src={selectedMember.avatar} 
                    alt={selectedMember.name} 
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-lg border-4 border-white"
                  />
                ) : (
                  <div className={`w-24 h-24 bg-gradient-to-r ${getRoleColor(selectedMember.role)} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{selectedMember.name}</h3>
                <Badge className={`mb-3 ${getRoleBgColor(selectedMember.role)} border`}>
                  {selectedMember.role}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="text-gray-900">{selectedMember.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Contact</Label>
                  <p className="text-gray-900">{selectedMember.contact}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Bio</Label>
                  <p className="text-gray-900">{selectedMember.bio}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <Badge variant={selectedMember.status === 'active' ? 'default' : 'secondary'}>
                    {selectedMember.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Joined</Label>
                  <p className="text-gray-900">
                    {new Date(selectedMember.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Social Links */}
                {selectedMember.socialLinks && Object.values(selectedMember.socialLinks).some(link => link) && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Social Links</Label>
                    <div className="space-y-2 mt-2">
                      {selectedMember.socialLinks.linkedin && (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">LinkedIn:</span>
                          <a 
                            href={selectedMember.socialLinks.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            View Profile
                          </a>
                        </div>
                      )}
                      
                      {selectedMember.socialLinks.instagram && (
                        <div className="flex items-center gap-2">
                          <span className="text-pink-600 font-medium">Instagram:</span>
                          <a 
                            href={selectedMember.socialLinks.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-800 underline"
                          >
                            View Profile
                          </a>
                        </div>
                      )}
                      
                      {selectedMember.socialLinks.website && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-medium">Website:</span>
                          <a 
                            href={selectedMember.socialLinks.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewDialog(false);
                    handleEditMember(selectedMember);
                  }}
                  className="border-gray-200 hover:border-green-300 hover:bg-green-50"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowViewDialog(false)}
                  className="border-gray-200 hover:border-gray-300"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Member Details Dialog */}
      <Dialog open={showMemberDetails} onOpenChange={setShowMemberDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Team Member Details
            </DialogTitle>
          </DialogHeader>
          {selectedMemberForDetails && (
            <div className="space-y-6">
              {/* Basic Info */}
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
                        <span className="font-medium">{selectedMemberForDetails.name}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{selectedMemberForDetails.email}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500">Contact</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{selectedMemberForDetails.contact}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500">Role</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{selectedMemberForDetails.role}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bio */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Biography</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{selectedMemberForDetails.bio}</p>
                </CardContent>
              </Card>

              {/* Status & Join Date */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        {selectedMemberForDetails.status === 'active' ? (
                          <UserCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <UserX className="w-4 h-4 text-red-600" />
                        )}
                        <Badge variant={selectedMemberForDetails.status === 'active' ? 'default' : 'secondary'}>
                          {selectedMemberForDetails.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500">Joined</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">
                          {new Date(selectedMemberForDetails.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowMemberDetails(false)}
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

export default TeamMemberManagement;


