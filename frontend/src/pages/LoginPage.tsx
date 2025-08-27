import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading,user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pre-fill email if coming from email check page
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that user role is selected
    if (!userRole) {
      toast({
        title: "Role Required",
        description: "Please select whether you are a Requester or Donor",
        variant: "destructive",
      });
      return;
    }
    
    const result = await login(email, password, userRole);
    console.log("27", result);
    
    if (result.success) {
      // Check if the user's actual role matches the selected role
      if (result.user && result.user.userRole === userRole) {
        toast({
          title: "Login successful!",
          description: `Welcome back, ${user.name}!`,
        });
        navigate("/profile", { replace: true }); // Go to profile dashboard after login
      } else {
        // Role mismatch - show error
        const actualRole = result.user?.userRole || 'unknown';
        toast({
          title: "Role Mismatch",
          description: `You selected ${userRole} but your account is registered as ${actualRole}. Please select the correct role.`,
          variant: "destructive",
        });
        // Clear the form and let user try again
        setUserRole("");
      }
    } else {
        toast({
          title: "Login failed",
          description: result.error || "Invalid credentials. Please check your email and password.",
          variant: "destructive",
        });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Yantra Daan </span>
          </Link>
        </div>

        {/* Login/Signup Form */}
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">


              {/* Login Form */}
              <div className="space-y-4">
                {/* User Role Selection */}
                <div className="space-y-2">
                  <Label>Login as</Label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="userRole"
                        value="requester"
                        checked={userRole === "requester"}
                        onChange={(e) => setUserRole(e.target.value)}
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span className="text-sm font-medium">Requester</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="userRole"
                        value="donor"
                        checked={userRole === "donor"}
                        onChange={(e) => setUserRole(e.target.value)}
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span className="text-sm font-medium">Donor</span>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select the role that matches your account registration
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full btn-hero" disabled={isLoading}>
                {isLoading ? "Processing..." : "Sign In"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-primary hover:underline"
                >
                  Sign up here
                </Link>
              </p>
              

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
