import Link from 'next/link';
import { Shield, FileText, Scale, Mail } from 'lucide-react';

export default function LegalPage() {
  const legalSections = [
    {
      icon: Shield,
      title: 'Privacy Policy',
      description: 'Learn how we collect, use, and protect your personal information.',
      href: '/legal/privacy',
      color: 'blue',
    },
    {
      icon: FileText,
      title: 'Terms of Service',
      description: 'Understand the rules and guidelines for using our platform.',
      href: '/legal/terms',
      color: 'green',
    },
    {
      icon: Scale,
      title: 'Data Protection',
      description: 'Our commitment to keeping your data secure and private.',
      color: 'purple',
    },
    {
      icon: Mail,
      title: 'Contact Us',
      description: 'Questions about our legal policies? We\'re here to help.',
      href: 'mailto:thegoodloosecoins@gmail.com',
      color: 'orange',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Legal Information</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transparency and trust are fundamental to our mission. Here you'll find all the legal information 
            about how The Good Loose Coins operates and protects your rights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {legalSections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className={`inline-flex p-3 rounded-full mb-4 bg-${section.color}-100`}>
                <section.icon className={`h-6 w-6 text-${section.color}-600`} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {section.title}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {section.description}
              </p>

              {section.href && (
                <Link
                  href={section.href}
                  className={`inline-flex items-center text-${section.color}-600 hover:text-${section.color}-700 font-medium`}
                >
                  {section.href.startsWith('mailto:') ? 'Send Email' : 'Read More'}
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Commitment to You</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full inline-flex mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Privacy First</h3>
              <p className="text-gray-600 text-sm">
                We collect only the minimum data necessary to provide our services and never sell your information.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full inline-flex mb-4">
                <Scale className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fair & Transparent</h3>
              <p className="text-gray-600 text-sm">
                Our terms are written in plain language, and we're always available to answer questions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full inline-flex mb-4">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Your Rights</h3>
              <p className="text-gray-600 text-sm">
                You have full control over your data and can delete your account at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}