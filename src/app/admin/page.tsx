'use client';

import { useState, useEffect } from 'react';
import { Users, Award, TrendingUp, Shield, Edit, Trash2, Eye, Ban, CheckCircle, AlertTriangle, FileText, BarChart3, Settings } from 'lucide-react';
import Image from 'next/image';
import { generateLeaderboard, getGlobalStats, getPledges, getUsers, clearAllData, seedTestData, confirmPledge } from '@/lib/localStore';
import { formatCurrency } from '@/lib/coins';

type AdminTab = 'overview' | 'users' | 'pledges' | 'beneficiaries' | 'reports' | 'audit';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  adminId: string;
  targetType: 'user' | 'pledge' | 'beneficiary';
  targetId: string;
  details: string;
  ip: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<Record<string, any>>({});
  const [pledges, setPledges] = useState<Record<string, any>>({});
  const [globalStats, setGlobalStats] = useState({
    totalPledged: 0,
    totalSent: 0,
    totalImpactPoints: 0,
    totalPledges: 0,
    totalUsers: 0,
    beneficiaryCount: 2
  });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedPledge, setSelectedPledge] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<string>('');
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  // Demo beneficiaries for admin management
  const beneficiaries = [
    {
      id: '1',
      name: 'Test Beneficiary 1',
      description: 'Educational programs and student support initiatives for community development',
      verified: true,
      status: 'active',
      facebook: 'https://www.facebook.com/testbeneficiary1',
      school: 'Demo School 1',
      totalReceived: 0,
      appliedAt: '2024-01-15'
    },
    {
      id: '2', 
      name: 'Test Beneficiary 2',
      description: 'Technology infrastructure and learning resources for enhanced educational experience',
      verified: true,
      status: 'active',
      facebook: 'https://www.facebook.com/testbeneficiary2',
      location: 'Demo Location, Philippines',
      totalReceived: 0,
      appliedAt: '2024-01-20'
    }
  ];

  const refreshData = () => {
    setUsers(getUsers());
    setPledges(getPledges());
    setGlobalStats(getGlobalStats());
  };

  useEffect(() => {
    refreshData();
    
    // Listen for data changes
    const handleStorageChange = () => refreshData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tglc-data-changed', handleStorageChange);

    // Mock audit log
    setAuditLog([
      {
        id: '1',
        timestamp: new Date().toISOString(),
        action: 'Login',
        adminId: 'admin',
        targetType: 'user',
        targetId: 'system',
        details: 'Admin logged into dashboard',
        ip: '127.0.0.1'
      }
    ]);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tglc-data-changed', handleStorageChange);
    };
  }, []);

  const addAuditEntry = (action: string, targetType: AuditEntry['targetType'], targetId: string, details: string) => {
    const newEntry: AuditEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      adminId: 'admin',
      targetType,
      targetId,
      details,
      ip: '127.0.0.1' // Mock IP - in real app, get from request
    };
    setAuditLog(prev => [newEntry, ...prev]);
  };

  const handleEditPledgeAmount = (pledgeId: string, newAmount: number) => {
    const updatedPledges = { ...pledges };
    if (updatedPledges[pledgeId]) {
      const oldAmount = updatedPledges[pledgeId].amount;
      updatedPledges[pledgeId].amount = newAmount;
      localStorage.setItem('tglc_pledges', JSON.stringify(updatedPledges));
      
      addAuditEntry(
        'Edit Pledge Amount',
        'pledge',
        pledgeId,
        `Changed amount from ₱${oldAmount} to ₱${newAmount}`
      );
      
      refreshData();
      window.dispatchEvent(new CustomEvent('tglc-data-changed'));
    }
  };

  const handleDeletePledge = (pledgeId: string) => {
    const updatedPledges = { ...pledges };
    const pledgeDetails = updatedPledges[pledgeId];
    delete updatedPledges[pledgeId];
    localStorage.setItem('tglc_pledges', JSON.stringify(updatedPledges));
    
    addAuditEntry(
      'Delete Pledge',
      'pledge',
      pledgeId,
      `Deleted pledge: ₱${pledgeDetails?.amount} from ${pledgeDetails?.username}`
    );
    
    refreshData();
    window.dispatchEvent(new CustomEvent('tglc-data-changed'));
  };

  const handleDeleteUser = (username: string) => {
    const updatedUsers = { ...users };
    delete updatedUsers[username];
    localStorage.setItem('tglc_users', JSON.stringify(updatedUsers));
    
    addAuditEntry(
      'Delete User',
      'user',
      username,
      `Deleted user account: ${username}`
    );
    
    refreshData();
    window.dispatchEvent(new CustomEvent('tglc-data-changed'));
  };

  const handleConfirmPledge = (pledgeId: string) => {
    confirmPledge(pledgeId);
    addAuditEntry(
      'Confirm Pledge',
      'pledge',
      pledgeId,
      `Manually confirmed pledge receipt`
    );
    refreshData();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'pledges', label: 'Pledges', icon: TrendingUp },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: Award },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'audit', label: 'Audit Log', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Admin Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-red-600/90 backdrop-blur-md border-b border-red-500/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8">
                <Shield className="w-full h-full text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TGLC Admin Dashboard</h1>
                <p className="text-red-100 text-sm">The Good Loose Coins - Administrative Panel</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-red-100">
                Admin: <span className="font-semibold">System Administrator</span>
              </div>
              <button
                onClick={() => {
                  clearAllData();
                  addAuditEntry('Clear Data', 'user', 'system', 'Cleared all application data');
                  refreshData();
                }}
                className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-sm"
              >
                Clear All Data
              </button>
              <button
                onClick={() => {
                  seedTestData();
                  addAuditEntry('Seed Data', 'user', 'system', 'Seeded test data');
                  refreshData();
                }}
                className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-sm"
              >
                Seed Test Data
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-red-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 pt-32">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{globalStats.totalUsers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Pledges</p>
                      <p className="text-2xl font-bold text-gray-900">{globalStats.totalPledges}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <div className="w-6 h-6">
                        <Image 
                          src="/th good loose coins (4).png" 
                          alt="Coins" 
                          width={24}
                          height={24}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(globalStats.totalPledged)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Award className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Impact Points</p>
                      <p className="text-2xl font-bold text-gray-900">{globalStats.totalImpactPoints}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {auditLog.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 p-2 rounded-full">
                        <Shield className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entry.action}</p>
                        <p className="text-sm text-gray-600">{entry.details}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <div className="text-sm text-gray-600">
                Total Users: {Object.keys(users).length}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.values(users).map((user: any) => (
                      <tr key={user.username}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{user.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          127.0.0.1 {/* Mock IP */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => setSelectedUser(selectedUser === user.username ? null : user.username)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.username)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pledges Tab */}
        {activeTab === 'pledges' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Pledge Management</h2>
              <div className="text-sm text-gray-600">
                Total Pledges: {Object.keys(pledges).length}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficiary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.values(pledges).map((pledge: any) => (
                      <tr key={pledge.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {pledge.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {pledge.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {pledge.beneficiaryName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {selectedPledge === pledge.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={editingAmount}
                                onChange={(e) => setEditingAmount(e.target.value)}
                                className="w-20 px-2 py-1 border rounded text-sm"
                                step="0.01"
                              />
                              <button
                                onClick={() => {
                                  handleEditPledgeAmount(pledge.id, parseFloat(editingAmount));
                                  setSelectedPledge(null);
                                  setEditingAmount('');
                                }}
                                className="text-green-600 hover:text-green-800"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="font-medium text-gray-900">{formatCurrency(pledge.amount)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            pledge.confirmed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {pledge.confirmed ? 'Confirmed' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(pledge.pledgedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => {
                              setSelectedPledge(pledge.id);
                              setEditingAmount(pledge.amount.toString());
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {!pledge.confirmed && (
                            <button
                              onClick={() => handleConfirmPledge(pledge.id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePledge(pledge.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Beneficiaries Tab */}
        {activeTab === 'beneficiaries' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Beneficiary Management</h2>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                Add New Beneficiary
              </button>
            </div>

            <div className="grid gap-6">
              {beneficiaries.map((beneficiary) => (
                <div key={beneficiary.id} className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{beneficiary.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          beneficiary.verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {beneficiary.verified ? 'Verified' : 'Pending'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          beneficiary.status === 'active'
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {beneficiary.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{beneficiary.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Applied:</span>
                          <span className="ml-1 text-gray-900">{beneficiary.appliedAt}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Received:</span>
                          <span className="ml-1 text-gray-900">{formatCurrency(beneficiary.totalReceived)}</span>
                        </div>
                        {beneficiary.school && (
                          <div>
                            <span className="text-gray-500">School:</span>
                            <span className="ml-1 text-gray-900">{beneficiary.school}</span>
                          </div>
                        )}
                        {beneficiary.location && (
                          <div>
                            <span className="text-gray-500">Location:</span>
                            <span className="ml-1 text-gray-900">{beneficiary.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Ban className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports & Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Users:</span>
                    <span className="font-medium">{globalStats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Pledges:</span>
                    <span className="font-medium">{globalStats.totalPledges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">{formatCurrency(globalStats.totalPledged)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confirmed Amount:</span>
                    <span className="font-medium">{formatCurrency(globalStats.totalSent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confirmation Rate:</span>
                    <span className="font-medium">
                      {globalStats.totalPledges > 0 
                        ? Math.round((globalStats.totalSent / globalStats.totalPledged) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="font-medium text-gray-900">Export User Data</div>
                    <div className="text-sm text-gray-600">Download CSV of all users</div>
                  </button>
                  <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="font-medium text-gray-900">Export Pledge Data</div>
                    <div className="text-sm text-gray-600">Download CSV of all pledges</div>
                  </button>
                  <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="font-medium text-gray-900">Export Audit Log</div>
                    <div className="text-sm text-gray-600">Download complete audit trail</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Audit Log</h2>
            
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {auditLog.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(entry.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            {entry.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.adminId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {entry.targetType}: {entry.targetId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {entry.ip}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {entry.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}