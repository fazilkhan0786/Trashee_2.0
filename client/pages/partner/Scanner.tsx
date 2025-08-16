import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Camera, QrCode, MapPin, Clock, Coins, CheckCircle, X, Gift, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PartnerScanner() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<any>(null);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'bins' | 'coupons'>('bins');
  const [scanHistory, setScanHistory] = useState([
    
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

  const simulateQRScan = (scanType: 'bins' | 'coupons') => {
    setIsScanning(true);
    
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      
      if (success) {
        if (scanType === 'bins') {
          const newScan = {
            id: `BIN-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
            type: 'bin',
            location: ['Downtown Mall, Level 1', 'Metro Station, Platform 2', 'Shopping Complex, Floor 3', 'City Center, Main Plaza'][Math.floor(Math.random() * 4)],
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
          // Coupon validation
          const validCoupon = Math.random() > 0.3; // 70% valid coupons
          
          if (validCoupon) {
            const newScan = {
              id: `CP-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
              type: 'coupon',
              customer: ['John Doe', 'Sarah Miller', 'Mike Johnson', 'Lisa Wang'][Math.floor(Math.random() * 4)],
              timestamp: new Date().toLocaleString('en-IN', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              value: [150, 299, 499, 199][Math.floor(Math.random() * 4)],
              status: 'redeemed'
            };
            
            setLastScan(newScan);
            setScanHistory(prev => [newScan, ...prev.slice(0, 4)]);
          } else {
            setLastScan({ 
              error: 'Invalid coupon', 
              details: 'Coupon expired, already used, or not for this store' 
            });
          }
        }
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
            <h1 className="text-xl font-bold">Partner Scanner</h1>
            <p className="text-sm text-gray-500">Scan trash bins and validate coupons</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Scanner Tabs */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-green-600" />
              Partner Scanner
            </CardTitle>
            <CardDescription>
              Choose what you want to scan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'bins' | 'coupons')} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bins" className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Trash Bins
                </TabsTrigger>
                <TabsTrigger value="coupons" className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Coupons
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="bins" className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Trash2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-green-800">Scan Trash Bins</h3>
                  <p className="text-sm text-green-600">Earn 15 points per scan</p>
                </div>
              </TabsContent>
              
              <TabsContent value="coupons" className="space-y-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Gift className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-medium text-purple-800">Validate Coupons</h3>
                  <p className="text-sm text-purple-600">Verify customer coupons for redemption</p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Camera Simulation */}
            <div className="relative bg-gray-900 rounded-lg aspect-square overflow-hidden mt-4">
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
                    <p className="text-sm opacity-50 mt-1">
                      {activeTab === 'bins' ? 'Point at trash bin QR code' : 'Point at customer coupon QR code'}
                    </p>
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
              onClick={() => simulateQRScan(activeTab)}
              disabled={isScanning || (activeTab === 'bins' && cooldownTime > 0)}
              className="w-full bg-primary hover:bg-primary/90 mt-4"
              size="lg"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Scanning...
                </>
              ) : cooldownTime > 0 && activeTab === 'bins' ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Cooldown: {formatCooldownTime(cooldownTime)}
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan {activeTab === 'bins' ? 'Bin' : 'Coupon'}
                </>
              )}
            </Button>

            {/* Cooldown info for bins only */}
            {cooldownTime > 0 && activeTab === 'bins' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
                <div className="flex items-center gap-2 text-orange-800">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    Next bin scan available in {formatCooldownTime(cooldownTime)}
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
                  {lastScan.details && <p className="text-sm text-gray-500 mt-1">{lastScan.details}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-green-800">
                      {lastScan.type === 'bin' ? 'Scan Successful!' : 'Coupon Validated!'}
                    </h3>
                    <p className="text-green-600">
                      {lastScan.type === 'bin' ? 'You earned 15 points' : 'Coupon successfully redeemed'}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {lastScan.type === 'bin' ? 'Bin ID:' : 'Coupon ID:'}
                      </span>
                      <Badge variant="outline">{lastScan.id}</Badge>
                    </div>
                    
                    {lastScan.type === 'bin' ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Location:</span>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{lastScan.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Points Earned:</span>
                          <div className="flex items-center gap-1">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold text-green-600">+{lastScan.points}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Customer:</span>
                          <span className="text-sm font-medium">{lastScan.customer}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Coupon Value:</span>
                          <span className="text-sm font-bold text-green-600">₹{lastScan.value}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Timestamp:</span>
                      <span className="text-sm">{lastScan.timestamp}</span>
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
            <CardTitle>Recent Scans</CardTitle>
            <CardDescription>Your latest scanning activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanHistory.map((scan, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${scan.type === 'bin' ? 'bg-green-100' : 'bg-purple-100'} rounded-full flex items-center justify-center`}>
                      {scan.type === 'bin' ? (
                        <Trash2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Gift className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{scan.id}</p>
                      <p className="text-xs text-gray-500">
                        {scan.type === 'bin' ? scan.location : `Customer: ${scan.customer}`}
                      </p>
                      <p className="text-xs text-gray-500">{scan.timestamp}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${scan.type === 'bin' ? 'text-green-600 border-green-200' : 'text-purple-600 border-purple-200'}`}>
                    {scan.type === 'bin' ? `+${scan.points}` : `₹${scan.value}`}
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
