import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, MapPin, Laptop, Smartphone, Tablet, Gift, Camera, Building2, User, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const DonatePage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [donorType, setDonorType] = useState<"individual" | "organization" | null>(null);
  const [deviceWorking, setDeviceWorking] = useState<boolean | null>(null);
  const [wantsSelfDonate, setWantsSelfDonate] = useState<boolean | null>(null);
  
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    contact: "",
    about: "",
    profession: "",
    socialLinks: {
      linkedin: "",
      instagram: "",
      facebook: ""
    },
    // Organization specific
    organizationName: "",
    // Individual specific with document
    document: "",
    // Pickup details
    pickupTiming: "",
    address: ""
  });
  
  const [deviceInfo, setDeviceInfo] = useState({
    quantity: "1",
    deviceName: "",
    deviceType: "",
    condition: "",
    canBeUsed: "",
    notice: "",
    description: "",
    remarks: "",
    isOrganizationDonation: false,
    devicePhotos: [] // New field for device photos
  });

  // Check authentication on component mount
  useEffect(() => {
    if (!user) {
      navigate('/donor-login', { state: { from: { pathname: '/donate' } } });
    }
  }, [user, navigate]);

  const handlePersonalInfoChange = (field: string, value: string) => {
    if (field.startsWith('socialLinks.')) {
      const socialField = field.split('.')[1];
      setPersonalInfo(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value
        }
      }));
    } else {
      setPersonalInfo(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleDeviceInfoChange = (field: string, value: string | boolean) => {
    setDeviceInfo(prev => ({ ...prev, [field]: value }));
  };

  // Handle device photo upload
  const handleDevicePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // For now, we'll just store file names
      // In a real app, you'd upload these to a cloud service
      const photoFiles = Array.from(files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));
      setDeviceInfo(prev => ({ ...prev, devicePhotos: photoFiles }));
    }
  };

  const handleStepNavigation = (step: number) => {
    setCurrentStep(step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again to submit your donation.",
          variant: "destructive",
        });
        navigate('/donor-login');
        return;
      }

      // Prepare device data for backend
      const deviceData = {
        title: deviceInfo.deviceName,
        description: deviceInfo.description,
        deviceType: deviceInfo.deviceType,
        condition: deviceInfo.condition,
        location: {
          city: personalInfo.address.split(',')[0]?.trim() || '',
          state: personalInfo.address.split(',')[1]?.trim() || '',
          country: 'India' // Default to India
        },
        contactInfo: {
          phone: personalInfo.contact || '',
          email: personalInfo.email || ''
        },
        images: [], // Will be implemented later
        devicePhotos: deviceInfo.devicePhotos.map(photo => ({
          url: `placeholder-${photo.name}`, // In real app, this would be the uploaded URL
          caption: photo.name
        })),
        isOrganizationDonation: personalInfo.organizationName ? true : false
      };

      const response = await fetch('http://localhost:5000/api/device-donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deviceData)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Device Listed Successfully!",
          description: "Your device donation has been submitted and is pending admin approval. Thank you for your contribution!",
        });

        // Reset form
        setCurrentStep(1);
        setDonorType(null);
        setDeviceWorking(null);
        setWantsSelfDonate(null);
        setPersonalInfo({
          name: "",
          email: "",
          contact: "",
          about: "",
          profession: "",
          socialLinks: {
            linkedin: "",
            instagram: "",
            facebook: ""
          },
          organizationName: "",
          document: "",
          pickupTiming: "",
          address: ""
        });
        setDeviceInfo({
          quantity: "1",
          deviceName: "",
          deviceType: "",
          condition: "",
          canBeUsed: "",
          notice: "",
          description: "",
          remarks: "",
          isOrganizationDonation: false,
          devicePhotos: []
        });

        // Navigate to donor dashboard
        navigate('/donor-dashboard');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit donation');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit your donation. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-hero-bg flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please login to continue with your donation.</p>
            <Button onClick={() => navigate('/donor-login')} className="btn-hero">
              Go to Donor Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 animate-fade-in">
      <div className="flex items-center space-x-4">
        {[1, 2].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 hover-scale ${
              currentStep >= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 2 && (
              <div className={`w-12 h-0.5 transition-all duration-500 ${currentStep > step ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <Card className="donation-card animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold animate-fade-in">Welcome! Select Your Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center mb-6 animate-fade-in">
          <h3 className="text-lg font-medium mb-2">I am a:</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in ${
              donorType === 'individual' ? 'border-primary bg-primary/5 scale-105 shadow-lg' : 'border-gray-200'
            }`}
            onClick={() => setDonorType('individual')}
            style={{ animationDelay: '0.1s' }}
          >
            <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-primary transition-transform duration-300 hover:scale-110" />
              <h4 className="text-xl font-semibold mb-2">Individual</h4>
              <p className="text-gray-600">Personal device donation</p>
            </div>
          </div>
          
          <div 
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in ${
              donorType === 'organization' ? 'border-primary bg-primary/5 scale-105 shadow-lg' : 'border-gray-200'
            }`}
            onClick={() => setDonorType('organization')}
            style={{ animationDelay: '0.2s' }}
          >
            <div className="text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-primary transition-transform duration-300 hover:scale-110" />
              <h4 className="text-xl font-semibold mb-2">Organization</h4>
              <p className="text-gray-600">Organizational bulk donation</p>
            </div>
          </div>
        </div>
        
        {donorType && (
          <div className="flex justify-end pt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button 
              onClick={() => handleStepNavigation(2)}
              className="btn-hero hover-scale"
            >
              Add Device
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );


  const renderStep2 = () => {
    if (donorType === 'individual') {
      return renderIndividualDeviceFlow();
    } else {
      return renderOrganizationDeviceFlow();
    }
  };

  const renderIndividualDeviceFlow = () => (
    <Card className="donation-card animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold animate-fade-in">Device Survey</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {deviceWorking === null && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-medium">Is your device working?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant={deviceWorking === true ? "default" : "outline"}
                onClick={() => setDeviceWorking(true)}
                className="h-20 hover-scale transition-all duration-300"
              >
                Yes, it's working
              </Button>
              <Button
                variant={deviceWorking === false ? "default" : "outline"}
                onClick={() => setDeviceWorking(false)}
                className="h-20 hover-scale transition-all duration-300"
              >
                No, it's not working
              </Button>
            </div>
          </div>
        )}
        
        {deviceWorking === false && wantsSelfDonate === null && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-medium">Would you like to donate your device yourself?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant={wantsSelfDonate === true ? "default" : "outline"}
                onClick={() => setWantsSelfDonate(true)}
                className="h-20 hover-scale transition-all duration-300"
              >
                Yes, I'll donate myself
              </Button>
              <Button
                variant={wantsSelfDonate === false ? "default" : "outline"}
                onClick={() => setWantsSelfDonate(false)}
                className="h-20 hover-scale transition-all duration-300"
              >
                No, schedule pickup
              </Button>
            </div>
          </div>
        )}
        
        {((deviceWorking === true) || (deviceWorking === false && wantsSelfDonate === true)) && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-medium">Device Listing Details</h3>
            {renderDeviceForm()}
          </div>
        )}
        
        {deviceWorking === false && wantsSelfDonate === false && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-medium">Schedule for Yantra Daan</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>When do you want us to pick up the device?</Label>
                <Select value={personalInfo.pickupTiming} onValueChange={(value) => handlePersonalInfoChange("pickupTiming", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pickup timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-day">1 Day</SelectItem>
                    <SelectItem value="3-days">3 Days</SelectItem>
                    <SelectItem value="7-days">7 Days</SelectItem>
                    <SelectItem value="15-days">15 Days</SelectItem>
                    <SelectItem value="asap">ASAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Pickup Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete pickup address"
                  value={personalInfo.address}
                  onChange={(e) => handlePersonalInfoChange("address", e.target.value)}
                  rows={3}
                  required
                />
              </div>
              
              <Button onClick={handleSubmit} className="w-full btn-hero hover-scale">
                Schedule Pickup
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex justify-between pt-4 animate-fade-in">
          <Button 
            variant="outline"
            onClick={() => handleStepNavigation(1)}
            className="hover-scale"
          >
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderOrganizationDeviceFlow = () => (
    <Card className="donation-card animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold animate-fade-in">Device Listing Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 animate-fade-in">
          <Label>Select Quantity</Label>
          <Select value={deviceInfo.quantity} onValueChange={(value) => handleDeviceInfoChange("quantity", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select quantity" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(10)].map((_, i) => (
                <SelectItem key={i} value={String(i)}>{i} devices</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {renderDeviceForm()}
        
        <div className="flex justify-between pt-4 animate-fade-in">
          <Button 
            variant="outline"
            onClick={() => handleStepNavigation(1)}
            className="hover-scale"
          >
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderDeviceForm = () => (
    <div className="space-y-6">
      <div className="space-y-2 animate-fade-in">
        <Label htmlFor="deviceName">Device Name/Title *</Label>
        <Input
          id="deviceName"
          placeholder="e.g., MacBook Pro 2021, Dell XPS 13"
          value={deviceInfo.deviceName}
          onChange={(e) => handleDeviceInfoChange("deviceName", e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label>Device Type *</Label>
        <Select value={deviceInfo.deviceType} onValueChange={(value) => handleDeviceInfoChange("deviceType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select device type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="laptop">Laptop</SelectItem>
            <SelectItem value="desktop">Desktop</SelectItem>
            <SelectItem value="tablet">Tablet</SelectItem>
            <SelectItem value="smartphone">Smartphone</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Device Condition *</Label>
          <Select value={deviceInfo.condition} onValueChange={(value) => handleDeviceInfoChange("condition", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
              <SelectItem value="old">Old</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="used">Used</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Can it be used? *</Label>
          <Select value={deviceInfo.canBeUsed} onValueChange={(value) => handleDeviceInfoChange("canBeUsed", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select usability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="maybe">Maybe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Notice Period *</Label>
        <Select value={deviceInfo.notice} onValueChange={(value) => handleDeviceInfoChange("notice", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select notice period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3-days">3 Day Notice</SelectItem>
            <SelectItem value="1-week">One Week Notice</SelectItem>
            <SelectItem value="instantly">Instantly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Basic Description About the Device *</Label>
        <Textarea
          id="description"
          placeholder="Describe the device's specifications, condition, and any important details..."
          value={deviceInfo.description}
          onChange={(e) => handleDeviceInfoChange("description", e.target.value)}
          rows={4}
          maxLength={500}
          required
        />
        <div className="text-xs text-gray-500 text-right">
          {deviceInfo.description.length}/500 characters
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="remarks">Any Remarks for requester</Label>
        <Textarea
          id="remarks"
          placeholder="Special instructions or notes for the requester..."
          value={deviceInfo.remarks}
          onChange={(e) => handleDeviceInfoChange("remarks", e.target.value)}
          rows={3}
        />
      </div>
      
      {/* Device Photos Upload */}
      <div className="space-y-2">
        <Label htmlFor="devicePhotos">Device Photos (Optional)</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="devicePhotos" className="cursor-pointer">
              <span className="text-sm font-medium text-primary hover:text-primary/80">
                Click to upload photos
              </span>
              <span className="text-xs text-gray-500 block mt-1">
                or drag and drop
              </span>
            </label>
            <input
              id="devicePhotos"
              type="file"
              multiple
              accept="image/*"
              onChange={handleDevicePhotoUpload}
              className="hidden"
            />
          </div>
          {deviceInfo.devicePhotos.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {deviceInfo.devicePhotos.length} photo(s) selected
              </p>
              <div className="mt-2 space-y-1">
                {deviceInfo.devicePhotos.map((photo, index) => (
                  <div key={index} className="text-xs text-gray-500">
                    {photo.name} ({(photo.size / 1024).toFixed(1)} KB)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Upload clear photos of your device to help requesters make informed decisions
        </p>
      </div>
      
      <Button onClick={handleSubmit} className="w-full btn-hero hover-scale">
        Submit Device Donation
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-hero-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Device Donor - <span className="gradient-text">I have a device to donate!</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your unused technology with someone who needs it. Every donation makes a difference in someone's life.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {renderStepIndicator()}
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
        </div>
      </div>
    </div>
  );
};

export default DonatePage;