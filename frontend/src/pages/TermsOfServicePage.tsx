import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfServicePage = () => {
  const handleDownload = () => {
    // Redirect to Google Drive link for Terms of Service
    window.open("https://drive.google.com/file/d/2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q/view?usp=sharing", "_blank");
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
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Terms of <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">Service</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              These terms govern your use of our website and services. Please read them carefully.
            </p>
            <div className="mt-6">
              <Button onClick={handleDownload} className="btn-hero">
                <Download className="w-5 h-5 mr-2" />
                Download Terms
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="donation-card mb-8 overflow-hidden">
            <CardContent className="p-8">
              <div className="prose max-w-none">
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
                  <p className="text-gray-600 mb-4">
                    By accessing or using the YantraDaan Foundation website and services, you agree to be bound by these Terms of Service 
                    and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using 
                    or accessing this site.
                  </p>
                  <p className="text-gray-600">
                    These terms apply to all visitors, users, and others who access or use our service.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Description of Service</h2>
                  <p className="text-gray-600 mb-4">
                    YantraDaan Foundation provides a platform to facilitate the donation and distribution of electronic devices 
                    to students and educational institutions in need. Our services include:
                  </p>
                  <ul className="space-y-2 text-gray-600 list-disc list-inside">
                    <li>Device donation collection and processing</li>
                    <li>Device refurbishment and quality assurance</li>
                    <li>Device distribution to verified recipients</li>
                    <li>Educational support and training programs</li>
                    <li>Community engagement and awareness</li>
                  </ul>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">User Responsibilities</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Donors</h3>
                      <ul className="space-y-2 text-gray-600 list-disc list-inside">
                        <li>Ensure donated devices are in working condition or repairable</li>
                        <li>Provide accurate information about device specifications and condition</li>
                        <li>Transfer ownership of devices to YantraDaan Foundation</li>
                        <li>Understand that donated devices will be refurbished and distributed</li>
                        <li>Comply with all applicable laws regarding device donation</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Recipients</h3>
                      <ul className="space-y-2 text-gray-600 list-disc list-inside">
                        <li>Provide accurate information for verification purposes</li>
                        <li>Use devices for educational purposes only</li>
                        <li>Participate in required training programs</li>
                        <li>Return devices if they are no longer needed or if circumstances change</li>
                        <li>Report any issues with received devices promptly</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
                  <p className="text-gray-600 mb-4">
                    Unless otherwise stated, YantraDaan Foundation owns the intellectual property rights for all material on this website. 
                    All intellectual property rights are reserved.
                  </p>
                  <p className="text-gray-600">
                    You may view and/or print pages for your personal use subject to restrictions set in these terms of service.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitations of Liability</h2>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      In no event shall YantraDaan Foundation or its suppliers be liable for any consequential, incidental, 
                      indirect, or special damages arising out of the use or inability to use our services.
                    </p>
                    <p className="text-gray-600">
                      We do not guarantee that our services will be uninterrupted, timely, secure, or error-free.
                    </p>
                    <p className="text-gray-600">
                      We are not liable for any loss or damage arising from your use of any third-party services linked to our website.
                    </p>
                  </div>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Device Warranty</h2>
                  <p className="text-gray-600 mb-4">
                    All donated devices are provided "as is" without warranty of any kind, either express or implied. 
                    While we strive to ensure all devices are in good working condition, we do not guarantee:
                  </p>
                  <ul className="space-y-2 text-gray-600 list-disc list-inside">
                    <li>The continued functionality of any device</li>
                    <li>The suitability of any device for a particular purpose</li>
                    <li>The absence of defects or errors</li>
                    <li>The accuracy of any device specifications</li>
                  </ul>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
                  <p className="text-gray-600">
                    We reserve the right to modify these terms at any time. Changes will be effective immediately 
                    upon posting to the website. Your continued use of the service after any such changes constitutes 
                    your acceptance of the new Terms of Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
                  <p className="text-gray-600">
                    These terms shall be governed by and construed in accordance with the laws of India, 
                    without regard to its conflict of law provisions. Any disputes arising from these terms 
                    shall be subject to the exclusive jurisdiction of the courts in [City, State].
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;