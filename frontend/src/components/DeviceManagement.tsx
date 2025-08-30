import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Printer,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  GraduationCap
} from "lucide-react";
import NoDataFound from './NoDataFound';
import { config } from "@/config/env";

interface Device {
  _id: string;
  title: string;
  deviceType: string;
  condition: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  ownerInfo: {
    name: string;
    email: string;
  };
  createdAt: string;
  rejectionReason?: string;
}

const DeviceManagement = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDonorDetails, setShowDonorDetails] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    deviceType: "",
    condition: ""
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDevices, setTotalDevices] = useState(0);
  const devicesPerPage = 10;

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchDevices();
  }, [currentPage]);

  useEffect(() => {
    filterDevices();
  }, [devices, searchTerm, statusFilter, typeFilter]);

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "No authentication token found. Please login again.",
          variant: "destructive"
        });
        return;
      }
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: devicesPerPage.toString(),
        status: statusFilter !== 'all' ? statusFilter : '',
        deviceType: typeFilter !== 'all' ? typeFilter : ''
      });

      const apiUrl = `${config.apiUrl}${config.endpoints.admin}/devices?${params}`;
      console.log('Fetching devices from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch devices`);
      }
      
      const data = await response.json();
      console.log('Devices data received:', data);
      
      setDevices(data.devices || []);
      setTotalPages(data.totalPages || 1);
      setTotalDevices(data.total || 0);
    } catch (error) {
      console.error('Fetch devices error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch devices",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterDevices = () => {
    let filtered = devices;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(device =>
        device.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (device.ownerInfo?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(device => device.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(device => device.deviceType === typeFilter);
    }

    setFilteredDevices(filtered);
  };

  const updateDeviceStatus = async (deviceId: string, status: string, reason?: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}${config.endpoints.admin}/devices/${deviceId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, rejectionReason: reason })
      });

      if (!response.ok) throw new Error('Failed to update device status');

      toast({
        title: "Success",
        description: `Device ${status} successfully`
      });

      fetchDevices();
      setShowRejectDialog(false);
      setRejectionReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update device status",
        variant: "destructive"
      });
    }
  };

    const deleteDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}${config.endpoints.devices}/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete device');

      toast({
        title: "Success",
        description: "Device deleted successfully"
      });

      fetchDevices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete device",
        variant: "destructive"
      });
    }
  };

  const handleShowDonorDetails = (donor) => {
    setSelectedDonor(donor);
    setShowDonorDetails(true);
  };

  const getDeviceTypeIcon = (type: string) => {
    switch (type) {
      case 'smartphone': return <Smartphone className="w-4 h-4" />;
      case 'laptop': return <Laptop className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'printer': return <Printer className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
          <h2 className="text-2xl font-bold">Device Management</h2>
          <p className="text-muted-foreground">Manage all device donations and requests</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchDevices} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

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
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
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
              <Label htmlFor="type">Device Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="smartphone">Smartphone</SelectItem>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="printer">Printer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Total Devices</Label>
              <div className="text-2xl font-bold text-primary">
                {totalDevices}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Devices List */}
      <div className="grid gap-4">
        {filteredDevices.length === 0 ? (
          <NoDataFound
            title="No devices found"
            description="No devices match your current search criteria. Try adjusting your filters or search terms."
            actionText="Clear Filters"
            onAction={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setTypeFilter('all');
            }}
          />
        ) : (
          filteredDevices.map((device) => {
            // Safety check for device object
            if (!device || !device._id) {
              console.warn('Skipping invalid device:', device);
              return null;
            }
            
            return (
              <Card key={device._id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getDeviceTypeIcon(device.deviceType)}
                      <h3 className="font-semibold text-lg">{device.title || 'Untitled Device'}</h3>
                    </div>
                    {getStatusBadge(device.status)}
                  </div>
                  
                  <p className="text-muted-foreground">{device.description || 'No description available'}</p>
                  
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline">{device.deviceType || 'Unknown Type'}</Badge>
                    <Badge variant="outline">{device.condition || 'Unknown Condition'}</Badge>
                    <Badge variant="outline">
                      {device.createdAt ? new Date(device.createdAt).toLocaleDateString() : 'No Date'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <strong>Donor:</strong> {device.ownerInfo?.name || 'Unknown'} ({device.ownerInfo?.email || 'No email'})
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => device.ownerInfo && handleShowDonorDetails(device.ownerInfo)}
                      className="h-8 px-2"
                      disabled={!device.ownerInfo}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  {device.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => updateDeviceStatus(device._id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedDevice(device);
                          setShowRejectDialog(true);
                        }}
                        variant="destructive"
                        size="sm"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  <Button
                    onClick={() => {
                      setSelectedDevice(device);
                      setEditForm({
                        title: device.title,
                        description: device.description,
                        deviceType: device.deviceType,
                        condition: device.condition
                      });
                      setShowEditDialog(true);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    onClick={() => deleteDevice(device._id)}
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    size="sm"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
            );
          }).filter(Boolean)
        )}
      </div>



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
            Page {currentPage} of {totalPages} ({totalDevices} total devices)
          </span>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedDevice && rejectionReason.trim()) {
                    updateDeviceStatus(selectedDevice._id, 'rejected', rejectionReason);
                  }
                }}
                variant="destructive"
                disabled={!rejectionReason.trim()}
              >
                Reject Device
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTitle">Title</Label>
              <Input
                id="editTitle"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editType">Device Type</Label>
                <Select value={editForm.deviceType} onValueChange={(value) => setEditForm(prev => ({ ...prev, deviceType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smartphone">Smartphone</SelectItem>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="printer">Printer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editCondition">Condition</Label>
                <Select value={editForm.condition} onValueChange={(value) => setEditForm(prev => ({ ...prev, condition: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('authToken');
                    const response = await fetch(`${config.apiUrl}${config.endpoints.devices}/${selectedDevice?._id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify(editForm)
                    });

                    if (!response.ok) throw new Error('Failed to update device');

                    toast({
                      title: "Success",
                      description: "Device updated successfully"
                    });

                    fetchDevices();
                    setShowEditDialog(false);
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to update device",
                      variant: "destructive"
                    });
                  }
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Donor Details Dialog */}
      <Dialog open={showDonorDetails} onOpenChange={setShowDonorDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Donor Information
            </DialogTitle>
          </DialogHeader>
          {selectedDonor && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{selectedDonor.name || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{selectedDonor.email || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Contact</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{selectedDonor.contact || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">User Type</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    {selectedDonor.isOrganization ? (
                      <Building2 className="w-4 h-4 text-gray-400" />
                    ) : (
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="font-medium">
                      {selectedDonor.isOrganization ? 'Organization' : 'Individual'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {selectedDonor.profession && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Profession</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{selectedDonor.profession}</span>
                  </div>
                </div>
              )}

              {selectedDonor.address && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{selectedDonor.address}</span>
                  </div>
                </div>
              )}

              {selectedDonor.about && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">About</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm leading-relaxed">{selectedDonor.about}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDonorDetails(false)}
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

export default DeviceManagement;
