'use client';

import { useState, useEffect } from 'react';
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
  Award
} from 'lucide-react';

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

export default function Home() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      value: isLoading ? '...' : `$${stats?.totalAmountPledged?.toFixed(2) || '0.00'}`, 
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
      <section className="bg-gradient-to-br from-primary-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform your{' '}
              <span className="text-primary-600">loose change</span>
              <br />
              into meaningful impact
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect with our community of generous donors and beneficiaries. 
              Make a difference in people's lives, one coin at a time, through our 
              trusted platform that turns spare change into social impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/signup"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center gap-2 shadow-lg"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#how-it-works"
                className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Learn More
              </a>
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
              <Link
                href="/signup"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center gap-2 shadow-lg"
              >
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Link>
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
