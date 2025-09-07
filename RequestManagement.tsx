import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Gift, Users, Mail, Phone, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { config } from "@/config/env";

interface RequestItem {
  _id: string;
  status: string;
  createdAt: string;
  message: string;
  adminNotes?: string;
  rejectionReason?: string;
  requesterInfo?: {
    _id: string;
    name?: string;
    email?: string;
    contact?: string;
  };
  deviceInfo?: {
    _id: string;
    title: string;
    deviceType: string;
    condition: string;
    ownerInfo?: {
      _id: string;
      name?: string;
      email?: string;
      contact?: string;
    };
  };
}

const RequestManagement = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedDonor, setSelectedDonor] = useState<RequestItem["deviceInfo"]["ownerInfo"] | null>(null);
  const [showDonorDialog, setShowDonorDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'complete'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestsPerPage = 10;

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

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
      toast({ title: 'Error', description: 'Failed to load requests', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = requests.filter((r) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      r.deviceInfo?.title?.toLowerCase().includes(t) ||
      r.requesterInfo?.name?.toLowerCase().includes(t) ||
      r.deviceInfo?.ownerInfo?.name?.toLowerCase().includes(t) ||
      r.message?.toLowerCase().includes(t)
    );
  });

  const handleAction = (request: RequestItem, type: 'approve' | 'reject' | 'complete') => {
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
        fetchRequests();
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

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge>Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Device Requests</h2>
          <p className="text-muted-foreground">Review and manage all device requests</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rq-search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="rq-search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by device, requester, donor" className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Total</Label>
              <div className="text-2xl font-bold text-primary">{total}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="grid gap-4">
        {filtered.map((req) => (
          <Card key={req._id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      <h3 className="font-semibold text-lg">{req.deviceInfo?.title}</h3>
                    </div>
                    {statusBadge(req.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                    <div>
                      <div className="font-medium text-foreground">Requester</div>
                      <div className="flex items-center gap-2"><Users className="w-4 h-4" />{req.requesterInfo?.name || 'Unknown'}</div>
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4" />{req.requesterInfo?.email}</div>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Donor</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedDonor(req.deviceInfo?.ownerInfo || null); setShowDonorDialog(true); }}
                      >
                        {req.deviceInfo?.ownerInfo?.name || 'View Donor'}
                      </Button>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Meta</div>
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(req.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Request Message */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-medium text-blue-900 mb-1">Request Message:</div>
                    <div className="text-sm text-blue-700">{req.message}</div>
                  </div>

                  {/* Action Buttons */}
                  {req.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
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
                    </div>
                  )}

                  {req.status === 'approved' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleAction(req, 'complete')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Complete
                      </Button>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {req.adminNotes && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="font-medium text-green-900 mb-1">Admin Notes:</div>
                      <div className="text-sm text-green-700">{req.adminNotes}</div>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {req.rejectionReason && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="font-medium text-red-900 mb-1">Rejection Reason:</div>
                      <div className="text-sm text-red-700">{req.rejectionReason}</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-2">
          <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Previous</Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            return (
              <Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(pageNum)}>{pageNum}</Button>
            );
          })}
          <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      )}

      {/* Donor Details Dialog */}
      <Dialog open={showDonorDialog} onOpenChange={setShowDonorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Donor Details</DialogTitle>
          </DialogHeader>
          {selectedDonor ? (
            <div className="space-y-2 text-sm">
              <div className="font-semibold text-lg">{selectedDonor.name}</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" />{selectedDonor.email || 'N/A'}</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4" />{selectedDonor.contact || 'N/A'}</div>
            </div>
          ) : (
            <div className="text-muted-foreground">No donor details available.</div>
          )}
        </DialogContent>
      </Dialog>

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
                <h3 className="font-semibold text-lg">{selectedRequest.deviceInfo?.title}</h3>
                <p className="text-sm text-gray-600">
                  Requested by: {selectedRequest.requesterInfo?.name}
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
    </div>
  );
};

export default RequestManagement;


