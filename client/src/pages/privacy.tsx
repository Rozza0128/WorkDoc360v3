import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardHeader className="bg-slate-900 text-white">
            <CardTitle className="text-2xl">Privacy Policy</CardTitle>
            <p className="text-slate-300">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-slate-700 mb-4">
                WorkDoc360 Limited ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, and safeguard your information when you use our construction compliance 
                platform and AI-powered document generation services.
              </p>
            </section>

            <Separator />

            {/* Data Collection */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Personal Information</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-1 mb-4">
                <li>Name, email address, and contact details</li>
                <li>Company information and business details</li>
                <li>Trade specialisation and industry role</li>
                <li>Payment and billing information</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Technical Information</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-1 mb-4">
                <li>IP addresses, browser type, and device information</li>
                <li>Usage patterns and feature interactions</li>
                <li>Log files and analytical data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mb-2">Construction-Specific Data</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>CSCS card information and certification data</li>
                <li>Risk assessments and method statements</li>
                <li>Compliance documentation and safety records</li>
                <li>Site information and project details</li>
              </ul>
            </section>

            <Separator />

            {/* Data Use */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Provide and maintain our AI-powered compliance services</li>
                <li>Generate construction-specific documentation and reports</li>
                <li>Process payments and manage your account</li>
                <li>Send compliance alerts and renewal notifications</li>
                <li>Improve our AI algorithms and service quality</li>
                <li>Provide customer support and technical assistance</li>
                <li>Comply with legal obligations and regulatory requirements</li>
              </ul>
            </section>

            <Separator />

            {/* Data Sharing */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">4. Information Sharing</h2>
              <p className="text-slate-700 mb-4">
                We do not sell or rent your personal information. We may share your information only in these circumstances:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Service Providers:</strong> Third-party vendors who assist in service delivery</li>
                <li><strong>Legal Requirements:</strong> When required by law or regulatory authorities</li>
                <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                <li><strong>Consent:</strong> When you explicitly authorise disclosure</li>
              </ul>
            </section>

            <Separator />

            {/* Data Security */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">5. Data Security</h2>
              <p className="text-slate-700 mb-4">
                We implement appropriate technical and organisational measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and employee training</li>
                <li>Secure cloud infrastructure with backup systems</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
            </section>

            <Separator />

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">6. Your Rights (UK GDPR)</h2>
              <p className="text-slate-700 mb-4">Under UK data protection law, you have the right to:</p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Access:</strong> Request copies of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
                <li><strong>Automated Decision-Making:</strong> Rights regarding AI-driven decisions</li>
              </ul>
            </section>

            <Separator />

            {/* Contact */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">7. Contact Us</h2>
              <p className="text-slate-700">
                For privacy-related inquiries or to exercise your rights:
                <br />
                <strong>Email:</strong> privacy@workdoc360.com
                <br />
                <strong>Data Protection Officer:</strong> dpo@workdoc360.com
                <br />
                <strong>Address:</strong> WorkDoc360 Limited, United Kingdom
              </p>
            </section>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}