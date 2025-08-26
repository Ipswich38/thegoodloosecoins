import { ArrowRight, Coins } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section id="hero" className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <div className="bg-primary-500 p-6 rounded-full">
            <Coins className="h-16 w-16 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          The Good Loose Coins
        </h1>
        
        <p className="text-2xl text-gray-600 mb-12 font-light">
          Turn your spare change into <span className="font-semibold text-primary-600">social impact</span>
        </p>
        
        <Link 
          href="/dashboard" 
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-4 px-10 rounded-xl transition-all transform hover:scale-105 inline-flex items-center text-lg shadow-lg hover:shadow-xl"
        >
          Start Making Impact
          <ArrowRight className="h-6 w-6 ml-3" />
        </Link>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">Count</div>
            <p className="text-gray-600">Your coins</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">Pledge</div>
            <p className="text-gray-600">To beneficiaries</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">Impact</div>
            <p className="text-gray-600">Lives changed</p>
          </div>
        </div>
      </div>
    </section>
  );
}