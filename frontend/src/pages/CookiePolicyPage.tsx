import { Card, CardContent } from "@/components/ui/card";
import { Cookie, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const CookiePolicyPage = () => {
  const handleDownload = () => {
    // Redirect to Google Drive link for Cookie Policy
    window.open("https://drive.google.com/file/d/3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r/view?usp=sharing", "_blank");
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
                <Cookie className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Cookie <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              This policy explains how we use cookies and tracking technologies on our website.
            </p>
            <div className="mt-6">
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
                  <p className="text-gray-600">
                    Cookies are small text files that are stored on your device when you visit websites. 
                    They are widely used to make websites work more efficiently and to provide information 
                    to the owners of the site.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
                  <p className="text-gray-600 mb-4">
                    We use cookies to enhance your experience on our website. Cookies help us:
                  </p>
                  <ul className="space-y-2 text-gray-600 list-disc list-inside">
                    <li>Remember your preferences and settings</li>
                    <li>Understand how you use our website</li>
                    <li>Improve website performance and functionality</li>
                    <li>Provide personalized content and recommendations</li>
                    <li>Analyze website traffic and usage patterns</li>
                  </ul>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Essential Cookies</h3>
                      <p className="text-gray-600 mb-2">
                        These cookies are necessary for the website to function and cannot be switched off in our systems. 
                        They are usually only set in response to actions made by you which amount to a request for services, 
                        such as setting your privacy preferences, logging in or filling in forms.
                      </p>
                      <ul className="space-y-1 text-gray-600 text-sm list-disc list-inside">
                        <li>Session management</li>
                        <li>Authentication</li>
                        <li>Security features</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance Cookies</h3>
                      <p className="text-gray-600 mb-2">
                        These cookies allow us to count visits and traffic sources so we can measure and improve the performance 
                        of our site. They help us to know which pages are the most and least popular and see how visitors move 
                        around the site.
                      </p>
                      <ul className="space-y-1 text-gray-600 text-sm list-disc list-inside">
                        <li>Site usage analytics</li>
                        <li>Load time measurements</li>
                        <li>Error tracking</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Functionality Cookies</h3>
                      <p className="text-gray-600 mb-2">
                        These cookies enable the website to provide enhanced functionality and personalization. 
                        They may be set by us or by third party providers whose services we have added to our pages.
                      </p>
                      <ul className="space-y-1 text-gray-600 text-sm list-disc list-inside">
                        <li>Language preferences</li>
                        <li>Regional settings</li>
                        <li>Social media features</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Targeting Cookies</h3>
                      <p className="text-gray-600 mb-2">
                        These cookies may be set through our site by our advertising partners. They may be used by those 
                        companies to build a profile of your interests and show you relevant adverts on other sites. 
                        They do not store directly personal information, but are based on uniquely identifying your browser 
                        and internet device.
                      </p>
                      <ul className="space-y-1 text-gray-600 text-sm list-disc list-inside">
                        <li>Personalized advertising</li>
                        <li>Interest-based content</li>
                        <li>Campaign measurement</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
                  <p className="text-gray-600 mb-4">
                    We may use third-party services that use cookies to collect information about your online activities 
                    across different websites. These include:
                  </p>
                  <ul className="space-y-2 text-gray-600 list-disc list-inside">
                    <li>Google Analytics for website analytics</li>
                    <li>Social media platforms for sharing features</li>
                    <li>Payment processors for donation transactions</li>
                    <li>Email marketing platforms for newsletter subscriptions</li>
                  </ul>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      You can control and/or delete cookies as you wish. You can delete all cookies that are already on your 
                      device and you can set most browsers to prevent them from being placed. If you do this, however, you 
                      may have to manually adjust some preferences every time you visit a site and some services and 
                      functionalities may not work.
                    </p>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Browser Settings</h3>
                      <p className="text-gray-600">
                        Most web browsers allow you to control cookies through their settings preferences. However, 
                        if you limit the ability of websites to set cookies, you may worsen your overall user experience, 
                        since it will no longer be personalized to you. It may also stop you from saving customized 
                        settings like login information.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Cookie Consent</h3>
                      <p className="text-gray-600">
                        When you first visit our website, you will be presented with a cookie consent banner. 
                        You can choose to accept or reject non-essential cookies. You can change your preferences 
                        at any time by clicking on the cookie settings link in the footer of our website.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
                  <p className="text-gray-600">
                    We may update this Cookie Policy from time to time. We will notify you of any changes by posting 
                    the new Cookie Policy on this page and updating the "Last Updated" date below.
                  </p>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-800 font-medium">Last Updated: September 16, 2025</p>
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

export default CookiePolicyPage;