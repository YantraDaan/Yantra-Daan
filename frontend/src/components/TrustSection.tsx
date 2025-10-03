import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Award, Users, CheckCircle, Star, TrendingUp } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const TrustSection = () => {
  const trustMetrics = [
    {
      icon: Shield,
      title: "Verified NGO",
      description: "Registered under Section 8 of Companies Act, 2013",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Award,
      title: "5+ Years",
      description: "Trusted experience in community service",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "1000+ Lives",
      description: "Students and families impacted positively",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: CheckCircle,
      title: "100% Transparent",
      description: "Every donation tracked and verified",
      color: "from-primary to-primary-glow"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Student, Delhi University",
      content: "Thanks to Yantra Daan, I received a laptop that helped me complete my online courses during COVID-19. This device opened new opportunities for my education.",
      rating: 5
    },
    {
      name: "Rajesh Kumar",
      role: "IT Professional, Bangalore",
      content: "The process was seamless. I donated my old laptop and knew it reached someone who really needed it. It feels great to give back to the community.",
      rating: 5
    },
    {
      name: "Dr. Anita Singh",
      role: "School Principal, Mumbai",
      content: "Our school partnered with Yantra Daan to provide devices for underprivileged students. Their professionalism and commitment are truly commendable.",
      rating: 5
    },
    {
      name: "Meera Patel",
      role: "Mother of Two, Ahmedabad",
      content: "Yantra Daan helped me get a tablet for my children's online classes. Their team was supportive throughout the process and understood our needs perfectly.",
      rating: 5
    },
    {
      name: "Amit Verma",
      role: "College Student, Pune",
      content: "As a student from a low-income family, getting a refurbished laptop was a dream come true. It helped me pursue my engineering studies without worries.",
      rating: 5
    },
    {
      name: "Sunita Rao",
      role: "Retired Teacher, Hyderabad",
      content: "I donated my old smartphone and was amazed by how efficiently Yantra Daan redistributed it to someone in need. Their work is truly inspiring.",
      rating: 4
    }
  ];

  const achievements = [
    "Featured in The Hindu for digital inclusion efforts",
    "Partnership with 15+ educational institutions",
    "Zero administration fee - 100% donation reaches beneficiaries",
    "ISO certified refurbishment process"
  ];

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Autoplay functionality
  useEffect(() => {
    if (!api) {
      return;
    }

    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by <span className="gradient-text">Thousands</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our commitment to transparency, accountability, and impact has earned the trust of donors and recipients across India.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-6"></div>
        </div>

        {/* Trust Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {trustMetrics.map((metric, index) => (
            <Card key={index} className="trust-card text-center group">
              <CardContent className="p-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${metric.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <metric.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{metric.title}</h3>
                <p className="text-sm text-gray-600">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials Carousel */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">What People Say</h3>
          <div className="relative">
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="donation-card h-full">
                        <CardContent className="p-6">
                          <div className="flex items-center mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <p className="text-gray-600 mb-4 italic leading-relaxed">
                            "{testimonial.content}"
                          </p>
                          <div className="border-t pt-4">
                            <div className="font-semibold text-gray-900">{testimonial.name}</div>
                            <div className="text-sm text-gray-500">{testimonial.role}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>

        {/* Achievements & Certifications */}
        <Card className="donation-card">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Achievements</h3>
              <p className="text-gray-600">Recognition and milestones that demonstrate our commitment to excellence</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 group">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700">{achievement}</span>
                </div>
              ))}
            </div>
            
            {/* Call to Action */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-6 py-3 border border-primary/20">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-primary font-semibold">Join 1000+ satisfied donors and recipients</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default TrustSection;