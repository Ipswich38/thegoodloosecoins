'use client';
import { useState } from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface Pledge {
  id: string;
  amount: number;
  status: string;
  task1Done: boolean;
  task2Done: boolean;
  task3Done: boolean;
  createdAt: string;
}

interface TaskCardProps {
  pledge: Pledge;
  onUpdate: () => void;
}

export default function TaskCard({ pledge, onUpdate }: TaskCardProps) {
  const [updating, setUpdating] = useState(false);

  const tasks = [
    {
      id: 'task1',
      title: 'Pledge the amount of on-hand/counted loose coins',
      completed: pledge.task1Done,
      points: 10,
    },
    {
      id: 'task2',
      title: 'Done exchanging to the nearest stores that accept loose coins',
      completed: pledge.task2Done,
      points: 10,
    },
    {
      id: 'task3',
      title: 'Successful transfer of exchanged loose coins',
      completed: pledge.task3Done,
      points: 10,
    },
  ];

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalPoints = completedTasks * 10;

  const handleTaskToggle = async (taskId: string) => {
    setUpdating(true);
    try {
      await fetch(`/api/pledges/${pledge.id}/tasks`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            ₱{pledge.amount.toFixed(2)} Pledge
          </h3>
          <p className="text-sm text-gray-500">
            Created {new Date(pledge.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">
            Progress: {completedTasks}/3 Tasks
          </div>
          <div className="text-sm font-medium text-green-600">
            {totalPoints} Social Impact Points
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
          >
            <button
              onClick={() => handleTaskToggle(task.id)}
              disabled={updating || task.completed}
              className="flex-shrink-0"
            >
              {task.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 hover:text-primary-600" />
              )}
            </button>
            
            <div className="flex-grow">
              <p className={`text-sm ${task.completed ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                {task.title}
              </p>
            </div>
            
            <div className="text-xs text-gray-500">
              +{task.points} pts
            </div>
          </div>
        ))}
      </div>

      {completedTasks === 3 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              All tasks completed! You've earned {totalPoints} Social Impact Points.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}