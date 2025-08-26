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
  const { login, isLoading, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Attempt admin login
      const result = await login(email, password, "admin");
      if (result.success) {
        // Check if the logged-in user is actually an admin
        if (user && user.userRole === 'admin') {
          toast({
            title: "Admin Login Successful!",
            description: "Welcome to the admin panel.",
          });
          navigate("/admin");
        } else {
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges. Please contact an administrator.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Invalid admin credentials. Please check your email and password.",
          variant: "destructive",
        });
      }
    } catch (error) {
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
        <Card className="glass-card border-destructive/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-destructive">Admin Access</CardTitle>
            <CardDescription>
              Restricted access for administrators only
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Login Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="admin@yantradaan.com" 
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
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required 
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-destructive hover:bg-destructive/90" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Admin Sign In"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <Link
                  to="/"
                  className="font-medium text-primary hover:underline"
                >
                  ← Back to Home
                </Link>
              </p>
            </form>
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