import { Card, CardContent } from "@/components/ui/card";
import { BarChart, PieChart, TrendingUp, Users, Heart, Globe, Award, Leaf, Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const TransparencyReportPage = () => {
  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 to-yellow-100/20 rounded-3xl transform -rotate-1"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-green-100">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-yellow-500 p-4 rounded-full">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Transparency <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">Report</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our commitment to transparency and accountability in all our operations and impact.
            </p>
            <div className="mt-6">
              <Button onClick={handleDownload} className="btn-hero">
                <Download className="w-5 h-5 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Financial Overview</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 bg-white/70 backdrop-blur-sm border border-green-100">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">₹</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">85%</div>
              <div className="text-gray-600 font-medium">Program Expenses</div>
              <p className="text-sm text-gray-500 mt-2">Direct impact activities</p>
            </Card>
            <Card className="text-center p-6 bg-white/70 backdrop-blur-sm border border-green-100">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">₹</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">10%</div>
              <div className="text-gray-600 font-medium">Administrative</div>
              <p className="text-sm text-gray-500 mt-2">Operational costs</p>
            </Card>
            <Card className="text-center p-6 bg-white/70 backdrop-blur-sm border border-green-100">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">₹</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">5%</div>
              <div className="text-gray-600 font-medium">Fundraising</div>
              <p className="text-sm text-gray-500 mt-2">Donor engagement</p>
            </Card>
            <Card className="text-center p-6 bg-white/70 backdrop-blur-sm border border-green-100">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600 font-medium">Efficiency</div>
              <p className="text-sm text-gray-500 mt-2">Funds to mission</p>
            </Card>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Annual Impact Report</h2>
          <Card className="donation-card overflow-hidden">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">2,500+</div>
                  <div className="text-gray-600 font-medium">Devices Donated</div>
                  <p className="text-sm text-gray-500 mt-2">15% increase from last year</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">1,200+</div>
                  <div className="text-gray-600 font-medium">Students Impacted</div>
                  <p className="text-sm text-gray-500 mt-2">20% increase from last year</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">50+</div>
                  <div className="text-gray-600 font-medium">Cities Reached</div>
                  <p className="text-sm text-gray-500 mt-2">Expansion to 5 new regions</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">1,200+</div>
                  <div className="text-gray-600 font-medium">KGS E-waste</div>
                  <p className="text-sm text-gray-500 mt-2">Collected & processed responsibly</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">850+</div>
                  <div className="text-gray-600 font-medium">Tons CO₂ Reduced</div>
                  <p className="text-sm text-gray-500 mt-2">Environmental impact</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">98%</div>
                  <div className="text-gray-600 font-medium">Success Rate</div>
                  <p className="text-sm text-gray-500 mt-2">Device refurbishment</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Program Details */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Program Breakdown</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="donation-card overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <BarChart className="w-6 h-6 mr-2 text-green-600" />
                  Device Distribution by Category
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700">Laptops</span>
                      <span className="text-gray-900 font-medium">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full" style={{width: "45%"}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700">Smartphones</span>
                      <span className="text-gray-900 font-medium">30%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full" style={{width: "30%"}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700">Tablets</span>
                      <span className="text-gray-900 font-medium">15%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full" style={{width: "15%"}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700">Accessories</span>
                      <span className="text-gray-900 font-medium">10%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full" style={{width: "10%"}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="donation-card overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <PieChart className="w-6 h-6 mr-2 text-green-600" />
                  Geographic Distribution
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700">Urban Areas</span>
                      <span className="text-gray-900 font-medium">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full" style={{width: "60%"}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700">Rural Areas</span>
                      <span className="text-gray-900 font-medium">40%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full" style={{width: "40%"}}></div>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Regions Served</h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-700">Delhi-NCR</span>
                      <span className="text-gray-900 font-medium">25%</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-700">Mumbai</span>
                      <span className="text-gray-900 font-medium">15%</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-700">Bangalore</span>
                      <span className="text-gray-900 font-medium">12%</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-700">Hyderabad</span>
                      <span className="text-gray-900 font-medium">10%</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Governance */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Governance & Accountability</h2>
          <Card className="donation-card overflow-hidden">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Certifications</h3>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>ISO 9001:2015 Certified</li>
                    <li>100% Transparency Guarantee</li>
                    <li>Registered NGO</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Board Oversight</h3>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>Independent Board of Directors</li>
                    <li>Quarterly Financial Reviews</li>
                    <li>Annual External Audit</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Compliance</h3>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>FCRA Compliant</li>
                    <li>Tax Exempt Status</li>
                    <li>Regular Compliance Audits</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact */}
        <div className="text-center">
          <Card className="donation-card overflow-hidden max-w-3xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions or Feedback?</h2>
              <p className="text-gray-600 mb-6">
                We welcome your questions about our transparency report or any aspect of our operations. 
                Please contact us for more detailed information.
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-800 font-medium">YantraDaan Foundation</p>
                <p className="text-gray-600">Email: transparency@yantradaan.org</p>
                <p className="text-gray-600">Phone: +91-XXXXXXXXXX</p>
                <p className="text-gray-600">Annual Report Available Upon Request</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TransparencyReportPage;