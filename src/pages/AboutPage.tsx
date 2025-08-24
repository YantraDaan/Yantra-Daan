import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Gallery from "@/components/Gallery";
import { Heart, Users, Globe, Award, User, Loader2 } from "lucide-react";
import NoDataFound from "@/components/NoDataFound";

const AboutPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const stats = [
    { label: "Items Donated", value: "2,500+", icon: Heart },
    { label: "Students Helped", value: "1,200+", icon: Users },
    { label: "Cities Reached", value: "50+", icon: Globe },
    { label: "Years Active", value: "5+", icon: Award },
  ];

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/team-members`);
      
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
    <div className="min-h-screen bg-gradient-to-br from-hero-bg to-request-highlight">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
            About TechShare NGO
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering students through technology donations, one device at a time.
            We believe every student deserves access to the digital tools they need to succeed.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="donation-card mb-16">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-600 mb-4">
                  TechShare NGO is dedicated to reducing the digital divide by connecting generous 
                  donors with students in need of technology. We facilitate the donation of laptops, 
                  tablets, and other educational devices to ensure every student has the tools they 
                  need for academic success.
                </p>
                <p className="text-gray-600">
                  Founded in 2019, we have created a platform that makes it easy for individuals 
                  and organizations to donate their unused technology directly to students who need it most.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                  <Heart className="w-32 h-32 text-primary" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="donation-card text-center">
              <CardContent className="p-6">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Values Section */}
        <Card className="donation-card mb-16">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
                <p className="text-gray-600">
                  Building connections between donors and recipients to create lasting impact.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Accessibility</h3>
                <p className="text-gray-600">
                  Making technology accessible to students regardless of their economic background.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
                <p className="text-gray-600">
                  Maintaining high standards in our donation process and student support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our dedicated team works tirelessly to ensure every donation reaches the right student.
          </p>
        </div>

        {/* Team Members Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600">Loading team members...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load team</h3>
              <p className="text-gray-500">{error}</p>
              <button 
                onClick={fetchTeamMembers}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : teamMembers.length === 0 ? (
          <NoDataFound
            title="No team members found"
            description="Our team information is being updated."
            imageType="users"
            variant="full"
          />
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers
              .filter(member => member.status === 'active')
              .map((member, index) => (
                <Card key={member._id || index} className="donation-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className={`w-20 h-20 bg-gradient-to-r ${getRoleColor(member.role)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
        
        {/* Gallery Section */}
        <Gallery />
      </div>
    </div>
  );
};

export default AboutPage;