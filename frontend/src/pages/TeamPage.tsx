import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Mail, 
  Phone, 
  Heart,
  Award,
  Lightbulb,
  Shield,
  UserCheck,
  Star,
  Building2,
  Users2,
  Target,
  Zap
} from "lucide-react";
import { config } from "@/config/env";
import LoadingSpinner from "@/components/LoadingSpinner";
import NoDataFound from "@/components/NoDataFound";
import { useToast } from "@/components/ui/use-toast";

interface TeamMember {
  _id: string;
  name: string;
  role: 'Founder & CEO' | 'Operations Director' | 'Community Manager' | 'Technical Lead' | 'Support Staff';
  bio: string;
  email?: string;
  contact?: string;
  avatar?: string;
}

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching team members from:', `${config.apiUrl}${config.endpoints.teamMembers}`);
      
      const response = await fetch(`${config.apiUrl}${config.endpoints.teamMembers}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Team members data received:', data);
      setTeamMembers(data.members || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load team members",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Founder & CEO':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'Operations Director':
        return <Building2 className="w-5 h-5 text-blue-500" />;
      case 'Community Manager':
        return <Users2 className="w-5 h-5 text-green-500" />;
      case 'Technical Lead':
        return <Zap className="w-5 h-5 text-purple-500" />;
      case 'Support Staff':
        return <UserCheck className="w-5 h-5 text-orange-500" />;
      default:
        return <Users className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Founder & CEO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Operations Director':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Community Manager':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Technical Lead':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Support Staff':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <NoDataFound
        title="Team Not Found"
        description="Our team information is currently being updated. Please check back soon!"
        imageType="general"
        variant="full"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-accent text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">Meet Our Team</h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Dedicated professionals working together to bridge the digital divide and create 
              positive impact in communities through technology donations and support.
            </p>
            <div className="flex items-center justify-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{teamMembers.length} Team Members</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span>Passionate & Dedicated</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span>Mission-Driven</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet the passionate individuals who are driving change and making technology accessible to everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <Card 
                key={member._id} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white"
              >
                <CardContent className="p-6">
                  {/* Avatar */}
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Users className="w-12 h-12 text-white" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                    <Badge className={`${getRoleColor(member.role)} border`}>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </div>
                    </Badge>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-600 text-center leading-relaxed">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamPage;
