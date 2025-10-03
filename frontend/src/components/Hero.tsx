import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Gift, Users, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-hero-bg to-request-highlight overflow-hidden">
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
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Make Digital 
                <span className="gradient-text"> Access To Every Students ashwani</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
              Imagine that your secondhand device can be a learning opportunity in the community
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Gift className="w-8 h-8 text-primary" />
                </div>
                <div className="text-2xl font-bold text-gray-900">1,247</div>
                <div className="text-sm text-gray-600">Items Donated</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <div className="text-2xl font-bold text-gray-900">856</div>
                <div className="text-sm text-gray-600">Lives Impacted</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-8 h-8 text-secondary" />
                </div>
                <div className="text-2xl font-bold text-gray-900">432</div>
                <div className="text-sm text-gray-600">Active Donors</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/donate">
                <Button className="btn-hero group">
                  Donate Items
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/requests">
                <Button variant="outline" className="btn-outline-hero">
                  Find Items
                </Button>
              </Link>
            </div>

    
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
                  <div className="text-xs text-gray-500">MacBook Pro donated</div>
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