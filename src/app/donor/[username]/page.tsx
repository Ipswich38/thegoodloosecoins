'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Coins, Send, Check, Plus, Edit, Mail, Phone, MapPin, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/coins';
import { getUserPledges, getUser, updateUser, addDonationDetails, getCurrentUser, clearCurrentUser } from '@/lib/localStore';

interface Pledge {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
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

interface User {
  username: string;
  passcode: string;
  createdAt: string;
  email?: string;
  phone?: string;
  location?: string;
}

export default function DonorAccount() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: '',
    phone: '',
    location: ''
  });
  const [showDonationForm, setShowDonationForm] = useState<string | null>(null);
  const [donationForm, setDonationForm] = useState({
    method: 'e-wallet' as 'e-wallet' | 'bank-transfer' | 'cash' | 'other',
    amount: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    message: ''
  });

  useEffect(() => {
    // Check if user is authenticated and accessing their own account
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser !== username) {
      router.push('/signin');
      return;
    }

    const userData = getUser(username);
    const userPledges = getUserPledges(username);
    
    setUser(userData);
    setPledges(userPledges);
    
    if (userData) {
      setEditForm({
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || ''
      });
    }

    // Listen for data changes
    const handleStorageChange = () => {
      setUser(getUser(username));
      setPledges(getUserPledges(username));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tglc-data-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tglc-data-changed', handleStorageChange);
    };
  }, [username, router]);

  const handleUpdateProfile = () => {
    if (user) {
      updateUser(username, editForm);
      setUser({...user, ...editForm});
      setIsEditing(false);
    }
  };

  const handleMarkAsSent = (pledgeId: string) => {
    const pledge = pledges.find(p => p.id === pledgeId);
    if (!pledge) return;

    const donationDetails = {
      method: donationForm.method,
      amount: parseFloat(donationForm.amount),
      reference: donationForm.reference,
      date: donationForm.date,
      message: donationForm.message
    };

    addDonationDetails(pledgeId, donationDetails);
    
    // Update local state
    setPledges(prev => prev.map(p => 
      p.id === pledgeId 
        ? { ...p, donationSent: true, donationDetails, sentAt: new Date().toISOString() }
        : p
    ));

    setShowDonationForm(null);
    setDonationForm({
      method: 'e-wallet',
      amount: '',
      reference: '',
      date: new Date().toISOString().split('T')[0],
      message: ''
    });

    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('tglc-data-changed'));
  };

  const handleSignOut = () => {
    clearCurrentUser();
    router.push('/dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gray-100 p-4 rounded-full inline-flex mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h3>
          <p className="text-gray-600 mb-4">The user "{username}" does not exist.</p>
          <Link 
            href="/dashboard" 
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalPledged = pledges.reduce((sum, pledge) => sum + pledge.amount, 0);
  const totalSent = pledges.filter(p => p.donationSent).reduce((sum, pledge) => sum + pledge.amount, 0);
  const totalConfirmed = pledges.filter(p => p.confirmed).reduce((sum, pledge) => sum + pledge.amount, 0);
  const impactPoints = Math.floor(totalConfirmed);

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
                <h1 className="text-xl font-bold text-gray-900">{user.username}</h1>
                <p className="text-sm text-gray-600">Donor Account</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </button>
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
                <Coins className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Pledged</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPledged)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Amount Sent</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSent)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Check className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Confirmed Received</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalConfirmed)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <div className="w-6 h-6">
                  <Image 
                    src="/th good loose coins (3).png" 
                    alt="Impact Points" 
                    width={24}
                    height={24}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Impact Points</p>
                <p className="text-2xl font-bold text-gray-900">{impactPoints}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="h-5 w-5" />
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="+63 XXX XXX XXXX"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="City, Province"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={handleUpdateProfile}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{user.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{user.phone || 'No phone provided'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{user.location || 'No location provided'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Pledges List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">My Pledges</h2>
            
            {pledges.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-4 rounded-full inline-flex mb-4">
                  <Coins className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No pledges yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
                    Make your first pledge
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pledges.map((pledge) => (
                  <div key={pledge.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{pledge.beneficiaryName}</h3>
                        <p className="text-lg font-bold text-primary-600 mb-2">{formatCurrency(pledge.amount)}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>Pledged: {new Date(pledge.pledgedAt).toLocaleDateString()}</span>
                          {pledge.sentAt && (
                            <span>Sent: {new Date(pledge.sentAt).toLocaleDateString()}</span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            pledge.donationSent 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {pledge.donationSent ? 'Donation Sent' : 'Not Sent'}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            pledge.confirmed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {pledge.confirmed ? 'Confirmed Received' : 'Pending Confirmation'}
                          </span>
                        </div>

                        {pledge.donationDetails && (
                          <div className="bg-blue-50 p-3 rounded-lg text-sm">
                            <p className="font-medium text-blue-900 mb-1">Donation Details:</p>
                            <p className="text-blue-800">Method: {pledge.donationDetails.method}</p>
                            <p className="text-blue-800">Amount: {formatCurrency(pledge.donationDetails.amount)}</p>
                            <p className="text-blue-800">Reference: {pledge.donationDetails.reference}</p>
                            <p className="text-blue-800">Date: {pledge.donationDetails.date}</p>
                            {pledge.donationDetails.message && (
                              <p className="text-blue-800 mt-1">Message: {pledge.donationDetails.message}</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        {!pledge.donationSent ? (
                          <button
                            onClick={() => {
                              setShowDonationForm(pledge.id);
                              setDonationForm({
                                ...donationForm,
                                amount: pledge.amount.toString()
                              });
                            }}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Mark as Sent
                          </button>
                        ) : (
                          <div className="text-center">
                            <Check className="h-6 w-6 text-green-600 mx-auto mb-1" />
                            <p className="text-xs text-green-600">Sent</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Donation Form Modal */}
                    {showDonationForm === pledge.id && (
                      <div className="mt-4 p-4 bg-gray-50 border-t">
                        <h4 className="font-medium text-gray-900 mb-4">Donation Details</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                            <select
                              value={donationForm.method}
                              onChange={(e) => setDonationForm({...donationForm, method: e.target.value as any})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="e-wallet">E-Wallet (GCash, PayMaya, etc.)</option>
                              <option value="bank-transfer">Bank Transfer</option>
                              <option value="cash">Cash</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount Sent</label>
                            <input
                              type="number"
                              step="0.01"
                              value={donationForm.amount}
                              onChange={(e) => setDonationForm({...donationForm, amount: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              placeholder="0.00"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                            <input
                              type="text"
                              value={donationForm.reference}
                              onChange={(e) => setDonationForm({...donationForm, reference: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Transaction reference"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Sent</label>
                            <input
                              type="date"
                              value={donationForm.date}
                              onChange={(e) => setDonationForm({...donationForm, date: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                            <textarea
                              value={donationForm.message}
                              onChange={(e) => setDonationForm({...donationForm, message: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              rows={3}
                              placeholder="How was the money sent? Any additional details..."
                            />
                          </div>
                        </div>

                        <div className="flex space-x-3 mt-4">
                          <button
                            onClick={() => handleMarkAsSent(pledge.id)}
                            disabled={!donationForm.amount || !donationForm.reference}
                            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium disabled:cursor-not-allowed"
                          >
                            Confirm Donation Sent
                          </button>
                          <button
                            onClick={() => setShowDonationForm(null)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}