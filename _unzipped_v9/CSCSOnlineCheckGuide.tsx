import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  Smartphone, 
  Computer, 
  QrCode, 
  NfcIcon,
  Search,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Info,
  Shield,
  Database
} from "lucide-react";

export function CSCSOnlineCheckGuide() {
  const [selectedMethod, setSelectedMethod] = useState<'web' | 'app' | 'api'>('web');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-6 w-6 mr-2 text-green-600" />
            How CSCS Cards Are Checked Online - Official Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-blue-800">
                <p className="font-semibold mb-1">CSCS Smart Check - Official Verification System</p>
                <p className="text-sm">
                  The only unified platform that verifies all 2.3 million CSCS cards across 38 schemes. 
                  Replaced CSCS Go Smart in April 2024.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Three Official Methods */}
      <Tabs value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="web" className="flex items-center space-x-2">
            <Computer className="h-4 w-4" />
            <span>Web Portal</span>
          </TabsTrigger>
          <TabsTrigger value="app" className="flex items-center space-x-2">
            <Smartphone className="h-4 w-4" />
            <span>Mobile App</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>API Integration</span>
          </TabsTrigger>
        </TabsList>

        {/* Web Portal Method */}
        <TabsContent value="web" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Official CSCS Smart Check Web Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">How to Access:</h4>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <p className="text-sm font-mono">cscssmartcheck.co.uk</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Who Can Use:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• HR departments</li>
                      <li>• Site managers</li>
                      <li>• Office-based staff</li>
                      <li>• Pre-registration teams</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Features:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Manual card number entry</li>
                      <li>• Batch verification</li>
                      <li>• Export verification results</li>
                      <li>• Audit trail maintenance</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Verification Process:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</div>
                        <span>Visit cscssmartcheck.co.uk</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</div>
                        <span>Enter CSCS card number</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">3</div>
                        <span>Add cardholder name (optional)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">4</div>
                        <span>Get real-time verification results</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Official Web Portal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile App Method */}
        <TabsContent value="app" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="h-5 w-5 mr-2" />
                CSCS Smart Check Mobile App
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Download:</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Smartphone className="h-4 w-4 mr-2" />
                        App Store (iOS)
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Smartphone className="h-4 w-4 mr-2" />
                        Google Play (Android)
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Perfect For:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Site gate security</li>
                      <li>• Mobile verification teams</li>
                      <li>• On-site supervisors</li>
                      <li>• Quick card checks</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Verification Methods:</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <QrCode className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="font-medium">QR Code Scanning</p>
                          <p className="text-sm text-gray-600">Camera-based instant verification</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <NfcIcon className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-medium">NFC Tap-to-Verify</p>
                          <p className="text-sm text-gray-600">Contactless card reading</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Search className="h-6 w-6 text-orange-600" />
                        <div>
                          <p className="font-medium">Manual Entry</p>
                          <p className="text-sm text-gray-600">Type card number manually</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-green-800">
                    <p className="font-semibold mb-1">Works Offline</p>
                    <p className="text-sm">
                      App stores recent verification data and syncs when connection is restored. 
                      Perfect for remote construction sites.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Integration Method */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                CSCS Smart Check API Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">How WorkDoc360 Uses It:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Real-time verification during upload</li>
                      <li>• Automated compliance checking</li>
                      <li>• Bulk verification processing</li>
                      <li>• Integration with existing systems</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Becoming an IT Partner:</h4>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <p className="text-sm font-mono mb-2">ITPartner@cscs.co.uk</p>
                      <p className="text-sm text-gray-600">Contact CSCS to become approved API partner</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">API Capabilities:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>All 2.3 million cards across 38 schemes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Real-time database validation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Fraud detection and alerts</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>GDPR compliant data handling</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Enterprise Integration:</strong> WorkDoc360 is implementing official 
                      CSCS Smart Check API integration for seamless verification within your 
                      compliance management workflow.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Your Card Verification Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
            Your Green Scaffolding Labourer Card - Verification Result
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">What Would Happen Online:</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Card number recognized in CSCS database</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Cardholder details confirmed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Card type: Green CSCS Scaffolding Labourer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Status: EXPIRED</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Official CSCS Response:</h4>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="text-red-800 text-sm">
                    <p className="font-medium">Card Verification Failed</p>
                    <p>This card expired on 31/12/2024</p>
                    <p>Cardholder requires renewal before site access</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mt-4">
            <h4 className="font-semibold text-amber-800 mb-2">How Construction Sites Use This:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Gate security scans QR code or taps NFC on card</li>
              <li>• System immediately shows EXPIRED status</li>
              <li>• Access is denied automatically</li>
              <li>• Worker is directed to renew card before returning</li>
              <li>• Incident is logged for compliance records</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Try It Yourself */}
      <Card>
        <CardHeader>
          <CardTitle>Try The Official CSCS Smart Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            You can verify your card right now using the official CSCS systems:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Computer className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Web Portal</p>
                <p className="text-xs text-gray-600">cscssmartcheck.co.uk</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Smartphone className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Mobile App</p>
                <p className="text-xs text-gray-600">Search "CSCS Smart Check"</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Shield className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">WorkDoc360</p>
                <p className="text-xs text-gray-600">Integrated verification</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}