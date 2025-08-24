import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Lock, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid Reset Link",
        description: "Password reset link is invalid or expired",
        variant: "destructive",
      });
      navigate('/forgot-password');
    }
  }, [token, navigate, toast]);

  const validateForm = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      newErrors.password = "Password must contain uppercase, lowercase, number, and special character";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token,
          password: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Success!",
          description: "Your password has been reset successfully",
        });
      } else {
        throw new Error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to reset password',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">TechShare NGO</span>
            </Link>
          </div>

          <Card className="glass-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Password Reset Successfully!</CardTitle>
              <CardDescription>
                Your password has been updated. You can now sign in with your new password.
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <Link to="/login">
                <Button className="w-full btn-hero">
                  Sign In Now
                </Button>
              </Link>
              
              <Link to="/">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!token) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">TechShare NGO</span>
          </Link>
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? 'border-red-500' : ''}
                  required 
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                  required 
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" className="w-full btn-hero" disabled={isSubmitting}>
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>

              <div className="text-center space-y-3">
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
