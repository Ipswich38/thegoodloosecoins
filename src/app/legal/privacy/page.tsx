import { Shield, Eye, Lock, Trash2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary-100 p-4 rounded-full">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-gray-600 mt-2">Last updated: January 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 mb-6">
              At The Good Loose Coins (TG/LC), we are committed to protecting your privacy and being transparent about how we collect, use, and share your information.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <Eye className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">Transparency</h3>
                <p className="text-blue-700 text-sm">We're clear about what data we collect and why</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <Lock className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-900 mb-2">Security</h3>
                <p className="text-green-700 text-sm">Your data is protected with industry standards</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <Trash2 className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-purple-900 mb-2">Control</h3>
                <p className="text-purple-700 text-sm">You can delete your data at any time</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Account Information</h3>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Username (required)</li>
              <li>Email address (optional)</li>
              <li>Password (encrypted)</li>
              <li>Account type (Donor or Beneficiary)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Platform Activity</h3>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Pledge amounts and completion status</li>
              <li>Donation records</li>
              <li>Social Impact Points earned</li>
              <li>Login timestamps</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>To provide and improve our platform services</li>
              <li>To track your pledges and calculate Social Impact Points</li>
              <li>To display platform statistics (aggregated and anonymized)</li>
              <li>To communicate important updates (if email provided)</li>
              <li>To ensure platform security and prevent fraud</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Information Sharing</h2>
            <p className="mb-4 text-gray-700">
              We do not sell, trade, or otherwise transfer your personal information to third parties. We may share information only in these limited circumstances:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>When required by law or to comply with legal processes</li>
              <li>To protect our rights, property, or safety, or that of our users</li>
              <li>With service providers who assist in platform operations (under strict confidentiality agreements)</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Security</h2>
            <p className="mb-6 text-gray-700">
              We implement industry-standard security measures to protect your information, including encryption of passwords, secure data transmission, and regular security audits. However, no method of transmission over the Internet is 100% secure.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Your Rights and Choices</h2>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Access and update your account information at any time</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of non-essential communications</li>
              <li>Request a copy of your data</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>
            <p className="mb-4 text-gray-700">
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">Email: thegoodloosecoins@gmail.com</p>
              <p className="text-sm text-gray-600 mt-2">We'll respond to privacy inquiries within 48 hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}