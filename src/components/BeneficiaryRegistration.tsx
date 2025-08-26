'use client';

import { useState } from 'react';
import { Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function BeneficiaryRegistration() {
  const [showComingSoon, setShowComingSoon] = useState(true);

  if (showComingSoon) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="text-center">
          <div className="bg-blue-100 p-6 rounded-full inline-flex mb-6">
            <Clock className="h-12 w-12 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Beneficiary Registration
          </h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">Coming Soon</h3>
            <p className="text-blue-800 leading-relaxed">
              We're preparing a comprehensive registration system for new beneficiaries. 
              This will include application submission, document verification, and approval workflow.
            </p>
          </div>

          <div className="text-left max-w-2xl mx-auto">
            <h4 className="font-semibold text-gray-900 mb-4">Registration Process (Preview):</h4>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <FileText className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">1. Application Submission</h5>
                  <p className="text-sm text-gray-600">
                    Submit detailed application with organization/individual information, 
                    purpose of funds, and supporting documents.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <AlertCircle className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">2. Document Verification</h5>
                  <p className="text-sm text-gray-600">
                    Verification of legitimacy, legal documents, and background check 
                    by authorized PTA officers and platform administrators.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">3. Approval & Activation</h5>
                  <p className="text-sm text-gray-600">
                    Final approval and activation on the platform with ability to 
                    receive pledges and confirm donations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Current Status:</strong> We have 2 PTA-verified beneficiaries active on the platform. 
              New registrations will be available soon as we finalize the verification process.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Future registration form will go here
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Register as Beneficiary
      </h2>
      {/* Registration form components will be built here */}
      <div className="text-center py-12 text-gray-500">
        Registration form under development...
      </div>
    </div>
  );
}