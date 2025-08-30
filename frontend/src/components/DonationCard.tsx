import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, User, Laptop, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { config } from "@/config/env";

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
  requestState?: {
    canRequest: boolean;
    reason: string;
    activeRequestCount: number;
  };
}

const DonationCard = ({ item, onRequest, requestState }: DonationCardProps) => {
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

    // Check if user can request this device
    if (requestState && !requestState.canRequest) {
      return;
    }

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
    return `${config.apiUrl}/uploads/${imagePath}`;
  };

  const getDonorName = () => {
    return item.ownerInfo?.name || "Yantra Daan";
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

            // onError={(e) => {
            //   console.log('Image failed to load:', getImageUrl(item.devicePhotos[0].url));
            //   console.log('Original image path:', item.devicePhotos[0].url);
            //   console.log('Constructed URL:', getImageUrl(item.devicePhotos[0].url));
            //   e.currentTarget.style.display = "none";
            //   // Show fallback content
            //   const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback');
            //   if (fallback) {
            //     fallback.classList.remove('hidden');
            //   }
            // }
          // }
          //   onLoad={() => {
          //     console.log('Image loaded successfully:', getImageUrl(item.devicePhotos[0].url));
          //   }}
          />
        ) : item.images && item.images.length > 0 ? (
          <img
            src={getImageUrl(item.images[0])}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            // onError={(e) => {
            //   console.log('Image failed to load:', getImageUrl(item.images[0]));
            //   console.log('Original image path:', item.images[0]);
            //   console.log('Constructed URL:', getImageUrl(item.images[0]));
            //   e.currentTarget.style.display = "none";
            //   // Show fallback content
            //   const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback');
            //   if (fallback) {
            //     fallback.classList.remove('hidden');
            //   }
            // }}
            // onLoad={() => {
            //   console.log('Image loaded successfully:', getImageUrl(item.images[0]));
            // }}
          />
        ) : null}

        {/* Fallback content when image fails to load */}
        <div className="image-fallback hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="text-center">
            <Laptop className="w-16 h-16 text-primary/40 mx-auto mb-2" />
            <p className="text-sm text-primary/60">{item.deviceType || 'Device'}</p>
            <p className="text-xs text-primary/40">Image unavailable</p>
          </div>
        </div>

        {/* Default content when no images */}
        {(!item.devicePhotos || item.devicePhotos.length === 0) && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <div className="text-center">
              <Laptop className="w-16 h-16 text-primary/40 mx-auto mb-2" />
              <p className="text-sm text-primary/60">{item.deviceType || 'Device'}</p>
              <p className="text-xs text-primary/40">No image available</p>
            </div>
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
          <div className="flex items-center text-sm text-primery">
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

        {/* Request button is now only shown on detailed view */}
        {/* Users must click "Read More" to see the request button */}

        {/* Read More Button */}
        <Link to={`/devices/${item._id}`}>
          <Button className="w-full mt-3">
            <Eye className="w-4 h-4 mr-2" />
            Read More
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default DonationCard;
