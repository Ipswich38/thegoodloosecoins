import { FileText, Users, DollarSign, AlertTriangle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary-100 p-4 rounded-full">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
            <p className="text-gray-600 mt-2">Last updated: January 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 mb-6">
              Welcome to The Good Loose Coins (TG/LC). By using our platform, you agree to these terms of service.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">Community</h3>
                <p className="text-blue-700 text-sm">Respectful interaction between all users</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-900 mb-2">Transparency</h3>
                <p className="text-green-700 text-sm">Honest reporting of loose coin amounts</p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg text-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-red-900 mb-2">Responsibility</h3>
                <p className="text-red-700 text-sm">Users are responsible for their actions</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Platform Overview</h2>
            <p className="mb-6 text-gray-700">
              The Good Loose Coins is a platform that connects donors who want to contribute their loose coins with beneficiaries who can benefit from these contributions. Our platform facilitates this connection through a task-based system that encourages community engagement and social impact.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">User Accounts and Registration</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Account Types</h3>
            <ul className="list-disc list-inside mb-4 text-gray-700">
              <li><strong>Donors:</strong> Users who pledge and contribute loose coins</li>
              <li><strong>Beneficiaries:</strong> Users who receive contributions from donors</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Registration Requirements</h3>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>New registrations require a shared referral link</li>
              <li>Users must provide a valid username</li>
              <li>Email address is optional but recommended</li>
              <li>Users may register using Google authentication</li>
              <li>You must be at least 13 years old to use our platform</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Donor Responsibilities</h2>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Accurately count and report loose coin amounts when making pledges</li>
              <li>Complete the three-task system honestly:
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>Task 1: Pledge the amount of counted loose coins</li>
                  <li>Task 2: Exchange coins at stores that accept loose coins</li>
                  <li>Task 3: Successfully transfer the exchanged amount</li>
                </ul>
              </li>
              <li>Provide truthful information about task completion</li>
              <li>Use the platform in good faith to help beneficiaries</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Beneficiary Responsibilities</h2>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Use received donations for legitimate purposes</li>
              <li>Maintain accurate account information</li>
              <li>Respect the generosity of donors</li>
              <li>Report any issues or concerns promptly</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Prohibited Activities</h2>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              <li>Providing false information about pledge amounts or task completion</li>
              <li>Creating multiple accounts to game the system</li>
              <li>Using the platform for illegal activities</li>
              <li>Harassing or abusing other users</li>
              <li>Attempting to exploit or hack the platform</li>
              <li>Misusing the referral system</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Platform Policies</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Social Impact Points</h3>
            <p className="mb-4 text-gray-700">
              Social Impact Points are awarded for completing tasks and are intended to gamify the donation process. These points have no monetary value and cannot be exchanged for goods or services.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">No Guarantees</h3>
            <p className="mb-6 text-gray-700">
              While we facilitate connections between donors and beneficiaries, we do not guarantee specific donation amounts or outcomes. The platform operates on a voluntary basis, and all contributions are made at the donor's discretion.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Limitation of Liability</h2>
            <p className="mb-6 text-gray-700">
              The Good Loose Coins platform is provided "as is" without warranties of any kind. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform. Users participate at their own risk.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Termination</h2>
            <p className="mb-4 text-gray-700">
              We reserve the right to terminate or suspend accounts that violate these terms of service. Users may also delete their accounts at any time through their account settings.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Changes to Terms</h2>
            <p className="mb-6 text-gray-700">
              We may update these terms from time to time. Users will be notified of significant changes, and continued use of the platform constitutes acceptance of the updated terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">Email: thegoodloosecoins@gmail.com</p>
              <p className="text-sm text-gray-600 mt-2">For questions about these terms or to report violations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}