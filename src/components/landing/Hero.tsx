import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section id="hero" className="bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <div className="flex justify-center mb-12">
          <div className="w-32 h-32 md:w-40 md:h-40">
            <Image 
              src="/th good loose coins (4).png" 
              alt="The Good Loose Coins Logo" 
              width={160}
              height={160}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        <h1 className="display-large md:display-large text-foreground mb-6 max-w-4xl mx-auto">
          The Good Loose Coins
        </h1>
        
        <p className="headline-small text-gray-600 mb-12 max-w-2xl mx-auto font-normal">
          Turn your spare change into <span className="text-primary-600 font-medium">meaningful social impact</span>
        </p>
        
        <Link 
          href="/dashboard" 
          className="btn-filled text-white px-8 py-3 text-base rounded-3xl hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2 focus-ring"
        >
          Start Making Impact
          <ArrowRight className="h-5 w-5" />
        </Link>
        
        <div className="mt-20 grid md:grid-cols-3 gap-12 max-w-3xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🪙</span>
            </div>
            <div className="title-large text-primary-600 mb-2 font-medium">Count</div>
            <p className="body-large text-gray-600">Your spare coins or set any amount</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <div className="title-large text-primary-600 mb-2 font-medium">Pledge</div>
            <p className="body-large text-gray-600">Support verified beneficiaries</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <div className="title-large text-primary-600 mb-2 font-medium">Impact</div>
            <p className="body-large text-gray-600">Create positive change together</p>
          </div>
        </div>
      </div>
    </section>
  );
}