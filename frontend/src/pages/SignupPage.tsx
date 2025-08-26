import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, ArrowLeft, ArrowRight, User, Building2, Upload, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config/env";
// API functions removed - using direct fetch

interface PersonalInfo {
  name: string;
  email: string;
  password: string;
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
  const [step, setStep] = useState(1);
  const [userRole, setUserRole] = useState<"donor" | "requester" | "">("");
  const [categoryType, setCategoryType] = useState<"individual" | "organization" | "">("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isOrganization, setIsOrganization] = useState(false);
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    email: "",
    contact: "",
    userRole: "",
    password: "",
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
  
  console.log("personalInfo 47",personalInfo);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPersonalInfo(prev => ({ ...prev, document: file }));
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return personalInfo.name && personalInfo.email && password && confirmPassword && password === confirmPassword;
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
    console.log("personalInfo", personalInfo);

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
        password,
        document: documentInfo
      };

      const response = await fetch(`${config.apiUrl}${config.endpoints.users}`, {
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
        toast({
          title: "Registration Successful!",
          description: `Welcome to Yantra Daan ${personalInfo.name}!`,
        });
        navigate("/login");
      } else {
        alert(`Error: Registration failed`);
      }
    } catch (error) {
      console.error("Error:", error);
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
            <span className="text-sm text-muted-foreground">Step {step} of 4</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Registration Form */}
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {step === 1 && "Create Your Account"}
              {step === 2 && "Choose Your Role"}
              {step === 3 && "Select Category"}
              {step === 4 && "Personal Information"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Start your journey with TechShare NGO"}
              {step === 2 && "How would you like to participate?"}
              {step === 3 && "Tell us more about yourself"}
              {step === 4 && "Complete your profile"}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent>
              {/* Step 1: Basic Registration */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={personalInfo.name}
                      onChange={(e) => handlePersonalInfoChange("name", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={personalInfo.email}
                      onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {password && confirmPassword && password !== confirmPassword && (
                      <p className="text-sm text-destructive">Passwords do not match</p>
                    )}
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
                    className="space-y-6"
                  >
                    <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="donor" id="donor" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="donor" className="cursor-pointer">
                          <div className="flex items-center space-x-2 mb-2">
                            <Heart className="w-5 h-5 text-primary" />
                            <span className="font-semibold">Device Donor - I have a device to donate!</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Share your unused technology with those who need it most. Help bridge the digital divide.
                          </p>
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="requester" id="requester" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="requester" className="cursor-pointer">
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="w-5 h-5 text-primary" />
                            <span className="font-semibold">Device Requester - I would like to request a device</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
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
                    className="space-y-6"
                  >
                    <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="individual" id="individual" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="individual" className="cursor-pointer">
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="w-5 h-5 text-primary" />
                            <span className="font-semibold">Individual</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Personal account for individual {personalInfo.userRole === "donor" ? "donations" : "requests"}
                          </p>
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="organization" id="organization" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="organization" className="cursor-pointer">
                          <div className="flex items-center space-x-2 mb-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            <span className="font-semibold">Organisation/Company</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact">Contact Number *</Label>
                      <Input
                        id="contact"
                        placeholder="+1 (555) 123-4567"
                        value={personalInfo.contact}
                        onChange={(e) => handlePersonalInfoChange("contact", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profession">Profession</Label>
                      <Select value={personalInfo.profession} onValueChange={(value) => handlePersonalInfoChange("profession", value)}>
                        <SelectTrigger>
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
                    <Label htmlFor="about">About {isOrganization ? "Organisation" : "You"} *</Label>
                    <Textarea
                      id="about"
                      placeholder={`Tell us about ${isOrganization ? "your organization" : "yourself"}...`}
                      value={personalInfo.about}
                      onChange={(e) => handlePersonalInfoChange("about", e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="document">Document Upload *</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        {personalInfo.userRole === "requester" 
                          ? "Upload ID, School ID, Registration, or any proof of need"
                          : "Upload ID, Business License, or any proof of identity"
                        }
                      </p>
                      <Input
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="max-w-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Social Links (Optional)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          placeholder="LinkedIn profile URL"
                          value={personalInfo.linkedIn}
                          onChange={(e) => handlePersonalInfoChange("linkedIn", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          id="instagram"
                          placeholder="Instagram handle"
                          value={personalInfo.instagram}
                          onChange={(e) => handlePersonalInfoChange("instagram", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input
                          id="facebook"
                          placeholder="Facebook profile URL"
                          value={personalInfo.facebook}
                          onChange={(e) => handlePersonalInfoChange("facebook", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Additional Information</Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Textarea
                          id="address"
                          placeholder="Enter your full address..."
                          value={personalInfo.address}
                          onChange={(e) => handlePersonalInfoChange("address", e.target.value)}
                          rows={2}
                          required
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="emailUpdates" 
                          checked={personalInfo.emailUpdates}
                          onCheckedChange={(checked) => 
                            setPersonalInfo(prev => ({ ...prev, emailUpdates: checked as boolean }))
                          }
                        />
                        <Label htmlFor="emailUpdates" className="text-sm">
                          Send me updates and notifications via email
                        </Label>
                      </div>
                    </div>
                  </div>

                  {isOrganization && (
                    <div className="flex items-center space-x-2">
                      <Checkbox id="organization-behalf" />
                      <Label htmlFor="organization-behalf" className="text-sm">
                        I am registering on behalf of my organisation
                      </Label>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>

                {step === 4 ? (
                  <Button
                    type="submit"
                    disabled={!validateStep()}
                    className="btn-hero flex items-center space-x-2"
                  >
                    <span>Complete Registration</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!validateStep()}
                    className="btn-hero flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Login Link */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;