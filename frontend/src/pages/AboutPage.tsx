import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Gallery from "@/components/Gallery";
import { Heart, Users, Globe, Award, User, Loader2, Gift, ArrowRight, CheckCircle, Calendar, Target, Zap, Laptop, Smartphone, Shield, X, QrCode, Leaf } from "lucide-react";
import NoDataFound from "@/components/NoDataFound";
import { config } from "@/config/env";

const AboutPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const stats = [
    { label: "Items Donated", value: "2,500+", icon: Heart },
    { label: "Students Helped", value: "1,200+", icon: Users },
    { label: "Cities Reached", value: "50+", icon: Globe },
    { label: "Years Active", value: "5+", icon: Award },
    { label: "E-waste Collected", value: "1,200+ KGS", icon: Shield },
    { label: "Carbon Footprint Reduced", value: "850+ Tons", icon: Leaf },
  ];

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${config.apiUrl}${config.endpoints.teamMembers}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      
      const data = await response.json();
      setTeamMembers(data.members || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Founder & CEO': return 'from-purple-500 to-purple-600';
      case 'Operations Director': return 'from-blue-500 to-blue-600';
      case 'Community Manager': return 'from-green-500 to-green-600';
      case 'Technical Lead': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-primary/5 dark:from-gray-900 dark:via-gray-800/50 dark:to-primary/10 transition-colors duration-300">
      <div className="container mx-auto px-4 py-20">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-3xl -z-10"></div>
          <div className="relative z-10 py-8 lg:py-16">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold gradient-text mb-6 lg:mb-8 leading-tight">
              About Yantra Daan
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mb-6 lg:mb-8"></div>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
              Empowering students through technology donations, one device at a time.
              We believe every student deserves access to the digital tools they need to succeed.
            </p>
            
            {/* Trust Indicators */}
            <div className="mt-8 lg:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 max-w-2xl mx-auto px-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-gray-600">Since 2019</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-accent to-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-gray-600">1000+ Lives</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-secondary to-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-gray-600">50+ Cities</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-gray-600">Award Winner</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Mission Section */}
        <Card className="donation-card mb-20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full -z-10"></div>
          <CardContent className="p-8 lg:p-12 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2">
                  <Heart className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Our Mission</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                  Bridging the Digital Divide
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Yantra Daan Foundation is an organization working on electronics waste minimization where we collect second-hand/broken computers, repair and distribute, and ensure computer skill training among slum children/youth in Sanjay Colony, Delhi.
                  </p>
                  <p>
                    We empower rural communities by providing second-hand digital learning resources to organizations working in rural areas. Founded in 2019, we have created a platform that makes it easy for individuals and organizations to donate their unused technology directly to students who need it most.
                  </p>
                </div>
                
                {/* Mission Highlights */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-sm text-gray-700">Device Refurbishment</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-accent to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-sm text-gray-700">Digital Training</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-secondary to-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-sm text-gray-700">Community Support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-sm text-gray-700">Waste Reduction</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center relative">
                <div className="relative z-10">
                  <div className="w-64 lg:w-80 h-64 lg:h-80 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 rounded-full flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-4 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full animate-pulse"></div>
                    <Heart className="w-24 lg:w-32 h-24 lg:h-32 text-primary relative z-10" />
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 w-12 lg:w-16 h-12 lg:h-16 bg-white rounded-full shadow-lg flex items-center justify-center animate-float z-20">
                    <Users className="w-6 lg:w-8 h-6 lg:h-8 text-accent" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-12 lg:w-16 h-12 lg:h-16 bg-white rounded-full shadow-lg flex items-center justify-center animate-float z-20" style={{animationDelay: '1s'}}>
                    <Globe className="w-6 lg:w-8 h-6 lg:h-8 text-secondary" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How YantraDaan Works - Executive Professional Section */}
        <div className="mb-20 relative bg-gradient-to-br from-white via-gray-50 to-primary/5 rounded-3xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full -z-10"></div>
          <div className="relative z-10 p-8 lg:p-16">
            {/* Executive Header */}
            <div className="text-center mb-12 lg:mb-20">
              <div className="inline-flex items-center space-x-3 bg-white rounded-full px-6 lg:px-8 py-3 lg:py-4 shadow-lg border mb-6 lg:mb-8">
                <div className="w-6 lg:w-8 h-6 lg:h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <Zap className="w-3 lg:w-4 h-3 lg:h-4 text-white" />
                </div>
                <span className="text-sm lg:text-base font-bold text-gray-800">Enterprise-Grade Process</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-6 lg:mb-8 leading-tight px-4">
                How YantraDaan Works
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-5xl mx-auto leading-relaxed mb-6 lg:mb-8 px-4">
                An ISO-certified, systematically engineered process that transforms unused technology into powerful educational opportunities for underserved communities
              </p>
              <div className="flex items-center justify-center px-4">
                <div className="w-16 lg:w-20 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                <div className="w-3 lg:w-4 h-3 lg:h-4 bg-accent rounded-full mx-3 lg:mx-4"></div>
                <div className="w-16 lg:w-20 h-1 bg-gradient-to-r from-accent to-secondary rounded-full"></div>
              </div>
            </div>

            {/* Executive Process Steps */}
            <div className="grid lg:grid-cols-2 gap-16 mb-20">
              {/* Phase 1 & 2 */}
              <div className="space-y-12">
                {/* Strategic Collection */}
                <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-accent to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Gift className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-primary mb-2 tracking-widest">PHASE 01</div>
                        <h3 className="text-2xl font-bold text-gray-900">Strategic Collection</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">500+</div>
                      <div className="text-sm text-gray-500">Monthly Units</div>
                    </div>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Comprehensive collection through verified corporate partnerships, individual donors, and community drives ensuring steady supply of quality devices.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <Laptop className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-xs font-medium text-gray-700">Computers</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <Smartphone className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-xs font-medium text-gray-700">Mobiles</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <Globe className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-xs font-medium text-gray-700">Accessories</div>
                    </div>
                  </div>
                </div>

                {/* Expert Refurbishment */}
                <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-accent to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-accent mb-2 tracking-widest">PHASE 02</div>
                        <h3 className="text-2xl font-bold text-gray-900">Expert Refurbishment</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-accent">98.5%</div>
                      <div className="text-sm text-gray-500">Success Rate</div>
                    </div>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Certified technicians perform comprehensive diagnostics, repairs, and upgrades using industry-standard procedures with 45-point quality checks.
                  </p>
                  {/* <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">ISO 9001:2015 Quality Standards</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Educational Software Pre-installation</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Security & Privacy Compliance</span>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Phase 3 & 4 */}
              <div className="space-y-12">
                {/* Strategic Distribution */}
                <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-accent to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-secondary mb-2 tracking-widest">PHASE 03</div>
                        <h3 className="text-2xl font-bold text-gray-900">Strategic Distribution</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-secondary">100%</div>
                      <div className="text-sm text-gray-500">Verified</div>
                    </div>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Proprietary impact assessment algorithm identifies and prioritizes recipients based on educational need, family income, and academic potential.
                  </p>
                </div>

                {/* Comprehensive Support */}
                <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-accent to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Heart className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-purple-500 mb-2 tracking-widest">PHASE 04</div>
                        <h3 className="text-2xl font-bold text-gray-900">Comprehensive Support</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-500">24/7</div>
                      <div className="text-sm text-gray-500">Support</div>
                    </div>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Comprehensive training programs and ongoing technical support to ensure maximum utilization and sustained educational impact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
          {stats.map((stat, index) => (
            <Card key={index} className="donation-card text-center group hover:shadow-2xl transition-all duration-500 border-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                <div className="w-8 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </CardContent>
            </Card>
          ))}
        </div>

                    {/* Trust Statement */}
            <div className="text-center mb-20">
              <div className="inline-block bg-green-50 rounded-2xl px-8 py-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-center space-x-6 text-sm font-semibold text-gray-700">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>ISO Certified Process</span>
                  </div>
                  <div className="w-px h-6 bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span>100% Transparency</span>
                  </div>
                  <div className="w-px h-6 bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-accent" />
                    <span>Trusted by Thousands</span>
                  </div>
                </div>
              </div>
            </div>

        {/* Enhanced Values Section */}
        <Card className="donation-card mb-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-secondary"></div>
          <CardContent className="p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These principles guide everything we do, from community engagement to technology distribution.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-6"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Users, title: "Community", desc: "We use creative tech solutions for real-world impact.", color: "from-primary to-primary-glow" },
                { icon: Users, title: "Innovation", desc: "Building connections between donors and recipients to create lasting impact.", color: "from-accent to-blue-500" },
                { icon: Globe, title: "Accessibility", desc: "Making technology accessible to students regardless of their economic background.", color: "from-secondary to-green-500" },
                { icon: Globe, title: "Sustainability", desc: "We protect the planet through mindful tech reuse.", color: "from-accent to-blue-500" },
                { icon: Award, title: "Transparency", desc: "We operate with honesty and build trust through action.", color: "from-secondary to-green-500" },
                { icon: Award, title: "Excellence", desc: "Maintaining high standards in our donation process and student support.", color: "from-primary to-primary-glow" }
              ].map((value, index) => (
                <div key={index} className="text-center group">
                  <div className={`w-20 h-20 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-2xl`}>
                    <value.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                  <div className={`w-12 h-1 bg-gradient-to-r ${value.color} rounded-full mx-auto mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Projects Section */}
        <Card className="donation-card mb-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-transparent rounded-br-full"></div>
          <CardContent className="p-12">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-secondary/10 rounded-full px-6 py-3 mb-6">
                <Target className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium text-secondary">Future Initiatives</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Projects</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Exciting new initiatives on the horizon that will expand our reach and deepen our impact in communities across India.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-secondary to-green-500 rounded-full mx-auto mt-6"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Project 1 */}
              <Card className="trust-card group hover:shadow-xl transition-all duration-500">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Laptop className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Launch: Q2 2024</div>
                      <div className="flex items-center text-xs text-secondary">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>6 months</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile Learning Labs</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Deploying mobile units equipped with refurbished devices to reach remote villages and underserved communities across 10 states.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>50+ villages targeted</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>1000+ students to benefit</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Local partnerships established</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project 2 */}
              <Card className="trust-card group hover:shadow-xl transition-all duration-500">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-accent to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Launch: Q3 2024</div>
                      <div className="flex items-center text-xs text-accent">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>8 months</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Women Empowerment Program</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Specialized digital literacy and entrepreneurship training for women in rural areas, combining device donations with skill development.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>500+ women enrolled</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Entrepreneurship training</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Microfinance partnerships</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project 3 */}
              <Card className="trust-card group hover:shadow-xl transition-all duration-500">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-secondary to-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Smartphone className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Launch: Q4 2024</div>
                      <div className="flex items-center text-xs text-secondary">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>12 months</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Learning Centers</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Establishing permanent technology centers in partnership with schools and community organizations for sustained impact.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>25 centers planned</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>24/7 access for students</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Internet connectivity provided</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Investment & Support */}
            <div className="mt-16 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Support Our Vision</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  These ambitious projects require community support. Your donations and partnerships help us expand our reach and create lasting change.
                </p>
              </div>
              <div className="text-center mt-8">
                <Button 
                  className="btn-hero px-8 py-3" 
                  onClick={() => setShowPaymentPopup(true)}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Support Our Projects
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>        
        {/* Gallery Section */}
        <Gallery />
      </div>

      {/* Payment QR Code Popup */}
      {showPaymentPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl relative transform animate-in fade-in zoom-in duration-300">
            {/* Close Button */}
            <button 
              onClick={() => setShowPaymentPopup(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              {/* <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-white" />
              </div> */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Support Our Future Projects</h3>
              <p className="text-gray-600">Scan the QR code to make a donation and help us expand our impact</p>
            </div>

            {/* QR Code */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center mb-6">
              <div className="w-48 h-48 mx-auto bg-white rounded-xl shadow-sm flex items-center justify-center border">
                {/* QR Code Placeholder - Replace with actual QR code */}
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=yantradaan@paytm&pn=YantraDaan%20Foundation&am=&cu=INR&mc=8398" 
                  alt="Payment QR Code" 
                  className="w-44 h-44 rounded-lg"
                />
              </div>
              <p className="text-sm text-gray-500 mt-4">Scan with any UPI app to donate</p>
            </div>

            {/* Payment Details */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 mb-6">
              <h4 className="font-bold text-gray-900 mb-3">Payment Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Organization:</span>
                  <span className="font-medium text-gray-900">YantraDaan Foundation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">UPI ID:</span>
                  <span className="font-medium text-gray-900">yantradaan@paytm</span>
                </div>
              </div>
            </div>


            {/* Thank You Message */}
            <div className="text-center mt-6 p-4 bg-green-50 rounded-xl">
              <p className="text-green-800 text-sm font-medium">Every donation helps us reach more students in need. Thank you for your support! 💚</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutPage;