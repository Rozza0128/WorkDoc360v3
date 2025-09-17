import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useState } from "react";
import { 
  HardHat, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  ArrowLeft,
  Send,
  MessageSquare,
  Headphones,
  FileQuestion
} from "lucide-react";

export default function Contact() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert("Thank you for your message. We'll get back to you within 24 hours!");
    setFormData({
      name: "",
      email: "",
      company: "",
      phone: "",
      subject: "",
      message: ""
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/")}
                className="text-slate-600 hover:text-blue-600"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <HardHat className="text-construction-orange text-2xl" />
              <img 
                src="/src/assets/workdoc360-logo.png" 
                alt="WorkDoc360" 
                className="h-8 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="bg-construction-orange text-white mb-4">Contact Us</Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-6">
            Get in Touch with Our
            <span className="block text-blue-600">Construction Compliance Experts</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Have questions about WorkDoc360? Need help with implementation? Our team of construction 
            industry experts is here to help you succeed.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <Headphones className="mr-2 h-5 w-5 text-construction-orange" />
                  Customer Support
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <div className="font-semibold text-slate-900">Phone Support</div>
                      <div className="text-slate-600">0800 123 4567</div>
                      <div className="text-sm text-slate-500">Monday - Friday, 8:00 AM - 6:00 PM</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <div className="font-semibold text-slate-900">Email Support</div>
                      <div className="text-slate-600">support@workdoc360.com</div>
                      <div className="text-sm text-slate-500">Response within 4 hours</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <div className="font-semibold text-slate-900">Live Chat</div>
                      <div className="text-slate-600">Available on website</div>
                      <div className="text-sm text-slate-500">Monday - Friday, 9:00 AM - 5:00 PM</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <FileQuestion className="mr-2 h-5 w-5 text-construction-orange" />
                  Sales Enquiries
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <div className="font-semibold text-slate-900">Sales Team</div>
                      <div className="text-slate-600">0800 987 6543</div>
                      <div className="text-sm text-slate-500">Monday - Friday, 9:00 AM - 5:00 PM</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <div className="font-semibold text-slate-900">Sales Email</div>
                      <div className="text-slate-600">sales@workdoc360.com</div>
                      <div className="text-sm text-slate-500">Quote requests and demos</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-construction-orange" />
                  Head Office
                </h3>
                <div className="text-slate-600">
                  <div className="font-semibold">WorkDoc360 Limited</div>
                  <div>123 Construction House</div>
                  <div>Manchester Business Park</div>
                  <div>Manchester M1 2AB</div>
                  <div>United Kingdom</div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="text-sm text-slate-500">
                    <div className="font-semibold">Company Registration:</div>
                    <div>Company No: 12345678</div>
                    <div>VAT No: GB123456789</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company Name
                      </label>
                      <Input
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What can we help you with?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your requirements, current challenges, or questions about WorkDoc360..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      * Required fields
                    </div>
                    <Button 
                      type="submit"
                      size="lg"
                      className="bg-construction-orange hover:bg-orange-600 text-white"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </div>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-200">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-blue-900">Response Time</div>
                        <div className="text-sm text-blue-700">
                          We typically respond to all enquiries within 4 hours during business hours. 
                          For urgent support issues, please call our support line.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Quick Links */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Common Questions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left"
              onClick={() => setLocation("/cscs-verification")}
            >
              <div>
                <div className="font-semibold">How does the AI work?</div>
                <div className="text-sm text-slate-600">See our interactive demo</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left"
              onClick={() => setLocation("/#pricing")}
            >
              <div>
                <div className="font-semibold">What are the pricing plans?</div>
                <div className="text-sm text-slate-600">View pricing options</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left"
              onClick={() => setLocation("/about")}
            >
              <div>
                <div className="font-semibold">Who is behind WorkDoc360?</div>
                <div className="text-sm text-slate-600">Learn about our team</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}