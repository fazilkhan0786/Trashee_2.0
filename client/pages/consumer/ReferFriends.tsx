import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Copy, Share, Users, Coins, Gift, MessageCircle,
  Send, CheckCircle, TrendingUp, Target, Zap, Award, Loader2, Ticket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// --- Helper: fetch or generate the user's referral code ---
const fetchOrGenerateCode = async (user, setUserReferralCode) => {
  if (!user) {
    setUserReferralCode('LOGIN-REQUIRED');
    return;
  }

  try {
    // 1) Try to fetch an existing referral row
    const { data: referralData, error: fetchError } = await supabase
      .from('referrals')
      .select('code')
      .eq('inviter_id', user.id)
      .single();

    if (fetchError) {
      const msg = (fetchError.message || '').toLowerCase();
      // treat "no rows" specially -> generate code
      if (msg.includes('no rows') || msg.includes('not found') || fetchError.code === 'PGRST116') {
        console.debug('No existing referral - generating code via RPC for', user.id);
        const { data: generated, error: genError } = await supabase.rpc('generate_referral_code', { user_id: user.id });

        if (genError) {
          console.error('generate_referral_code RPC error:', genError);
          setUserReferralCode('ERROR');
          return;
        }

        // Normalize generator return
        const code = typeof generated === 'string' ? generated : (generated?.code || generated);
        setUserReferralCode(String(code || 'ERROR').toUpperCase());
        return;
      }

      console.error('fetch referrals error:', fetchError);
      setUserReferralCode('ERROR');
      return;
    }

    // success path
    if (referralData && referralData.code) {
      setUserReferralCode(String(referralData.code).toUpperCase());
      return;
    }

    // fallback
    setUserReferralCode('NOT-FOUND');
  } catch (err) {
    console.error('Unexpected error in fetchOrGenerateCode:', err);
    setUserReferralCode('ERROR');
  }
};

export default function ConsumerReferFriends() {
  const navigate = useNavigate();

  // inviter's code display
  const [userReferralCode, setUserReferralCode] = useState('Loading...');
  const [copySuccess, setCopySuccess] = useState(false);

  // invitee entering code
  const [enteredCode, setEnteredCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState({ loading: false, message: '', type: '' });

  // auth / user
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // mock stats (you fetch these separately)
  const referralStats = {
    totalInvites: 0,
    successfulSignups: 0,
    pointsEarned: 0,
    pendingPoints: 0,
    level: 'Bronze Referrer'
  };
  const recentReferrals = [];

  // init session + subscribe auth changes
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session ?? null;
        if (!mounted) return;
        setCurrentUser(session?.user ?? null);
      } catch (err) {
        console.error('auth.getSession error', err);
        if (!mounted) return;
        setCurrentUser(null);
      } finally {
        if (!mounted) return;
        setIsAuthReady(true);
      }
    };
    init();

    // subscribe to auth change to update UI if user logs in/out after load
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      // if user just logged in -> fetch/generate their code
      if (session?.user) {
        fetchOrGenerateCode(session.user, setUserReferralCode);
      } else {
        setUserReferralCode('LOGIN-REQUIRED');
      }
    });

    return () => {
      mounted = false;
      // cleanup listener
      try { listener?.subscription?.unsubscribe?.(); } catch (e) { /* ignore */ }
    };
  }, []);

  // when auth ready / user changes, fetch or generate code
  useEffect(() => {
    if (!isAuthReady) return;
    fetchOrGenerateCode(currentUser, setUserReferralCode);
  }, [isAuthReady, currentUser]);

  // copy own code (uses execCommand for iframe compatibility)
  const copyReferralCode = async () => {
    if (!userReferralCode || userReferralCode === 'Loading...' || userReferralCode === 'ERROR' || userReferralCode === 'LOGIN-REQUIRED') return;
    try {
      const temp = document.createElement('textarea');
      temp.value = userReferralCode;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('copy failed', err);
    }
  };

  // redeem handler
  const handleRedeemCode = async () => {
    setRedeemStatus({ loading: true, message: '', type: '' });

    if (!currentUser?.id) {
      setRedeemStatus({ loading: false, message: 'You must be logged in to redeem a code.', type: 'error' });
      return;
    }

    const trimmed = enteredCode.trim();
    if (!trimmed) {
      setRedeemStatus({ loading: false, message: 'Please enter a referral code.', type: 'error' });
      return;
    }

    const codeToSend = trimmed.toUpperCase();

    // client-side self-check when inviter code is known
    if (userReferralCode && !['ERROR','NOT-FOUND','LOGIN-REQUIRED','Loading...'].includes(userReferralCode) && userReferralCode === codeToSend) {
      setRedeemStatus({ loading: false, message: 'You cannot redeem your own referral code.', type: 'error' });
      return;
    }

    try {
      console.debug('Calling redeem_referral_code RPC with', { invitee_id: currentUser.id, entered_code: codeToSend });
      const { data, error } = await supabase.rpc('redeem_referral_code', {
        invitee_id: currentUser.id,
        entered_code: codeToSend
      });

      if (error) {
        console.error('redeem_referral_code RPC error', error);
        // map common DB/function error messages to a friendly message
        const errMsg = (error.message || '').toLowerCase();
        if (errMsg.includes('invalid') || errMsg.includes('not found')) {
          setRedeemStatus({ loading: false, message: 'Invalid referral code.', type: 'error' });
        } else if (errMsg.includes('already')) {
          setRedeemStatus({ loading: false, message: 'You have already redeemed a referral code.', type: 'error' });
        } else {
          setRedeemStatus({ loading: false, message: `Error: ${error.message}`, type: 'error' });
        }
        return;
      }

      // Normalise response: accept string 'success:...' or structured JSON
      const resp = Array.isArray(data) ? data[0] : data;
      console.debug('redeem RPC response', resp);

      if (typeof resp === 'string') {
        if (resp.startsWith('error:')) {
          setRedeemStatus({ loading: false, message: resp.substring(6), type: 'error' });
        } else if (resp.startsWith('success:')) {
          setRedeemStatus({ loading: false, message: resp.substring(8), type: 'success' });
          setEnteredCode('');
        } else {
          setRedeemStatus({ loading: false, message: 'Redeemed successfully!', type: 'success' });
          setEnteredCode('');
        }
      } else if (resp && resp.status === 'ok') {
        setRedeemStatus({ loading: false, message: 'Referral redeemed — points applied!', type: 'success' });
        setEnteredCode('');
      } else {
        setRedeemStatus({ loading: false, message: 'Referral redeemed — check points table.', type: 'success' });
        setEnteredCode('');
      }
    } catch (err) {
      console.error('Unexpected error redeeming code', err);
      setRedeemStatus({ loading: false, message: `Unexpected error: ${err.message || err}`, type: 'error' });
    }
  };

  // share helpers
  const shareMessage = (platform) => {
    const code = userReferralCode === 'Loading...' || userReferralCode === 'ERROR' || userReferralCode === 'NOT-FOUND' || userReferralCode === 'LOGIN-REQUIRED'
      ? '[Your Code Will Be Here]'
      : userReferralCode;

    const message = `Hey! Join me on Trashee - the smart waste management app where you earn points for being eco-friendly! 🌱♻️\n\nUse my referral code: ${code}\n\nYou'll get 50 bonus points when you sign up, and I'll get 100 points! 💰\n\nDownload now and start earning!`;
    const encodedMessage = encodeURIComponent(message);

    let url = '';
    if (platform === 'whatsapp') url = `https://wa.me/?text=${encodedMessage}`;
    if (platform === 'telegram') url = `https://t.me/share/url?url=&text=${encodedMessage}`;
    if (platform === 'email') url = `mailto:?subject=${encodeURIComponent('Join Trashee and Earn Rewards!')}&body=${encodedMessage}`;

    if (url) window.open(url, '_blank');
  };

  const isCodeAvailable = userReferralCode !== 'Loading...' && userReferralCode !== 'ERROR' && userReferralCode !== 'LOGIN-REQUIRED';

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white pb-20">
      {/* Decorative backgrounds (page-level) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-green-200/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-xl">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Refer Friends</h1>
              <p className="text-emerald-100 text-sm mt-1">You get 100 points, your friend gets 50!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto p-4 space-y-6">
        {/* Enter Referral Code (visible when user is logged in) */}
        {isAuthReady && currentUser && (
          <Card className="border-blue-100 shadow-xl rounded-2xl overflow-hidden">
            {/* decorative overlay made non-interactive */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pointer-events-none"></div>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 relative">
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <div className="bg-blue-100 rounded-full p-1">
                  <Ticket className="w-5 h-5 text-blue-700" />
                </div>
                Have a Referral Code?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative space-y-4">
              <p className="text-sm text-gray-600">
                Enter a friend's referral code to get <strong>50 bonus points!</strong> Your friend will get 100 points as a thank you.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="text"
                  placeholder="Enter code here..."
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value)} // keep raw while typing (avoid IME issues)
                  disabled={redeemStatus.loading}
                  className="flex-grow text-lg h-12 border-blue-300 focus:border-blue-500"
                />
                <Button
                  onClick={handleRedeemCode}
                  disabled={redeemStatus.loading || !enteredCode.trim()}
                  className="h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-shadow"
                >
                  {redeemStatus.loading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  )}
                  Redeem Code
                </Button>
              </div>

              {redeemStatus.message && (
                <div className={`mt-4 text-sm font-medium p-3 rounded-md ${
                  redeemStatus.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {redeemStatus.message}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Your Referral Code Card */}
        <Card className="border-emerald-100 shadow-xl rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 pointer-events-none"></div>
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100 relative">
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <div className="bg-emerald-100 rounded-full p-1">
                <Gift className="w-5 h-5 text-emerald-700" />
              </div>
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 relative">
            <div className="text-center">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/30">
                  <p className="text-3xl font-bold tracking-widest text-white">
                    {userReferralCode === 'LOGIN-REQUIRED' ? 'Sign in to get your code' : userReferralCode}
                  </p>
                </div>
                {userReferralCode === 'Loading...' && (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-white/80" />
                )}
                {userReferralCode === 'ERROR' && (
                  <p className="text-red-300">Could not load/generate code.</p>
                )}

                {isCodeAvailable && (
                  <>
                    <p className="text-emerald-100 mb-6">
                      Share this unique code with friends and family
                    </p>
                    <Button
                      onClick={copyReferralCode}
                      className={`${copySuccess ? 'bg-emerald-600' : 'bg-white text-emerald-700 hover:bg-emerald-50'} transition-all shadow-md`}
                    >
                      {copySuccess ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Statistics (unchanged visual content) */}
        <Card className="border-emerald-100 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <div className="bg-emerald-100 rounded-full p-1">
                <TrendingUp className="w-5 h-5 text-emerald-700" />
              </div>
              Referral Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  <span className="text-3xl font-bold text-blue-800">{referralStats.totalInvites}</span>
                </div>
                <p className="text-sm font-medium text-blue-700 text-center">Total Invites</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <span className="text-3xl font-bold text-emerald-800">{referralStats.successfulSignups}</span>
                </div>
                <p className="text-sm font-medium text-emerald-700 text-center">Successful Signups</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-6 h-6 text-yellow-600" />
                    <span className="text-2xl font-bold text-yellow-800">{referralStats.pointsEarned}</span>
                  </div>
                  <p className="text-sm font-medium text-yellow-700">Points Earned</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-yellow-100 text-yellow-800 border-0 text-sm">
                    <Award className="w-3 h-3 mr-1" />
                    {referralStats.level}
                  </Badge>
                  <p className="text-xs text-yellow-600 mt-2">
                    {referralStats.pendingPoints} points to next reward
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Options */}
        <Card className="border-emerald-100 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <div className="bg-emerald-100 rounded-full p-1">
                <Share className="w-5 h-5 text-emerald-700" />
              </div>
              Share with Friends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => shareMessage('whatsapp')}
                variant="outline"
                disabled={!isCodeAvailable}
                className="h-20 flex-col gap-3 hover:bg-green-50 hover:border-green-200 hover:shadow-md transition-all border-emerald-200"
              >
                <MessageCircle className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium">WhatsApp</span>
              </Button>

              <Button
                onClick={() => shareMessage('telegram')}
                variant="outline"
                disabled={!isCodeAvailable}
                className="h-20 flex-col gap-3 hover:bg-blue-50 hover:border-blue-200 hover:shadow-md transition-all border-emerald-200"
              >
                <Send className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium">Telegram</span>
              </Button>

              <Button
                onClick={() => shareMessage('email')}
                variant="outline"
                disabled={!isCodeAvailable}
                className="h-20 flex-col gap-3 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all border-emerald-200"
              >
                <Send className="w-6 h-6 text-gray-600" />
                <span className="text-sm font-medium">Email</span>
              </Button>

              <Button
                variant="outline"
                disabled={!isCodeAvailable}
                className="h-20 flex-col gap-3 hover:bg-purple-50 hover:border-purple-200 hover:shadow-md transition-all border-emerald-200"
              >
                <Share className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-medium">More</span>
              </Button>
            </div>

            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800 text-center font-medium">
                💡 <strong>Pro Tip:</strong> Personal messages get better response rates!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card className="border-emerald-100 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
            <CardTitle className="text-emerald-800">Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentReferrals.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No referrals yet</p>
                  <p className="text-gray-400 text-sm mt-1">Start sharing your code to see results</p>
                </div>
              ) : (
                recentReferrals.map((referral, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-emerald-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        referral.status === 'completed' ? 'bg-emerald-100' : 'bg-yellow-100'
                      }`}>
                        {referral.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <Users className="w-6 h-6 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{referral.name}</p>
                        <p className="text-sm text-gray-500">{referral.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'} className={
                        referral.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-0' : ''
                      }>
                        {referral.status}
                      </Badge>
                      {referral.points > 0 && (
                        <div className="flex items-center gap-1 text-emerald-600 text-sm mt-1">
                          <Coins className="w-3 h-3" />
                          <span>+{referral.points}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="bg-white/20 rounded-full p-1">
                <Gift className="w-5 h-5 text-white" />
              </div>
              How Referrals Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            <div className="grid gap-6">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Share Your Code</h3>
                  <p className="text-purple-100 text-sm">Share your unique referral code with friends and family</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">They Join & Redeem</h3>
                  <p className="text-purple-100 text-sm">They sign up and enter your code in their app</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">You Both Earn!</h3>
                  <p className="text-purple-100 text-sm">
                    They get <strong>50 points</strong> instantly, and you get <strong>100 points!</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-center gap-2 text-center">
                <Target className="w-5 h-5 text-white" />
                <span className="font-semibold">Ready to become a Green Ambassador?</span>
                <Zap className="w-5 h-5 text-yellow-300" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
