'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Check, Clock, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/coins';

interface PendingPledge {
  id: string;
  amount: number;
  donorUsername: string;
  pledgedAt: string;
  confirmed: boolean;
}

export default function BeneficiaryDashboard() {
  const params = useParams();
  const beneficiaryId = params.id as string;
  
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [pendingPledges, setPendingPledges] = useState<PendingPledge[]>([]);
  const [confirming, setConfirming] = useState<string | null>(null);

  // Real data - will connect to API
  useEffect(() => {
    // Demo beneficiary data for presentation
    const realBeneficiary = beneficiaryId === '1' 
      ? 'Test Beneficiary 1'
      : beneficiaryId === '2' 
      ? 'Test Beneficiary 2'
      : 'Unknown Beneficiary';
    
    setBeneficiaryName(realBeneficiary);

    // Start with empty pledges for production
    setPendingPledges([]);
  }, [beneficiaryId]);

  const handleConfirmPledge = async (pledgeId: string) => {
    setConfirming(pledgeId);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update the pledge as confirmed
    setPendingPledges(prev => 
      prev.map(pledge => 
        pledge.id === pledgeId 
          ? { ...pledge, confirmed: true }
          : pledge
      )
    );
    
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

  const totalPending = pendingPledges
    .filter(pledge => !pledge.confirmed)
    .reduce((sum, pledge) => sum + pledge.amount, 0);

  const totalConfirmed = pendingPledges
    .filter(pledge => pledge.confirmed)
    .reduce((sum, pledge) => sum + pledge.amount, 0);

  const pendingCount = pendingPledges.filter(pledge => !pledge.confirmed).length;
  const confirmedCount = pendingPledges.filter(pledge => pledge.confirmed).length;

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
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Confirmation</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPending)}</p>
                <p className="text-xs text-gray-500">{pendingCount} pledges</p>
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
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalConfirmed)}</p>
                <p className="text-xs text-gray-500">{confirmedCount} confirmed</p>
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
                <p className="text-sm text-gray-600">Total Received</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalPending + totalConfirmed)}
                </p>
                <p className="text-xs text-gray-500">{pendingPledges.length} total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pledges List */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Pledges Received</h2>
          
          {pendingPledges.length === 0 ? (
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
              {pendingPledges.map((pledge) => (
                <div 
                  key={pledge.id} 
                  className={`p-4 border rounded-lg transition-colors ${
                    pledge.confirmed 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-orange-200 bg-orange-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-full ${
                          pledge.confirmed ? 'bg-green-100' : 'bg-orange-100'
                        }`}>
                          {pledge.confirmed ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-orange-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(pledge.amount)}
                          </p>
                          <p className="text-sm text-gray-600">
                            from <span className="font-medium">{pledge.donorUsername}</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 ml-9">
                        Pledged on {formatDate(pledge.pledgedAt)}
                      </p>
                    </div>

                    <div className="ml-4">
                      {pledge.confirmed ? (
                        <div className="flex items-center text-green-600">
                          <Check className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Confirmed</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConfirmPledge(pledge.id)}
                          disabled={confirming === pledge.id}
                          className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed inline-flex items-center"
                        >
                          {confirming === pledge.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Confirming...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Confirm Received
                            </>
                          )}
                        </button>
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