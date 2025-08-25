export type PledgeStatus = 'PENDING' | 'TASK1_COMPLETE' | 'TASK2_COMPLETE' | 'COMPLETED';

export interface Pledge {
  id: string;
  donorId: string;
  amount: number;
  amountSent?: number | null;
  completionPercentage?: number | null;
  status: PledgeStatus;
  createdAt: string;
  updatedAt: string;
  donor?: {
    id: string;
    username: string;
    email: string | null;
  };
  donations?: Donation[];
}

export interface Donation {
  id: string;
  pledgeId: string;
  beneficiaryId: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  pledge?: Pledge;
  beneficiary?: {
    id: string;
    username: string;
    email: string | null;
  };
}

export interface SocialImpactPoint {
  id: string;
  userId: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePledgeRequest {
  amount: number;
}

export interface UpdatePledgeRequest {
  status: PledgeStatus;
  taskEvidence?: {
    type: 'photo' | 'receipt' | 'confirmation';
    url?: string;
    description?: string;
  };
}

export interface PledgeResponse {
  success: boolean;
  pledge?: Pledge;
  message?: string;
  error?: string;
}

export interface PledgesResponse {
  success: boolean;
  pledges?: Pledge[];
  total?: number;
  message?: string;
  error?: string;
}

export interface TaskCompletionRequest {
  pledgeId: string;
  taskType: 'task1' | 'task2' | 'task3';
  evidence?: {
    description: string;
    photoUrl?: string;
    receiptUrl?: string;
  };
}

export interface PledgeTask {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  evidence?: {
    description: string;
    photoUrl?: string;
    receiptUrl?: string;
  };
  points: number;
}

export interface PledgeWithTasks extends Pledge {
  tasks: PledgeTask[];
  totalPoints: number;
  earnedPoints: number;
}

export interface CoinCount {
  twentyPesos: number;   // ₱20 coins
  tenPesos: number;      // ₱10 coins
  fivePesos: number;     // ₱5 coins
  onePeso: number;       // ₱1 coins
  fiftyCentavos: number; // 50 centavos
  twentyFiveCentavos: number; // 25 centavos
  tenCentavos: number;   // 10 centavos
  fiveCentavos: number;  // 5 centavos
  oneCentavo: number;    // 1 centavo
  total: number;
}

export interface PledgeStats {
  totalPledged: number;
  totalAmountSent: number;
  activePledges: number;
  completedPledges: number;
  totalPoints: number;
  peopleHelped: number;
  averageCompletion: number;
}

export interface DoneeStats {
  availableFunds: number;
  activeTasks: number;
  completedTasks: number;
  pendingRewards: number;
  totalEarned: number;
}

export interface PledgeFilters {
  status?: PledgeStatus;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Validation schemas as types for runtime validation
export interface PledgeValidation {
  amount: {
    min: number;
    max: number;
    step: number;
  };
  coinCounts: {
    maxPerType: number;
    totalMax: number;
  };
  evidence: {
    maxDescriptionLength: number;
    allowedImageTypes: string[];
    maxImageSize: number;
  };
}

export const PLEDGE_VALIDATION: PledgeValidation = {
  amount: {
    min: 0.5,
    max: 1000,
    step: 0.01,
  },
  coinCounts: {
    maxPerType: 1000,
    totalMax: 2000,
  },
  evidence: {
    maxDescriptionLength: 500,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024, // 5MB
  },
};

// Point calculation constants
export const POINTS_CONFIG = {
  PLEDGE_CREATION: 10,
  TASK1_COMPLETION: 5,  // Automatic on pledge creation
  TASK2_COMPLETION: 15, // Exchange coins at store
  TASK3_COMPLETION: 20, // Transfer confirmation
  BONUS_THRESHOLDS: {
    SMALL: { min: 5, max: 24.99, bonus: 5 },
    MEDIUM: { min: 25, max: 99.99, bonus: 15 },
    LARGE: { min: 100, max: Infinity, bonus: 50 },
  },
} as const;

// Status transition rules
export const STATUS_TRANSITIONS: Record<PledgeStatus, PledgeStatus[]> = {
  PENDING: ['TASK1_COMPLETE'],
  TASK1_COMPLETE: ['TASK2_COMPLETE'],
  TASK2_COMPLETE: ['COMPLETED'],
  COMPLETED: [], // Final state
};

// Error types for better error handling
export interface PledgeError {
  code: 'INVALID_AMOUNT' | 'UNAUTHORIZED' | 'PLEDGE_NOT_FOUND' | 'INVALID_STATUS_TRANSITION' | 'VALIDATION_ERROR' | 'INSUFFICIENT_FUNDS' | 'TASK_NOT_READY' | 'EVIDENCE_REQUIRED';
  message: string;
  field?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: PledgeError;
  message?: string;
}