import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import NoDataFound from './NoDataFound';
import { useNavigate } from 'react-router-dom';

interface Device {
  _id: string;
  title: string;
  description: string;
  deviceType: string;
  condition: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  images: Array<{
    url: string;
    caption: string;
  }>;
  createdAt: string;
  ownerInfo: {
    name: string;
    city: string;
    state: string;
  };
}

const DeviceBrowse: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    deviceType: '',
    condition: '',
    city: '',
    state: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, [currentPage, filters]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...filters
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/devices/approved?${params}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices);
        setTotalPages(data.totalPages);
      } else {
        throw new Error('Failed to fetch devices');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load devices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchDevices();
  };

  const clearFilters = () => {
    setFilters({
      deviceType: '',
      condition: '',
      city: '',
      state: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleRequestDevice = (device: Device) => {
    setSelectedDevice(device);
    setRequestMessage('');
    setRequestDialogOpen(true);
  };

  const submitRequest = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to request devices",
        variant: "destructive"
      });
      return;
    }

    if (!selectedDevice || !requestMessage.trim()) {
      toast({
        title: "Invalid Request",
        description: "Please provide a message for your request",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmittingRequest(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/device-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          deviceId: selectedDevice._id,
          message: requestMessage.trim()
        })
      });

      if (response.ok) {
        toast({
          title: "Request Submitted",
          description: "Your device request has been submitted successfully and is pending admin approval",
        });
        setRequestDialogOpen(false);
        setSelectedDevice(null);
        setRequestMessage('');
      } else {
        const errorData = await response.json();
        toast({
          title: "Request Failed",
          description: errorData.error || "Failed to submit request",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmittingRequest(false);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceTypeIcon = (type: string) => {
    switch (type) {
      case 'laptop': return '💻';
      case 'desktop': return '🖥️';
      case 'tablet': return '📱';
      case 'smartphone': return '📱';
      case 'accessories': return '🔌';
      default: return '📱';
    }
  };

  if (loading && devices.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Available Devices</h1>
        <p className="text-gray-600">Find devices donated by generous people in your area</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div>
            <Label htmlFor="deviceType">Device Type</Label>
            <Select value={filters.deviceType} onValueChange={(value) => handleFilterChange('deviceType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="laptop">Laptop</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="smartphone">Smartphone</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="condition">Condition</Label>
            <Select value={filters.condition} onValueChange={(value) => handleFilterChange('condition', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All conditions</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="City"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="State"
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <Button onClick={handleSearch}>Search</Button>
          <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {devices.length} device{devices.length !== 1 ? 's' : ''}
          {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
        </p>
      </div>

      {/* Devices Grid */}
      {devices.length === 0 ? (
          <NoDataFound
            title="No devices found"
            description="Try adjusting your search criteria or check back later for new donations."
            imageType="devices"
            variant="full"
          />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {devices.map((device) => (
            <Card key={device._id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="text-2xl">{getDeviceTypeIcon(device.deviceType)}</div>
                  <Badge className={getConditionColor(device.condition)}>
                    {device.condition}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight">{device.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {device.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Type:</span>
                    <span className="ml-2 capitalize">{device.deviceType}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">
                      {device.location.city}, {device.location.state}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Posted:</span>
                    <span className="ml-2">
                      {new Date(device.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {device.images && device.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {device.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={image.caption || 'Device image'}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="pt-2 space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        // Navigate to device detail page
                        navigate(`/devices/${device._id}`);
                      }}
                    >
                      View Details
                    </Button>
                    
                    {/* Show Request button only for requesters (not donors) */}
                    {user && user.userRole === 'requester' && (
                      <Button 
                        variant="outline"
                        className="w-full" 
                        onClick={() => handleRequestDevice(device)}
                      >
                        Request This Device
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className="w-10 h-10 p-0"
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Request Device Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDevice && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg">{selectedDevice.title}</h3>
                <p className="text-sm text-gray-600">
                  {selectedDevice.deviceType} • {selectedDevice.condition}
                </p>
                <p className="text-sm text-gray-600">
                  Location: {selectedDevice.location.city}, {selectedDevice.location.state}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="requestMessage">Why do you need this device?</Label>
              <Textarea
                id="requestMessage"
                placeholder="Please explain why you need this device and how it will help you..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {requestMessage.length}/500 characters
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setRequestDialogOpen(false)}
                disabled={submittingRequest}
              >
                Cancel
              </Button>
              <Button
                onClick={submitRequest}
                disabled={submittingRequest || !requestMessage.trim()}
              >
                {submittingRequest ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeviceBrowse;
