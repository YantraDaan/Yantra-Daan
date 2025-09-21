import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import DonationCard from "@/components/DonationCard";
import TrustSection from "@/components/TrustSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Users, Heart, ArrowRight, Laptop, Smartphone, Tablet} from "lucide-react";
import { Link } from "react-router-dom";
import NoDataFound from "@/components/NoDataFound";
import { config } from "@/config/env";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const [approvedDevices, setApprovedDevices] = useState<any[]>([]);
  const [deviceTypeStats, setDeviceTypeStats] = useState<{[key: string]: number}>({
    laptop: 0,
    desktop: 0,
    smartphone: 0,
    tablet: 0,
    accessories: 0,
    other: 0
  });
  const [deviceRequestStates, setDeviceRequestStates] = useState<{[key: string]: {canRequest: boolean, reason: string, activeRequestCount: number}}>({});
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch recently approved devices (limit 6, first page)
    const fetchRecentDevices = async () => {
      try {
        const response = await fetch(`${config.apiUrl}${config.endpoints.devices}/approved?page=1&limit=6`);
        if (response.ok) {
          const data = await response.json();
          setApprovedDevices(data.devices || []);
          
          // Check request eligibility for each device if user is logged in
          if (user) {
            checkDeviceRequestEligibility(data.devices || []);
          }
        } else {
          throw new Error('Failed to load featured donations');
        }
       
      } catch (e) {
        setApprovedDevices([]);
      }
    };
    
    // Fetch device type statistics
    const fetchDeviceTypeStats = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/devices/admin/stats`);
        if (response.ok) {
          const data = await response.json();
          // Transform the data to match our expected format
          const stats: {[key: string]: number} = {
            laptop: 0,
            desktop: 0,
            smartphone: 0,
            tablet: 0,
            accessories: 0,
            other: 0
          };
          
          // Map the deviceTypeStats array to our stats object
          data.deviceTypeStats.forEach((item: { _id: string; count: number }) => {
            if (item._id in stats) {
              stats[item._id] = item.count;
            }
          });
          
          setDeviceTypeStats(stats);
        }
      } catch (e) {
        console.error("Error fetching device type stats:", e);
      }
    };

   // Run fetches when user changes (or component mounts)
  fetchRecentDevices();
  fetchDeviceTypeStats();
  }, [user]);

  const checkDeviceRequestEligibility = async (devices: any[]) => {
    if (!user) return;
    
    const requestStates: {[key: string]: {canRequest: boolean, reason: string, activeRequestCount: number}} = {};
    
    for (const device of devices) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${config.apiUrl}/api/requests/can-request/${device._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          requestStates[device._id] = {
            canRequest: data.canRequest,
            reason: data.reason || '',
            activeRequestCount: data.activeRequestCount || 0
          };
        }
      } catch (error) {
        console.error('Error checking request eligibility:', error);
        requestStates[device._id] = {
          canRequest: false,
          reason: 'Error checking eligibility',
          activeRequestCount: 0
        };
      }
    }
    
    setDeviceRequestStates(requestStates);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

          {/* Trust & Credibility Section */}
      <TrustSection />
  
      {/* Featured Donations */}
      <section className="py-20 bg-hero-bg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Donations</h2>
              <p className="text-xl text-gray-600">Discover amazing items shared by our community</p>
            </div>
            <Link to="/donations">
              <Button className="btn-hero">
                View All Donations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {approvedDevices.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {approvedDevices.map((item) => (
                <DonationCard 
                  key={item._id} 
                  item={{ ...item, isActive: item.status === 'approved' }}
                />
              ))}
            </div>
          ) : (
            <NoDataFound
              title="No featured donations yet"
              description="Be the first to donate and inspire others in your community!"
              imageType="devices"
              variant="full"
            />
          )}
        </div>
      </section>

    {/* Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Item Categories</h2>
            <p className="text-xl text-gray-600">Browse donations by category</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: "Laptops", icon: Laptop, count: deviceTypeStats.laptop, color: "from-green-500 to-green-600", bgColor: "from-green-500/10 to-green-600/10" },
              { name: "Desktop", icon: Laptop, count: deviceTypeStats.desktop, color: "from-green-500 to-green-600", bgColor: "from-green-500/10 to-green-600/10" },
              { name: "Smartphones", icon: Smartphone, count: deviceTypeStats.smartphone, color: "from-green-500 to-green-600", bgColor: "from-green-500/10 to-green-600/10" },
              { name: "Tablets", icon: Tablet, count: deviceTypeStats.tablet, color: "from-green-500 to-green-600", bgColor: "from-green-500/10 to-green-600/10" },
              { name: "Accessories", icon: Gift, count: deviceTypeStats.accessories, color: "from-green-500 to-green-600", bgColor: "from-green-500/10 to-green-600/10" },
              { name: "Other", icon: Gift, count: deviceTypeStats.other, color: "from-green-500 to-green-600", bgColor: "from-green-500/10 to-green-600/10" },
            ].map((category) => (
              <Card key={category.name} className={`text-center hover:shadow-xl transition-all duration-500 cursor-pointer group border-0 bg-gradient-to-br from-white ${category.bgColor} relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${category.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <CardContent className="p-6 relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-2xl`}>
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{category.count} available</p>
                  <div className={`w-8 h-1 bg-gradient-to-r ${category.color} rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of donors and recipients creating positive impact in their communities.
              Start donating or find the technology you need today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/donate">
                <Button size="lg" variant="secondary" className="text-primary font-semibold">
                  Donate Items
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg" variant="outline" className="border-white text-black hover:bg-white hover:text-primary">
                  Browse Donations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Scholarship Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-6 py-3 mb-6">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Scholarship Program</span>
            </div>
            <h2 className="text-4xl font-bold gradient-text mb-6">
              Scholarship Newsletter
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get scholarship opportunities, application guides, and success stories delivered to your inbox.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="donation-card hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image Section */}
                  <div className="relative">
                    <div className="aspect-[4/3] md:aspect-auto md:h-full">
                      <img
                        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                        alt="Students studying with scholarships"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8">
                    <div className="space-y-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center">
                        <Heart className="w-8 h-8 text-white" />
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          Access Scholarship Opportunities
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-6">
                          Stay updated with the latest scholarship opportunities and educational support programs.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-sm text-gray-700">Weekly scholarship updates</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                          <span className="text-sm text-gray-700">Application guidance & tips</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-secondary rounded-full"></div>
                          <span className="text-sm text-gray-700">Student success stories</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => window.open('https://letmespread.com/opportunities/', '_blank')} 
                        className="w-full btn-hero py-3"
                      >
                        Access Scholarship Portal
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
