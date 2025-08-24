import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogoSVG } from "@/components/ui/logoSVG";
import { Heart, Menu, X, User, Gift, Users, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Check if user is actually authenticated (has valid token)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setIsAuthenticated(!!userData && !!userData.id);
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: "Home", path: "/", icon: Heart },
    { name: "Donations", path: "/donations", icon: Gift },
    { name: "About", path: "/about", icon: Users },
    { name: "Contact", path: "/contact", icon: Users },
    { name: "Admin", path: "/admin", icon: Users },
  ];



  // Admin navigation (only show for admin users)
  const adminNavigation = [
    { name: "Admin", path: "/admin", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
           <LogoSVG></LogoSVG>
            {/* <span className="text-xl font-bold gradient-text">YantraDaan</span> */}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.path) ? "text-primary" : "text-gray-600"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Admin only navigation */}
            {user?.email === 'admin@techshare.com' && adminNavigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.path) ? "text-primary" : "text-gray-600"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Auth Buttons - Show for non-admin users only */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Profile Button */}
                {user.userRole !== 'admin' && (
                  <Link to={`/profile?id=${user.id}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&role=${user.userRole}`}>
                    <Button variant="outline" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
                {/* Show Donate button only for non-admin users */}
                {user.userRole !== 'admin' && (
                  <Link to="/donate">
                    <Button size="sm" className="btn-hero">
                      Donate Now
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/donate">
                  <Button size="sm" className="btn-hero">
                    Donate Now
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
          <div className="md:hidden py-4 border-t border-gray-100">
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
              {user?.email === 'admin@techshare.com' && adminNavigation.map((item) => (
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
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-gray-100">
                {isAuthenticated && user ? (
                  <>
                    {/* Profile Button for Mobile */}
                    {user.userRole !== 'admin' && (
                      <Link to={`/profile?id=${user.id}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&role=${user.userRole}`} onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Button>
                      </Link>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                    {/* Show Donate button only for non-admin users */}
                    {user.userRole !== 'admin' && (
                      <Link to="/donate" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full btn-hero">
                          Donate Now
                        </Button>
                      </Link>
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
