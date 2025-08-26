import Link from 'next/link';
import { ArrowRight, Coins, Shield, TrendingUp, Users } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <div className="bg-primary-500 p-4 rounded-full">
            <Coins className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          The Good Loose Coins
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          <strong>Transform your loose change into meaningful impact</strong><br/>
          Connect with our community of generous donors and beneficiaries. Make a difference in people's lives, one coin at a time, through our trusted platform that turns spare change into social impact.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-full inline-flex mb-3">
              <Coins className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Count & Pledge</h3>
            <p className="text-sm text-gray-600">Easy coin counting with instant pledges</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 p-3 rounded-full inline-flex mb-3">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure & Trusted</h3>
            <p className="text-sm text-gray-600">Bank-level security for all transactions</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 p-3 rounded-full inline-flex mb-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Real Impact</h3>
            <p className="text-sm text-gray-600">Track your contribution to the community</p>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 p-3 rounded-full inline-flex mb-3">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
            <p className="text-sm text-gray-600">Join thousands of generous donors</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="mailto:thegoodloosecoins@gmail.com?subject=Become a Donor"
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            Become a Donor
            <ArrowRight className="h-5 w-5" />
          </a>
          
          <a
            href="mailto:thegoodloosecoins@gmail.com?subject=Register as Beneficiary"
            className="bg-white hover:bg-gray-50 text-primary-600 px-8 py-4 rounded-lg font-semibold border-2 border-primary-600 transition-colors"
          >
            Register as Beneficiary
          </a>
        </div>
      </div>
    </section>
  );
}