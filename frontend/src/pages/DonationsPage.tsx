import { useState, useEffect } from "react";
import DonationCard from "@/components/DonationCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NoDataFound from "@/components/NoDataFound";
import { config } from "@/config/env";

const DonationsPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${config.apiUrl}${config.endpoints.donations}/approved`);
        
        if (response.ok) {
          const data = await response.json();
          setDonations(data.devices || []);
        } else {
          throw new Error('Failed to fetch donations');
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
        toast({
          title: "Error",
          description: "Failed to load donations. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const filteredDonations = donations.filter((item: any) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.deviceType === selectedCategory;
    const matchesCondition = selectedCondition === "all" || item.condition === selectedCondition;
    
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const handleRequest = (itemId: string) => {
    // Note: This would integrate with authentication and database
    toast({
      title: "Request Submitted!",
      description: "The donor will be notified of your request. Please check your email for updates.",
    });
  };

  return (
    <div className="min-h-screen bg-hero-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Available <span className="gradient-text">Donations</span>
          </h1>
          <p className="text-xl text-gray-600">
            Browse technology items donated by our generous community
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search items..."
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
                <SelectItem value="Accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>

            {/* Condition Filter */}
            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Like New">Like New</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Button variant="outline" className="w-full">
              <MapPin className="w-4 h-4 mr-2" />
              Near Me
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredDonations.length} of {donations.length} items
          </p>
        </div>

        {/* Donations Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="text-gray-600 mt-4">Loading donations...</p>
          </div>
        ) : filteredDonations.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDonations.map((item) => (
              <DonationCard 
                key={item.id} 
                item={item}
                onRequest={handleRequest}
              />
            ))}
          </div>
        ) : (
          <NoDataFound
            title="No items found"
            description="Try adjusting your search filters to find more items."
            imageType="devices"
            variant="full"
          />
        )}

        {/* Note about Supabase */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Want to request an item?</h3>
          <p className="text-gray-600 mb-4">
            To submit donation requests and connect with donors, you'll need to integrate with Supabase for authentication and database functionality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonationsPage;