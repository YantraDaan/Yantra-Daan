import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Calendar, 
  User, 
  Laptop, 
  Heart, 
  MessageSquare, 
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Phone,
  Mail,
  Building2,
  GraduationCap,
  Gift,
  Users
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config/env";
import LoadingSpinner from "@/components/LoadingSpinner";
import NoDataFound from "@/components/NoDataFound";

interface DeviceOwner {
  _id: string;
  name: string;
  email: string;
  contact?: string;
  userRole: string;
  categoryType?: string;
  isOrganization?: boolean;
  about?: string;
  profession?: string;
  address?: string;
}

interface DeviceRequester {
  _id: string;
  name: string;
  email: string;
  contact?: string;
  userRole: string;
  profession?: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  adminNotes?: string;
  rejectionReason?: string;
}

interface DeviceDetail {
  _id: string;
  title: string;
  description: string;
  deviceType: string;
  condition: "excellent" | "good" | "fair" | "poor";
  location: {
    city: string;
    state: string;
    country: string;
  };
  fullLocation?: string;
  ownerInfo: DeviceOwner;
  createdAt: string;
  updatedAt: string;
  devicePhotos?: Array<{ 
    url: string; 
    caption?: string;
  }>;
  isActive: boolean;
  status: "approved" | "pending" | "rejected";
  specifications?: {
    brand?: string;
    model?: string;
    year?: number;
    ram?: string;
    storage?: string;
    processor?: string;
  };
  tags?: string[];
}

const DeviceDetailPage = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const [device, setDevice] = useState<DeviceDetail | null>(null);
  const [requesters, setRequesters] = useState<DeviceRequester[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canRequest, setCanRequest] = useState(false);
  const [requestReason, setRequestReason] = useState("");
  const [activeRequestCount, setActiveRequestCount] = useState(0);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it's a relative path, construct the full URL
    const baseUrl = config.apiUrl;
    return `${baseUrl}/uploads/${imagePath}`;
  };

  useEffect(() => {
    if (deviceId) {
      fetchDeviceDetails();
      fetchDeviceRequesters();
      checkCanRequest(); // Call the new function here
    }
  }, [deviceId]);

  useEffect(() => {
    if (user && deviceId) {
      checkCanRequest();
    }
  }, [user, deviceId]);

  const fetchDeviceDetails = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching device details for ID:', deviceId);
      console.log('API URL:', `${config.apiUrl}${config.endpoints.devices}/${deviceId}`);
      
      const response = await fetch(`${config.apiUrl}${config.endpoints.devices}/${deviceId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Device data received:', data);
      setDevice(data);
    } catch (error) {
      console.error('Error fetching device details:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load device details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeviceRequesters = async () => {
    try {
      console.log('Fetching device requesters for device:', deviceId);
      const response = await fetch(`${config.apiUrl}${config.endpoints.requests}/public/device/${deviceId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Requesters data received:', data);
        setRequesters(data.requests || []);
      } else {
        console.log('Failed to fetch requesters:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching device requesters:', error);
    }
  };

  const checkCanRequest = async () => {
    if (!user || !deviceId) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}${config.endpoints.requests}/can-request/${deviceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCanRequest(data.canRequest);
        setRequestReason(data.reason || '');
        setActiveRequestCount(data.activeRequestCount || 0);
        setExistingRequest(data.existingRequest || null);
      }
    } catch (error) {
      console.error('Error checking request eligibility:', error);
    }
  };

  const handleRequestDevice = async () => {
    if (!user) {
      navigate("/login", {
        state: { from: { pathname: `/devices/${deviceId}` } }
      });
      return;
    }

    if (!requestMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a request message",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${config.apiUrl}${config.endpoints.requests}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deviceId: deviceId,
          message: requestMessage
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Device request submitted successfully!",
        });
        setShowRequestForm(false);
        setRequestMessage("");
        fetchDeviceRequesters(); // Refresh requesters list
        checkCanRequest(); // Refresh request eligibility
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit request",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!device) {
    return (
      <NoDataFound
        title="Device Not Found"
        description="The device you're looking for doesn't exist or has been removed."
        actionText="Go Back"
        onAction={() => navigate(-1)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{device.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Device Images */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                    {device.devicePhotos && device.devicePhotos.length > 0 ? (
                      <img
                        src={device.devicePhotos[activeImageIndex]?.url}
                        alt={device.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                        <Laptop className="w-24 h-24 text-primary/40" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className={device.isActive ? "bg-green-600 text-white" : "bg-gray-600 text-white"}>
                        {device.isActive ? "Available" : "Reserved"}
                      </Badge>
                    </div>
                  </div>

                  {/* Thumbnail Images */}
                  {device.devicePhotos && device.devicePhotos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {device.devicePhotos.map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            index === activeImageIndex ? 'border-primary' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={photo.url}
                            alt={`${device.title} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Device Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Laptop className="w-5 h-5" />
                  Device Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Device Type</label>
                    <p className="text-lg font-semibold">{device.deviceType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 pr-1">Condition</label>
                    <Badge className="bg-blue-100 text-blue-800">
                      {device.condition.charAt(0).toUpperCase() + device.condition.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-lg">{device.location ? `${device.location.city}, ${device.location.state}` : 'Location not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Posted</label>
                    <p className="text-lg">{new Date(device.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-lg mt-1 text-gray-700 leading-relaxed">{device.description}</p>
                </div>

                {/* Specifications */}
                {device.specifications && Object.keys(device.specifications).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Specifications</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {device.specifications.brand && (
                        <div>
                          <span className="text-gray-600">Brand:</span>
                          <span className="ml-2 font-medium">{device.specifications.brand}</span>
                        </div>
                      )}
                      {device.specifications.model && (
                        <div>
                          <span className="text-gray-600">Model:</span>
                          <span className="ml-2 font-medium">{device.specifications.model}</span>
                        </div>
                      )}
                      {device.specifications.year && (
                        <div>
                          <span className="text-gray-600">Year:</span>
                          <span className="ml-2 font-medium">{device.specifications.year}</span>
                        </div>
                      )}
                      {device.specifications.ram && (
                        <div>
                          <span className="text-gray-600">RAM:</span>
                          <span className="ml-2 font-medium">{device.specifications.ram}</span>
                        </div>
                      )}
                      {device.specifications.storage && (
                        <div>
                          <span className="text-gray-600">Storage:</span>
                          <span className="ml-2 font-medium">{device.specifications.storage}</span>
                        </div>
                      )}
                      {device.specifications.processor && (
                        <div>
                          <span className="text-gray-600">Processor:</span>
                          <span className="ml-2 font-medium">{device.specifications.processor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {device.tags && device.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {device.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Request Form */}
            {device.isActive && user && (user.userRole === 'requester') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Request This Device
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!canRequest ? (
                    <div className="text-center space-y-3">
                      <div className="text-amber-600 bg-amber-50 p-3 rounded-lg">
                        <p className="font-medium">{requestReason}</p>
                        {activeRequestCount > 0 && (
                          <p className="text-sm text-amber-700 mt-1">
                            You currently have {activeRequestCount} active request(s)
                          </p>
                        )}
                      </div>
                    </div>
                  ) : !showRequestForm ? (
                    <div className="space-y-3">
                      <div className="text-center text-sm text-gray-600">
                        <p>You can request up to 3 devices at a time</p>
                        <p className="text-primary font-medium">Current: {activeRequestCount}/3</p>
                      </div>
                      <Button 
                        onClick={() => setShowRequestForm(true)}
                        className="w-full btn-hero"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Request Device
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Why do you need this device?
                        </label>
                        <textarea
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value)}
                          placeholder="Please explain why you need this device and how it will help you..."
                          className="w-full mt-2 p-3 border border-gray-300 rounded-lg resize-none"
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleRequestDevice}
                          disabled={isSubmitting || !requestMessage.trim()}
                          className="flex-1 btn-hero"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setShowRequestForm(false);
                            setRequestMessage("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Show existing request details */}
            {existingRequest && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <CheckCircle className="w-5 h-5" />
                    Your Request Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <Badge 
                        variant={existingRequest.status === 'pending' ? 'secondary' : 
                               existingRequest.status === 'approved' ? 'default' : 
                               existingRequest.status === 'rejected' ? 'destructive' : 'secondary'}
                        className="capitalize"
                      >
                        {existingRequest.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Your Message:</span>
                      <p className="mt-1 text-gray-700">{existingRequest.message}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Requested on: {new Date(existingRequest.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-sm text-blue-700">
                    {existingRequest.status === 'pending' && "Your request is being reviewed by our team."}
                    {existingRequest.status === 'approved' && "Your request has been approved! Please contact the donor to arrange pickup."}
                    {existingRequest.status === 'rejected' && "Your request was not approved. You can request other available devices."}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Show message for donors */}
            {device.isActive && user && user.userRole === 'donor' && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">Donors cannot request devices</p>
                </CardContent>
              </Card>
            )}

            {/* Show login prompt for non-authenticated users */}
            {device.isActive && !user && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600 mb-4">Login to request this device</p>
                  <Button 
                    onClick={() => navigate("/login", {
                      state: { from: { pathname: `/devices/${deviceId}` } }
                    })}
                    className="btn-hero"
                  >
                    Login
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Requesters List */}
            {requesters.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Device Requests ({requesters.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requesters.map((requester) => (
                      <div key={requester._id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{requester.name}</h4>
                              <p className="text-sm text-gray-600">{requester.email}</p>
                              {requester.profession && (
                                <p className="text-xs text-gray-500">{requester.profession}</p>
                              )}
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            <span className="capitalize">{requester.status}</span>
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-2">{requester.message}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Requested {new Date(requester.createdAt).toLocaleDateString()}</span>
                          {requester.contact && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {requester.contact}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Device Owner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-3">
                    {device.ownerInfo.categoryType === 'organization' ? (
                      <Building2 className="w-10 h-10 text-white" />
                    ) : device.ownerInfo.userRole === 'donor' ? (
                      <Gift className="w-10 h-10 text-white" />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold">{device.ownerInfo.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {device.ownerInfo.categoryType || 'Individual'}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  {/* <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{device.ownerInfo.email}</span>
                  </div> */}
                  {/* {device.ownerInfo.contact && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{device.ownerInfo.contact}</span>
                    </div>
                  )}
                  {device.ownerInfo.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm">{device.ownerInfo.address}</span>
                    </div>
                  )} */}
                  {device.ownerInfo.profession && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{device.ownerInfo.profession}</span>
                    </div>
                  )}
                </div>

                {device.ownerInfo.about && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-2">About</h4>
                      <p className="text-sm text-gray-700">{device.ownerInfo.about}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const location = device.location ? `${device.location.city}, ${device.location.state}` : '';
                    if (location) {
                      window.open(`https://www.google.com/maps/place/${location}`, '_blank');
                    }
                  }}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  View on Map
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: device.title,
                        text: `Check out this ${device.deviceType} on YantraDaan!`,
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: "Link Copied",
                        description: "Device link copied to clipboard!",
                      });
                    }
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Share Device
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailPage;
