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
  socialLinks?: {
    linkedin: string;
    instagram: string;
  };
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
                    {member.avatar ? (
                      <div className="w-24 h-24 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover shadow-xl border-4 border-white ring-4 ring-gray-100"
                          onError={(e) => {
                            // Fallback to avatar if image fails to load
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        {/* Fallback avatar (hidden by default) */}
                        <div className="w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg hidden">
                          <Users className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Users className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                    <Badge className={`${getRoleColor(member.role)} border`}>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </div>
                    </Badge>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-600 text-center leading-relaxed mb-4">
                    {member.bio}
                  </p>

                  {/* Social Links - LinkedIn & Instagram Only */}
                  {member.socialLinks && (member.socialLinks.linkedin || member.socialLinks.instagram) && (
                    <div className="flex justify-center gap-3 pt-4 border-t border-gray-100">
                      {member.socialLinks.linkedin && (
                        <a 
                          href={member.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-all duration-300 p-2 rounded-full hover:bg-blue-50 hover:scale-110 transform hover:shadow-md"
                          title="LinkedIn"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                      {member.socialLinks.instagram && (
                        <a 
                          href={member.socialLinks.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-800 transition-all duration-300 p-2 rounded-full hover:bg-pink-50 hover:scale-110 transform hover:shadow-md"
                          title="Instagram"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.928-.875-1.418-2.026-1.418-3.323s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.323z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
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
