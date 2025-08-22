'use client';

import { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Camera, Upload, Star, DollarSign } from 'lucide-react';
import { PledgeWithTasks, PledgeTask, UpdatePledgeRequest } from '@/types/pledge';
import { formatCurrency } from '@/lib/coins';
import AmountSentForm from './AmountSentForm';

interface PledgeStatusCardProps {
  pledge: PledgeWithTasks;
  onUpdate?: (updatedPledge: any) => void;
  showTasks?: boolean;
  className?: string;
}

export default function PledgeStatusCard({ 
  pledge, 
  onUpdate, 
  showTasks = true, 
  className = '' 
}: PledgeStatusCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [taskEvidence, setTaskEvidence] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showAmountSentForm, setShowAmountSentForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'TASK2_COMPLETE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TASK1_COMPLETE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'TASK2_COMPLETE':
        return 'Coins Exchanged';
      case 'TASK1_COMPLETE':
        return 'Pledge Created';
      case 'PENDING':
        return 'Pending';
      default:
        return status;
    }
  };

  const getTaskIcon = (task: PledgeTask) => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const canCompleteTask = (task: PledgeTask) => {
    return task.status === 'in_progress' && task.id > 1; // Only tasks 2 and 3 need manual completion
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'TASK1_COMPLETE':
        return 'TASK2_COMPLETE';
      case 'TASK2_COMPLETE':
        return 'COMPLETED';
      default:
        return currentStatus;
    }
  };

  const handleTaskComplete = async (task: PledgeTask) => {
    if (!canCompleteTask(task)) return;

    setIsUpdating(true);
    setError(null);

    try {
      const newStatus = getNextStatus(pledge.status);
      
      const request: UpdatePledgeRequest = {
        status: newStatus as any,
        taskEvidence: {
          type: task.id === 2 ? 'photo' : 'receipt',
          description: taskEvidence || `Completed ${task.title}`,
        }
      };

      const response = await fetch(`/api/pledges/${pledge.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to update pledge');
      }

      onUpdate?.(data.pledge);
      setSelectedTaskId(null);
      setTaskEvidence('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  const progressPercentage = (pledge.earnedPoints / pledge.totalPoints) * 100;

  return (
    <div className={`bg-white rounded-lg shadow border ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {formatCurrency(pledge.amount)} Pledge
            </h3>
            <p className="text-sm text-gray-500">
              Created {new Date(pledge.createdAt).toLocaleDateString()}
            </p>
            {(pledge as any).amountSent !== undefined && (
              <div className="mt-2 text-sm">
                <span className="text-gray-600">Amount Sent: </span>
                <span className="font-semibold text-green-600">
                  {formatCurrency((pledge as any).amountSent || 0)}
                </span>
                <span className="text-gray-500 ml-2">
                  ({(((pledge as any).amountSent || 0) / pledge.amount * 100).toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(pledge.status)}`}>
              {getStatusText(pledge.status)}
            </div>
            {!showAmountSentForm && (pledge as any).amountSent !== undefined && (
              <button
                onClick={() => setShowAmountSentForm(true)}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Update amount sent"
              >
                <DollarSign className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900">
                {pledge.earnedPoints} / {pledge.totalPoints} points
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Tasks */}
        {showTasks && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Tasks</h4>
            {pledge.tasks.map((task) => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getTaskIcon(task)}
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900">{task.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      {task.completedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Completed {new Date(task.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs font-medium text-gray-600">{task.points}</span>
                    </div>
                    
                    {canCompleteTask(task) && (
                      <button
                        onClick={() => setSelectedTaskId(task.id)}
                        className="text-xs bg-primary-600 text-white px-3 py-1 rounded-md hover:bg-primary-700"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>

                {/* Task Completion Form */}
                {selectedTaskId === task.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {task.id === 2 ? 'Describe your coin exchange' : 'Describe your transfer'}
                        </label>
                        <textarea
                          value={taskEvidence}
                          onChange={(e) => setTaskEvidence(e.target.value)}
                          placeholder={task.id === 2 ? 
                            "Example: Exchanged coins at local grocery store coin counter" :
                            "Example: Transferred $25.47 via mobile banking to recipient"
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                          rows={2}
                        />
                      </div>

                      {task.id === 2 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <Camera className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-blue-800">Photo Evidence (Optional)</p>
                              <p className="text-xs text-blue-600 mt-1">
                                In a future version, you'll be able to upload a photo of your receipt or the coin exchange process.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                          {error}
                        </div>
                      )}

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTaskId(null);
                            setTaskEvidence('');
                            setError(null);
                          }}
                          disabled={isUpdating}
                          className="text-sm px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleTaskComplete(task)}
                          disabled={isUpdating || !taskEvidence.trim()}
                          className="text-sm px-4 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          {isUpdating ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              <span>Updating...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              <span>Complete Task</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Amount Sent Form */}
        {showAmountSentForm && (
          <div className="mt-6">
            <AmountSentForm
              pledgeId={pledge.id}
              pledgeAmount={pledge.amount}
              currentAmountSent={(pledge as any).amountSent || 0}
              onSuccess={() => {
                setShowAmountSentForm(false);
                if (onUpdate) {
                  onUpdate(pledge);
                }
              }}
              onCancel={() => setShowAmountSentForm(false)}
            />
          </div>
        )}

        {/* Donor Info */}
        {pledge.donor && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Pledged by:</span>
              <span className="font-medium text-gray-900">{pledge.donor.username}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}