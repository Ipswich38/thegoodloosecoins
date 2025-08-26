'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Check, Clock, User, ArrowLeft, Send, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/coins';
import { getBeneficiaryPledges, confirmPledge } from '@/lib/localStore';

interface BeneficiaryPledge {
  id: string;
  username: string;
  amount: number;
  pledgedAt: string;
  confirmed: boolean;
  confirmedAt?: string;
  donationSent: boolean;
  donationDetails?: {
    method: 'e-wallet' | 'bank-transfer' | 'cash' | 'other';
    amount: number;
    reference: string;
    date: string;
    message: string;
  };
  sentAt?: string;
}

export default function BeneficiaryDashboard() {
  const params = useParams();
  const beneficiaryId = params.id as string;
  
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [pledges, setPledges] = useState<BeneficiaryPledge[]>([]);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const refreshData = () => {
    const beneficiaryPledges = getBeneficiaryPledges(beneficiaryId);
    setPledges(beneficiaryPledges);
  };

  useEffect(() => {
    // Demo beneficiary data for presentation
    const realBeneficiary = beneficiaryId === '1' 
      ? 'Test Beneficiary 1'
      : beneficiaryId === '2' 
      ? 'Test Beneficiary 2'
      : 'Unknown Beneficiary';
    
    setBeneficiaryName(realBeneficiary);
    refreshData();

    // Listen for data changes
    const handleStorageChange = () => refreshData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tglc-data-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tglc-data-changed', handleStorageChange);
    };
  }, [beneficiaryId]);

  const handleConfirmReceived = async (pledgeId: string) => {
    setConfirming(pledgeId);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Confirm the pledge in localStorage
    const success = confirmPledge(pledgeId);
    
    if (success) {
      refreshData();
      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('tglc-data-changed'));
    }
    
    setConfirming(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sentPledges = pledges.filter(pledge => pledge.donationSent);
  const receivedPledges = pledges.filter(pledge => pledge.confirmed);
  const totalPledged = pledges.reduce((sum, pledge) => sum + pledge.amount, 0);
  const totalReceived = receivedPledges.reduce((sum, pledge) => sum + pledge.amount, 0);
  const totalSent = sentPledges.reduce((sum, pledge) => sum + pledge.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link 
                href="/dashboard" 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="bg-primary-500 p-2 rounded-full">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{beneficiaryName}</h1>
                <p className="text-sm text-gray-600">Beneficiary Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/signin" 
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <div className="text-sm text-gray-600">
                Beneficiary View
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Pledgers</p>
                <p className="text-2xl font-bold text-gray-900">{pledges.length}</p>
                <p className="text-xs text-gray-500">people pledged</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <Send className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Donations Sent</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSent)}</p>
                <p className="text-xs text-gray-500">{sentPledges.length} sent</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Confirmed Received</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalReceived)}</p>
                <p className="text-xs text-gray-500">{receivedPledges.length} confirmed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-full">
                <div className="w-6 h-6">
                  <Image 
                    src="/th good loose coins (3).png" 
                    alt="Coins" 
                    width={24}
                    height={24}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Pledged</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPledged)}</p>
                <p className="text-xs text-gray-500">all pledges</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pledges List */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Pledges from Donors</h2>
          
          {pledges.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 p-4 rounded-full inline-flex mb-4">
                <div className="w-8 h-8">
                  <Image 
                    src="/th good loose coins (3).png" 
                    alt="Coins" 
                    width={32}
                    height={32}
                    className="w-full h-full object-contain opacity-60"
                  />
                </div>
              </div>
              <p className="text-gray-500 text-lg">No pledges received yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Pledges will appear here when donors make contributions
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pledges.map((pledge) => (
                <div 
                  key={pledge.id} 
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-primary-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{pledge.username}</p>
                          <p className="text-lg font-bold text-primary-600">{formatCurrency(pledge.amount)}</p>
                        </div>
                      </div>
                      
                      <div className="ml-9 space-y-2">
                        <p className="text-sm text-gray-600">
                          Pledged on {formatDate(pledge.pledgedAt)}
                        </p>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            pledge.donationSent 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {pledge.donationSent ? 'Donation Sent' : 'Not Sent Yet'}
                          </span>
                          
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            pledge.confirmed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {pledge.confirmed ? 'Confirmed Received' : 'Awaiting Confirmation'}
                          </span>
                        </div>

                        {pledge.donationDetails && (
                          <div className="mt-3">
                            <button
                              onClick={() => setShowDetails(showDetails === pledge.id ? null : pledge.id)}
                              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {showDetails === pledge.id ? 'Hide' : 'View'} Donation Details
                            </button>
                            
                            {showDetails === pledge.id && (
                              <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="font-medium text-blue-900">Method:</span>
                                    <span className="ml-1 text-blue-800">{pledge.donationDetails.method}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-blue-900">Amount:</span>
                                    <span className="ml-1 text-blue-800">{formatCurrency(pledge.donationDetails.amount)}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-blue-900">Reference:</span>
                                    <span className="ml-1 text-blue-800">{pledge.donationDetails.reference}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-blue-900">Date:</span>
                                    <span className="ml-1 text-blue-800">{pledge.donationDetails.date}</span>
                                  </div>
                                </div>
                                {pledge.donationDetails.message && (
                                  <div className="mt-2">
                                    <span className="font-medium text-blue-900">Message:</span>
                                    <p className="text-blue-800 mt-1">{pledge.donationDetails.message}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col items-end space-y-2">
                      {pledge.donationSent && !pledge.confirmed && (
                        <button
                          onClick={() => handleConfirmReceived(pledge.id)}
                          disabled={confirming === pledge.id}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed inline-flex items-center"
                        >
                          {confirming === pledge.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Confirming...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Received
                            </>
                          )}
                        </button>
                      )}
                      
                      {pledge.confirmed && (
                        <div className="flex items-center text-green-600">
                          <Check className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Confirmed</span>
                        </div>
                      )}
                      
                      {!pledge.donationSent && (
                        <div className="text-center">
                          <Clock className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Waiting for<br/>donation</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Confirm Pledges</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• Click "Confirm Received" only after you have physically received the money from the donor</p>
            <p>• Confirming a pledge will award the donor Impact Points (1 peso = 1 point)</p>
            <p>• Confirmed pledges will appear in the public leaderboard as "Successfully Sent"</p>
            <p>• Only confirm pledges you have actually received - this maintains trust in the platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}