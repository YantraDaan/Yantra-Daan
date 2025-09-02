import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import NoDataFound from "@/components/NoDataFound";
import { useSearchParams } from "react-router-dom";
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Gift, 
  MessageSquare, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Laptop,
  Smartphone,
  Monitor,
  Tablet,
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Camera
} from "lucide-react";
import { config } from "@/config/env";
import VerificationForm from "@/components/VerificationForm";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  
  // Read URL parameters
  const urlId = searchParams.get('id');
  const urlName = searchParams.get('name');
  const urlEmail = searchParams.get('email');
  const urlRole = searchParams.get('role');
  
  console.log("URL Parameters:", { urlId, urlName, urlEmail, urlRole });
  console.log("Current user from context:", user);
  console.log("User ID:", user?.id);
  console.log("User name:", user?.name);
  console.log("User email:", user?.email);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    contact: user?.contact || "",
    address: user?.address || "",
    about: user?.about || "",
    profession: user?.profession || "",
    linkedIn: user?.linkedIn || "",
    instagram: user?.instagram || "",
    facebook: user?.facebook || "",
    emailUpdates: user?.emailUpdates !== undefined ? user.emailUpdates : true,
    userRole: user?.userRole || "",
    categoryType: user?.categoryType || "",
    isOrganization: user?.isOrganization || false
  });

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        contact: user.contact || "",
        address: user.address || "",
        about: user.about || "",
        profession: user.profession || "",
        linkedIn: user.linkedIn || "",
        instagram: user.instagram || "",
        facebook: user.facebook || "",
        emailUpdates: user.emailUpdates !== undefined ? user.emailUpdates : true,
        userRole: user.userRole || "",
        categoryType: user.categoryType || "",
        isOrganization: user.isOrganization || false
      }));
    }
  }, [user]);
  console.log("Profile data to send:", profileData);
  
  // State for real data from backend
  const [donorStats, setDonorStats] = useState<{
    totalDonations: number;
    activeItems: number;
    completedRequests: number;
    totalStudentsHelped: number;
  }>({
    totalDonations: 0,
    activeItems: 0,
    completedRequests: 0,
    totalStudentsHelped: 0
  });

  const [donorItems, setDonorItems] = useState([]);
  const [studentRequests, setStudentRequests] = useState([]);
  const [deviceRequests, setDeviceRequests] = useState({});
  const [requesterStats, setRequesterStats] = useState({
    totalRequests: 0,
    approvedRequests: 0,
    pendingRequests: 0,
    fulfilledRequests: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      if (user?.userRole === 'donor') {
        // Fetch donor's device donations
        const donationsResponse = await fetch(`${config.apiUrl}${config.endpoints.devices}/my`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (donationsResponse.ok) {
          const donationsData = await donationsResponse.json();
          setDonorItems(donationsData.devices || []);
          
          // Fetch requests for each device
          const requestsData = {};
          for (const device of donationsData.devices || []) {
            try {
              const requestsResponse = await fetch(`${config.apiUrl}${config.endpoints.requests}/device/${device._id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (requestsResponse.ok) {
                const deviceRequests = await requestsResponse.json();
                requestsData[device._id] = deviceRequests.requests || [];
              }
            } catch (error) {
              console.error(`Error fetching requests for device ${device._id}:`, error);
              requestsData[device._id] = [];
            }
          }
          setDeviceRequests(requestsData);
          
          // Calculate stats
          const total = donationsData.devices?.length || 0;
          const active = donationsData.devices?.filter((d: any) => d.status === 'approved')?.length || 0;
          const pending = donationsData.devices?.filter((d: any) => d.status === 'pending')?.length || 0;
          
          // Calculate total requests across all devices
          const allRequests = Object.values(requestsData).flat() as any[];
          const totalRequests = allRequests.length;
          const completedRequests = allRequests.filter((r: any) => r.status === 'completed').length;
          
          setDonorStats({
            totalDonations: total,
            activeItems: active,
            completedRequests: completedRequests,
            totalStudentsHelped: totalRequests
          });
        }
      } else if (user?.userRole === 'requester' || user?.userRole === 'student') {
        // Fetch requester's requests
        const requestsResponse = await fetch(`${config.apiUrl}${config.endpoints.requests}/my`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setStudentRequests(requestsData.requests || []);
          
          // Calculate requester stats
          const total = requestsData.requests?.length || 0;
          const approved = requestsData.requests?.filter((r: any) => r.status === 'approved')?.length || 0;
          const pending = requestsData.requests?.filter((r: any) => r.status === 'pending')?.length || 0;
          const fulfilled = requestsData.requests?.filter((r: any) => r.status === 'completed')?.length || 0;
          
          setRequesterStats({
            totalRequests: total,
            approvedRequests: approved,
            pendingRequests: pending,
            fulfilledRequests: fulfilled
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      console.log("Starting profile update...");
      console.log("User ID:", user?.id);
      console.log("Profile data to send:", profileData);
      console.log("Auth token:", localStorage.getItem('authToken'));
      
      // Check if auth token exists
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to update your profile.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate only essential fields
      if (!profileData.name || !profileData.contact) {
        toast({
          title: "Validation Error",
          description: "Please fill in at least Name and Contact number.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate contact number format (10 digits)
      if (!/^\d{10}$/.test(profileData.contact)) {
        toast({
          title: "Invalid Contact",
          description: "Contact number must be exactly 10 digits.",
          variant: "destructive"
        });
        return;
      }
      
      // Update profile data
      const response = await fetch(`${config.apiUrl}${config.endpoints.users}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: profileData.name,
          contact: profileData.contact,
          address: profileData.address || '',
          about: profileData.about || '',
          profession: profileData.profession || '',
          linkedIn: profileData.linkedIn || '',
          instagram: profileData.instagram || '',
          facebook: profileData.facebook || '',
          emailUpdates: profileData.emailUpdates
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const responseData = await response.json();
        console.log("Response data:", responseData);
        
        // Update the user data in context and localStorage
        if (responseData.user) {
          updateUser(responseData.user);
        }
        
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        console.log("Profile saved:", profileData);
      } else {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
        }
        throw new Error(`Failed to update profile: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      
      let errorMessage = "Failed to update profile";
      
      if (error.name === 'AbortError') {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        errorMessage = error.message || "An unexpected error occurred.";
      }
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleProfilePhotoUpload = async (file: File) => {
    if (!file) {
      toast({
        title: "No Photo Selected",
        description: "Please select a photo to upload.",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      console.log('Uploading profile photo:', file.name);
      console.log('Using endpoint:', `${config.apiUrl}/api/users/upload-photo`);

      const response = await fetch(`${config.apiUrl}/api/users/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Upload response data:', result);
        
        toast({
          title: "Photo Updated",
          description: "Your profile photo has been successfully updated.",
        });
        
        // Refresh user data to show new photo
        if (result.user) {
          // Update local storage with new user data
          localStorage.setItem('authUser', JSON.stringify(result.user));
          // Update user context
          updateUser(result.user);
        }
        
        setProfilePhoto(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Upload failed:', errorData);
        throw new Error(errorData.error || 'Failed to upload photo');
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile photo. Please try again.",
        variant: "destructive"
      });
      console.error("Photo upload error:", error);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}${config.endpoints.requests}/my/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Request Cancelled",
          description: "Your request has been cancelled successfully.",
        });
        fetchUserData(); // Refresh data
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to cancel request",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}${config.endpoints.requests}/admin/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'approved',
          adminNotes: 'Approved by device owner'
        })
      });

      if (response.ok) {
        toast({
          title: "Request Approved",
          description: "The request has been approved successfully.",
        });
        fetchUserData(); // Refresh data
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to approve request",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}${config.endpoints.requests}/admin/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason: 'Rejected by device owner'
        })
      });

      if (response.ok) {
        toast({
          title: "Request Rejected",
          description: "The request has been rejected.",
        });
        fetchUserData(); // Refresh data
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to reject request",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'requested': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'donated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'fulfilled': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'fulfilled': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hero-bg to-request-highlight flex items-center justify-center">
        <Card className="donation-card p-8">
          <div className="text-center">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please log in to view your profile</h2>
            <p className="text-muted-foreground">You need to be logged in to access your profile dashboard.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hero-bg to-request-highlight">
      <div className="container mx-auto px-4 py-8">
        {/* URL Parameters Display */}
        {/* {urlId && (
          <Card className="donation-card mb-4 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-blue-700">URL ID</Label>
                  <div className="font-mono text-blue-900">{urlId}</div>
                </div>
                {urlName && (
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-blue-700">URL Name</Label>
                    <div className="font-mono text-blue-900">{urlName}</div>
                  </div>
                )}
                {urlEmail && (
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-blue-700">URL Email</Label>
                    <div className="font-mono text-blue-900">{urlEmail}</div>
                  </div>
                )}
                {urlRole && (
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-blue-700">URL Role</Label>
                    <div className="font-mono text-blue-900 capitalize">{urlRole}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Profile Header */}
        <Card className="donation-card mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('profilePhotoInput')?.click()} title="Click to upload profile photo">
                  {user.profilePhoto?.filename ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
                      <img 
                        src={`${config.apiUrl}/uploads/${user.profilePhoto.filename}`}
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Profile image failed to load:', `${config.apiUrl}/uploads/${user.profilePhoto.filename}`);
                          // Fallback to icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                        onLoad={() => {
                          console.log('Profile image loaded successfully:', `${config.apiUrl}/uploads/${user.profilePhoto.filename}`);
                        }}
                      />
                      <div className={`w-full h-full bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center ${user.profilePhoto?.filename ? 'hidden' : ''}`}>
                        {user.userRole === 'requester' ? <GraduationCap className="w-8 h-8 text-white" /> : <User className="w-4 h-8 text-white" />}
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                      {user.userRole === 'requester' ? <GraduationCap className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />}
                    </div>
                  )}
                  
                  {/* Upload overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    id="profilePhotoInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setProfilePhoto(file);
                        handleProfilePhotoUpload(file);
                      }
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{profileData.name}</h1>
                  <p className="text-muted-foreground capitalize flex items-center gap-2">
                    {user.userRole === 'requester' ? <BookOpen className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                    {user.userRole}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    Member since {new Date().toLocaleDateString()}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {isEditing ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      className="capitalize"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact">Contact *</Label>
                    <Input
                      id="contact"
                      value={profileData.contact}
                      onChange={(e) => setProfileData(prev => ({ ...prev, contact: e.target.value }))}
                      placeholder="10 digit number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      rows={2}
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Your address (optional)"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="about">About</Label>
                    <Textarea
                      id="about"
                      rows={4}
                      value={profileData.about}
                      onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                      placeholder="Tell us about yourself (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profession">Profession</Label>
                    <Input
                      id="profession"
                      value={profileData.profession}
                      onChange={(e) => setProfileData(prev => ({ ...prev, profession: e.target.value }))}
                      placeholder="e.g., Student, Developer, Teacher... (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedIn">LinkedIn</Label>
                    <Input
                      id="linkedIn"
                      value={profileData.linkedIn}
                      onChange={(e) => setProfileData(prev => ({ ...prev, linkedIn: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={profileData.instagram}
                      onChange={(e) => setProfileData(prev => ({ ...prev, instagram: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={profileData.facebook}
                      onChange={(e) => setProfileData(prev => ({ ...prev, facebook: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="emailUpdates" 
                      checked={profileData.emailUpdates}
                      onCheckedChange={(checked) => 
                        setProfileData(prev => ({ ...prev, emailUpdates: checked as boolean }))
                      }
                    />
                    <Label htmlFor="emailUpdates" className="text-sm">
                      Send me updates and notifications via email
                    </Label>
                  </div>
                  <Button onClick={handleSaveProfile} className="btn-hero w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <span>{profileData.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <span>{profileData.contact}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{profileData.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>Joined {new Date().toLocaleDateString()}</span>
                  </div>
                  {user.userRole === 'requester' && (
                    <>
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        <span>University</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <span>Major - Year of Study</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground mb-4">{profileData.about}</p>
                  {user.userRole === 'requester' && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Academic Performance:</span>
                        <span className="text-sm font-semibold">GPA</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Status Section - Only for requesters */}
        {user.userRole === 'requester' && (
          <Card className="donation-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Account Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.isVerified ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Account Verified</h3>
                    <p className="text-sm text-green-600">You can request up to 3 devices. Your verification was completed on {user.verifiedAt ? new Date(user.verifiedAt).toLocaleDateString() : 'recently'}.</p>
                  </div>
                </div>
              ) : user.verificationStatus === 'pending' ? (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">Verification Pending</h3>
                    <p className="text-sm text-yellow-600">Your verification request is being reviewed. You'll be able to request devices once approved.</p>
                    {user.verificationFormData?.submittedAt && (
                      <p className="text-xs text-yellow-500 mt-1">
                        Submitted on: {new Date(user.verificationFormData.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ) : user.verificationStatus === 'rejected' ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-800">Verification Rejected</h3>
                    <p className="text-sm text-red-600">Your verification was rejected. Please submit a new verification request.</p>
                    <Button 
                      onClick={() => setShowVerificationForm(true)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Submit New Verification
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800">Verification Required</h3>
                    <p className="text-sm text-blue-600">You need to verify your account to request devices. Complete the verification process to get started.</p>
                    <Button 
                      onClick={() => setShowVerificationForm(true)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Account
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Activity Content Based on User Type */}
        {user.userRole === 'donor' ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="items" className="relative">
                My Items
                {(() => {
                  const itemsWithPendingRequests = Object.values(deviceRequests).flat().filter((r: any) => r.status === 'pending').length;
                  return itemsWithPendingRequests > 0 ? (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {itemsWithPendingRequests}
                    </Badge>
                  ) : null;
                })()}
              </TabsTrigger>
              <TabsTrigger value="requests" className="relative">
                Student Requests
                {(() => {
                  const totalPendingRequests = Object.values(deviceRequests).flat().filter((r: any) => r.status === 'pending').length;
                  return totalPendingRequests > 0 ? (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {totalPendingRequests}
                    </Badge>
                  ) : null;
                })()}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="donation-card text-center">
                  <CardContent className="p-6">
                    <Gift className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="text-2xl font-bold text-gray-900">{donorStats.totalDonations}</h3>
                    <p className="text-gray-600">Total Donations</p>
                  </CardContent>
                </Card>
                
                <Card className="donation-card text-center">
                  <CardContent className="p-6">
                    <Laptop className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="text-2xl font-bold text-gray-900">{donorStats.activeItems}</h3>
                    <p className="text-gray-600">Active Items</p>
                  </CardContent>
                </Card>
                
                <Card className="donation-card text-center">
                  <CardContent className="p-6">
                    <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="text-2xl font-bold text-gray-900">{donorStats.completedRequests}</h3>
                    <p className="text-gray-600">Fulfilled Requests</p>
                  </CardContent>
                </Card>
                
                <Card className="donation-card text-center">
                  <CardContent className="p-6">
                    <User className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="text-2xl font-bold text-gray-900">{donorStats.totalStudentsHelped}</h3>
                    <p className="text-gray-600">Students Helped</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

                        <TabsContent value="items">
              <Card className="donation-card">
                <CardHeader>
                  <CardTitle>My Donated Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {donorItems.map((item: any) => {
                      const itemRequests = deviceRequests[item._id] || [];
                      const pendingRequests = itemRequests.filter((r: any) => r.status === 'pending').length;
                      const approvedRequests = itemRequests.filter((r: any) => r.status === 'approved').length;
                      const completedRequests = itemRequests.filter((r: any) => r.status === 'completed').length;
                      
                      return (
                        <div key={item._id} className="p-6 border rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                                {item.deviceType === 'laptop' ? <Laptop className="w-6 h-6 text-white" /> :
                                 item.deviceType === 'smartphone' ? <Smartphone className="w-6 h-6 text-white" /> :
                                 item.deviceType === 'tablet' ? <Tablet className="w-6 h-6 text-white" /> :
                                 <Monitor className="w-6 h-6 text-white" />}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                <p className="text-sm text-gray-600">{item.deviceType} • {item.condition}</p>
                                <p className="text-xs text-gray-500">Added {new Date(item.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                            </div>
                          </div>
                          
                          {/* Device Details */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Device Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p><span className="font-medium">Description:</span> {item.description}</p>
                                <p><span className="font-medium">Location:</span> {item.location?.city}, {item.location?.state}</p>
                              </div>
                              <div>
                                <p><span className="font-medium">Total Requests:</span> {itemRequests.length}</p>
                                <p><span className="font-medium">Status:</span> {item.status}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Request Statistics */}
                          {itemRequests.length > 0 && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium mb-2">Request Statistics</h4>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-yellow-600">{pendingRequests}</p>
                                  <p className="text-gray-600">Pending</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-blue-600">{approvedRequests}</p>
                                  <p className="text-gray-600">Approved</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-green-600">{completedRequests}</p>
                                  <p className="text-gray-600">Completed</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Recent Requests */}
                          {itemRequests.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Recent Requests</h4>
                              <div className="space-y-2">
                                {itemRequests.slice(0, 3).map((request: any) => (
                                  <div key={request._id} className="flex items-center justify-between p-3 bg-white border rounded">
                                    <div>
                                      <p className="font-medium">{request.requesterInfo?.name || 'Unknown'}</p>
                                      <p className="text-sm text-gray-600">{request.message.substring(0, 50)}...</p>
                                      <p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                                  </div>
                                ))}
                              </div>
                              {itemRequests.length > 3 && (
                                <Button variant="outline" size="sm" className="mt-2">
                                  View All {itemRequests.length} Requests
                                </Button>
                              )}
                            </div>
                          )}
                          
                          {itemRequests.length === 0 && (
                            <NoDataFound
                              title="No requests for this device"
                              description="Students haven't requested this device yet"
                              imageType="requests"
                              variant="compact"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests">
              <Card className="donation-card">
                <CardHeader>
                  <CardTitle>Student Requests for My Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {donorItems.filter(item => (deviceRequests[item._id] || []).length > 0).map((item: any) => {
                      const itemRequests = deviceRequests[item._id] || [];
                      
                      return (
                        <div key={item._id} className="p-6 border rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                                {item.deviceType === 'laptop' ? <Laptop className="w-6 h-6 text-white" /> :
                                 item.deviceType === 'smartphone' ? <Smartphone className="w-6 h-6 text-white" /> :
                                 item.deviceType === 'tablet' ? <Tablet className="w-6 h-6 text-white" /> :
                                 <Monitor className="w-6 h-6 text-white" />}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                <p className="text-sm text-gray-600">{item.deviceType} • {item.condition}</p>
                                <p className="text-xs text-gray-500">{itemRequests.length} requests</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          </div>
                          
                          <div className="space-y-3">
                            {itemRequests.map((request: any) => (
                              <div key={request._id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <User className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{request.requesterInfo?.name || 'Unknown'}</p>
                                      <p className="text-sm text-gray-600">{request.requesterInfo?.email}</p>
                                    </div>
                                  </div>
                                  <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                                </div>
                                
                                <div className="bg-white p-3 rounded border">
                                  <p className="text-sm text-gray-700">{request.message}</p>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>Requested on {new Date(request.createdAt).toLocaleDateString()}</span>
                                  {request.requesterInfo?.contact && (
                                    <span>Contact: {request.requesterInfo.contact}</span>
                                  )}
                                </div>
                                
                                {request.status === 'pending' && (
                                  <div className="flex space-x-2 pt-2 border-t">
                                    <Button 
                                      size="sm" 
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleApproveRequest(request._id)}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => handleRejectRequest(request._id)}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                                
                                {request.status === 'approved' && (
                                  <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                                    <p className="text-sm text-green-700">
                                      ✅ Request approved. Please contact the student to arrange pickup/delivery.
                                    </p>
                                  </div>
                                )}
                                
                                {request.status === 'completed' && (
                                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                                    <p className="text-sm text-blue-700">
                                      🎉 Device successfully transferred to the student.
                                    </p>
                                  </div>
                                )}
                                
                                {request.status === 'rejected' && (
                                  <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                                    <p className="text-sm text-red-700">
                                      ❌ Request was rejected.
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    
                    {donorItems.filter(item => (deviceRequests[item._id] || []).length === 0).length === donorItems.length && (
                      <NoDataFound
                        title="No requests yet"
                        description="Students haven't requested any of your devices yet. Keep sharing your devices!"
                        imageType="requests"
                        variant="compact"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Dashboard</TabsTrigger>
              <TabsTrigger value="requests">My Requests</TabsTrigger>
              <TabsTrigger value="history">Request History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {/* Requester/Student Stats Overview */}
              <div className="grid md:grid-cols-4 gap-6 mb-6">
                <Card className="donation-card text-center">
                  <CardContent className="p-6">
                    <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="text-2xl font-bold">{requesterStats.totalRequests}</h3>
                    <p className="text-muted-foreground">Total Requests</p>
                  </CardContent>
                </Card>
                
                <Card className="donation-card text-center">
                  <CardContent className="p-6">
                    <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <h3 className="text-2xl font-bold">{requesterStats.pendingRequests}</h3>
                    <p className="text-muted-foreground">Pending</p>
                  </CardContent>
                </Card>
                
                <Card className="donation-card text-center">
                  <CardContent className="p-6">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h3 className="text-2xl font-bold">{requesterStats.fulfilledRequests}</h3>
                    <p className="text-muted-foreground">Fulfilled</p>
                  </CardContent>
                </Card>
                
                <Card className="donation-card text-center">
                  <CardContent className="p-6">
                    <AlertCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="text-2xl font-bold">{requesterStats.approvedRequests}</h3>
                    <p className="text-muted-foreground">Approved</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="donation-card">
                <CardHeader>
                  <CardTitle>Recent Request Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentRequests.slice(0, 3).map((request: any) => (
                      <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent">
                            {getStatusIcon(request.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{request.deviceInfo?.title || 'Unknown Device'}</h3>
                            <p className="text-sm text-muted-foreground">{request.deviceInfo?.deviceType || 'Unknown Type'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests">
              <Card className="donation-card">
                <CardHeader>
                  <CardTitle>My Active Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentRequests.filter((req: any) => ['pending', 'approved'].includes(req.status)).map((request: any) => (
                      <div key={request._id} className="p-6 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent text-white">
                              {getStatusIcon(request.status)}
                            </div>
                            <div>
                              <h3 className="font-semibold">{request.deviceInfo?.title || 'Unknown Device'}</h3>
                              <p className="text-sm text-muted-foreground">{request.deviceInfo?.deviceType || 'Unknown Type'}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Request Details</h4>
                            <p className="text-sm text-muted-foreground mb-2">Requested on {new Date(request.createdAt).toLocaleDateString()}</p>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p>Device: {request.deviceInfo?.title}</p>
                              <p>Type: {request.deviceInfo?.deviceType}</p>
                              <p>Condition: {request.deviceInfo?.condition}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Donor Information</h4>
                            <p className="text-sm text-muted-foreground">Donor: {request.deviceInfo?.ownerInfo?.name || 'Unknown'}</p>
                          </div>
                        </div>

                        <div className="flex space-x-2 pt-4 border-t">
                          {request.status === 'pending' && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleCancelRequest(request._id)}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel Request
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="donation-card">
                <CardHeader>
                  <CardTitle>Request History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentRequests.filter((req: any) => ['completed', 'rejected'].includes(req.status)).map((request: any) => (
                      <div key={request._id} className={`p-4 border rounded-lg ${
                        request.status === 'completed' ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                              request.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {getStatusIcon(request.status)}
                            </div>
                            <div>
                              <h3 className="font-semibold">{request.deviceInfo?.title || 'Unknown Device'}</h3>
                              <p className="text-sm text-muted-foreground">{request.deviceInfo?.deviceType || 'Unknown Type'}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">Requested on {new Date(request.createdAt).toLocaleDateString()}</p>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Device: {request.deviceInfo?.title}</p>
                          <p>Donor: {request.deviceInfo?.ownerInfo?.name || 'Unknown'}</p>
                        </div>

                        {request.status === 'completed' && (
                          <div className="mt-3 pt-3 border-t">
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Send Thank You Message
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Verification Form Modal */}
        {showVerificationForm && (
          <VerificationForm
            isOpen={showVerificationForm}
            onClose={() => setShowVerificationForm(false)}
            onSuccess={() => {
              setShowVerificationForm(false);
              // Refresh user data to get updated verification status
              fetchUserData();
              toast({
                title: "Verification Submitted",
                description: "Your verification request has been submitted successfully. We'll review it within 2-3 business days.",
              });
            }}
            user={user}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 