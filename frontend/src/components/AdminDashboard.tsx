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
  Gift, 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Eye,
  Clock,
  AlertCircle
} from 'lucide-react';
import NoDataFound from './NoDataFound';
import { config } from "@/config/env";

interface DeviceRequest {
  _id: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  message: string;
  adminNotes?: string;
  rejectionReason?: string;
  requesterInfo: {
    _id: string;
    name: string;
    email: string;
    contact: string;
  };
  deviceInfo: {
    _id: string;
    title: string;
    deviceType: string;
    condition: string;
    description: string;
    location: {
      city: string;
      state: string;
    };
    ownerInfo: {
      _id: string;
      name: string;
      email: string;
      contact: string;
    };
  };
}

const AdminDashboard = () => {
  const [requests, setRequests] = useState<DeviceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<DeviceRequest | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'complete'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<DeviceRequest | null>(null);
  const [showRequestFullDetails, setShowRequestFullDetails] = useState(false);
  const [selectedRequestForFullDetails, setSelectedRequestForFullDetails] = useState<DeviceRequest | null>(null);
  const requestsPerPage = 10;

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
    
    // Only fetch requests if user is confirmed admin and not already loading
    if (user.userRole === 'admin' && !isLoading) {
      fetchRequests();
    }
  }, [currentPage, statusFilter, user, isLoading, toast, navigate]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: requestsPerPage.toString(),
        status: statusFilter !== 'all' ? statusFilter : ''
      });
      
      const response = await fetch(`${config.apiUrl}${config.endpoints.requests}/admin/all?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch requests');
      
      const data = await response.json();
      setRequests(data.requests || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to load requests', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      req.deviceInfo?.title?.toLowerCase().includes(t) ||
      req.requesterInfo?.name?.toLowerCase().includes(t) ||
      req.deviceInfo?.ownerInfo?.name?.toLowerCase().includes(t) ||
      req.message?.toLowerCase().includes(t)
    );
  });

  const handleAction = (request: DeviceRequest, type: 'approve' | 'reject' | 'complete') => {
    setSelectedRequest(request);
    setActionType(type);
    setAdminNotes(request.adminNotes || '');
    setRejectionReason(request.rejectionReason || '');
    setShowActionDialog(true);
  };

  const submitAction = async () => {
    if (!selectedRequest) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}${config.endpoints.requests}/admin/${selectedRequest._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'completed',
          adminNotes: actionType === 'approve' ? adminNotes : undefined,
          rejectionReason: actionType === 'reject' ? rejectionReason : undefined
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Request ${actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'completed'} successfully`,
        });
        setShowActionDialog(false);
        fetchRequests(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update request status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update request status',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewRequestDetails = (request: DeviceRequest) => {
    setSelectedRequestForDetails(request);
    setShowRequestDetails(true);
  };

  const handleShowRequestFullDetails = (request: DeviceRequest) => {
    setSelectedRequestForFullDetails(request);
    setShowRequestFullDetails(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard - Device Requests</h2>
          <p className="text-muted-foreground">Review and manage all device requests</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{total}</div>
          <p className="text-sm text-muted-foreground">Total Requests</p>
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
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Search by device, requester, donor" 
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Page</Label>
              <div className="text-sm text-muted-foreground">
                {currentPage} of {totalPages}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Results</Label>
              <div className="text-sm text-muted-foreground">
                {filteredRequests.length} of {total}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading requests...</p>
          </div>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <Card key={req._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    {/* Header with Device Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                          <Gift className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{req.deviceInfo.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {req.deviceInfo.deviceType} • {req.deviceInfo.condition}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(req.status)}>
                        {getStatusIcon(req.status)}
                        <span className="ml-1 capitalize">{req.status}</span>
                      </Badge>
                    </div>

                    {/* Request Message */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="font-medium text-blue-900 mb-2">Request Message:</div>
                      <div className="text-sm text-blue-700">{req.message}</div>
                    </div>

                    {/* User Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Requester Info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          <h4 className="font-medium">Requester</h4>
                        </div>
                        <div className="bg-gray-50 p-3 rounded space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Name:</span>
                            <span>{req.requesterInfo.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{req.requesterInfo.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{req.requesterInfo.contact}</span>
                          </div>
                        </div>
                      </div>

                      {/* Device Owner Info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-primary" />
                          <h4 className="font-medium">Device Owner</h4>
                        </div>
                        <div className="bg-gray-50 p-3 rounded space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Name:</span>
                            <span>{req.deviceInfo.ownerInfo.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{req.deviceInfo.ownerInfo.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{req.deviceInfo.ownerInfo.contact}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Device Details */}
                    <div className="bg-gray-50 p-4 rounded space-y-2">
                      <h4 className="font-medium">Device Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Description:</span>
                          <p className="text-muted-foreground">{req.deviceInfo.description}</p>
                        </div>
                        <div>
                          <span className="font-medium">Location:</span>
                          <p className="text-muted-foreground">
                            {req.deviceInfo.location.city}, {req.deviceInfo.location.state}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Meta Information */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Requested {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Admin Notes and Rejection Reason */}
                    {req.adminNotes && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="font-medium text-green-900 mb-1">Admin Notes:</div>
                        <div className="text-sm text-green-700">{req.adminNotes}</div>
                      </div>
                    )}

                    {req.rejectionReason && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="font-medium text-red-900 mb-1">Rejection Reason:</div>
                        <div className="text-sm text-red-700">{req.rejectionReason}</div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShowRequestFullDetails(req)}
                        className="h-8 px-2"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewRequestDetails(req)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>

                      {req.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAction(req, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(req, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {req.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleAction(req, 'complete')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <NoDataFound
            icon={Search}
            title="No requests found"
            description={
              searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'There are no device requests at the moment'
            }
            actionText={searchTerm || statusFilter !== 'all' ? 'Clear Filters' : undefined}
            onAction={
              searchTerm || statusFilter !== 'all' 
                ? () => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }
                : undefined
            }
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

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Request' : 
               actionType === 'reject' ? 'Reject Request' : 'Mark Complete'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg">{selectedRequest.deviceInfo.title}</h3>
                <p className="text-sm text-gray-600">
                  Requested by: {selectedRequest.requesterInfo.name}
                </p>
                <p className="text-sm text-gray-600">
                  Message: {selectedRequest.message}
                </p>
              </div>
            )}
            
            {actionType === 'approve' && (
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add any notes for the requester..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {actionType === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Please provide a reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            )}

            {actionType === 'complete' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  This will mark the request as completed. The device has been successfully transferred.
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowActionDialog(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={submitAction}
                disabled={isSubmitting || (actionType === 'reject' && !rejectionReason.trim())}
                className={
                  actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {actionType === 'approve' ? 'Approve' : 
                     actionType === 'reject' ? 'Reject' : 'Complete'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Details Dialog */}
      <Dialog open={showRequestDetails} onOpenChange={setShowRequestDetails}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequestForDetails && (
            <div className="space-y-4">
              {/* Device Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Device Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Title:</span>
                    <p className="text-muted-foreground">{selectedRequestForDetails.deviceInfo.title}</p>
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>
                    <p className="text-muted-foreground">{selectedRequestForDetails.deviceInfo.deviceType}</p>
                  </div>
                  <div>
                    <span className="font-medium">Condition:</span>
                    <p className="text-muted-foreground">{selectedRequestForDetails.deviceInfo.condition}</p>
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>
                    <p className="text-muted-foreground">
                      {selectedRequestForDetails.deviceInfo.location.city}, {selectedRequestForDetails.deviceInfo.location.state}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-medium">Description:</span>
                  <p className="text-muted-foreground mt-1">{selectedRequestForDetails.deviceInfo.description}</p>
                </div>
              </div>

              {/* Requester Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Requester Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span>
                    <p className="text-muted-foreground">{selectedRequestForDetails.requesterInfo.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-muted-foreground">{selectedRequestForDetails.requesterInfo.email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Contact:</span>
                    <p className="text-muted-foreground">{selectedRequestForDetails.requesterInfo.contact}</p>
                  </div>
                </div>
              </div>

              {/* Device Owner Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Device Owner Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span>
                    <p className="text-muted-foreground">{selectedRequestForDetails.deviceInfo.ownerInfo.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-muted-foreground">{selectedRequestForDetails.deviceInfo.ownerInfo.email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Contact:</span>
                    <p className="text-muted-foreground">{selectedRequestForDetails.deviceInfo.ownerInfo.contact}</p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Request Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge className={`ml-2 ${getStatusColor(selectedRequestForDetails.status)}`}>
                      {selectedRequestForDetails.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Requested On:</span>
                    <p className="text-muted-foreground">
                      {new Date(selectedRequestForDetails.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Message:</span>
                    <p className="text-muted-foreground mt-1">{selectedRequestForDetails.message}</p>
                  </div>
                </div>
              </div>

              {/* Admin Notes and Rejection Reason */}
              {selectedRequestForDetails.adminNotes && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Admin Notes</h3>
                  <p className="text-sm text-green-700">{selectedRequestForDetails.adminNotes}</p>
                </div>
              )}

              {selectedRequestForDetails.rejectionReason && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Rejection Reason</h3>
                  <p className="text-sm text-red-700">{selectedRequestForDetails.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
