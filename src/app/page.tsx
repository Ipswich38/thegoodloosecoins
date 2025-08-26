'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Coins, 
  Heart, 
  Users, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  Star,
  TrendingUp,
  Globe,
  Award,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/coins';

interface GlobalStats {
  totalUsers: number;
  totalDonors: number;
  totalDonees: number;
  totalPledges: number;
  totalAmountPledged: number;
  totalAmountSent: number;
  completedPledges: number;
  activeDonorsCount: number;
  peopleHelpedCount: number;
  totalImpactPoints: number;
  averagePledgeAmount: number;
  completionRate: number;
  coinsBackInCirculation: number;
}

interface AuthFormData {
  username: string;
  password: string;
  userType: 'DONOR' | 'DONEE';
}

export default function Home() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [authData, setAuthData] = useState<AuthFormData>({
    username: '',
    password: '',
    userType: 'DONOR'
  });
  const [authErrors, setAuthErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  const router = useRouter();

  const validateAuthForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!authData.username) {
      newErrors.username = 'Username is required';
    } else if (authData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!authData.password) {
      newErrors.password = 'Password is required';
    } else if (authData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setAuthErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAuthForm()) {
      return;
    }

    setIsAuthLoading(true);
    setAuthErrors({});

    try {
      const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: authData.username,
          password: authData.password,
          userType: authData.userType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard');
      } else {
        setAuthErrors({ 
          general: data.error || `${authMode === 'signup' ? 'Signup' : 'Login'} failed. Please try again.` 
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthErrors({ 
        general: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleAuthInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAuthData(prev => ({ ...prev, [name]: value }));
    
    if (authErrors[name]) {
      setAuthErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (authErrors.general) {
      setAuthErrors(prev => ({ ...prev, general: '' }));
    }
  };

  useEffect(() => {
    fetchGlobalStats();
    
    // Refresh stats every 30 seconds when page is visible
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchGlobalStats();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchGlobalStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching global stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayStats = [
    { 
      label: 'Total Pledged', 
      value: isLoading ? '...' : formatCurrency(stats?.totalAmountPledged || 0), 
      icon: Heart 
    },
    { 
      label: 'People Helped', 
      value: isLoading ? '...' : `${stats?.peopleHelpedCount?.toLocaleString() || '0'}+`, 
      icon: Users 
    },
    { 
      label: 'Active Donors', 
      value: isLoading ? '...' : `${stats?.activeDonorsCount?.toLocaleString() || '0'}+`, 
      icon: Star 
    },
    { 
      label: 'Impact Points', 
      value: isLoading ? '...' : `${stats?.totalImpactPoints?.toLocaleString() || '0'}+`, 
      icon: Award 
    }
  ];

  const steps = [
    {
      number: 1,
      title: 'Count & Pledge',
      description: 'Count your loose coins and make a pledge to donate them',
      icon: Coins
    },
    {
      number: 2,
      title: 'Exchange Coins',
      description: 'Visit participating stores to exchange your coins for digital value',
      icon: CheckCircle
    },
    {
      number: 3,
      title: 'Transfer & Impact',
      description: 'Funds are transferred to help beneficiaries in your community',
      icon: Heart
    }
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section id="hero" className="bg-gradient-to-br from-primary-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12 items-center">
            {/* Left Side - Platform Description */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Transform your{' '}
                <span className="text-primary-600">loose change</span>
                <br />
                into meaningful impact
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect with our community of generous donors and beneficiaries. 
                Make a difference in people's lives, one coin at a time, through our 
                trusted platform that turns spare change into social impact.
              </p>
              
              {/* Key Features */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 p-2 rounded-full mt-1">
                    <Coins className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Count & Pledge</h3>
                    <p className="text-gray-600 text-sm">Easy coin counting with instant pledges</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 p-2 rounded-full mt-1">
                    <Shield className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Secure & Trusted</h3>
                    <p className="text-gray-600 text-sm">Bank-level security for all transactions</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 p-2 rounded-full mt-1">
                    <Heart className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Real Impact</h3>
                    <p className="text-gray-600 text-sm">Track your contribution to the community</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 p-2 rounded-full mt-1">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Community</h3>
                    <p className="text-gray-600 text-sm">Join thousands of generous donors</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Authentication Form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-3">
                    <Coins className="h-8 w-8 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {authMode === 'signup' ? 'Join The Community' : 'Welcome Back'}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {authMode === 'signup' ? 'Start making a difference today' : 'Continue your impact journey'}
                  </p>
                </div>

                {authErrors.general && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-red-700 text-sm">{authErrors.general}</div>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {/* User Type Selection - Only show for signup */}
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        I want to
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          authData.userType === 'DONOR' 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-300 bg-white hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="userType"
                            value="DONOR"
                            checked={authData.userType === 'DONOR'}
                            onChange={handleAuthInputChange}
                            className="sr-only"
                          />
                          <div className="flex-1 text-center">
                            <div className="font-medium text-gray-900 text-sm">Help Others</div>
                            <div className="text-xs text-gray-600">Donor</div>
                          </div>
                        </label>
                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          authData.userType === 'DONEE' 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-300 bg-white hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="userType"
                            value="DONEE"
                            checked={authData.userType === 'DONEE'}
                            onChange={handleAuthInputChange}
                            className="sr-only"
                          />
                          <div className="flex-1 text-center">
                            <div className="font-medium text-gray-900 text-sm">Get Help</div>
                            <div className="text-xs text-gray-600">Recipient</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={authData.username}
                      onChange={handleAuthInputChange}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                        authErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter your username"
                      disabled={isAuthLoading}
                    />
                    {authErrors.username && (
                      <p className="mt-1 text-xs text-red-600">{authErrors.username}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={authData.password}
                        onChange={handleAuthInputChange}
                        className={`w-full px-3 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                          authErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder={authMode === 'signup' ? '6+ characters' : 'Enter password'}
                        disabled={isAuthLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        disabled={isAuthLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {authErrors.password && (
                      <p className="mt-1 text-xs text-red-600">{authErrors.password}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isAuthLoading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        {authMode === 'signup' ? 'Creating...' : 'Signing In...'}
                      </>
                    ) : (
                      <>
                        {authMode === 'signup' ? 'Get Started' : 'Sign In'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </button>
                </form>

                {/* Mode Switch */}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      setAuthMode(authMode === 'signup' ? 'login' : 'signup');
                      setAuthErrors({});
                      setAuthData({ username: '', password: '', userType: 'DONOR' });
                    }}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    disabled={isAuthLoading}
                  >
                    {authMode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create account'}
                  </button>
                </div>

                {/* Privacy Note */}
                {authMode === 'signup' && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-xs text-center">
                      🔒 Just username + password to start. Add email later if needed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <stat.icon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to turn your spare change into meaningful community impact
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                      {step.number}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <step.icon className="h-8 w-8 text-primary-600" />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                The Good Loose Coins connects generous donors with beneficiaries through 
                the simple power of loose change. We believe that small contributions, 
                when combined, can create meaningful social impact in communities.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our platform builds trust through transparency, task verification, and 
                community engagement. Every coin donated is tracked, every impact is 
                measured, and every donor becomes part of a movement for positive change.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-primary-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Community-driven impact</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-primary-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">100% transparent processes</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-primary-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Verified beneficiary network</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                  <TrendingUp className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">Growing</div>
                  <div className="text-sm text-gray-600">Community Impact</div>
                </div>
                <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                  <Shield className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">Secure</div>
                  <div className="text-sm text-gray-600">& Transparent</div>
                </div>
                <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                  <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">Connected</div>
                  <div className="text-sm text-gray-600">Community</div>
                </div>
                <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                  <Globe className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">Local</div>
                  <div className="text-sm text-gray-600">Impact Focus</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Built on Trust & Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines security, transparency, and gamification to create 
              a trustworthy environment for meaningful donations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="bg-primary-100 p-3 rounded-full w-fit mb-6">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Security First</h3>
              <p className="text-gray-600 leading-relaxed">
                Enterprise-grade security with encrypted transactions and verified user 
                accounts. Your donations are protected every step of the way.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="bg-primary-100 p-3 rounded-full w-fit mb-6">
                <CheckCircle className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Task Verification</h3>
              <p className="text-gray-600 leading-relaxed">
                Community-driven verification system ensures that beneficiaries complete 
                meaningful tasks before receiving support.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="bg-primary-100 p-3 rounded-full w-fit mb-6">
                <Star className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Impact Points</h3>
              <p className="text-gray-600 leading-relaxed">
                Earn Social Impact Points for donations and community engagement. 
                Track your contribution and compete on our leaderboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join our community of changemakers and start transforming loose change 
              into meaningful impact today
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <a
                href="#hero"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center gap-2 shadow-lg"
              >
                Get Started Above
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="mailto:thegoodloosecoins@gmail.com"
                className="text-primary-600 hover:text-primary-700 font-semibold text-lg flex items-center gap-2"
              >
                thegoodloosecoins@gmail.com
              </a>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-2xl max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Be part of something bigger
              </h3>
              <p className="text-gray-600 mb-6">
                Every coin matters. Every donation counts. Every person helped makes our 
                community stronger. Start your journey with us today.
              </p>
              <div className="text-sm text-gray-500">
                "Small change, big impact - join the movement"
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
