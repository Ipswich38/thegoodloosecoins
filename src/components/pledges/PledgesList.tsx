'use client';

import { useState, useEffect } from 'react';
import { Heart, Filter, ChevronDown, Loader } from 'lucide-react';
import { Pledge, PledgeFilters, PaginationParams, PledgesResponse } from '@/types/pledge';
import { formatCurrency } from '@/lib/coins';
import PledgeStatusCard from './PledgeStatusCard';

interface PledgesListProps {
  userType: 'DONOR' | 'DONEE';
  onPledgeUpdate?: (pledge: Pledge) => void;
  className?: string;
}

export default function PledgesList({ userType, onPledgeUpdate, className = '' }: PledgesListProps) {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  
  const [filters, setFilters] = useState<PledgeFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchPledges = async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      
      // Add filters
      if (filters.status) searchParams.set('status', filters.status);
      if (filters.dateFrom) searchParams.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) searchParams.set('dateTo', filters.dateTo);
      if (filters.minAmount) searchParams.set('minAmount', filters.minAmount.toString());
      if (filters.maxAmount) searchParams.set('maxAmount', filters.maxAmount.toString());
      
      // Add pagination
      if (pagination.page) searchParams.set('page', pagination.page.toString());
      if (pagination.limit) searchParams.set('limit', pagination.limit.toString());
      if (pagination.sortBy) searchParams.set('sortBy', pagination.sortBy);
      if (pagination.sortOrder) searchParams.set('sortOrder', pagination.sortOrder);

      const response = await fetch(`/api/pledges?${searchParams.toString()}`);
      const data: PledgesResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch pledges');
      }

      setPledges(data.pledges || []);
      setTotal(data.total || 0);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPledges();
  }, [filters, pagination]);

  const handleFilterChange = (key: keyof PledgeFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleSortChange = (sortBy: string) => {
    setPagination(prev => ({
      ...prev,
      sortBy: sortBy as any,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
  };

  const handlePledgeUpdate = async (updatedPledge: any) => {
    // Update the pledge in the local state
    setPledges(prev => 
      prev.map(p => p.id === updatedPledge.id ? updatedPledge : p)
    );
    
    // Call the parent callback
    onPledgeUpdate?.(updatedPledge);
    
    // Optionally refresh the list to ensure consistency
    // fetchPledges();
  };

  const loadMore = () => {
    setPagination(prev => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }));
  };

  if (loading && pledges.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-8 text-center">
          <Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading pledges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <Heart className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Error loading pledges</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchPledges}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {userType === 'DONOR' ? 'My Pledges' : 'Available Tasks'}
            </h2>
            <p className="text-gray-600 mt-1">
              {total} {total === 1 ? 'pledge' : 'pledges'} found
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  <option value="">All statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="TASK1_COMPLETE">Pledge Created</option>
                  <option value="TASK2_COMPLETE">Coins Exchanged</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                <input
                  type="number"
                  value={filters.minAmount || ''}
                  onChange={(e) => handleFilterChange('minAmount', parseFloat(e.target.value))}
                  placeholder="$0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                <input
                  type="number"
                  value={filters.maxAmount || ''}
                  onChange={(e) => handleFilterChange('maxAmount', parseFloat(e.target.value))}
                  placeholder="$1000.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                <select
                  value={`${pagination.sortBy}-${pagination.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setPagination(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any, page: 1 }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  <option value="createdAt-desc">Newest first</option>
                  <option value="createdAt-asc">Oldest first</option>
                  <option value="amount-desc">Highest amount</option>
                  <option value="amount-asc">Lowest amount</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setFilters({});
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {pledges.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {userType === 'DONOR' ? 'No pledges yet' : 'No tasks available'}
            </h3>
            <p className="text-gray-600">
              {userType === 'DONOR' 
                ? 'Create your first pledge to get started!'
                : 'Tasks will appear here when pledges are made for you.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pledges.map((pledge) => (
              <PledgeStatusCard
                key={pledge.id}
                pledge={pledge as any} // We'll need to fetch task data separately or extend the API
                onUpdate={handlePledgeUpdate}
                showTasks={userType === 'DONOR'}
              />
            ))}

            {/* Load More Button */}
            {pledges.length < total && (
              <div className="text-center pt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    `Load More (${total - pledges.length} remaining)`
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}