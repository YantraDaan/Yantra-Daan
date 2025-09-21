/// <reference types="@types/google.maps" />

// Extend Window interface to include initAutocomplete
declare global {
  interface Window {
    initAutocomplete: () => void;
  }
}

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, ArrowLeft, ArrowRight, User, Building2, Upload, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, MapPin, Search, X, FileText, FileImage, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config/env";

interface PersonalInfo {
  name: string;
  email: string;
  contact: string;
  userRole: "donor" | "requester" | "";
  categoryType: "individual" | "organization" | "";
  isOrganization: boolean;
  about: string;
  profession: string;
  linkedIn: string;
  instagram: string;
  facebook: string;
  address: string;
  emailUpdates: boolean;
  document?: File;
}

const SignupPage = () => {
  const [step, setStep] = useState(0); // Start with email check step
  const [userRole, setUserRole] = useState<"donor" | "requester" | "">("");
  const [categoryType, setCategoryType] = useState<"individual" | "organization" | "">("");

  const [isOrganization, setIsOrganization] = useState(false);
  
  // Email check state
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailCheckResult, setEmailCheckResult] = useState<{
    exists: boolean;
    message: string;
    redirectTo: string;
  } | null>(null);
  
  // Add loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add state for document preview
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null);
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    email: "",
    contact: "",
    userRole: "",
    categoryType: "",
    isOrganization: false,
    about: "",
    profession: "",
    linkedIn: "",
    instagram: "",
    facebook: "",
    address: "",
    emailUpdates: true
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill email if coming from email check page
  useEffect(() => {
    if (location.state?.email) {
      setPersonalInfo(prev => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  // Auto-check email when email changes (with debounce)
  useEffect(() => {
    if (personalInfo.email && personalInfo.email.includes('@')) {
      const timer = setTimeout(() => {
        if (personalInfo.email.trim()) {
          // Create a mock event for the email check
          const mockEvent = { preventDefault: () => {} } as React.FormEvent;
          handleEmailCheck(mockEvent);
        }
      }, 1000); // Wait 1 second after user stops typing
      
      return () => clearTimeout(timer);
    }
  }, [personalInfo.email]);

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!personalInfo.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to check.",
        variant: "destructive",
      });
      return;
    }

    if (!personalInfo.email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingEmail(true);
    setEmailCheckResult(null);

    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.auth}/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: personalInfo.email.trim() }),
      });

      const result = await response.json();

      if (response.ok) {
        setEmailCheckResult(result);
        
        if (result.exists) {
          toast({
            title: "Email Already Registered",
            description: result.message,
            variant: "destructive",
          });
          // Auto-redirect to login after 2 seconds
          setTimeout(() => {
            handleGoToLogin();
          }, 2000);
        } else {
          toast({
            title: "Email Available",
            description: result.message,
          });
          // Auto-proceed to signup after 2 seconds
          setTimeout(() => {
            handleProceedWithSignup();
          }, 1000);
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
      setIsCheckingEmail(false);
    }
  };

  const handleProceedWithSignup = () => {
    if (emailCheckResult && !emailCheckResult.exists) {
      setStep(1); // Move to the first signup step
    }
  };

  const handleGoToLogin = () => {
    navigate('/login', { state: { email: personalInfo.email } });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPersonalInfo(prev => ({ ...prev, document: file }));
      
      // Generate preview for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocumentPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setDocumentPreviewUrl(null);
      }
    }
  };

  const validateStep = () => {
    switch (step) {
      case 0:
        return emailCheckResult && !emailCheckResult.exists; 
      case 1:
        return personalInfo.name && personalInfo.email;
      case 2:
        return personalInfo.userRole !== "";
      case 3:
        return personalInfo.categoryType !== "";
      case 4:
        return personalInfo.contact && personalInfo.about && personalInfo.address && personalInfo.document;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before continuing.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set submitting state to true
    setIsSubmitting(true);

    try {
      // Prepare document information
      let documentInfo = null;
      if (personalInfo.document) {
        documentInfo = {
          name: personalInfo.document.name,
          type: personalInfo.document.type,
          size: personalInfo.document.size
        };
      }

      const userData = {
        ...personalInfo,
        document: documentInfo
      };

      const response = await fetch(`${config.apiUrl}${config.endpoints.auth}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      const data = await response.json();

      if (data) {
        if (data.passwordSetupRequired) {
          toast({
            title: "Registration Successful!",
            description: "Your account has been created. Please check your email for password setup instructions after admin verification.",
          });
        } else {
          toast({
            title: "Registration Successful!",
            description: `Welcome to Yantra Daan ${personalInfo.name}!`,
          });
        }
        navigate("/login");
      } else {
        alert(`Error: Registration failed`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error processing your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset submitting state
      setIsSubmitting(false);
    }
  };

  // Add state for address suggestions
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Function to generate address suggestions (mock data for demonstration)
  const generateAddressSuggestions = (input: string) => {
    if (!input || input.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    setIsAddressLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock address suggestions based on input
      const mockSuggestions = [
        `${input}, New Delhi, India`,
        `${input}, Delhi, India`,
        `${input}, NCR, India`,
        `${input} Street, New Delhi, India`,
        `${input} Road, Delhi, India`,
        `${input} Colony, New Delhi, India`,
        `${input} Area, Delhi, India`,
        `${input} Nagar, New Delhi, India`,
      ];
      
      setAddressSuggestions(mockSuggestions);
      setShowSuggestions(true);
      setIsAddressLoading(false);
    }, 300);
  };

  // Handle address input change
  const handleAddressChange = (value: string) => {
    handlePersonalInfoChange("address", value);
    generateAddressSuggestions(value);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    handlePersonalInfoChange("address", suggestion);
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          addressInputRef.current && !addressInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add state for Google Places autocomplete
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Initialize Google Maps Places Autocomplete
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      setGoogleMapsLoaded(true);
      initAutocomplete();
      return;
    }

    // Load Google Maps script if not already loaded
    if (!document.querySelector('#google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places&callback=initAutocomplete`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.error('Error loading Google Maps script');
      };
      window.initAutocomplete = initAutocomplete;
      document.head.appendChild(script);
    } else {
      // Script exists, try to initialize
      setTimeout(initAutocomplete, 500);
    }

    return () => {
      if (window.initAutocomplete) {
        delete window.initAutocomplete;
      }
    };
  }, []);

  // Initialize autocomplete functionality
  const initAutocomplete = () => {
    if (typeof google !== 'undefined' && google.maps && google.maps.places && addressInputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'in' } // Restrict to India
      });
      
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          handlePersonalInfoChange("address", place.formatted_address);
        }
      });
      
      setGoogleMapsLoaded(true);
    }
  };

  const professionOptions = [
    "Corporate",
    "Individual",
    "Social Entrepreneur",
    "Teacher",
    "Healthcare Worker",
    "Non-Profit Worker",
    "Government Employee",
    "Retired",
    "Other"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Yantra Daan</span>
          </Link>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Step {step === 0 ? 'Email Check ' : step} of 5</span>
            <span className="text-sm text-muted-foreground">{step === 0 ? '0%' : `${Math.round(((step) / 4) * 100)}%`} Complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: step === 0 ? '0%' : `${((step) / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Registration Form */}
        <Card className="glass-card border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl md:text-3xl font-bold">
              {step === 0 && "Enter Your Email"}
              {step === 1 && "Create Your Account"}
              {step === 2 && "Choose Your Role"}
              {step === 3 && "Select Category"}
              {step === 4 && "Personal Information"}
            </CardTitle>
            <CardDescription className="text-base">
              {step === 0 && "First, let's check if your email is available"}
              {step === 1 && "Start your journey with Yantra Daan"}
              {step === 2 && "How would you like to participate?"}
              {step === 3 && "Tell us more about yourself"}
              {step === 4 && "Complete your profile"}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent>
              {/* Step 0: Email Check */}
              {step === 0 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">Email Address *</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={personalInfo.email}
                        onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                        required
                        className="py-3 px-4 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      {isCheckingEmail && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email Check Result */}
                  {emailCheckResult && (
                    <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${
                      emailCheckResult.exists 
                        ? 'bg-destructive/10 border-destructive/30' 
                        : 'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        {emailCheckResult.exists ? (
                          <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center mt-0.5 flex-shrink-0">
                            <AlertCircle className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className={`font-medium text-base ${
                            emailCheckResult.exists ? 'text-destructive' : 'text-green-700'
                          }`}>
                            {emailCheckResult.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Auto-email check happens on blur */}
                  <p className="text-sm text-muted-foreground text-center">
                    Email will be checked automatically when you finish typing
                  </p>
                </div>
              )}

              {/* Step 1: Basic Registration */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-medium">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={personalInfo.name}
                      onChange={(e) => handlePersonalInfoChange("name", e.target.value)}
                      required
                      className="py-3 px-4 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={personalInfo.email}
                      onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                      className="py-3 px-4 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      readOnly
                    />
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-primary">Password Setup</p>
                        <p className="text-sm text-primary/80 mt-1">
                          You'll receive an email with a password setup link after your account is verified by our admin team.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Role Selection */}
              {step === 2 && (
                <div className="space-y-6">
                  <RadioGroup
                    value={personalInfo.userRole}
                    onValueChange={(value: "donor" | "requester") => setPersonalInfo((prev) => ({
                      ...prev,
                      userRole: value,
                    }))}
                    className="space-y-4"
                  >
                    <div className={`flex items-start space-x-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      personalInfo.userRole === "donor" 
                        ? "border-primary bg-primary/5" 
                        : "border-muted hover:border-primary/30"
                    }`}>
                      <RadioGroupItem 
                        value="donor" 
                        id="donor" 
                        className="mt-1.5 w-5 h-5 border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white" 
                      />
                      <div className="flex-1">
                        <Label htmlFor="donor" className="cursor-pointer">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                              <Heart className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-semibold">Device Donor</span>
                          </div>
                          <p className="text-muted-foreground">
                            Share your unused technology with those who need it most. Help bridge the digital divide.
                          </p>
                        </Label>
                      </div>
                    </div>

                    <div className={`flex items-start space-x-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      personalInfo.userRole === "requester" 
                        ? "border-primary bg-primary/5" 
                        : "border-muted hover:border-primary/30"
                    }`}>
                      <RadioGroupItem 
                        value="requester" 
                        id="requester" 
                        className="mt-1.5 w-5 h-5 border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white" 
                      />
                      <div className="flex-1">
                        <Label htmlFor="requester" className="cursor-pointer">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-accent to-blue-500 rounded-lg flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-semibold">Device Requester</span>
                          </div>
                          <p className="text-muted-foreground">
                            Request technology that can help with your education, work, or personal development.
                          </p>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Step 3: Category Selection */}
              {step === 3 && personalInfo.userRole && (
                <div className="space-y-6">
                  <RadioGroup
                    value={personalInfo.categoryType}
                    onValueChange={(value: "individual" | "organization") => setPersonalInfo((prev) => ({
                      ...prev,
                      categoryType: value,
                      isOrganization: value === "organization",
                    }))}
                    className="space-y-4"
                  >
                    <div className={`flex items-start space-x-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      personalInfo.categoryType === "individual" 
                        ? "border-primary bg-primary/5" 
                        : "border-muted hover:border-primary/30"
                    }`}>
                      <RadioGroupItem 
                        value="individual" 
                        id="individual" 
                        className="mt-1.5 w-5 h-5 border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white" 
                      />
                      <div className="flex-1">
                        <Label htmlFor="individual" className="cursor-pointer">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-semibold">Individual</span>
                          </div>
                          <p className="text-muted-foreground">
                            Personal account for individual {personalInfo.userRole === "donor" ? "donations" : "requests"}
                          </p>
                        </Label>
                      </div>
                    </div>

                    <div className={`flex items-start space-x-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      personalInfo.categoryType === "organization" 
                        ? "border-primary bg-primary/5" 
                        : "border-muted hover:border-primary/30"
                    }`}>
                      <RadioGroupItem 
                        value="organization" 
                        id="organization" 
                        className="mt-1.5 w-5 h-5 border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white" 
                      />
                      <div className="flex-1">
                        <Label htmlFor="organization" className="cursor-pointer">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-accent to-blue-500 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-semibold">Organisation/Company</span>
                          </div>
                          <p className="text-muted-foreground">
                            Corporate or organizational account for bulk {personalInfo.userRole === "donor" ? "donations" : "requests"}
                          </p>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Step 4: Personal Information */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="contact" className="text-base font-medium">Contact Number *</Label>
                      <Input
                        id="contact"
                        placeholder="+1 (555) 123-4567"
                        value={personalInfo.contact}
                        onChange={(e) => handlePersonalInfoChange("contact", e.target.value)}
                        required
                        className="py-3 px-4 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profession" className="text-base font-medium">Profession</Label>
                      <Select value={personalInfo.profession} onValueChange={(value) => handlePersonalInfoChange("profession", value)}>
                        <SelectTrigger className="py-3 px-4 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                          <SelectValue placeholder="Select profession" />
                        </SelectTrigger>
                        <SelectContent>
                          {professionOptions.map((profession) => (
                            <SelectItem key={profession} value={profession.toLowerCase()}>
                              {profession}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-base font-medium">Address *</Label>
                    <div className="relative" ref={suggestionsRef}>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <Input
                          ref={addressInputRef}
                          id="address"
                          placeholder="Search for your address..."
                          value={personalInfo.address}
                          onChange={(e) => handleAddressChange(e.target.value)}
                          required
                          className="pl-10 py-3 px-4 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          disabled={!googleMapsLoaded}
                        />
                        {isAddressLoading && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          </div>
                        )}
                        {!googleMapsLoaded && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Show fallback suggestions if Google Maps fails to load */}
                      {!googleMapsLoaded && showSuggestions && addressSuggestions.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-muted rounded-lg shadow-lg max-h-60 overflow-auto">
                          {addressSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-4 py-3 hover:bg-muted cursor-pointer flex items-center text-sm"
                              onClick={() => handleSuggestionSelect(suggestion)}
                            >
                              <Search className="h-4 w-4 text-muted-foreground mr-2" />
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="document" className="text-base font-medium">Document Upload *</Label>
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 text-center bg-muted/10 hover:bg-muted/20 transition-all duration-300 relative group">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-base text-muted-foreground mb-2 font-medium">
                          {personalInfo.userRole === "requester" 
                            ? "Upload ID, School ID, Registration, or any proof of need"
                            : "Upload ID, Business License, or any proof of identity"
                          }
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Maximum file size: 5MB
                        </p>
                        
                        {personalInfo.document ? (
                          <div className="w-full max-w-md">
                            {/* Document Preview */}
                            {documentPreviewUrl ? (
                              // Image preview
                              <div className="mb-4 overflow-hidden rounded-lg border border-muted shadow-sm">
                                <div className="relative">
                                  <img 
                                    src={documentPreviewUrl} 
                                    alt="Document preview" 
                                    className="w-full h-48 object-contain bg-white"
                                  />
                                  <Button 
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setPersonalInfo(prev => ({ ...prev, document: undefined }));
                                      setDocumentPreviewUrl(null);
                                    }}
                                    className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full shadow-md"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="bg-muted p-3">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {personalInfo.document.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(personalInfo.document.size / 1024 / 1024).toFixed(2)} MB • Image
                                  </p>
                                </div>
                              </div>
                            ) : (
                              // Non-image file preview
                              <div className="flex items-center justify-between bg-white border border-primary/20 rounded-lg p-4 shadow-sm mb-4">
                                <div className="flex items-center">
                                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                                    {personalInfo.document.type.includes('pdf') ? (
                                      <FileText className="w-6 h-6 text-primary" />
                                    ) : (
                                      <FileText className="w-6 h-6 text-primary" />
                                    )}
                                  </div>
                                  <div className="text-left">
                                    <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                                      {personalInfo.document.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {(personalInfo.document.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <Button 
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setPersonalInfo(prev => ({ ...prev, document: undefined }));
                                    setDocumentPreviewUrl(null);
                                  }}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            <Button 
                              type="button"
                              variant="outline"
                              className="btn-hero px-6 py-3 text-base font-medium hover:shadow-lg transition-all"
                              onClick={(e) => {
                                e.preventDefault();
                                const fileInput = document.getElementById('document-upload');
                                if (fileInput) {
                                  fileInput.click();
                                }
                              }}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                            <Input
                              id="document-upload"
                              type="file"
                              onChange={handleFileUpload}
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              className="hidden"
                            />
                          </div>
                        )}
                      </div>
                      
                      {personalInfo.document && !documentPreviewUrl && (
                        <div className="absolute top-3 right-3">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* File type preview icons */}
                    <div className="flex justify-center space-x-4 mt-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-1">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-xs text-muted-foreground">PDF</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mb-1">
                          <FileImage className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-xs text-muted-foreground">JPG/PNG</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-1">
                          <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <span className="text-xs text-muted-foreground">DOC</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="about" className="text-base font-medium">About {isOrganization ? "Organisation" : "You"} *</Label>
                        <Textarea
                          id="about"
                          placeholder={`Tell us about ${isOrganization ? "your organization" : "yourself"}...`}
                          value={personalInfo.about}
                          onChange={(e) => handlePersonalInfoChange("about", e.target.value)}
                          rows={4}
                          required
                          className="py-3 px-4 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <Checkbox 
                          id="emailUpdates" 
                          checked={personalInfo.emailUpdates}
                          onCheckedChange={(checked) => 
                            setPersonalInfo(prev => ({ ...prev, emailUpdates: checked as boolean }))
                          }
                          className="w-5 h-5 border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
                        />
                        <Label htmlFor="emailUpdates" className="text-base">
                          Send me updates and notifications via email
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Social Links (Optional)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-muted-foreground text-sm">@</span>
                          </div>
                          <Input
                            id="linkedin"
                            placeholder="linkedin.com/in/username"
                            value={personalInfo.linkedIn}
                            onChange={(e) => handlePersonalInfoChange("linkedIn", e.target.value)}
                            className="pl-8 py-2.5 px-4 text-sm border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram" className="text-sm">Instagram</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-muted-foreground text-sm">@</span>
                          </div>
                          <Input
                            id="instagram"
                            placeholder="instagram.com/username"
                            value={personalInfo.instagram}
                            onChange={(e) => handlePersonalInfoChange("instagram", e.target.value)}
                            className="pl-8 py-2.5 px-4 text-sm border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebook" className="text-sm">Facebook</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-muted-foreground text-sm">@</span>
                          </div>
                          <Input
                            id="facebook"
                            placeholder="facebook.com/username"
                            value={personalInfo.facebook}
                            onChange={(e) => handlePersonalInfoChange("facebook", e.target.value)}
                            className="pl-8 py-2.5 px-4 text-sm border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {isOrganization && (
                    <div className="flex items-center space-x-3 p-4 bg-accent/10 rounded-lg border border-accent/20">
                      <Checkbox 
                        id="organization-behalf" 
                        className="w-5 h-5 border-2 border-accent data-[state=checked]:bg-accent data-[state=checked]:text-white"
                      />
                      <Label htmlFor="organization-behalf" className="text-base">
                        I am registering on behalf of my organisation
                      </Label>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-10 pt-6 border-t border-muted">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center space-x-2 px-6 py-3 text-base font-medium border-2 hover:shadow-md transition-all"
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </Button>
                )}
                
                {step === 0 && (
                  <div></div> // Empty div for spacing when no back button
                )}

                {step === 4 ? (
                  <Button
                    type="submit"
                    disabled={!validateStep() || isSubmitting}
                    className="btn-hero flex items-center space-x-2 px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!validateStep() || isSubmitting}
                    className="btn-hero flex items-center space-x-2 px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;