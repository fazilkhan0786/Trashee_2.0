import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Camera, QrCode, MapPin, Clock, Coins, CheckCircle, X, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CollectorScanner() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<any>(null);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [scanHistory, setScanHistory] = useState([
    { id: 'BIN-012', type: 'bin', location: 'Industrial Area, Block C', timestamp: '2024-01-15 11:20', points: 15 },
    { id: 'BIN-008', type: 'bin', location: 'Commercial District, Plaza 2', timestamp: '2024-01-14 14:45', points: 15 },
    { id: 'BIN-015', type: 'bin', location: 'Residential Zone, Street 5', timestamp: '2024-01-13 09:30', points: 15 },
    { id: 'BIN-003', type: 'bin', location: 'Market Area, Section A', timestamp: '2024-01-12 16:15', points: 15 }
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTime]);

  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const simulateQRScan = () => {
    setIsScanning(true);
    
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      
      if (success) {
        const newScan = {
          id: `BIN-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
          type: 'bin',
          location: ['Industrial Area, Block C', 'Commercial District, Plaza 2', 'Residential Zone, Street 5', 'Market Area, Section A'][Math.floor(Math.random() * 4)],
          timestamp: new Date().toLocaleString('en-IN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          points: 15
        };
        
        setLastScan(newScan);
        setScanHistory(prev => [newScan, ...prev.slice(0, 4)]);
        setCooldownTime(300); // 5 minutes cooldown
      } else {
        setLastScan({ error: 'No QR code detected' });
      }
      
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Collector Scanner</h1>
            <p className="text-sm text-gray-500">Scan trash bins during collection routes</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Scanner Interface */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-green-600" />
              Collector Scanner
            </CardTitle>
            <CardDescription>
              Scan bins during your collection route to earn points
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Collector Benefits Banner */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-orange-800">Collector Advantage</h3>
                  <p className="text-sm text-orange-600">Earn points for every bin you scan during collection</p>
                </div>
              </div>
            </div>

            {/* Camera Simulation */}
            <div className="relative bg-gray-900 rounded-lg aspect-square overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                {isScanning ? (
                  <div className="text-center text-white">
                    <div className="animate-pulse">
                      <QrCode className="w-16 h-16 mx-auto mb-2" />
                      <p>Scanning...</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-white">
                    <Camera className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p className="opacity-75">Camera View</p>
                    <p className="text-sm opacity-50 mt-1">Point at trash bin QR code</p>
                  </div>
                )}
              </div>
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 border-2 border-white/30 rounded-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-green-400 rounded-lg"></div>
              </div>
            </div>

            {/* Scan Button */}
            <Button 
              onClick={simulateQRScan}
              disabled={isScanning || cooldownTime > 0}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Scanning...
                </>
              ) : cooldownTime > 0 ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Cooldown: {formatCooldownTime(cooldownTime)}
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan Trash Bin
                </>
              )}
            </Button>

            {/* Cooldown info */}
            {cooldownTime > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-orange-800">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    Next scan available in {formatCooldownTime(cooldownTime)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Scan Result */}
        {lastScan && (
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {lastScan.error ? (
                  <X className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                Scan Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lastScan.error ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium">{lastScan.error}</p>
                  <p className="text-sm text-gray-500 mt-1">Please try again with a valid QR code</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-green-800">Scan Successful!</h3>
                    <p className="text-green-600">You earned 15 points</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bin ID:</span>
                      <Badge variant="outline">{lastScan.id}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Location:</span>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{lastScan.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Timestamp:</span>
                      <span className="text-sm">{lastScan.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Points Earned:</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-green-600">+{lastScan.points}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Scan History */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
          <CardHeader>
            <CardTitle>Collection Route Scans</CardTitle>
            <CardDescription>Your recent bin scans during collection routes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanHistory.map((scan, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Truck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{scan.id}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{scan.location}</span>
                      </div>
                      <p className="text-xs text-gray-500">{scan.timestamp}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    +{scan.points}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
