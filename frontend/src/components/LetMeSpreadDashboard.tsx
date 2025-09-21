import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
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
  Image as ImageIcon,
  Globe,
  Star,
  TrendingUp,
  Users,
  Heart,
  Share2,
  Calendar,
  MapPin,
  Tag,
  Upload,
  Download
} from 'lucide-react';
import NoDataFound from './NoDataFound';
import { config } from "@/config/env";

interface ImpactStory {
  _id: string;
  headline: string;
  description: string;
  link: string;
  image: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    uploadDate: string;
  };
  status: 'draft' | 'published' | 'archived';
  isActive: boolean;
  featured: boolean;
  priority: number;
  tags: string[];
  category: 'success_story' | 'impact_metric' | 'testimonial' | 'achievement' | 'milestone' | 'other';
  location: {
    city?: string;
    state?: string;
    country?: string;
  };
  metrics: {
    peopleHelped: number;
    devicesDonated: number;
    communitiesReached: number;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  publishedBy: {
    _id: string;
    name: string;
    email: string;
  } | null;
  publishedAt: string | null;
  views: number;
  likes: number;
  shares: number;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

const LetMeSpreadDashboard = () => {
  const [impacts, setImpacts] = useState<ImpactStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Form states
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingImpact, setEditingImpact] = useState<ImpactStory | null>(null);
  const [formData, setFormData] = useState({
    headline: '',
    description: '',
    link: '',
    category: 'success_story',
    tags: [] as string[],
    location: {
      city: '',
      state: '',
      country: ''
    },
    metrics: {
      peopleHelped: 0,
      devicesDonated: 0,
      communitiesReached: 0
    },
    featured: false,
    priority: 0,
    adminNotes: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

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
      fetchImpacts();
    }
  }, [currentPage, statusFilter, categoryFilter, featuredFilter, user, isLoading, toast, navigate]);

  const fetchImpacts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        status: statusFilter !== 'all' ? statusFilter : '',
        category: categoryFilter !== 'all' ? categoryFilter : '',
        featured: featuredFilter !== 'all' ? featuredFilter : '',
        search: searchTerm
      });
      
      const response = await fetch(`${config.apiUrl}/api/admin/impact?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch impact stories');
      
      const data = await response.json();
      setImpacts(data.impacts || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to load impact stories', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');
      
      const formDataToSend = new FormData();
      formDataToSend.append('headline', formData.headline);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('link', formData.link);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('location', JSON.stringify(formData.location));
      formDataToSend.append('metrics', JSON.stringify(formData.metrics));
      formDataToSend.append('featured', formData.featured.toString());
      formDataToSend.append('priority', formData.priority.toString());
      formDataToSend.append('adminNotes', formData.adminNotes);
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      const url = editingImpact 
        ? `${config.apiUrl}/api/admin/impact/${editingImpact._id}`
        : `${config.apiUrl}/api/admin/impact`;
      
      const method = editingImpact ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: editingImpact ? 'Impact story updated successfully' : 'Impact story created successfully',
        });
        setShowFormDialog(false);
        resetForm();
        fetchImpacts();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to save impact story',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save impact story',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (impact: ImpactStory) => {
    setEditingImpact(impact);
    setFormData({
      headline: impact.headline,
      description: impact.description,
      link: impact.link,
      category: impact.category,
      tags: impact.tags,
      location: impact.location,
      metrics: impact.metrics,
      featured: impact.featured,
      priority: impact.priority,
      adminNotes: impact.adminNotes
    });
    setImagePreview(`${config.apiUrl}/uploads/impact/${impact.image.filename}`);
    setSelectedImage(null);
    setShowFormDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this impact story?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/admin/impact/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Impact story deleted successfully',
        });
        fetchImpacts();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to delete impact story',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete impact story',
        variant: 'destructive'
      });
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/admin/impact/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Status updated successfully',
        });
        fetchImpacts();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      headline: '',
      description: '',
      link: '',
      category: 'success_story',
      tags: [],
      location: { city: '', state: '', country: '' },
      metrics: { peopleHelped: 0, devicesDonated: 0, communitiesReached: 0 },
      featured: false,
      priority: 0,
      adminNotes: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingImpact(null);
    setTagInput('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'success_story': return 'bg-blue-100 text-blue-800';
      case 'impact_metric': return 'bg-purple-100 text-purple-800';
      case 'testimonial': return 'bg-green-100 text-green-800';
      case 'achievement': return 'bg-orange-100 text-orange-800';
      case 'milestone': return 'bg-pink-100 text-pink-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Let Me Spread - Our Impact in Action</h2>
          <p className="text-muted-foreground">Share and manage impact stories to inspire others</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{total}</div>
          <p className="text-sm text-muted-foreground">Total Stories</p>
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
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Search stories..." 
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="success_story">Success Story</SelectItem>
                  <SelectItem value="impact_metric">Impact Metric</SelectItem>
                  <SelectItem value="testimonial">Testimonial</SelectItem>
                  <SelectItem value="achievement">Achievement</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Featured</Label>
              <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Featured</SelectItem>
                  <SelectItem value="false">Not Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <Button onClick={() => setShowFormDialog(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Story
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Stories List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading impact stories...</p>
          </div>
        ) : impacts.length > 0 ? (
          impacts.map((impact) => (
            <Card key={impact._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Image */}
                  <div className="lg:w-48 flex-shrink-0">
                    <div className="relative w-full h-32 lg:h-48 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={`${config.apiUrl}/uploads/impact/${impact.image.filename}`}
                        alt={impact.headline}
                        className="w-full h-full object-cover"
                      />
                      {impact.featured && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-yellow-500 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-2">{impact.headline}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{impact.description}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Badge className={getStatusColor(impact.status)}>
                          {impact.status}
                        </Badge>
                        <Badge className={getCategoryColor(impact.category)}>
                          {impact.category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {impact.metrics.peopleHelped > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{impact.metrics.peopleHelped} people helped</span>
                        </div>
                      )}
                      {impact.metrics.devicesDonated > 0 && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{impact.metrics.devicesDonated} devices donated</span>
                        </div>
                      )}
                      {impact.metrics.communitiesReached > 0 && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{impact.metrics.communitiesReached} communities</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {impact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {impact.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{impact.views} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{impact.likes} likes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        <span>{impact.shares} shares</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(impact.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(impact.link, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Link
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(impact)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      {impact.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(impact._id, 'published')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Publish
                        </Button>
                      )}
                      {impact.status === 'published' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(impact._id, 'archived')}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Archive
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(impact._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <NoDataFound
            icon={TrendingUp}
            title="No impact stories found"
            description="Create your first impact story to inspire others"
            actionText="Add Story"
            onAction={() => setShowFormDialog(true)}
          />
        )}
      </div>

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

      {/* Form Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingImpact ? 'Edit Impact Story' : 'Create Impact Story'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Headline *</Label>
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => setFormData({...formData, headline: e.target.value})}
                  placeholder="Enter compelling headline"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="success_story">Success Story</SelectItem>
                    <SelectItem value="impact_metric">Impact Metric</SelectItem>
                    <SelectItem value="testimonial">Testimonial</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the impact story"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link *</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="flex-1"
                />
                {imagePreview && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority (0-10)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Featured</Label>
                <Select value={formData.featured.toString()} onValueChange={(value) => setFormData({...formData, featured: value === 'true'})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Not Featured</SelectItem>
                    <SelectItem value="true">Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.location.city}
                  onChange={(e) => setFormData({...formData, location: {...formData.location, city: e.target.value}})}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.location.state}
                  onChange={(e) => setFormData({...formData, location: {...formData.location, state: e.target.value}})}
                  placeholder="State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.location.country}
                  onChange={(e) => setFormData({...formData, location: {...formData.location, country: e.target.value}})}
                  placeholder="Country"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="peopleHelped">People Helped</Label>
                <Input
                  id="peopleHelped"
                  type="number"
                  min="0"
                  value={formData.metrics.peopleHelped}
                  onChange={(e) => setFormData({...formData, metrics: {...formData.metrics, peopleHelped: parseInt(e.target.value) || 0}})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="devicesDonated">Devices Donated</Label>
                <Input
                  id="devicesDonated"
                  type="number"
                  min="0"
                  value={formData.metrics.devicesDonated}
                  onChange={(e) => setFormData({...formData, metrics: {...formData.metrics, devicesDonated: parseInt(e.target.value) || 0}})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="communitiesReached">Communities Reached</Label>
                <Input
                  id="communitiesReached"
                  type="number"
                  min="0"
                  value={formData.metrics.communitiesReached}
                  onChange={(e) => setFormData({...formData, metrics: {...formData.metrics, communitiesReached: parseInt(e.target.value) || 0}})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                value={formData.adminNotes}
                onChange={(e) => setFormData({...formData, adminNotes: e.target.value})}
                placeholder="Internal notes about this story"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowFormDialog(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.headline || !formData.description || !formData.link || (!selectedImage && !editingImpact)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingImpact ? 'Update Story' : 'Create Story'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LetMeSpreadDashboard;
