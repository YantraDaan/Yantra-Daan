import { Card, CardContent } from "@/components/ui/card";
import { Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicyPage = () => {
  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .min-h-screen {
            min-height: auto;
          }
          .bg-gradient-to-br {
            background: white !important;
          }
          .print-page-break {
            page-break-before: always;
          }
        }
      `}</style>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 to-yellow-100/20 rounded-3xl transform -rotate-1"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-green-100">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-yellow-500 p-4 rounded-full">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Privacy <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
            <div className="mt-6 no-print">
              <Button onClick={handleDownload} className="btn-hero">
                <Download className="w-5 h-5 mr-2" />
                Download Policy
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Personal Information</h3>
                      <p className="text-gray-600">
                        When you register on our site, we collect your name, email address, phone number, and postal address. 
                        For donors, we may also collect information about the devices you wish to donate.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Usage Data</h3>
                      <p className="text-gray-600">
                        We collect information about how you interact with our website, including IP address, browser type, 
                        pages visited, time spent on pages, and other diagnostic data.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Device Information</h3>
                      <p className="text-gray-600">
                        For device donations, we collect technical specifications and condition information to ensure 
                        proper refurbishment and distribution.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mb-12 print-page-break">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                  <ul className="space-y-3 text-gray-600 list-disc list-inside">
                    <li>To facilitate device donations and distributions</li>
                    <li>To communicate with you about your donations or requests</li>
                    <li>To verify your identity for security purposes</li>
                    <li>To improve our website and services</li>
                    <li>To comply with legal obligations</li>
                    <li>To send you updates about our programs (with your consent)</li>
                  </ul>
                </section>

                <section className="mb-12 print-page-break">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Protection</h2>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      We implement appropriate security measures to protect your personal information, including:
                    </p>
                    <ul className="space-y-2 text-gray-600 list-disc list-inside">
                      <li>Encrypted data transmission (SSL/TLS)</li>
                      <li>Secure server infrastructure</li>
                      <li>Regular security audits</li>
                      <li>Access controls and authentication</li>
                      <li>Data backup and recovery procedures</li>
                    </ul>
                    <p className="text-gray-600">
                      All device data is securely wiped before refurbishment and distribution to ensure your privacy.
                    </p>
                  </div>
                </section>

                <section className="mb-12 print-page-break">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sharing</h2>
                  <p className="text-gray-600 mb-4">
                    We do not sell, trade, or rent your personal information to third parties. We may share your information with:
                  </p>
                  <ul className="space-y-3 text-gray-600 list-disc list-inside">
                    <li>Trusted partners who assist in our operations (with strict confidentiality agreements)</li>
                    <li>Recipients of donated devices (only necessary information for distribution)</li>
                    <li>Legal authorities when required by law</li>
                    <li>Service providers who help us operate our website and programs</li>
                  </ul>
                </section>

                <section className="mb-12 print-page-break">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      You have the right to:
                    </p>
                    <ul className="space-y-2 text-gray-600 list-disc list-inside">
                      <li>Access your personal information</li>
                      <li>Correct inaccurate information</li>
                      <li>Request deletion of your data</li>
                      <li>Object to processing of your data</li>
                      <li>Withdraw consent at any time</li>
                      <li>Data portability</li>
                    </ul>
                    <p className="text-gray-600">
                      To exercise these rights, please contact us at privacy@yantradaan.org
                    </p>
                  </div>
                </section>

                <section className="mb-12 print-page-break">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies</h2>
                  <p className="text-gray-600">
                    We use cookies to enhance your experience on our website. For more information, 
                    please see our <a href="/cookie-policy" className="text-green-600 hover:underline">Cookie Policy</a>.
                  </p>
                </section>

                <section className="print-page-break">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                  <p className="text-gray-600">
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-800 font-medium">YantraDaan Foundation</p>
                    <p className="text-gray-600">Email: privacy@yantradaan.org</p>
                    <p className="text-gray-600">Phone: +91-XXXXXXXXXX</p>
                    <p className="text-gray-600">Address: [Organization Address]</p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;