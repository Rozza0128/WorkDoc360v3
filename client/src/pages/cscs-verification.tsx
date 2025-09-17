import { Helmet } from "react-helmet";
import { CSCSCardVerifier } from "@/components/CSCSCardVerifier";
import { CSCSActualCardTest } from "@/components/CSCSActualCardTest";
import { ExtractedPhotoDisplay } from "@/components/ExtractedPhotoDisplay";
import { CSCSPersonnelRecords } from "@/components/CSCSPersonnelRecords";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CSCSVerificationPage() {
  return (
    <>
      <Helmet>
        <title>CSCS Card Verification | WorkDoc360</title>
        <meta name="description" content="AI-powered CSCS card verification system with fraud detection and official register checking for UK construction businesses." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                CSCS Card Verification & Personnel Management
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Complete CSCS card verification system with personnel records management for construction compliance.
              </p>
            </div>

            <Tabs defaultValue="verification" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="verification">Card Verification</TabsTrigger>
                <TabsTrigger value="records">Personnel Records</TabsTrigger>
              </TabsList>
              
              <TabsContent value="verification" className="space-y-6">
                <div className="max-w-4xl">
                  <h2 className="text-2xl font-semibold mb-4">RPA Photo Extraction - Card JW027401</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Demonstrating automated cardholder photo extraction from real Green CSCS Scaffolding Labourer card using RPA technology.
                  </p>
                  <ExtractedPhotoDisplay />
                </div>
              </TabsContent>
              
              <TabsContent value="records" className="space-y-6">
                <CSCSPersonnelRecords companyId="company_1" />
              </TabsContent>
            </Tabs>

            {/* Information Section */}
            <div className="mt-12 space-y-8">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  How AI Verification Works
                </h3>
                <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Advanced computer vision analyses card images for authenticity</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Extracts card number, holder name, expiry date, and card type automatically</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Checks security features including holograms and correct fonts</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Cross-references details with official CSCS register when available</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Provides comprehensive fraud risk assessment and recommendations</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-3">
                  Benefits for Construction Businesses
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Site Safety</h4>
                    <ul className="space-y-1 text-amber-700 dark:text-amber-300 text-sm">
                      <li>• Prevent unqualified workers on site</li>
                      <li>• Ensure all workers have valid CSCS cards</li>
                      <li>• Reduce HSE compliance risks</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Fraud Prevention</h4>
                    <ul className="space-y-1 text-amber-700 dark:text-amber-300 text-sm">
                      <li>• Detect counterfeit or fake cards</li>
                      <li>• Identify expired or suspended cards</li>
                      <li>• Protect against insurance issues</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Efficiency</h4>
                    <ul className="space-y-1 text-amber-700 dark:text-amber-300 text-sm">
                      <li>• Instant verification results</li>
                      <li>• No manual register checking required</li>
                      <li>• Automated digital record keeping</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Compliance</h4>
                    <ul className="space-y-1 text-amber-700 dark:text-amber-300 text-sm">
                      <li>• Audit trail for inspections</li>
                      <li>• Automatic renewal reminders</li>
                      <li>• CDM 2015 compliance support</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
                  Supported Card Types
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-8 bg-green-500 rounded border-2 border-green-600 mx-auto mb-2"></div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Green</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Labourer</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-8 bg-blue-500 rounded border-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Blue</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Skilled Worker</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-8 bg-yellow-400 rounded border-2 border-yellow-500 mx-auto mb-2"></div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Gold</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Supervisory</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-8 bg-gray-800 rounded border-2 border-gray-900 mx-auto mb-2"></div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Black</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Senior Manager</p>
                  </div>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-4">
                  Also supports ECS, CPCS, and NPORS cards for electrical and plant operator verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}