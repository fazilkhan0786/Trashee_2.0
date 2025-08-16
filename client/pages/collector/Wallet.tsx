import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Wallet, ArrowUpRight, ArrowDownLeft, Plus, Minus, Calendar, Filter, Download, TrendingUp, Coins, Gift, CreditCard, Truck, Target, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Transaction {
  id: string;
  type: 'earned' | 'spent' | 'bonus' | 'refund';
  category: 'collection' | 'referral' | 'bonus' | 'purchase' | 'withdrawal' | 'ad_watch';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  details?: string;
}

interface OwnedCoupon {
  id: string;
  productName: string;
  shopName: string;
  originalPrice: number;
  discountedPrice: number;
  pointsUsed: number;
  purchaseDate: string;
  expiryDate: string;
  status: 'active' | 'used' | 'expired';
  qrCode: string;
  category: string;
}

export default function CollectorWallet() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');

  const [ownedCoupons] = useState<OwnedCoupon[]>([
    
  ]);

  const [transactions] = useState<Transaction[]>([
    
  ]);

  const walletStats = {
    currentBalance: 0,
    totalEarned: 0,
    totalSpent: 0,
    totalWithdrawn: 0,
    monthlyEarnings: 0,
    averageDaily: 0,
    rank: 'broonze Collector',
    nextMilestone: 500
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || filterType === '' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || filterCategory === '' || transaction.category === filterCategory;
    return matchesType && matchesCategory;
  });

  const getTransactionIcon = (type: string, category: string) => {
    if (type === 'earned') {
      switch (category) {
        case 'collection': return <Truck className="w-4 h-4 text-green-600" />;
        case 'referral': return <Gift className="w-4 h-4 text-purple-600" />;
        case 'bonus': return <Target className="w-4 h-4 text-orange-600" />;
        case 'ad_watch': return <Play className="w-4 h-4 text-blue-600" />;
        default: return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      }
    } else {
      return <ArrowUpRight className="w-4 h-4 text-red-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    return type === 'earned' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || !withdrawMethod) return;

    console.log('Processing withdrawal:', { amount: withdrawAmount, method: withdrawMethod });
    alert(`✅ Withdrawal initiated!\n\nAmount: ${withdrawAmount} points\nMethod: ${withdrawMethod}\nExpected amount: ₹${(Number(withdrawAmount) * 0.10 - 5).toFixed(2)}`);
    setShowWithdrawDialog(false);
    setWithdrawAmount('');
    setWithdrawMethod('');
  };

  const handleTransfer = () => {
    if (!transferAmount || !transferRecipient) return;

    console.log('Processing transfer:', { amount: transferAmount, recipient: transferRecipient });
    alert(`✅ Transfer completed!\n\nAmount: ${transferAmount} points\nRecipient: ${transferRecipient}`);
    setShowTransferDialog(false);
    setTransferAmount('');
    setTransferRecipient('');
  };

  const handleExportData = () => {
    console.log('Exporting transaction data');
    alert('📊 Transaction data exported successfully!\n\nCheck your downloads folder for the CSV file.');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'collection_history':
        navigate('/collector/scan-history');
        break;
      case 'redeem_points':
        navigate('/collector/coupons');
        break;
      case 'set_goals':
        alert('🎯 Goal setting feature coming soon!\n\nSet daily and weekly collection targets.');
        break;
      case 'export_data':
        handleExportData();
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              My Wallet
            </h1>
            <p className="text-sm opacity-90">Track earnings and manage your finances</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold opacity-90">Current Balance</h2>
                <div className="text-4xl font-bold mt-2">{walletStats.currentBalance.toLocaleString()}</div>
                <p className="text-sm opacity-75 mt-1">points available</p>
              </div>
              <div className="text-right">
                <Badge className="bg-white/20 text-white mb-2">
                  {walletStats.rank}
                </Badge>
                <div className="text-sm opacity-75">
                  {walletStats.nextMilestone} points to next level
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 text-white border-white hover:bg-white hover:text-green-600">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Withdraw
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 text-white border-white hover:bg-white hover:text-green-600">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Transfer
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{walletStats.totalEarned.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{walletStats.monthlyEarnings.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{walletStats.averageDaily}</p>
                  <p className="text-xs text-gray-500">Daily Average</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{walletStats.totalWithdrawn.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Withdrawn</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-16 flex-col gap-2"
                onClick={() => handleQuickAction('collection_history')}
              >
                <Truck className="w-6 h-6" />
                <span className="text-xs">Collection History</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex-col gap-2"
                onClick={() => handleQuickAction('redeem_points')}
              >
                <Gift className="w-6 h-6" />
                <span className="text-xs">Redeem Points</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex-col gap-2"
                onClick={() => handleQuickAction('set_goals')}
              >
                <Target className="w-6 h-6" />
                <span className="text-xs">Set Goals</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex-col gap-2"
                onClick={() => handleQuickAction('export_data')}
              >
                <Download className="w-6 h-6" />
                <span className="text-xs">Export Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Owned Coupons Section */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1050">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                My Coupons ({ownedCoupons.length})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/collector/coupons')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Get More
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ownedCoupons.length > 0 ? (
              <div className="space-y-3">
                {ownedCoupons.map((coupon) => (
                  <div key={coupon.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{coupon.productName}</h4>
                          <Badge
                            className={
                              coupon.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : coupon.status === 'used'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {coupon.status}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{coupon.shopName}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span>Purchased: {coupon.purchaseDate}</span>
                          <span>Expires: {coupon.expiryDate}</span>
                          <span className="flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            {coupon.pointsUsed} points
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-green-600">₹{coupon.discountedPrice}</span>
                            <span className="text-sm text-gray-500 line-through">₹{coupon.originalPrice}</span>
                          </div>

                          {coupon.status === 'active' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => alert(`QR Code: ${coupon.qrCode}\n\nShow this code at the store to redeem your coupon.`)}
                              >
                                View QR
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => alert(`✅ Coupon used successfully!\n\n${coupon.productName} at ${coupon.shopName}`)}
                              >
                                Use Now
                              </Button>
                            </div>
                          )}

                          {coupon.status === 'used' && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              ✓ Used
                            </Badge>
                          )}

                          {coupon.status === 'expired' && (
                            <Badge variant="outline" className="text-red-600 border-red-200">
                              ⏰ Expired
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No coupons owned yet</p>
                <p className="text-sm text-gray-400 mb-4">Start redeeming points for exclusive collector deals</p>
                <Button onClick={() => navigate('/collector/coupons')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Coupons
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="earned">Earned</SelectItem>
              <SelectItem value="spent">Spent</SelectItem>
              <SelectItem value="bonus">Bonus</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="collection">Collection</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="bonus">Bonus</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="ad_watch">Ad Watching</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transaction History */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Transaction History</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getTransactionIcon(transaction.type, transaction.category)}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{transaction.description}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{transaction.date}</span>
                        <Badge className={getStatusColor(transaction.status)} variant="outline">
                          {transaction.status}
                        </Badge>
                        {transaction.details && (
                          <span className="text-xs text-gray-400">• {transaction.details}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No transactions found</p>
                <p className="text-sm text-gray-400">Try adjusting your filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5" />
              Withdraw Points
            </DialogTitle>
            <DialogDescription>
              Convert your points to cash and withdraw to your bank account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Withdrawal Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter points to withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Available balance: {walletStats.currentBalance.toLocaleString()} points
              </p>
            </div>
            
            <div>
              <Label htmlFor="method">Withdrawal Method</Label>
              <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select withdrawal method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI Transfer</SelectItem>
                  <SelectItem value="wallet">Digital Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {withdrawAmount && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Withdrawal Summary</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Points to withdraw:</span>
                    <span>{withdrawAmount} points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion rate:</span>
                    <span>1 point = ₹0.10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing fee:</span>
                    <span>₹5.00</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Amount to receive:</span>
                    <span>₹{(Number(withdrawAmount) * 0.10 - 5).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleWithdraw}
              disabled={!withdrawAmount || !withdrawMethod || Number(withdrawAmount) < 100}
            >
              Withdraw Points
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Transfer Points
            </DialogTitle>
            <DialogDescription>
              Transfer points to another collector or user
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="transferAmount">Transfer Amount</Label>
              <Input
                id="transferAmount"
                type="number"
                placeholder="Enter points to transfer"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Available balance: {walletStats.currentBalance.toLocaleString()} points
              </p>
            </div>

            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                placeholder="Enter recipient's ID or phone number"
                value={transferRecipient}
                onChange={(e) => setTransferRecipient(e.target.value)}
              />
            </div>

            {transferAmount && (
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Transfer Summary</h4>
                <div className="space-y-1 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Points to transfer:</span>
                    <span>{transferAmount} points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transfer fee:</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recipient receives:</span>
                    <span>{transferAmount} points</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!transferAmount || !transferRecipient || Number(transferAmount) < 10}
            >
              Transfer Points
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
