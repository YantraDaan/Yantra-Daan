import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Heart, Users, Award, ArrowRight, X, Play } from 'lucide-react';

const Gallery = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const galleryImages = [
    {
      id: 1,
      title: "Tech Donation Drive",
      description: "Community members donating laptops and tablets to students in need. Over 200 devices collected in a single day at our Delhi center.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "events",
      impact: "200+ devices collected",
      date: "March 2024"
    },
    {
      id: 2,
      title: "Student Success Stories",
      description: "Students learning coding skills with donated computers at our Sanjay Colony learning center.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "impact",
      impact: "50+ students trained",
      date: "February 2024"
    },
    {
      id: 3,
      title: "Device Refurbishment Workshop",
      description: "Volunteers and technical experts refurbishing donated devices for redistribution to deserving students.",
      image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "operations",
      impact: "150+ devices refurbished",
      date: "January 2024"
    },
    {
      id: 4,
      title: "Community Learning Centers",
      description: "Modern learning spaces equipped with donated devices, providing digital education to underserved communities.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "facilities",
      impact: "5 centers established",
      date: "December 2023"
    },
    {
      id: 5,
      title: "Corporate Partnerships",
      description: "Collaborative initiatives with leading companies contributing to digital inclusion and sustainable technology practices.",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "partnerships",
      impact: "15+ corporate partners",
      date: "November 2023"
    },
    {
      id: 6,
      title: "Mobile Tech Units",
      description: "Bringing technology access directly to remote communities through our mobile outreach programs.",
      image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "outreach",
      impact: "25+ villages reached",
      date: "October 2023"
    },
    {
      id: 7,
      title: "Digital Literacy Training",
      description: "Comprehensive training programs teaching essential digital skills to students and community members.",
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      category: "training",
      impact: "300+ people trained",
      date: "September 2023"
    },
    {
      id: 8,
      title: "Women Empowerment Program",
      description: "Special initiatives focused on providing technology access and training to women in rural communities.",
      image: "https://images.unsplash.com/photo-1594736797933-d0a9ba4b4d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      category: "impact",
      impact: "100+ women empowered",
      date: "August 2023"
    }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: Eye },
    { id: 'events', name: 'Events', icon: Users },
    { id: 'impact', name: 'Impact', icon: Heart },
    { id: 'operations', name: 'Operations', icon: Award },
    { id: 'facilities', name: 'Facilities', icon: Award },
    { id: 'partnerships', name: 'Partnerships', icon: Users },
    { id: 'outreach', name: 'Outreach', icon: Users },
    { id: 'training', name: 'Training', icon: Award }
  ];

  const filteredImages = activeCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  const openModal = (image: any) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-white via-gray-50/50 to-primary/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-accent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-6 py-3 mb-6">
            <Eye className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Gallery</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-6 leading-tight">
            Our Impact in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Witness the transformative power of technology donations as we bridge the digital divide 
            and create opportunities in communities across India.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto"></div>
        </div>

        {/* Enhanced Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.slice(0, 4).map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full transition-all duration-300 font-medium ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg scale-105'
                  : 'border-gray-200 hover:border-primary hover:bg-primary/5'
              }`}
            >
              <category.icon className="w-4 h-4 mr-2" />
              {category.name}
            </Button>
          ))}
        </div>

        {/* Enhanced Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          {filteredImages.map((item, index) => (
            <Card
              key={item.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 bg-white"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => openModal(item)}
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Enhanced Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
                  hoveredIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-300 translate-y-4 group-hover:translate-y-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                        {item.date}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-red-400" />
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-1">{item.title}</h3>
                    <p className="text-gray-200 text-sm mb-3 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                      <span className="text-xs bg-gradient-to-r from-primary to-accent px-3 py-1 rounded-full text-white font-medium">
                        {item.impact}
                      </span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* View Icon */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Enhanced Call to Action */}
        <div className="text-center">
          <Card className="donation-card inline-block">
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Be Part of Our Story</h3>
                  <p className="text-gray-600 text-sm">Your donation can create the next success story</p>
                </div>
                <Button className="btn-hero ml-4">
                  Donate Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Modal */}
      {showModal && selectedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  {selectedImage.date}
                </span>
                <span className="text-sm bg-gradient-to-r from-primary to-accent text-white px-3 py-1 rounded-full font-medium">
                  {selectedImage.impact}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">{selectedImage.title}</h3>
              <p className="text-gray-600 leading-relaxed text-lg">{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;