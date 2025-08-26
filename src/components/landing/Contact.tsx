import { Mail, MessageCircle } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Contact Us
        </h2>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-100 p-4 rounded-full">
              <Mail className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Get in Touch
          </h3>
          
          <p className="text-gray-600 mb-6">
            Have questions about our platform? Need help getting started? 
            Want to share your feedback? We'd love to hear from you!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:thegoodloosecoins@gmail.com"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Mail className="h-5 w-5" />
              thegoodloosecoins@gmail.com
            </a>
            
            <div className="text-gray-500">or</div>
            
            <a
              href="mailto:thegoodloosecoins@gmail.com?subject=Request for Signup Link"
              className="bg-white hover:bg-gray-50 text-primary-600 px-6 py-3 rounded-lg font-semibold border-2 border-primary-600 flex items-center gap-2 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Request Signup Link
            </a>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Note: New registrations require a shared link. Contact us to get yours!
          </p>
        </div>
      </div>
    </section>
  );
}