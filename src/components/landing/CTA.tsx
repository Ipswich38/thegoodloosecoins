import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-16 px-4 bg-primary-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Ready to Make an Impact?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Join our community of changemakers and start transforming loose change 
          into meaningful impact today
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <a
            href="mailto:thegoodloosecoins@gmail.com?subject=Join The Community"
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center gap-2 shadow-lg"
          >
            Join Now
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
    </section>
  );
}