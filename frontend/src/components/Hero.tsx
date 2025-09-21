import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Gift, Users, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useState, useEffect } from "react";
import { config } from "@/config/env";

const Hero = () => {
  const [devices, setDevices] = useState([]);
  const [stats, setStats] = useState({
    itemsDonated: 0,
    livesImpacted: 0,
    activeDonors: 0
  });

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const responseDevice = await fetch(`${config.apiUrl}${config.endpoints.devices}/approved`);

        if (responseDevice.ok) {
          const dataDevice = await responseDevice.json();
          setDevices(dataDevice.devices || []); 
          console.log("Fetched devices:", dataDevice.devices);
        } 
      } catch (error) {
        console.error("Network error:", error);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/admin/public-stats`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            itemsDonated: data.itemsDonated,
            livesImpacted: data.livesImpacted,
            activeDonors: data.activeDonors
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchDevices();
    fetchStats();
  }, []);

  const getLatestDevice = devices.map(item => item.title)[0];
  console.log("getLatestDevice ", getLatestDevice);
  
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-hero-bg to-request-highlight dark:from-gray-900 dark:to-gray-800 overflow-hidden transition-colors duration-300">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-accent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-secondary rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 fade-in">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Making Impact Since 2019</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Make Digital 
                <span className="gradient-text block">Access Universal</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                Transform lives by donating your unused devices. Every laptop, smartphone, or tablet can become a gateway to education and opportunity.
              </p>
            </div>

            {/* Enhanced Stats with Animations */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.itemsDonated + 100}+</div>
                <div className="text-sm text-gray-600 font-medium">Items Donated</div>
                <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary-glow rounded-full mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-accent to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.livesImpacted + 100}+</div>
                <div className="text-sm text-gray-600 font-medium">Lives Impacted</div>
                <div className="w-12 h-1 bg-gradient-to-r from-accent to-blue-500 rounded-full mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-secondary to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.activeDonors + 100  }+</div>
                <div className="text-sm text-gray-600 font-medium">Active Donors</div>
                <div className="w-12 h-1 bg-gradient-to-r from-secondary to-orange-500 rounded-full mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            {/* <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/donate">
                <Button className="btn-hero group relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    Donate Items
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </Button>
              </Link>
              <Link to="/requests">
                <Button variant="outline" className="btn-outline-hero group relative">
                  <span className="flex items-center">
                    Find Items
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
            </div> */}
          </div>

          {/* Hero Image */}
          <div className="relative slide-up">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="People sharing technology and helping each other"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold">New Donation</div>
                  <div className="text-xs text-gray-500">{getLatestDevice || "Laptop"}</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Request Fulfilled</div>
                  <div className="text-xs text-gray-500">Student got laptop</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;