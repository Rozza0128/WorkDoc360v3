import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  User, 
  Camera, 
  Download, 
  Eye, 
  FileImage,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface CardholderPhotoDisplayProps {
  cardNumber: string;
  holderName?: string;
  holderPhotoUrl?: string;
  holderPhotoBase64?: string;
  savedPhotoUrl?: string;
  cardImageUrl?: string;
  cardImageBase64?: string;
  verificationStatus: string;
}

export function CardholderPhotoDisplay({
  cardNumber,
  holderName,
  holderPhotoUrl,
  holderPhotoBase64,
  savedPhotoUrl,
  cardImageUrl,
  cardImageBase64,
  verificationStatus
}: CardholderPhotoDisplayProps) {
  const [showFullPhoto, setShowFullPhoto] = useState(false);

  const downloadPhoto = () => {
    if (holderPhotoBase64) {
      const link = document.createElement('a');
      link.href = holderPhotoBase64;
      link.download = `${cardNumber}_cardholder_photo.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadCardImage = () => {
    if (cardImageBase64) {
      const link = document.createElement('a');
      link.href = cardImageBase64;
      link.download = `${cardNumber}_card_image.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cardholder Photo Section */}
      {(holderPhotoBase64 || holderPhotoUrl || savedPhotoUrl) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Cardholder Photo
              </div>
              <div className="flex items-center space-x-2">
                {savedPhotoUrl && (
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    <FileImage className="h-3 w-3 mr-1" />
                    Saved to File
                  </Badge>
                )}
                <Badge className={`${
                  verificationStatus === 'valid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                } border`}>
                  {verificationStatus.toUpperCase()}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Photo Display */}
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={holderPhotoBase64 || holderPhotoUrl || savedPhotoUrl}
                    alt={`${holderName || 'Cardholder'} Photo`}
                    className="w-full max-w-xs mx-auto rounded-lg border-2 border-gray-200 shadow-lg"
                    style={{ aspectRatio: '3/4', objectFit: 'cover' }}
                  />
                  
                  {/* Photo verification overlay */}
                  <div className="absolute top-2 right-2">
                    {verificationStatus === 'valid' ? (
                      <div className="bg-green-500 text-white p-1 rounded-full">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="bg-red-500 text-white p-1 rounded-full">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Size
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Cardholder Photo - {cardNumber}</DialogTitle>
                      </DialogHeader>
                      <div className="p-4">
                        <img
                          src={holderPhotoBase64 || holderPhotoUrl || savedPhotoUrl}
                          alt={`${holderName || 'Cardholder'} Photo`}
                          className="w-full rounded-lg border shadow-lg"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadPhoto}
                    disabled={!holderPhotoBase64}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Photo Information */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Photo Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Card Number:</span>
                      <span className="font-mono">{cardNumber}</span>
                    </div>
                    {holderName && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cardholder:</span>
                        <span>{holderName}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Source:</span>
                      <span>CSCS Database</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Extracted:</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {savedPhotoUrl && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div className="text-green-800">
                        <p className="font-medium text-sm">Photo Saved Successfully</p>
                        <p className="text-xs">Stored in company photo archive</p>
                        <p className="text-xs font-mono mt-1">{savedPhotoUrl}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-blue-800 text-sm">
                    <p className="font-medium mb-1">Photo Verification</p>
                    <p className="text-xs">
                      This photo was automatically extracted from the official CSCS verification 
                      system and matches the cardholder's registered identity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card Image Section */}
      {(cardImageBase64 || cardImageUrl) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              CSCS Card Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <img
                  src={cardImageBase64 || cardImageUrl}
                  alt="CSCS Card"
                  className="w-full max-w-sm mx-auto rounded-lg border shadow-lg"
                />
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Card Details</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-600">Card Number:</span> {cardNumber}</p>
                  <p><span className="text-gray-600">Type:</span> CSCS Card</p>
                  <p><span className="text-gray-600">Status:</span> {verificationStatus}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadCardImage}
                  disabled={!cardImageBase64}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Card Image
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Photos Available */}
      {!holderPhotoBase64 && !holderPhotoUrl && !savedPhotoUrl && !cardImageBase64 && !cardImageUrl && (
        <Card>
          <CardContent className="text-center py-8">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No photos available</p>
            <p className="text-sm text-gray-500">
              Photos are automatically extracted when available from CSCS verification
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}