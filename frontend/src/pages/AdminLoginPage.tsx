import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Mail, Lock, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config/env";


const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [createAdminData, setCreateAdminData] = useState({
    name: "",
    email: "",
    password: "",
    contact: ""
  });
  const { adminLogin, isLoading, user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Attempting admin login with:', { email, password: password ? '***' : 'empty' });
      
      // Attempt admin login using the adminLogin function
      const result = await adminLogin(email, password);
      console.log('Login result:', result);
      
      if (result.success) {
        // Check admin role from the login response
        if (result.user && result.user.userRole === 'admin') {
          toast({
            title: "Admin Login Successful!",
            description: "Welcome to the admin panel.",
          });
          navigate("/admin");
        } else {
          console.log('Admin role validation failed:', { user: result.user, userRole: result.user?.userRole });
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges. Please contact an administrator.",
            variant: "destructive",
          });
          // Logout the user since they don't have admin access
          logout();
        }
      } else {
        console.log('Login failed');
        toast({
          title: "Login failed",
          description: "Invalid admin credentials. Please check your email and password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAdmin(true);
    
    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.auth}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: createAdminData.name,
          email: createAdminData.email,
          password: createAdminData.password,
          userRole: 'admin',
          contact: createAdminData.contact,
          categoryType: 'individual',
          isOrganization: false,
          about: 'System Administrator',
          profession: 'Administrator',
          address: 'Admin Address'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create admin user');
      }
      
      const data = await response.json();
      
      toast({
        title: "Admin User Created!",
        description: `Admin user ${createAdminData.email} created successfully. You can now login.`,
      });
      
      // Clear the form
      setCreateAdminData({
        name: "",
        email: "",
        password: "",
        contact: ""
      });
      
      // Auto-fill login form with new admin credentials
      setEmail(createAdminData.email);
      setPassword(createAdminData.password);
      
    } catch (error) {
      toast({
        title: "Failed to create admin",
        description: error instanceof Error ? error.message : "An error occurred while creating admin user.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/10 via-background to-destructive/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-destructive to-destructive/80 rounded-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Admin Panel</span>
          </Link>
        </div>

        {/* Admin Login Form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="w-6 h-6" />
              Admin Login
            </CardTitle>
            <CardDescription>
              Access the admin panel to manage users, devices, and requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login to Admin Panel"}
              </Button>
            </form>

            {/* Help Section */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
              <p className="text-sm text-blue-700 mb-2">
                If you're getting "Invalid email or password" errors:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Ensure the backend server is running</li>
                <li>• Check if you have admin privileges</li>
                <li>• Contact the system administrator</li>
                <li>• Use the "Create Admin User" option below</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Create Admin User Form */}
        <Card className="glass-card border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-primary flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5" />
              Create New Admin
            </CardTitle>
            <CardDescription>
              Create a new admin user account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="createName">Full Name</Label>
                <Input 
                  id="createName" 
                  type="text" 
                  placeholder="Admin User" 
                  value={createAdminData.name}
                  onChange={(e) => setCreateAdminData(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="createEmail">Email</Label>
                <Input 
                  id="createEmail" 
                  type="email" 
                  placeholder="admin@example.com" 
                  value={createAdminData.email}
                  onChange={(e) => setCreateAdminData(prev => ({ ...prev, email: e.target.value }))}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="createPassword">Password</Label>
                <Input 
                  id="createPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  value={createAdminData.password}
                  onChange={(e) => setCreateAdminData(prev => ({ ...prev, password: e.target.value }))}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="createContact">Contact Number</Label>
                <Input 
                  id="createContact" 
                  type="tel" 
                  placeholder="1234567890" 
                  value={createAdminData.contact}
                  onChange={(e) => setCreateAdminData(prev => ({ ...prev, contact: e.target.value }))}
                  required 
                />
              </div>

              <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
                <strong>Role:</strong> Admin (Auto-selected)
                <br />
                <strong>Category:</strong> Individual
                <br />
                <strong>Organization:</strong> No
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90" 
                disabled={isCreatingAdmin}
              >
                {isCreatingAdmin ? "Creating Admin..." : "Create Admin User"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage;