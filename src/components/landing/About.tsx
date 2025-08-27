import { Target, Users, Heart, BookOpen, Utensils } from 'lucide-react';
import Image from 'next/image';

export default function About() {
  return (
    <section id="about" className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Our Mission & Story
        </h2>
        
        <div className="prose prose-lg mx-auto text-gray-600 mb-12">
          <p className="text-xl leading-relaxed mb-6">
            The Good Loose Coins is a connection platform built on three fundamental missions that address both economic and social challenges in our communities.
          </p>
          
          <p className="leading-relaxed mb-6">
            <strong>We are not a charity.</strong> Instead, we serve as a bridge connecting people who want to help with those who seek support, while simultaneously addressing the overlooked issue of coin circulation in our monetary system.
          </p>
        </div>

        {/* Three Missions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="bg-blue-100 p-4 rounded-full inline-flex mb-4">
              <div className="w-8 h-8">
                <Image 
                  src="/th good loose coins (4).png" 
                  alt="Coins" 
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Mission 1: Coin Circulation</h3>
            <p className="text-gray-600">
              Loose coins are often neglected and fail to return to circulation. The monetary system spends significant resources producing new coins when existing ones remain unused. We support the Bangko Sentral ng Pilipinas' project to improve coin circulation efficiency.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="bg-green-100 p-4 rounded-full inline-flex mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Mission 2: Accessible Helping</h3>
            <p className="text-gray-600">
              Many people with limited resources still want to help others. Our platform enables anyone with loose coins to contribute without hassle, making helping accessible regardless of financial capacity.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="bg-purple-100 p-4 rounded-full inline-flex mb-4">
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Mission 3: Community Support</h3>
            <p className="text-gray-600">
              Support flows to various organizations, individuals, and public school projects, primarily focusing on children who need educational support, feeding programs, and other essential services.
            </p>
          </div>
        </div>

        {/* Impact Areas */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-center text-gray-900 mb-8">
            Areas of Impact
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-full inline-flex mb-4">
                <BookOpen className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Education Support</h4>
              <p className="text-gray-600 text-sm">
                Helping children who want to study but lack resources, supporting public school projects and educational initiatives.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 p-4 rounded-full inline-flex mb-4">
                <Utensils className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Feeding Programs</h4>
              <p className="text-gray-600 text-sm">
                Supporting nutrition programs for children and families who need regular meals and food security.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 p-4 rounded-full inline-flex mb-4">
                <Target className="h-8 w-8 text-red-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Community Projects</h4>
              <p className="text-gray-600 text-sm">
                Connecting support with various community organizations and individual cases that need assistance.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto">
            <p className="text-blue-800 font-medium mb-2">
              <strong>Important Disclaimer:</strong>
            </p>
            <p className="text-blue-700 text-sm">
              The Good Loose Coins is a connection platform that facilitates relationships between helpers and those seeking support. We are not a registered charity or non-profit organization. All connections and support arrangements are made between individual users of the platform.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}