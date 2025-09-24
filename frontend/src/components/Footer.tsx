import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, LogOut, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LogoSVG } from "@/components/ui/logoSVG";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user, isAdmin, logout } = useAuth();

  // const getAdminLink = () => {
  //   if (!user) {
  //     return "/admin-login";
  //   }
  //   if (isAdmin()) {
  //     return "/admin";
  //   }
  //   return "/admin-login";
  // };

  const getAdminLinkText = () => {
    if (!user) {
      return "Admin Login";
    }
    if (isAdmin()) {
      return "Admin Panel";
    }
    return "Admin Login";
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white relative overflow-hidden transition-colors duration-300">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-secondary rounded-full blur-2xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Enhanced Logo and Description */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <LogoSVG></LogoSVG>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              <div>
                <span className="text-2xl font-bold gradient-text">Yantra Daan</span>
                <p className="text-sm text-gray-300 -mt-1">Foundation</p>
              </div>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
              Bridging the digital divide by connecting generous donors with students and communities in need of technology. Together, we're building a more connected future.
            </p>
            
            {/* Trust Indicators */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Heart className="w-4 h-4 text-primary" />
                <span>Registered NGO since 2019</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Users className="w-4 h-4 text-accent" />
                <span>1000+ Lives Impacted</span>
              </div>
            </div>
            
            {/* Enhanced Social Links */}
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/Yantradaan" 
                 className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/yantradaan/" 
                 className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/yantradaan" 
                 className="w-10 h-10 bg-gray-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Enhanced Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 relative">
              Quick Links
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/donations" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Browse Donations
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-gray-300 hover:text-primary hover:translate-x-1 transition-all duration-300 text-sm flex items-center group font-medium">
                  <span className="w-1 h-1 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Donate Now
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/admin-login" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm flex items-center group">
                  <span className="w-1 h-1 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {getAdminLinkText()}
                </Link>
              </li>
            </ul>
          </div>

          {/* Enhanced Programs */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 relative">
              Our Impact
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-accent to-secondary"></div>
            </h3>
            <ul className="space-y-3">
              <li className="text-gray-300 text-sm flex items-center group">
                <div className="w-2 h-2 bg-primary rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                Device Donation Drive
              </li>
              <li className="text-gray-300 text-sm flex items-center group">
                <div className="w-2 h-2 bg-accent rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                Student Tech Support
              </li>
              <li className="text-gray-300 text-sm flex items-center group">
                <div className="w-2 h-2 bg-secondary rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                Community Learning Centers
              </li>
              <li className="text-gray-300 text-sm flex items-center group">
                <div className="w-2 h-2 bg-primary rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                Corporate Partnerships
              </li>
              <li className="text-gray-300 text-sm flex items-center group">
                <div className="w-2 h-2 bg-accent rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                Digital Literacy Training
              </li>
            </ul>
            
            {/* Impact Numbers */}
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
              <h4 className="text-sm font-semibold text-white mb-2">Our Reach</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center">
                  <div className="text-primary font-bold text-lg">1000+</div>
                  <div className="text-gray-400">Devices Donated</div>
                </div>
                <div className="text-center">
                  <div className="text-accent font-bold text-lg">50+</div>
                  <div className="text-gray-400">Cities Reached</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 relative">
              Get In Touch
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-secondary to-primary"></div>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <a href="mailto:hello@yantradaan.org" className="text-gray-300 hover:text-white transition-colors text-sm">
                    hello@yantradaan.org
                  </a>
                  <p className="text-xs text-gray-500">Email us anytime</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-r from-accent to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <a href="tel:+918700283813" className="text-gray-300 hover:text-white transition-colors text-sm">
                    +91 8700283813
                  </a>
                  <p className="text-xs text-gray-500">Call us for support</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-r from-secondary to-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform mt-1">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-gray-300 text-sm block leading-relaxed">
                    Okhla Industrial Area,<br />
                    Phase-2, New Delhi - 110020<br />
                    India
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Visit our office</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-center md:text-left">
              <div className="text-gray-300 text-sm mb-2">
                © {currentYear} Yantra Daan Foundation. All rights reserved.
              </div>
              <div className="text-xs text-gray-500">
                Registered under Section 8 of the Companies Act, 2013
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm hover:underline">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-gray-400 hover:text-white transition-colors text-sm hover:underline">
                Terms of Service
              </Link>
              <Link to="/cookie-policy" className="text-gray-400 hover:text-white transition-colors text-sm hover:underline">
                Cookie Policy
              </Link>
              <Link to="/transparency-report" className="text-gray-400 hover:text-white transition-colors text-sm hover:underline">
                Transparency Report
              </Link>
            </div>
          </div>
          
          {/* Trust Badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-4 py-2 border border-primary/20">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-xs text-gray-300">Trusted by 1000+ donors and recipients</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
