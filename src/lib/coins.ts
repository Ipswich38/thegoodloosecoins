import { CoinCount } from '@/types/pledge';

// Coin values in dollars
export const COIN_VALUES = {
  quarters: 0.25,
  dimes: 0.10,
  nickels: 0.05,
  pennies: 0.01,
} as const;

export function calculateCoinTotal(coinCount: Partial<CoinCount>): number {
  const total = (
    (coinCount.quarters || 0) * COIN_VALUES.quarters +
    (coinCount.dimes || 0) * COIN_VALUES.dimes +
    (coinCount.nickels || 0) * COIN_VALUES.nickels +
    (coinCount.pennies || 0) * COIN_VALUES.pennies
  );
  
  return Math.round(total * 100) / 100; // Round to 2 decimal places
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function convertAmountToCoins(amount: number): CoinCount {
  let remaining = Math.round(amount * 100); // Convert to cents
  
  const quarters = Math.floor(remaining / 25);
  remaining -= quarters * 25;
  
  const dimes = Math.floor(remaining / 10);
  remaining -= dimes * 10;
  
  const nickels = Math.floor(remaining / 5);
  remaining -= nickels * 5;
  
  const pennies = remaining;
  
  return {
    quarters,
    dimes,
    nickels,
    pennies,
    total: amount,
  };
}

export function validateCoinCounts(coinCount: Partial<CoinCount>): string[] {
  const errors: string[] = [];
  
  // Check for negative values
  Object.entries(coinCount).forEach(([coin, count]) => {
    if (count && count < 0) {
      errors.push(`${coin} count cannot be negative`);
    }
  });
  
  // Check for reasonable maximums
  if (coinCount.quarters && coinCount.quarters > 1000) {
    errors.push('Too many quarters (max 1000)');
  }
  if (coinCount.dimes && coinCount.dimes > 1000) {
    errors.push('Too many dimes (max 1000)');
  }
  if (coinCount.nickels && coinCount.nickels > 1000) {
    errors.push('Too many nickels (max 1000)');
  }
  if (coinCount.pennies && coinCount.pennies > 1000) {
    errors.push('Too many pennies (max 1000)');
  }
  
  return errors;
}

export function getCoinDisplayName(coinType: keyof Omit<CoinCount, 'total'>): string {
  const names = {
    quarters: 'Quarters ($0.25)',
    dimes: 'Dimes ($0.10)',
    nickels: 'Nickels ($0.05)',
    pennies: 'Pennies ($0.01)',
  };
  
  return names[coinType];
}