import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import DonationCard from "@/components/DonationCard";
import Gallery from "@/components/Gallery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Users, Heart, ArrowRight, MapPin, Laptop, Smartphone, Tablet } from "lucide-react";
import { Link } from "react-router-dom";
import NoDataFound from "@/components/NoDataFound";
import { config } from "@/config/env";

const Home = () => {
  const [approvedDevices, setApprovedDevices] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecentDevices = async () => {
      try {
        const response = await fetch(`${config.apiUrl}${config.endpoints.devices}/approved?page=1&limit=6`);
        if (!response.ok) throw new Error('Failed to load featured donations');
        const data = await response.json();
        setApprovedDevices(data.devices || []);
      } catch (e) {
        setApprovedDevices([]);
      }
    };
    fetchRecentDevices();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How <span className="gradient-text">Yantra Daan</span> Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform makes it simple to donate and receive technology items, 
              creating meaningful connections in your community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Donate */}
            <Card className="text-center group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold">1. Donate Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  List your unused technology items with photos and descriptions. 
                  Set your location for local pickup.
                </p>
                <Link to="/donate">
                  <Button variant="outline" className="group">
                    Start Donating
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Connect */}
            <Card className="text-center group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold">2. Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Browse available items and connect with donors in your area. 
                  Send requests for items you need.
                </p>
                <Link to="/requests">
                  <Button variant="outline" className="group">
                    Find Items
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Impact */}
            <Card className="text-center group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold">3. Create Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Complete the exchange and help bridge the digital divide. 
                  Track your impact through your dashboard.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="group">
                    Join Community
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Laptops", icon: Laptop, count: 245, color: "from-primary to-primary-glow" },
              { name: "Smartphones", icon: Smartphone, count: 189, color: "from-accent to-blue-500" },
              { name: "Tablets", icon: Tablet, count: 167, color: "from-secondary to-green-500" },
              { name: "Accessories", icon: Gift, count: 312, color: "from-purple-500 to-pink-500" },
            ].map((category) => (
              <Card key={category.name} className="text-center hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.count} available</p>
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

      {/* Gallery Section */}
      <Gallery />
    </div>
  );
};

export default Home;
