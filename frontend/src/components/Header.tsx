import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogoSVG } from "@/components/ui/logoSVG";
import { Heart, Menu, X, User, Gift, Users, LogOut, BookOpen, UserCheck, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { 
    user, 
    logout, 
    isAdmin, 
    isDonor, 
    isRequester,
    getDisplayName,
    isTokenValid
  } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: "Home", path: "/", icon: Heart },
    { name: "Donations", path: "/donations", icon: Gift },
    { name: "About", path: "/about", icon: Users },
    { name: "Team", path: "/team", icon: Users },
    { name: "Contact", path: "/contact", icon: Users },
  ];

  // Admin navigation (only show for admin users)
  const adminNavigation = [
    { name: "Admin", path: "/admin", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <LogoSVG></LogoSVG>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold gradient-text">Yantra Daan</h1>
              <p className="text-xs text-gray-500 -mt-1">Bridging Digital Divide</p>
            </div>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 bg-gray-50/50 rounded-full px-2 py-1">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 hover:bg-white hover:shadow-md ${
                  isActive(item.path) 
                    ? "bg-white text-primary shadow-md" 
                    : "text-gray-600 hover:text-primary"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Enhanced Admin Navigation */}
            {isAdmin() && adminNavigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 hover:bg-white hover:shadow-md ${
                  isActive(item.path) 
                    ? "bg-white text-primary shadow-md" 
                    : "text-gray-600 hover:text-primary"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Enhanced Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user && isTokenValid ? (
              <>
                {/* Enhanced Profile Button */}
                {!isAdmin() && (
                  <Link to={`/profile`}>
                    <Button variant="outline" size="sm" className="border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300">
                      <User className="w-4 h-4 mr-2" />
                      {getDisplayName()}
                    </Button>
                  </Link>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all duration-300 rounded-full px-3 py-2"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
                
                {/* Show role-specific buttons */}
                {!isAdmin() && (
                  <>
                    {/* Enhanced Donate button */}
                    {isDonor() && (
                      <Link to="/donate">
                        <Button size="sm" className="btn-hero shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                          <Gift className="w-4 h-4 mr-2" />
                          Donate Device
                        </Button>
                      </Link>
                    )}
                    
                    {/* Enhanced Browse button */}
                    {isRequester() && (
                      <Link to="/donations">
                        <Button size="sm" className="btn-hero shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                          <Users className="w-4 h-4 mr-2" />
                          Browse Devices
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300">
                    Login
                  </Button>
                </Link>
                <Link to="/donate">
                  <Button size="sm" className="btn-hero shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                    <span className="relative z-10">Donate Now</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Admin only navigation for mobile */}
              {isAdmin() && adminNavigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
              
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                {user && isTokenValid ? (
                  <>
                    {/* Profile Button for Mobile */}
                    {!isAdmin() && (
                      <Link to={`/profile`} onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full">
                          <User className="w-4 h-4 mr-2" />
                          {getDisplayName()}
                        </Button>
                      </Link>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors p-0 h-auto text-sm w-full"

                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Logout
                    </Button>
                    
                    {/* Show role-specific buttons for mobile */}
                    {!isAdmin() && (
                      <>
                        {/* Donate button for donors */}
                        {isDonor() && (
                          <Link to="/donate" onClick={() => setIsMenuOpen(false)}>
                            <Button className="w-full btn-hero">
                              <Gift className="w-4 h-4 mr-2" />
                              Donate Device
                            </Button>
                          </Link>
                        )}
                        
                        {/* Request button for requesters */}
                        {isRequester() && (
                          <Link to="/donations" onClick={() => setIsMenuOpen(false)}>
                            <Button className="w-full btn-hero">
                              <Users className="w-4 h-4 mr-2" />
                              Browse Devices
                            </Button>
                          </Link>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/donate" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full btn-hero">
                        Donate Now
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
