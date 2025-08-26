import { Code, Database, Shield, Smartphone } from 'lucide-react';

export default function Technology() {
  const techFeatures = [
    {
      icon: Code,
      title: 'Modern Web Platform',
      description: 'Built with Next.js, TypeScript, and React for a fast, reliable user experience.',
    },
    {
      icon: Database,
      title: 'Secure Database',
      description: 'Powered by Supabase for secure, scalable data management.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is protected with industry-standard security measures and minimal data collection.',
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Responsive design ensures seamless experience across all devices.',
    },
  ];

  return (
    <section id="technology" className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Technology & Platform
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {techFeatures.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="bg-primary-100 p-4 rounded-full inline-flex mb-4">
                <feature.icon className="h-8 w-8 text-primary-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}