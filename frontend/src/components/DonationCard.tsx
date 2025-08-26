import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, User, Laptop, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

interface DonationItem {
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
  ownerInfo?: {
    _id: string;
    name?: string;
    email?: string;
  };
  createdAt: string;
  devicePhotos?: Array<{ url: string; caption?: string }>;
  images?: string[];
  isActive: boolean;
  status: "approved" | "pending" | "rejected";
}

interface DonationCardProps {
  item: DonationItem;
  onRequest?: (itemId: string) => void;
}

const DonationCard = ({ item, onRequest }: DonationCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "fair":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "Excellent";
      case "good":
        return "Good";
      case "fair":
        return "Fair";
      case "poor":
        return "Poor";
      default:
        return condition;
    }
  };

  const handleRequest = () => {
    if (!user) {
      navigate("/login", {
        state: { from: { pathname: window.location.pathname } },
      });
      return;
    }

    if (user.userRole !== "requester") return;

    onRequest?.(item._id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getLocationString = () => {
    if (item.fullLocation) return item.fullLocation;
    if (item.location) {
      const { city, state, country } = item.location;
      return [city, state, country].filter(Boolean).join(", ");
    }
    return "Location not specified";
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it's a relative path, construct the full URL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${imagePath}`;
  };

  const getDonorName = () => {
    return item.ownerInfo?.name || "Admin";
  };
  
  return (
    
    <Card className="donation-card group">
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {item.devicePhotos && item.devicePhotos.length > 0 && item.devicePhotos[0].url ? (
          <img
            src={getImageUrl(item.devicePhotos[0].url)}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              console.log('Image failed to load:', getImageUrl(item.devicePhotos[0].url));
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : item.images && item.images.length > 0 ? (
          <img
            src={getImageUrl(item.images[0])}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              console.log('Image failed to load:', getImageUrl(item.images[0]));
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <Laptop className="w-16 h-16 text-primary/40" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {item.isActive ? (
            <Badge className="bg-green-600 text-white">Available</Badge>
          ) : (
            <Badge variant="secondary">Reserved</Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{item.deviceType}</Badge>
              <Badge className={getConditionColor(item.condition)}>
                {getConditionLabel(item.condition)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            <a
              href={`https://www.google.com/maps/place/${getLocationString()}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {getLocationString()}
            </a>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <User className="w-4 h-4 mr-2" />
            <span>Donated by {getDonorName()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Posted {formatDate(item.createdAt)}</span>
          </div>
        </div>

        {/* Action Button */}
        {item.isActive && user && user.userRole === 'requester' && onRequest && (
          <Button
            onClick={handleRequest}
            className="w-full btn-hero"
          >
            Request This Item
          </Button>
        )}

        {/* Show different messages based on user role */}
        {item.isActive && user && user.userRole === 'donor' && (
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Donors cannot request items</p>
          </div>
        )}

        {item.isActive && !user && (
          <Button
            onClick={() => navigate("/login", {
              state: { from: { pathname: window.location.pathname } },
            })}
            className="w-full btn-hero"
          >
            Login to Request
          </Button>
        )}

        {/* Read More Button */}
        <Link to={`/devices/${item._id}`}>
          <Button variant="outline" className="w-full">
            <Eye className="w-4 h-4 mr-2" />
            Read More
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default DonationCard;
