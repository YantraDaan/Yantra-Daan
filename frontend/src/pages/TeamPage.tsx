import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Heart,
  Target,
  Star,
  Building2,
  Users2,
  Zap,
  UserCheck
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
  const [hoveredMember, setHoveredMember] = useState<TeamMember | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  // Helper function to construct full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it's a relative path, construct the full URL
    return `${config.apiUrl}${imagePath}`;
  };

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

  const handleMemberHover = (member: TeamMember, e: React.MouseEvent) => {
    setHoveredMember(member);
    setPopupPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMemberLeave = () => {
    setHoveredMember(null);
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member._id}
                className="relative"
                onClick={(e) => handleMemberHover(member, e)}
                onMouseLeave={handleMemberLeave}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white h-full overflow-hidden">
                  {/* Full card image */}
                  <div className="relative h-48 overflow-hidden">
                    {member.avatar ? (  
                      <img 
                        src={getImageUrl(member.avatar)} 
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          // Fallback to gradient if image fails to load
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                        <Users className="w-16 h-16 text-white" />
                      </div>
                    )}
                    {/* Fallback gradient (hidden by default) */}
                    <div className="w-full h-full bg-gradient-to-r from-primary to-accent hidden items-center justify-center">
                      <Users className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  
                  {/* Member info */}
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{member.name}</h3>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(member.role)}`}>
                      <div className="flex items-center gap-1.5">
                        {getRoleIcon(member.role)}
                        <span className="truncate">{member.role}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popup for click member */}
      {hoveredMember && (
        <div 
          className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-sm w-full w-100"
          style={{ 
            left: `${popupPosition.x + 20}px`, 
            top: `${popupPosition.y - 20}px`,
            transform: 'translateY(-50%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div className="flex items-start space-x-4">  
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">{hoveredMember.name}</h3>
              <p className="text-sm font-medium text-primary mb-2">{hoveredMember.role}</p>
              
              {/* Bio */}
              <p className="text-sm text-gray-600 mb-3">
                {hoveredMember.bio || "No bio available for this team member."}
              </p>
              
              {/* Social Links */}
              {hoveredMember.socialLinks && (
                <div className="flex space-x-3">
                  {hoveredMember.socialLinks.linkedin && (
                    <a 
                      href={hoveredMember.socialLinks.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                  {hoveredMember.socialLinks.instagram && (
                    <a 
                      href={hoveredMember.socialLinks.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-800 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.928-.875-1.418-2.026-1.418-3.323s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.323z"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;