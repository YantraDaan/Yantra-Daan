import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Home, Lock } from 'lucide-react';

const UnauthorizedPage = () => {
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </Link>
        </div>

        {/* Unauthorized Card */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-red-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Details */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                You tried to access:
              </p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded border">
                {from}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => window.history.back()} 
                variant="outline" 
                className="w-full h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <Link to="/">
                <Button className="w-full h-12 btn-hero">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please contact support or try logging in with a different account.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
