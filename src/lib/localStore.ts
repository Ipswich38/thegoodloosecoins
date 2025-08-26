// Simple local storage for demo/development purposes
// This will be replaced with a real database later

interface User {
  username: string;
  passcode: string;
  createdAt: string;
}

interface Pledge {
  id: string;
  username: string;
  beneficiaryId: string;
  beneficiaryName: string;
  amount: number;
  pledgedAt: string;
  confirmed: boolean;
  confirmedAt?: string;
}

interface LeaderboardEntry {
  id: string;
  username: string;
  totalPledged: number;
  totalSent: number;
  impactPoints: number;
  pledgeCount: number;
  rank: number;
}

const USERS_KEY = 'tglc_users';
const PLEDGES_KEY = 'tglc_pledges';
const CURRENT_USER_KEY = 'tglc_current_user';

// User Management
export function saveUser(username: string, passcode: string): void {
  const users = getUsers();
  const newUser: User = {
    username,
    passcode,
    createdAt: new Date().toISOString()
  };
  
  users[username] = newUser;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, username);
  
  // Dispatch event for real-time updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tglc-data-changed'));
  }
}

export function getUsers(): Record<string, User> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function getCurrentUser(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function setCurrentUser(username: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_USER_KEY, username);
}

export function verifyUser(username: string, passcode: string): boolean {
  const users = getUsers();
  const user = users[username];
  return user && user.passcode === passcode;
}

// Pledge Management
export function savePledge(
  username: string,
  beneficiaryId: string,
  beneficiaryName: string,
  amount: number
): string {
  const pledges = getPledges();
  const pledgeId = `pledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newPledge: Pledge = {
    id: pledgeId,
    username,
    beneficiaryId,
    beneficiaryName,
    amount,
    pledgedAt: new Date().toISOString(),
    confirmed: false
  };
  
  pledges[pledgeId] = newPledge;
  localStorage.setItem(PLEDGES_KEY, JSON.stringify(pledges));
  
  // Dispatch event for real-time updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tglc-data-changed'));
  }
  
  return pledgeId;
}

export function getPledges(): Record<string, Pledge> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(PLEDGES_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function getUserPledges(username: string): Pledge[] {
  const allPledges = getPledges();
  return Object.values(allPledges).filter(pledge => pledge.username === username);
}

export function getBeneficiaryPledges(beneficiaryId: string): Pledge[] {
  const allPledges = getPledges();
  return Object.values(allPledges).filter(pledge => pledge.beneficiaryId === beneficiaryId);
}

export function confirmPledge(pledgeId: string): boolean {
  const pledges = getPledges();
  const pledge = pledges[pledgeId];
  
  if (pledge && !pledge.confirmed) {
    pledge.confirmed = true;
    pledge.confirmedAt = new Date().toISOString();
    pledges[pledgeId] = pledge;
    localStorage.setItem(PLEDGES_KEY, JSON.stringify(pledges));
    
    // Dispatch event for real-time updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tglc-data-changed'));
    }
    
    return true;
  }
  
  return false;
}

// Statistics and Leaderboard
export function generateLeaderboard(): LeaderboardEntry[] {
  const pledges = getPledges();
  const userStats: Record<string, {
    totalPledged: number;
    totalSent: number;
    pledgeCount: number;
  }> = {};

  // Calculate stats for each user
  Object.values(pledges).forEach(pledge => {
    if (!userStats[pledge.username]) {
      userStats[pledge.username] = {
        totalPledged: 0,
        totalSent: 0,
        pledgeCount: 0
      };
    }

    const stats = userStats[pledge.username];
    stats.totalPledged += pledge.amount;
    stats.pledgeCount++;

    if (pledge.confirmed) {
      stats.totalSent += pledge.amount;
    }
  });

  // Convert to leaderboard entries and sort by impact points (totalSent)
  const entries: LeaderboardEntry[] = Object.entries(userStats).map(([username, stats]) => ({
    id: username,
    username,
    totalPledged: stats.totalPledged,
    totalSent: stats.totalSent,
    impactPoints: Math.floor(stats.totalSent), // 1 peso = 1 point
    pledgeCount: stats.pledgeCount,
    rank: 0 // Will be set below
  }));

  // Sort by impact points (descending) and assign ranks
  entries.sort((a, b) => b.impactPoints - a.impactPoints);
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return entries;
}

export function getGlobalStats() {
  const pledges = Object.values(getPledges());
  
  const totalPledged = pledges.reduce((sum, pledge) => sum + pledge.amount, 0);
  const totalSent = pledges
    .filter(pledge => pledge.confirmed)
    .reduce((sum, pledge) => sum + pledge.amount, 0);
  const totalImpactPoints = Math.floor(totalSent);
  
  return {
    totalPledged,
    totalSent,
    totalImpactPoints,
    totalPledges: pledges.length,
    totalUsers: Object.keys(getUsers()).length,
    beneficiaryCount: 2 // Fixed for now as we have 2 verified beneficiaries
  };
}

// Development helpers
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(PLEDGES_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function seedTestData(): void {
  // Only for development - remove in production
  if (process.env.NODE_ENV === 'production') return;
  
  clearAllData();
  
  // Add test users
  saveUser('TestUser1', '123456');
  saveUser('TestUser2', '654321');
  
  // Add test pledges
  savePledge('TestUser1', '1', 'Grade 11 Section Mercado', 250.50);
  savePledge('TestUser2', '2', 'CSJDM National Science High School', 180.75);
}