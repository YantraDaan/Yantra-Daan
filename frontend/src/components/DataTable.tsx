import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { 
  Edit, 
  Trash2, 
  Eye, 
  Plus, 
  Search,
  Users,
  MapPin,
  Calendar,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataItem {
  id: string;
  title: string;
  description: string;
  category: string;
  condition?: string;
  location: string;
  userName: string;
  dateCreated: string;
  status: string;
  priority?: string;
  reason?: string;
}

interface DataTableProps {
  title: string;
  data: DataItem[];
  type: "donations" | "requests";
  onAdd: (item: Omit<DataItem, 'id' | 'dateCreated'>) => void;
  onEdit: (id: string, item: Partial<DataItem>) => void;
  onDelete: (id: string) => void;
}

const DataTable = ({ title, data, type, onAdd, onEdit, onDelete }: DataTableProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DataItem | null>(null);
  const [viewingItem, setViewingItem] = useState<DataItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    location: "",
    userName: "",
    status: "",
    priority: "",
    reason: ""
  });

  const filteredData = data.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      condition: "",
      location: "",
      userName: "",
      status: "",
      priority: "",
      reason: ""
    });
  };

  const handleAdd = () => {
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    onAdd(formData);
    resetForm();
    setIsAddDialogOpen(false);
    toast({
      title: "Success",
      description: `${type === 'donations' ? 'Donation' : 'Request'} added successfully`
    });
  };

  const handleEdit = () => {
    if (!editingItem) return;
    
    onEdit(editingItem.id, formData);
    setEditingItem(null);
    resetForm();
    toast({
      title: "Success",
      description: `${type === 'donations' ? 'Donation' : 'Request'} updated successfully`
    });
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    toast({
      title: "Success",
      description: `${type === 'donations' ? 'Donation' : 'Request'} deleted successfully`
    });
  };

  const openEditDialog = (item: DataItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      condition: item.condition || "",
      location: item.location,
      userName: item.userName,
      status: item.status,
      priority: item.priority || "",
      reason: item.reason || ""
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
      case "approved":
        return "bg-success/20 text-success";
      case "pending":
        return "bg-warning/20 text-warning";
      case "fulfilled":
        return "bg-accent/20 text-accent";
      case "declined":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="donation-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-hero">
                <Plus className="w-4 h-4 mr-2" />
                Add {type === 'donations' ? 'Donation' : 'Request'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New {type === 'donations' ? 'Donation' : 'Request'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laptop">Laptop</SelectItem>
                        <SelectItem value="Smartphone">Smartphone</SelectItem>
                        <SelectItem value="Tablet">Tablet</SelectItem>
                        <SelectItem value="Desktop">Desktop</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {type === 'donations' && (
                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Select value={formData.condition} onValueChange={(value) => setFormData({...formData, condition: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Like New">Like New</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {type === 'requests' && (
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userName">{type === 'donations' ? 'Donor' : 'Requester'} Name</Label>
                    <Input
                      id="userName"
                      value={formData.userName}
                      onChange={(e) => setFormData({...formData, userName: e.target.value})}
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Enter location"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {type === 'donations' ? (
                        <>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="fulfilled">Fulfilled</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="fulfilled">Fulfilled</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {type === 'requests' && (
                  <div>
                    <Label htmlFor="reason">Reason for Request</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      placeholder="Explain why you need this item"
                      rows={2}
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <Button onClick={handleAdd} className="btn-hero flex-1">
                    Add {type === 'donations' ? 'Donation' : 'Request'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={`Search ${type}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        {/* Pagination Info */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} {type}
          </p>
        </div>

        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No {type} found matching your search.
            </div>
          ) : (
            currentData.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg border">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {item.userName}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {item.location}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {item.dateCreated}
                  </span>
                  <span className="flex items-center">
                    <Package className="w-4 h-4 mr-1" />
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
                {item.priority && (
                  <Badge variant="outline">
                    {item.priority} priority
                  </Badge>
                )}
                <div className="flex gap-1">
                  <Dialog open={viewingItem?.id === item.id} onOpenChange={(open) => !open && setViewingItem(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingItem(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{viewingItem?.title}</DialogTitle>
                      </DialogHeader>
                      {viewingItem && (
                        <div className="space-y-4">
                          <div>
                            <Label>Description</Label>
                            <p className="text-sm text-gray-700 mt-1">{viewingItem.description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Category</Label>
                              <p className="text-sm text-gray-700 mt-1">{viewingItem.category}</p>
                            </div>
                            {viewingItem.condition && (
                              <div>
                                <Label>Condition</Label>
                                <p className="text-sm text-gray-700 mt-1">{viewingItem.condition}</p>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>{type === 'donations' ? 'Donor' : 'Requester'}</Label>
                              <p className="text-sm text-gray-700 mt-1">{viewingItem.userName}</p>
                            </div>
                            <div>
                              <Label>Location</Label>
                              <p className="text-sm text-gray-700 mt-1">{viewingItem.location}</p>
                            </div>
                          </div>
                          {viewingItem.reason && (
                            <div>
                              <Label>Reason for Request</Label>
                              <p className="text-sm text-gray-700 mt-1">{viewingItem.reason}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={editingItem?.id === item.id} onOpenChange={(open) => !open && setEditingItem(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit {type === 'donations' ? 'Donation' : 'Request'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-title">Title</Label>
                          <Input
                            id="edit-title"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {type === 'donations' ? (
                                  <>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                                  </>
                                ) : (
                                  <>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                                    <SelectItem value="declined">Declined</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Location</Label>
                            <Input
                              value={formData.location}
                              onChange={(e) => setFormData({...formData, location: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={handleEdit} className="btn-hero flex-1">
                            Update
                          </Button>
                          <Button variant="outline" onClick={() => setEditingItem(null)} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                      }
                    }}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1);
                      }
                    }}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataTable;