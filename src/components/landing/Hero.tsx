'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Coins, Shield, TrendingUp, Users, Eye, EyeOff, Loader2, AlertCircle, Calendar, User, Mail, Lock } from 'lucide-react';

interface AuthFormData {
  email: string;
  name: string;
  birthYear: string;
  password: string;
  confirmPassword: string;
  userType: 'DONOR' | 'DONEE';
}

interface LoginFormData {
  email: string;
  password: string;
}

function HeroContent() {
  const searchParams = useSearchParams();
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [signupData, setSignupData] = useState<AuthFormData>({
    email: '',
    name: '',
    birthYear: '',
    password: '',
    confirmPassword: '',
    userType: 'DONOR'
  });
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [authErrors, setAuthErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  const router = useRouter();

  // Check for message parameter and set login mode if user was redirected
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setAuthMode('login');
      setAuthErrors({ general: message });
    }
  }, [searchParams]);

  const getCurrentYear = () => new Date().getFullYear();
  const getMinBirthYear = () => getCurrentYear() - 100; // Max age 100
  const getMaxBirthYear = () => getCurrentYear() - 13; // Min age 13

  const validateSignupForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const currentYear = getCurrentYear();

    // Email validation
    if (!signupData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Name validation
    if (!signupData.name) {
      newErrors.name = 'Name is required';
    } else if (signupData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (signupData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    // Birth year validation
    if (!signupData.birthYear) {
      newErrors.birthYear = 'Birth year is required';
    } else {
      const birthYear = parseInt(signupData.birthYear);
      const age = currentYear - birthYear;
      
      if (isNaN(birthYear) || birthYear < getMinBirthYear() || birthYear > getMaxBirthYear()) {
        newErrors.birthYear = `Birth year must be between ${getMinBirthYear()} and ${getMaxBirthYear()}`;
      } else if (age < 13) {
        newErrors.birthYear = 'You must be at least 13 years old to participate. A parent or guardian can create an account for you.';
      } else if (age > 100) {
        newErrors.birthYear = 'Please enter a valid birth year';
      }
    }

    // Password validation
    if (!signupData.password) {
      newErrors.password = 'Password is required';
    } else if (signupData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(signupData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, lowercase letter, and number';
    }

    // Confirm password validation
    if (!signupData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setAuthErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!loginData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }

    setAuthErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignupForm()) {
      return;
    }

    setIsAuthLoading(true);
    setAuthErrors({});

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signupData.email,
          name: signupData.name,
          birthYear: parseInt(signupData.birthYear),
          password: signupData.password,
          userType: signupData.userType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard');
      } else {
        setAuthErrors({ 
          general: data.error || 'Signup failed. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setAuthErrors({ 
        general: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      return;
    }

    setIsAuthLoading(true);
    setAuthErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard');
      } else {
        setAuthErrors({ 
          general: data.error || 'Login failed. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthErrors({ 
        general: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
    
    if (authErrors[name]) {
      setAuthErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (authErrors.general) {
      setAuthErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    
    if (authErrors[name]) {
      setAuthErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (authErrors.general) {
      setAuthErrors(prev => ({ ...prev, general: '' }));
    }
  };

  return (
    <section id="hero" className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Left Side - Platform Description */}
          <div className="lg:col-span-2">
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-8">
                <div className="bg-primary-500 p-4 rounded-full">
                  <Coins className="h-12 w-12 text-white" />
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                The Good Loose Coins
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl">
                <strong>Transform your loose change into meaningful impact</strong><br/>
                Connect with our community of generous donors and beneficiaries. Make a difference in people's lives, one coin at a time, through our trusted platform that turns spare change into social impact.
              </p>
              
              {/* Key Features */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="text-center lg:text-left">
                  <div className="bg-blue-100 p-3 rounded-full inline-flex mb-3">
                    <Coins className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Count & Pledge</h3>
                  <p className="text-sm text-gray-600">Easy coin counting with instant pledges</p>
                </div>
                
                <div className="text-center lg:text-left">
                  <div className="bg-green-100 p-3 rounded-full inline-flex mb-3">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Secure & Trusted</h3>
                  <p className="text-sm text-gray-600">Bank-level security for all transactions</p>
                </div>
                
                <div className="text-center lg:text-left">
                  <div className="bg-purple-100 p-3 rounded-full inline-flex mb-3">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Real Impact</h3>
                  <p className="text-sm text-gray-600">Track your contribution to the community</p>
                </div>
                
                <div className="text-center lg:text-left">
                  <div className="bg-orange-100 p-3 rounded-full inline-flex mb-3">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
                  <p className="text-sm text-gray-600">Join thousands of generous donors</p>
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

              {authMode === 'signup' ? (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  {/* User Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      I want to
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        signupData.userType === 'DONOR' 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="userType"
                          value="DONOR"
                          checked={signupData.userType === 'DONOR'}
                          onChange={handleSignupInputChange}
                          className="sr-only"
                        />
                        <div className="flex-1 text-center">
                          <div className="font-medium text-gray-900 text-sm">Help Others</div>
                          <div className="text-xs text-gray-600">Donor</div>
                        </div>
                      </label>
                      <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        signupData.userType === 'DONEE' 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="userType"
                          value="DONEE"
                          checked={signupData.userType === 'DONEE'}
                          onChange={handleSignupInputChange}
                          className="sr-only"
                        />
                        <div className="flex-1 text-center">
                          <div className="font-medium text-gray-900 text-sm">Get Help</div>
                          <div className="text-xs text-gray-600">Recipient</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={signupData.email}
                        onChange={handleSignupInputChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                          authErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email"
                        disabled={isAuthLoading}
                      />
                    </div>
                    {authErrors.email && (
                      <p className="mt-1 text-xs text-red-600">{authErrors.email}</p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={signupData.name}
                        onChange={handleSignupInputChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                          authErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                        disabled={isAuthLoading}
                      />
                    </div>
                    {authErrors.name && (
                      <p className="mt-1 text-xs text-red-600">{authErrors.name}</p>
                    )}
                  </div>

                  {/* Birth Year */}
                  <div>
                    <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-1">
                      Birth Year
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        id="birthYear"
                        name="birthYear"
                        value={signupData.birthYear}
                        onChange={handleSignupInputChange}
                        min={getMinBirthYear()}
                        max={getMaxBirthYear()}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                          authErrors.birthYear ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="e.g. 1990"
                        disabled={isAuthLoading}
                      />
                    </div>
                    {authErrors.birthYear && (
                      <p className="mt-1 text-xs text-red-600">{authErrors.birthYear}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={signupData.password}
                        onChange={handleSignupInputChange}
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                          authErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="8+ characters"
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

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={signupData.confirmPassword}
                        onChange={handleSignupInputChange}
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                          authErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Confirm your password"
                        disabled={isAuthLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        disabled={isAuthLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {authErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">{authErrors.confirmPassword}</p>
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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        id="loginEmail"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginInputChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                          authErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email"
                        disabled={isAuthLoading}
                      />
                    </div>
                    {authErrors.email && (
                      <p className="mt-1 text-xs text-red-600">{authErrors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="loginPassword"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginInputChange}
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                          authErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter your password"
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

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <a 
                      href="/forgot-password" 
                      className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      Forgot your password?
                    </a>
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
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </button>

                  {/* Forgot Password Link */}
                  <div className="text-center">
                    <a
                      href="/forgot-password"
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Forgot your password?
                    </a>
                  </div>
                </form>
              )}

              {/* Mode Switch */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'signup' ? 'login' : 'signup');
                    setAuthErrors({});
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  disabled={isAuthLoading}
                >
                  {authMode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create account'}
                </button>
              </div>

              {/* Privacy Note */}
              {authMode === 'signup' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-xs text-center">
                    🔒 We only collect essential information. You must be 13+ to participate independently, or have a guardian create an account.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Hero() {
  return (
    <Suspense fallback={
      <section id="hero" className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 text-center">
                <div className="animate-pulse">
                  <div className="h-8 w-8 bg-gray-300 rounded mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="space-y-4">
                    <div className="h-12 bg-gray-300 rounded"></div>
                    <div className="h-12 bg-gray-300 rounded"></div>
                    <div className="h-12 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    }>
      <HeroContent />
    </Suspense>
  );
}