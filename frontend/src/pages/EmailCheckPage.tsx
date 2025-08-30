import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config/env";

const EmailCheckPage = () => {
  const [email, setEmail] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    exists: boolean;
    message: string;
    redirectTo: string;
  } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to check.",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    setCheckResult(null);

    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.auth}/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();

      if (response.ok) {
        setCheckResult(result);
        
        if (result.exists) {
          toast({
            title: "Email Already Registered",
            description: result.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Email Available",
            description: result.message,
          });
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to check email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleProceed = () => {
    if (checkResult?.redirectTo === 'login') {
      navigate('/login', { state: { email } });
      return;
    }
    
    if (checkResult?.redirectTo === 'register') {
      navigate('/register', { state: { email } });
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">YantraDaan</span>
          </Link>
        </div>

        {/* Email Check Form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Mail className="w-6 h-6" />
              Check Email Availability
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your email to check if you already have an account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailCheck} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isChecking}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isChecking}>
                {isChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Check Email
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Result Display */}
            {checkResult && (
              <div className="mt-6 p-4 rounded-lg border">
                <div className="flex items-start gap-3">
                  {checkResult.exists ? (
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${checkResult.exists ? 'text-destructive' : 'text-green-600'}`}>
                      {checkResult.message}
                    </p>
                    
                    <div className="mt-3">
                      <Button
                        onClick={handleProceed}
                        className="w-full"
                        variant={checkResult.exists ? "destructive" : "default"}
                      >
                        {checkResult.redirectTo === 'login' ? 'Go to Login' : 'Create Account'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Alternative Actions */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Already know your status?
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailCheckPage;
