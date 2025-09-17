import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  CreditCard, 
  Camera, 
  Bot, 
  CheckCircle, 
  AlertTriangle, 
  Download,
  FileImage,
  Play,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CardholderPhotoDisplay } from "./CardholderPhotoDisplay";

export function CSCSCardDemo() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [demoResult, setDemoResult] = useState<any>(null);
  const { toast } = useToast();

  const runCSCSCardDemo = async () => {
    setIsVerifying(true);
    
    // Simulate the RPA verification process for your Green CSCS card
    toast({
      title: "Starting RPA Verification",
      description: "Connecting to cscssmartcheck.co.uk...",
      variant: "default"
    });

    // Simulate the RPA process stages
    setTimeout(() => {
      toast({
        title: "RPA Process Active",
        description: "Browser automation navigating CSCS website...",
        variant: "default"
      });
    }, 1000);

    setTimeout(() => {
      toast({
        title: "Card Data Found",
        description: "Extracting cardholder photo and verification results...",
        variant: "default"
      });
    }, 3000);

    setTimeout(() => {
      toast({
        title: "Photo Extraction Complete",
        description: "Cardholder photo saved to company directory",
        variant: "default"
      });
    }, 5000);

    // Simulate final results after 6 seconds
    setTimeout(() => {
      const mockResult = {
        cardNumber: "JW027401",
        status: "expired" as const,
        holderName: "Green Card Holder",
        cardType: "CSCS Scaffolding Labourer",
        expiryDate: "2024-12-31",
        scheme: "CSCS",
        verificationTimestamp: new Date().toISOString(),
        holderPhotoBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//2Q==",
        cardImageBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCABkAKADASIAAhEBAxEB/8QAHgAAAQUBAQEBAQAAAAAAAAAAAAIDBAUGBwgJAQr/xAAqEAACAQMEAgICAQUBAAAAAAABAgMABBEFBhIhMUETUQciCBQyYXGBkf/EABkBAAMBAQEAAAAAAAAAAAAAAAECAwAEBf/EACIRAAMBAAICAgMBAQAAAAAAAAABAgMREiEEMUFhE1FxIv/aAAwDAQACEQMRAD8A+qaKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//Z",
        savedPhotoUrl: "/uploaded_assets/cardholder_photos/demo-company/JW027401_2025-01-24T18-21-32.jpg"
      };

      setDemoResult(mockResult);
      setIsVerifying(false);

      toast({
        title: "RPA Verification Complete",
        description: `Card status: ${mockResult.status.toUpperCase()} - Photo archived`,
        variant: mockResult.status === 'valid' ? "default" : "destructive"
      });
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="h-6 w-6 mr-2 text-blue-600" />
            CSCS Card RPA Demo - Your Green Scaffolding Labourer Card
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Your Card Image */}
            <div>
              <h4 className="font-semibold mb-3">Your Uploaded Card:</h4>
              <img 
                src="/attached_assets/IMG-20250721-WA0000_1753362174747.jpg"
                alt="Green CSCS Scaffolding Labourer Card"
                className="w-full max-w-md rounded-lg border shadow-lg"
              />
              <div className="mt-3 space-y-2">
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CreditCard className="h-3 w-3 mr-1" />
                  Green CSCS Card
                </Badge>
                <p className="text-sm text-gray-600">
                  <strong>Type:</strong> Scaffolding Labourer<br/>
                  <strong>Card Features:</strong> Photo ID, Security watermarks, TESTED marking
                </p>
              </div>
            </div>

            {/* Demo Information */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">RPA Demo Process:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Automated browser visits cscssmartcheck.co.uk</li>
                  <li>• Enters card number automatically</li>
                  <li>• Extracts verification results</li>
                  <li>• Downloads cardholder photo</li>
                  <li>• Saves photo to company archive</li>
                  <li>• Returns complete verification data</li>
                </ul>
              </div>

              <Button
                onClick={runCSCSCardDemo}
                disabled={isVerifying}
                className="w-full"
                size="lg"
              >
                {isVerifying ? (
                  <>
                    <Bot className="h-4 w-4 mr-2 animate-spin" />
                    RPA Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run RPA Demo Verification
                  </>
                )}
              </Button>

              {isVerifying && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-amber-800 text-sm">
                    <Bot className="h-4 w-4 inline mr-1" />
                    RPA automation in progress... This simulates the full process 
                    including photo extraction from the CSCS verification system.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Results */}
      {demoResult && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  RPA Verification Results
                </div>
                <Badge className="bg-red-100 text-red-800 border-red-300">
                  EXPIRED
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Card Information:</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Card Number:</span> {demoResult.cardNumber}</p>
                    <p><span className="text-gray-600">Holder Name:</span> {demoResult.holderName}</p>
                    <p><span className="text-gray-600">Card Type:</span> {demoResult.cardType}</p>
                    <p><span className="text-gray-600">Expiry Date:</span> {demoResult.expiryDate}</p>
                    <p><span className="text-gray-600">Status:</span> 
                      <span className="font-semibold text-red-600 ml-1">EXPIRED</span>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">RPA Process:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Photo extracted successfully
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <FileImage className="h-4 w-4 mr-2" />
                      Saved to company archive
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <Bot className="h-4 w-4 mr-2" />
                      RPA automation completed
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Display */}
          <CardholderPhotoDisplay
            cardNumber={demoResult.cardNumber}
            holderName={demoResult.holderName}
            holderPhotoBase64={demoResult.holderPhotoBase64}
            savedPhotoUrl={demoResult.savedPhotoUrl}
            cardImageBase64={demoResult.cardImageBase64}
            verificationStatus={demoResult.status}
          />
        </>
      )}

      {/* How RPA Works */}
      <Card>
        <CardHeader>
          <CardTitle>How RPA Photo Extraction Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Automated Process:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Browser automation navigates to cscssmartcheck.co.uk</li>
                <li>Card number automatically entered in verification form</li>
                <li>System waits for verification results to load</li>
                <li>Scans page for cardholder photos and card images</li>
                <li>Downloads found images as base64 data</li>
                <li>Saves photos to company-specific directories</li>
                <li>Returns complete verification with photo links</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Benefits:</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>Visual Verification:</strong> Photo confirms identity</li>
                <li>• <strong>Audit Trails:</strong> Complete records with photos</li>
                <li>• <strong>Fraud Prevention:</strong> Detect fake cards</li>
                <li>• <strong>Automated Process:</strong> No manual intervention</li>
                <li>• <strong>Secure Storage:</strong> Company-specific archives</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}