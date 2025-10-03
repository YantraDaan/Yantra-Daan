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
    { label: "Students Helped", value: "1,200+", icon: Users },
    { label: "Cities Reached", value: "50+", icon: Globe },
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
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
                  <div className=" mb-4 w-100 ">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIrUH4vOmnxzAIwAq-PvP5kaUs7nrCk-szCg&s" alt="Mobile Learning Labs"  className="w-[400px]"/>
                  </div>
                  <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile Learning Labs</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Deploying mobile units equipped with refurbished devices to reach remote villages and underserved communities across 10 states.
                  </p>
                  </div>

              </Card>

              {/* Project 2 */}
              <Card className="trust-card group hover:shadow-xl transition-all duration-500">
                  <div className=" mb-4 w-100 ">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJ-N6XfUexJhvi0bzPn9w1wQwp2zsG0D5GMg&s" alt="Mobile Learning Labs"  className="w-[400px]"/>
                  </div>
                  <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Learning Centers</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Deploying mobile units equipped with refurbished devices to reach remote villages and underserved communities across 10 states.
                  </p>
                  </div>

              </Card>

              {/* Project 3 */}
              <Card className="trust-card group hover:shadow-xl transition-all duration-500">
                  <div className=" mb-4 w-100 ">
                    <img src="data:image/jpeg;base64,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" alt="Mobile Learning Labs"  className="w-[400px]"/>
                  </div>
                  <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Women Empowerment Program</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Deploying mobile units equipped with refurbished devices to reach remote villages and underserved communities across 10 states.
                  </p>
                  </div>

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
        {/* <Gallery /> */}
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