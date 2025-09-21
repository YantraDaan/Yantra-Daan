import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Clock, Users, MessageCircle, Heart, Shield, CheckCircle, Globe, Award, Zap } from "lucide-react";
// Import the API service
import { apiService } from "@/lib/api";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    subject: "",
    message: "",
    contactType: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Send data to backend including contactType
      const response = await apiService.submitContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        organization: formData.organization,
        subject: formData.subject,
        message: formData.message,
        contactType: formData.contactType // Include contactType in the submission
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log("Contact form submitted:", formData);
      setIsSubmitted(true);
      
      // Reset form after success
      setTimeout(() => {
        setFormData({ 
          name: "", 
          email: "", 
          phone: "", 
          organization: "", 
          subject: "", 
          message: "", 
          contactType: "general" 
        });
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error("Contact form submission error:", err);
      setError(err instanceof Error ? err.message : "Failed to submit contact form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "hello@yantradaan.org",
      description: "We'll respond within 24 hours",
      link: "mailto:hello@yantradaan.org",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Phone,
      title: "Call Us",
      content: "+91 8700283813",
      description: "Mon-Fri, 9am-6pm IST",
      link: "tel:+918700283813",
      color: "from-green-500 to-green-600"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      content: "Okhla Industrial Area Phase-2, New Delhi, 110020, India",
      description: "Our main office location",
      link: "https://maps.google.com/?q=Okhla+Industrial+Area+Phase-2+New+Delhi",
      color: "from-green-500 to-green-600"
    },
  ];

  const faqItems = [
    {
      question: "How do I donate a device?",
      answer: "Simply fill out our donation form with device details and your location. We'll guide you through the process."
    },
    {
      question: "Who can request a device?",
      answer: "Students in need of technology for educational purposes can create an account and submit a request."
    },
    {
      question: "Is there a cost to use your platform?",
      answer: "No, our platform is completely free for both donors and students."
    },
    {
      question: "How do you verify student eligibility?",
      answer: "We require proof of enrollment and need assessment to ensure devices reach genuine students."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-primary/5 dark:from-gray-900 dark:via-gray-800/50 dark:to-primary/10 transition-colors duration-300">
      <div className="container mx-auto px-4 py-16">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-3xl -z-10"></div>
          <div className="relative z-10 py-16">
            <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-6 py-3 mb-6">
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">We're Here to Help</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold gradient-text mb-8 leading-tight">
              Get In Touch
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Have questions about donating or requesting technology? We're here to help!
              Reach out to us and we'll get back to you as soon as possible.
            </p>
            
            {/* Trust Indicators */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-gray-600">Secure & Private</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-gray-600">Quick Response</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-2">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-gray-600">24/7 Support</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-gray-600">Expert Team</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Enhanced Contact Form */}
          <div className="lg:col-span-2">
            <Card className="donation-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-3xl font-bold text-gray-900 flex items-center">
                  <Send className="w-8 h-8 mr-3 text-primary" />
                  Send us a Message
                </CardTitle>
                <p className="text-gray-600 mt-2">We'd love to hear from you. Fill out the form below and we'll get back to you shortly.</p>
              </CardHeader>
              <CardContent className="relative z-10">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h3>
                    <p className="text-gray-600 mb-6">Thank you for contacting us. We'll get back to you within 24 hours.</p>
                    <div className="inline-flex items-center space-x-2 bg-green-50 rounded-full px-6 py-3">
                      <Heart className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">Your message matters to us</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    )}
                    
                    {/* Contact Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">I'm interested in:</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { value: "donation", label: "Donating Devices", icon: Heart },
                          { value: "request", label: "Requesting Device", icon: Users },
                          { value: "volunteer", label: "Volunteering", icon: Globe },
                          { value: "general", label: "General Inquiry", icon: MessageCircle },
                        ].map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, contactType: type.value }))}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                              formData.contactType === type.value
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-gray-200 hover:border-primary/50 text-gray-600'
                            }`}
                          >
                            <type.icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full Name
                          <span className="text-red-600 ml-1" aria-hidden="true">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email Address
                          <span className="text-red-600 ml-1" aria-hidden="true">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                          Organization/School
                        </Label>
                        <Input
                          id="organization"
                          placeholder="Your organization or school"
                          value={formData.organization}
                          onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                        Subject
                        <span className="text-red-600 ml-1" aria-hidden="true">*</span>
                      </Label>
                      <Input
                        id="subject"
                        placeholder="What is this about?"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Message
                        <span className="text-red-600 ml-1" aria-hidden="true">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full btn-hero py-4 text-lg font-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Contact Information */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="donation-card group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-14 h-14 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <info.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{info.title}</h3>
                      <a 
                        href={info.link} 
                        target={info.link.startsWith('http') ? '_blank' : '_self'}
                        rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-primary font-semibold mb-2 block hover:text-primary-glow transition-colors duration-200"
                      >
                        {info.content}
                      </a>
                      <p className="text-sm text-gray-600">{info.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Trust & Safety Card */}
            <Card className="donation-card bg-gradient-to-br from-green-50 to-blue-50">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                  <Shield className="w-6 h-6 mr-3 text-green-600" />
                  Your Privacy Matters
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-700">End-to-end encryption</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-700">No spam or marketing emails</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-700">GDPR compliant</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-700">Secure data handling</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced FAQ Section */}
        <Card className="donation-card mb-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-secondary"></div>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="w-8 h-8 mr-4 text-primary" />
              Frequently Asked Questions
            </CardTitle>
            <p className="text-gray-600 mt-2">Quick answers to common questions about our platform and services.</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {faqItems.map((item, index) => (
                <div key={index} className="space-y-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <h3 className="font-bold text-gray-900 text-lg flex items-start">
                    <span className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    {item.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed ml-11">{item.answer}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Still have questions?</p>
              <Button className="btn-hero" onClick={() => document.getElementById('name')?.focus()}>
                <MessageCircle className="w-5 h-5 mr-2" />
                Ask Us Anything
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Impact & Trust Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="donation-card text-center group hover:shadow-xl transition-all duration-500">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-secondary to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold gradient-text mb-2">2,500+</div>
              <div className="text-gray-600 font-medium">Devices Donated</div>
              <div className="w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-3"></div>
            </CardContent>
          </Card>
          
          <Card className="donation-card text-center group hover:shadow-xl transition-all duration-500">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-secondary to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold gradient-text mb-2">1,200+</div>
              <div className="text-gray-600 font-medium">Students Helped</div>
              <div className="w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-3"></div>
            </CardContent>
          </Card>
          
          <Card className="donation-card text-center group hover:shadow-xl transition-all duration-500">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-secondary to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold gradient-text mb-2">50+</div>
              <div className="text-gray-600 font-medium">Cities Reached</div>
              <div className="w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-3"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;