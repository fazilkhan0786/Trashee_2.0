import React, { useState, useEffect } from 'react';
import { Camera, Scan, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CapacitorService } from '@/lib/capacitorService';

interface MobileQRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function MobileQRScanner({ onScan, onClose, isOpen }: MobileQRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setCapturedImage(null);
    }
  }, [isOpen]);

  const handleScan = async () => {
    try {
      setIsScanning(true);
      setError(null);

      if (CapacitorService.isNative()) {
        // Use native camera
        const imageData = await CapacitorService.takePicture();
        if (imageData) {
          setCapturedImage(imageData);
          // In a real implementation, you'd process the image to extract QR code
          // For now, we'll simulate a successful scan
          const mockQRData = `TRASHBIN_${Date.now()}`;
          onScan(mockQRData);
        } else {
          setError('Failed to capture image');
        }
      } else {
        // Web fallback - show manual input
        const manualInput = prompt('Enter QR code data manually:');
        if (manualInput) {
          onScan(manualInput);
        }
      }
    } catch (err) {
      console.error('Scan error:', err);
      setError('Failed to scan QR code');
    } finally {
      setIsScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Scan QR Code</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {capturedImage && (
            <div className="mb-4">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="space-y-4">
            {CapacitorService.isNative() ? (
              <div className="text-center">
                <div className="mb-4">
                  <Camera className="h-16 w-16 mx-auto text-green-600 mb-2" />
                  <p className="text-gray-600">
                    Position the QR code within the camera frame
                  </p>
                </div>
                
                <Button 
                  onClick={handleScan}
                  disabled={isScanning}
                  className="w-full"
                  size="lg"
                >
                  {isScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Scan className="h-4 w-4 mr-2" />
                      Scan QR Code
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <Scan className="h-16 w-16 mx-auto text-blue-600 mb-2" />
                  <p className="text-gray-600">
                    Camera not available in web mode
                  </p>
                </div>
                
                <Button 
                  onClick={handleScan}
                  className="w-full"
                  size="lg"
                >
                  Enter QR Code Manually
                </Button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="text-xs text-gray-500 text-center">
              <p>Point your camera at a trash bin QR code to scan</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
