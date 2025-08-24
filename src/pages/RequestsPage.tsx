import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, Calendar, MessageCircle, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import NoDataFound from "@/components/NoDataFound";

interface RequestItem {
  _id: string;
  title: string;
  description: string;
  deviceType: string;
  requesterName: string;
  location: string;
  createdAt: string;
  status: "pending" | "approved" | "fulfilled" | "declined";
  urgency: "low" | "medium" | "high";
  reason: string;
}

const RequestsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setRequests([]);
        return;
      }

      const response = await fetch('http://localhost:5000/api/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || request.deviceType === selectedCategory;
    const matchesStatus = selectedStatus === "all" || request.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "fulfilled":
        return <CheckCircle className="w-4 h-4" />;
      case "declined":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "fulfilled":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-hero-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Technology <span className="gradient-text">Requests</span>
          </h1>
          <p className="text-xl text-gray-600">
            Help fulfill technology needs in your community
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Laptop">Laptops</SelectItem>
                <SelectItem value="Smartphone">Smartphones</SelectItem>
                <SelectItem value="Tablet">Tablets</SelectItem>
                <SelectItem value="Desktop">Desktops</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>

            {/* Submit Request */}
            <Button className="btn-hero">
              Submit Request
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredRequests.length} of {requests.length} requests
          </p>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading requests...</p>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <Card key={request._id} className="request-card hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                        {request.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">{request.deviceType}</Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </Badge>
                        <Badge className={getUrgencyColor(request.urgency)}>
                          {request.urgency} priority
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-700">{request.description}</p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Reason for Request:</p>
                    <p className="text-sm text-blue-700">{request.reason}</p>
                  </div>

                  {/* Request Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <span>{request.requesterName}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Requested {new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      <span>{request.location}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {request.status === "pending" && (
                    <div className="flex gap-3 pt-4">
                      <Button className="btn-hero flex-1">
                        I Can Help
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Contact Requester
                      </Button>
                    </div>
                  )}

                  {request.status === "approved" && (
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Contact Requester
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <NoDataFound
            title="No requests found"
            description="Try adjusting your search filters to find more requests."
            imageType="search"
            variant="full"
          />
        )}

        {/* Note about Supabase */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Want to help fulfill a request?</h3>
          <p className="text-gray-600 mb-4">
            To connect with requesters and manage donations, you'll need to integrate with Supabase for authentication and database functionality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;