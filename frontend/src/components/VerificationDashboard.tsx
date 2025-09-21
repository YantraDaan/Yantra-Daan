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
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Eye,
  Clock,
  AlertCircle,
  FileText,
  Download,
  UserCheck,
  UserX
} from 'lucide-react';
import NoDataFound from './NoDataFound';
import { config } from "@/config/env";

interface VerificationUser {
  _id: string;
  name: string;
  email: string;
  contact: string;
  profession: string;
  about: string;
  userRole: string;
  categoryType: string;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  isVerified: boolean;
  verificationDocuments: Array<{
    type: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    uploadDate: string;
  }>;
  verificationNotes: string;
  verificationFormData: {
    howDeviceHelps: string;
    whyNeedDevice: string;
    submittedAt: string;
  };
  verifiedAt: string | null;
  verifiedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

const VerificationDashboard = () => {
  const [users, setUsers] = useState<VerificationUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<VerificationUser | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'verify' | 'reject'>('verify');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<VerificationUser | null>(null);
  const usersPerPage = 10;

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch users on component mount
  useEffect(() => {
    if (user && user.userRole === 'admin') {
      fetchUsers();
    }
  }, []);

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
  }, [user, toast, navigate]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: usersPerPage.toString(),
        status: statusFilter !== 'all' ? statusFilter : '',
        search: searchTerm
      });
      
      const response = await fetch(`${config.apiUrl}/api/admin/verification/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to load verification requests', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(t) ||
      user.email?.toLowerCase().includes(t) ||
      user.profession?.toLowerCase().includes(t) ||
      user.about?.toLowerCase().includes(t)
    );
  });

  const handleAction = (user: VerificationUser, type: 'verify' | 'reject') => {
    setSelectedUser(user);
    setActionType(type);
    setAdminNotes(user.verificationNotes || '');
    setShowActionDialog(true);
  };

  const submitAction = async () => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/admin/verification/users/${selectedUser._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: actionType === 'verify' ? 'verified' : 'rejected',
          notes: adminNotes
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `User ${actionType === 'verify' ? 'verified' : 'rejected'} successfully`,
        });
        setShowActionDialog(false);
        fetchUsers(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update verification status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update verification status',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewUserDetails = (user: VerificationUser) => {
    setSelectedUserForDetails(user);
    setShowUserDetails(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unverified': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unverified': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const downloadDocument = (document: any) => {
    // Create a download link for the document
    const link = document.createElement('a');
    link.href = `${config.apiUrl}/uploads/verification/${document.filename}`;
    link.download = document.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Verification Dashboard</h2>
          <p className="text-muted-foreground">Review and verify user account requests</p>
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
                  placeholder="Search by name, email, profession" 
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
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
                {filteredUsers.length} of {total}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading verification requests...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card key={user._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    {/* Header with User Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {user.profession} • {user.categoryType}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(user.verificationStatus)}>
                        {getStatusIcon(user.verificationStatus)}
                        <span className="ml-1 capitalize">{user.verificationStatus}</span>
                      </Badge>
                    </div>

                    {/* User Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          <h4 className="font-medium">Contact Information</h4>
                        </div>
                        <div className="bg-gray-50 p-3 rounded space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{user.contact}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <h4 className="font-medium">Verification Documents</h4>
                        </div>
                        <div className="bg-gray-50 p-3 rounded space-y-2 text-sm">
                          {user.verificationDocuments && user.verificationDocuments.length > 0 ? (
                            user.verificationDocuments.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="capitalize">{doc.type.replace('_', ' ')}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadDocument(doc)}
                                  className="h-6 px-2"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <span className="text-muted-foreground">No documents uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="font-medium text-blue-900 mb-2">About:</div>
                      <div className="text-sm text-blue-700">{user.about}</div>
                    </div>

                    {/* Verification Form Data */}
                    {user.verificationFormData && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="font-medium text-green-900 mb-2">Verification Responses:</div>
                        <div className="space-y-2 text-sm text-green-700">
                          <div>
                            <strong>How can this device help me:</strong>
                            <p>{user.verificationFormData.howDeviceHelps}</p>
                          </div>
                          <div>
                            <strong>Why do I need a device:</strong>
                            <p>{user.verificationFormData.whyNeedDevice}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Meta Information */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Requested {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                      {user.verifiedAt && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Verified {new Date(user.verifiedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Admin Notes */}
                    {user.verificationNotes && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="font-medium text-yellow-900 mb-1">Admin Notes:</div>
                        <div className="text-sm text-yellow-700">{user.verificationNotes}</div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewUserDetails(user)}
                        className="h-8 px-2"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                      
                      {user.verificationStatus === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAction(user, 'verify')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(user, 'reject')}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
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
            title="No verification requests found"
            description={
              searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'There are no verification requests at the moment'
            }
            actionText={searchTerm || statusFilter !== 'all' ? 'Clear Filters' : undefined}
            onAction={
              searchTerm || statusFilter !== 'all' 
                ? () => {
                    setSearchTerm('');
                    setStatusFilter('pending');
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
              {actionType === 'verify' ? 'Verify User Account' : 'Reject Verification Request'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedUser && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                <p className="text-sm text-gray-600">
                  Email: {selectedUser.email}
                </p>
                <p className="text-sm text-gray-600">
                  Profession: {selectedUser.profession}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                placeholder={actionType === 'verify' ? 'Add any notes for the user...' : 'Please provide a reason for rejection...'}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
            
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
                disabled={isSubmitting}
                className={
                  actionType === 'verify' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {actionType === 'verify' ? 'Verify User' : 'Reject Request'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Verification Details</DialogTitle>
          </DialogHeader>
          {selectedUserForDetails && (
            <div className="space-y-4">
              {/* User Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">User Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span>
                    <p className="text-muted-foreground">{selectedUserForDetails.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-muted-foreground">{selectedUserForDetails.email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Contact:</span>
                    <p className="text-muted-foreground">{selectedUserForDetails.contact}</p>
                  </div>
                  <div>
                    <span className="font-medium">Profession:</span>
                    <p className="text-muted-foreground">{selectedUserForDetails.profession}</p>
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>
                    <p className="text-muted-foreground">{selectedUserForDetails.categoryType}</p>
                  </div>
                  <div>
                    <span className="font-medium">Role:</span>
                    <p className="text-muted-foreground">{selectedUserForDetails.userRole}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-medium">About:</span>
                  <p className="text-muted-foreground mt-1">{selectedUserForDetails.about}</p>
                </div>
              </div>

              {/* Verification Documents */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Verification Documents</h3>
                {selectedUserForDetails.verificationDocuments && selectedUserForDetails.verificationDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUserForDetails.verificationDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <span className="font-medium capitalize">{doc.type.replace('_', ' ')}</span>
                          <p className="text-sm text-muted-foreground">{doc.originalName}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadDocument(doc)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No documents uploaded</p>
                )}
              </div>

              {/* Verification Form Responses */}
              {selectedUserForDetails.verificationFormData && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Verification Form Responses</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">How can this device help me:</span>
                      <p className="text-muted-foreground mt-1">{selectedUserForDetails.verificationFormData.howDeviceHelps}</p>
                    </div>
                    <div>
                      <span className="font-medium">Why do I need a device:</span>
                      <p className="text-muted-foreground mt-1">{selectedUserForDetails.verificationFormData.whyNeedDevice}</p>
                    </div>
                    <div>
                      <span className="font-medium">Submitted At:</span>
                      <p className="text-muted-foreground">
                        {new Date(selectedUserForDetails.verificationFormData.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Status */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Verification Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <Badge className={getStatusColor(selectedUserForDetails.verificationStatus)}>
                      {selectedUserForDetails.verificationStatus}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Requested On:</span>
                    <p className="text-muted-foreground">
                      {new Date(selectedUserForDetails.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedUserForDetails.verifiedAt && (
                    <div>
                      <span className="font-medium">Verified On:</span>
                      <p className="text-muted-foreground">
                        {new Date(selectedUserForDetails.verifiedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedUserForDetails.verificationNotes && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Admin Notes</h3>
                  <p className="text-sm text-purple-700">{selectedUserForDetails.verificationNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerificationDashboard;
