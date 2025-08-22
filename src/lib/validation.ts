import { PLEDGE_VALIDATION, PledgeError, CreatePledgeRequest, UpdatePledgeRequest } from '@/types/pledge';

// Generic validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: PledgeError[];
}

// Utility function to create validation errors
export function createValidationError(
  code: PledgeError['code'],
  message: string,
  field?: string
): PledgeError {
  return { code, message, field };
}

// Validate pledge amount
export function validatePledgeAmount(amount: number): ValidationResult {
  const errors: PledgeError[] = [];

  if (typeof amount !== 'number' || isNaN(amount)) {
    errors.push(createValidationError('INVALID_AMOUNT', 'Amount must be a valid number', 'amount'));
    return { isValid: false, errors };
  }

  if (amount < PLEDGE_VALIDATION.amount.min) {
    errors.push(createValidationError(
      'INVALID_AMOUNT',
      `Amount must be at least $${PLEDGE_VALIDATION.amount.min}`,
      'amount'
    ));
  }

  if (amount > PLEDGE_VALIDATION.amount.max) {
    errors.push(createValidationError(
      'INVALID_AMOUNT',
      `Amount cannot exceed $${PLEDGE_VALIDATION.amount.max}`,
      'amount'
    ));
  }

  // Check if amount has valid precision (cents)
  if (Math.round(amount * 100) / 100 !== amount) {
    errors.push(createValidationError(
      'INVALID_AMOUNT',
      'Amount must be in valid currency format (cents)',
      'amount'
    ));
  }

  return { isValid: errors.length === 0, errors };
}

// Validate create pledge request
export function validateCreatePledgeRequest(request: CreatePledgeRequest): ValidationResult {
  const errors: PledgeError[] = [];

  // Validate amount
  const amountValidation = validatePledgeAmount(request.amount);
  errors.push(...amountValidation.errors);

  return { isValid: errors.length === 0, errors };
}

// Validate update pledge request
export function validateUpdatePledgeRequest(request: UpdatePledgeRequest): ValidationResult {
  const errors: PledgeError[] = [];

  // Validate status
  const validStatuses = ['PENDING', 'TASK1_COMPLETE', 'TASK2_COMPLETE', 'COMPLETED'];
  if (!validStatuses.includes(request.status)) {
    errors.push(createValidationError(
      'VALIDATION_ERROR',
      'Invalid status value',
      'status'
    ));
  }

  // Validate task evidence for certain statuses
  if ((request.status === 'TASK2_COMPLETE' || request.status === 'COMPLETED') && 
      !request.taskEvidence?.description?.trim()) {
    errors.push(createValidationError(
      'EVIDENCE_REQUIRED',
      'Task evidence description is required for this status',
      'taskEvidence.description'
    ));
  }

  // Validate evidence description length
  if (request.taskEvidence?.description && 
      request.taskEvidence.description.length > PLEDGE_VALIDATION.evidence.maxDescriptionLength) {
    errors.push(createValidationError(
      'VALIDATION_ERROR',
      `Evidence description cannot exceed ${PLEDGE_VALIDATION.evidence.maxDescriptionLength} characters`,
      'taskEvidence.description'
    ));
  }

  return { isValid: errors.length === 0, errors };
}

// Validate email format
export function validateEmail(email: string): ValidationResult {
  const errors: PledgeError[] = [];
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push(createValidationError(
      'VALIDATION_ERROR',
      'Invalid email format',
      'email'
    ));
  }

  return { isValid: errors.length === 0, errors };
}

// Validate username format
export function validateUsername(username: string): ValidationResult {
  const errors: PledgeError[] = [];

  if (!username || username.trim().length === 0) {
    errors.push(createValidationError(
      'VALIDATION_ERROR',
      'Username is required',
      'username'
    ));
    return { isValid: false, errors };
  }

  if (username.length < 2) {
    errors.push(createValidationError(
      'VALIDATION_ERROR',
      'Username must be at least 2 characters long',
      'username'
    ));
  }

  if (username.length > 50) {
    errors.push(createValidationError(
      'VALIDATION_ERROR',
      'Username cannot exceed 50 characters',
      'username'
    ));
  }

  // Check for valid characters (alphanumeric, underscore, hyphen)
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    errors.push(createValidationError(
      'VALIDATION_ERROR',
      'Username can only contain letters, numbers, underscores, and hyphens',
      'username'
    ));
  }

  return { isValid: errors.length === 0, errors };
}

// Validate pagination parameters
export function validatePaginationParams(params: any): ValidationResult {
  const errors: PledgeError[] = [];

  if (params.page !== undefined) {
    const page = parseInt(params.page);
    if (isNaN(page) || page < 1) {
      errors.push(createValidationError(
        'VALIDATION_ERROR',
        'Page must be a positive integer',
        'page'
      ));
    }
  }

  if (params.limit !== undefined) {
    const limit = parseInt(params.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push(createValidationError(
        'VALIDATION_ERROR',
        'Limit must be between 1 and 100',
        'limit'
      ));
    }
  }

  if (params.sortBy !== undefined) {
    const validSortFields = ['createdAt', 'amount', 'status'];
    if (!validSortFields.includes(params.sortBy)) {
      errors.push(createValidationError(
        'VALIDATION_ERROR',
        'Invalid sort field',
        'sortBy'
      ));
    }
  }

  if (params.sortOrder !== undefined) {
    const validSortOrders = ['asc', 'desc'];
    if (!validSortOrders.includes(params.sortOrder)) {
      errors.push(createValidationError(
        'VALIDATION_ERROR',
        'Invalid sort order',
        'sortOrder'
      ));
    }
  }

  return { isValid: errors.length === 0, errors };
}

// Sanitize user input
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

// Validate file upload (for future photo evidence feature)
export function validateFile(file: File): ValidationResult {
  const errors: PledgeError[] = [];

  // Check file size
  if (file.size > PLEDGE_VALIDATION.evidence.maxImageSize) {
    errors.push(createValidationError(
      'VALIDATION_ERROR',
      `File size cannot exceed ${PLEDGE_VALIDATION.evidence.maxImageSize / (1024 * 1024)}MB`,
      'file'
    ));
  }

  // Check file type
  if (!PLEDGE_VALIDATION.evidence.allowedImageTypes.includes(file.type)) {
    errors.push(createValidationError(
      'VALIDATION_ERROR',
      'Invalid file type. Only JPEG, PNG, and WebP images are allowed',
      'file'
    ));
  }

  return { isValid: errors.length === 0, errors };
}

// Format validation errors for display
export function formatValidationErrors(errors: PledgeError[]): string[] {
  return errors.map(error => error.message);
}

// Check if error is a specific type
export function isValidationError(error: any): error is PledgeError {
  return error && typeof error === 'object' && 'code' in error && 'message' in error;
}

// Generic API response handler
export function handleApiError(error: any): PledgeError {
  if (isValidationError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return createValidationError('VALIDATION_ERROR', error.message);
  }

  if (typeof error === 'string') {
    return createValidationError('VALIDATION_ERROR', error);
  }

  return createValidationError('VALIDATION_ERROR', 'An unexpected error occurred');
}

// Rate limiting helper (for future implementation)
export function createRateLimitError(): PledgeError {
  return createValidationError(
    'VALIDATION_ERROR',
    'Too many requests. Please try again later.'
  );
}

// Authentication helper
export function createAuthError(message: string = 'Authentication required'): PledgeError {
  return createValidationError('UNAUTHORIZED', message);
}