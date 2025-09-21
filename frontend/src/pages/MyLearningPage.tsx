import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BookOpen, 
  Video, 
  FileText, 
  Award, 
  Clock, 
  CheckCircle, 
  Play, 
  Download,
  ExternalLink,
  Star,
  Users,
  Lightbulb,
  Target,
  TrendingUp,
  Globe,
  Code,
  Smartphone,
  Laptop,
  Monitor
} from "lucide-react";

const MyLearningPage = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Learning resources data
  const learningResources = [
    {
      id: 1,
      title: "Introduction to Digital Literacy",
      description: "Learn the basics of using computers, internet, and digital tools effectively.",
      category: "digital-literacy",
      type: "course",
      duration: "2 hours",
      level: "beginner",
      rating: 4.8,
      students: 1250,
      thumbnail: "/api/placeholder/300/200",
      isCompleted: false,
      progress: 0
    },
    {
      id: 2,
      title: "Basic Computer Skills for Beginners",
      description: "Master essential computer operations, file management, and basic software usage.",
      category: "computer-skills",
      type: "course",
      duration: "3 hours",
      level: "beginner",
      rating: 4.9,
      students: 2100,
      thumbnail: "/api/placeholder/300/200",
      isCompleted: false,
      progress: 25
    },
    {
      id: 3,
      title: "Internet Safety and Security",
      description: "Learn how to protect yourself online and recognize common cyber threats.",
      category: "cybersecurity",
      type: "course",
      duration: "1.5 hours",
      level: "intermediate",
      rating: 4.7,
      students: 1800,
      thumbnail: "/api/placeholder/300/200",
      isCompleted: true,
      progress: 100
    },
    {
      id: 4,
      title: "Microsoft Office Basics",
      description: "Get started with Word, Excel, and PowerPoint for productivity.",
      category: "productivity",
      type: "course",
      duration: "4 hours",
      level: "beginner",
      rating: 4.6,
      students: 3200,
      thumbnail: "/api/placeholder/300/200",
      isCompleted: false,
      progress: 0
    },
    {
      id: 5,
      title: "Programming Fundamentals",
      description: "Introduction to programming concepts and basic coding skills.",
      category: "programming",
      type: "course",
      duration: "6 hours",
      level: "intermediate",
      rating: 4.8,
      students: 950,
      thumbnail: "/api/placeholder/300/200",
      isCompleted: false,
      progress: 60
    },
    {
      id: 6,
      title: "Mobile App Development",
      description: "Learn to create mobile applications for Android and iOS.",
      category: "programming",
      type: "course",
      duration: "8 hours",
      level: "advanced",
      rating: 4.9,
      students: 750,
      thumbnail: "/api/placeholder/300/200",
      isCompleted: false,
      progress: 0
    }
  ];

  const quickTips = [
    {
      id: 1,
      title: "Keyboard Shortcuts",
      description: "Essential keyboard shortcuts to boost your productivity",
      icon: <Code className="w-6 h-6" />,
      category: "productivity"
    },
    {
      id: 2,
      title: "File Organization",
      description: "Best practices for organizing your digital files",
      icon: <FileText className="w-6 h-6" />,
      category: "computer-skills"
    },
    {
      id: 3,
      title: "Online Research",
      description: "How to find reliable information on the internet",
      icon: <Globe className="w-6 h-6" />,
      category: "digital-literacy"
    },
    {
      id: 4,
      title: "Password Security",
      description: "Create strong passwords and manage them safely",
      icon: <Target className="w-6 h-6" />,
      category: "cybersecurity"
    }
  ];

  const categories = [
    { id: "all", label: "All Courses", icon: <BookOpen className="w-4 h-4" /> },
    { id: "digital-literacy", label: "Digital Literacy", icon: <Globe className="w-4 h-4" /> },
    { id: "computer-skills", label: "Computer Skills", icon: <Laptop className="w-4 h-4" /> },
    { id: "programming", label: "Programming", icon: <Code className="w-4 h-4" /> },
    { id: "productivity", label: "Productivity", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "cybersecurity", label: "Cybersecurity", icon: <Target className="w-4 h-4" /> }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const filteredResources = selectedCategory === "all" 
    ? learningResources 
    : learningResources.filter(resource => resource.category === selectedCategory);

  const completedCount = learningResources.filter(r => r.isCompleted).length;
  const inProgressCount = learningResources.filter(r => r.progress > 0 && r.progress < 100).length;
  const totalProgress = learningResources.reduce((sum, r) => sum + r.progress, 0) / learningResources.length;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hero-bg to-request-highlight flex items-center justify-center">
        <Card className="donation-card p-8">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please log in to access learning resources</h2>
            <p className="text-muted-foreground">You need to be logged in to view your learning dashboard.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hero-bg to-request-highlight">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
              <p className="text-gray-600">Enhance your digital skills and knowledge</p>
            </div>
          </div>
        </div>

        {/* Learning Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="donation-card text-center">
            <CardContent className="p-6">
              <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{learningResources.length}</h3>
              <p className="text-sm text-gray-600">Total Courses</p>
            </CardContent>
          </Card>
          
          <Card className="donation-card text-center">
            <CardContent className="p-6">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{completedCount}</h3>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
          
          <Card className="donation-card text-center">
            <CardContent className="p-6">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{inProgressCount}</h3>
              <p className="text-sm text-gray-600">In Progress</p>
            </CardContent>
          </Card>
          
          <Card className="donation-card text-center">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{Math.round(totalProgress)}%</h3>
              <p className="text-sm text-gray-600">Overall Progress</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses">All Courses</TabsTrigger>
            <TabsTrigger value="quick-tips">Quick Tips</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    {category.icon}
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="donation-card hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(resource.type)}
                        <Badge className={getLevelColor(resource.level)}>
                          {resource.level}
                        </Badge>
                      </div>
                      {resource.isCompleted && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {resource.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {resource.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {resource.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {resource.students}
                      </div>
                    </div>

                    {resource.progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{resource.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${resource.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        variant={resource.isCompleted ? "outline" : "default"}
                        disabled={resource.isCompleted}
                      >
                        {resource.isCompleted ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Completed
                          </>
                        ) : resource.progress > 0 ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Continue
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Course
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quick-tips">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickTips.map((tip) => (
                <Card key={tip.id} className="donation-card hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center text-white">
                        {tip.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{tip.description}</p>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="space-y-6">
              <Card className="donation-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Your Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-green-800">First Course Completed</h4>
                        <p className="text-sm text-green-600">Completed your first learning course</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Lightbulb className="w-8 h-8 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-blue-800">Digital Explorer</h4>
                        <p className="text-sm text-blue-600">Completed 3 digital literacy courses</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <Code className="w-8 h-8 text-purple-600" />
                      <div>
                        <h4 className="font-semibold text-purple-800">Code Learner</h4>
                        <p className="text-sm text-purple-600">Started programming journey</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyLearningPage;
