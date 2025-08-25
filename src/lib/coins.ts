import { CoinCount } from '@/types/pledge';

// Coin values in Philippine Pesos
export const COIN_VALUES = {
  quarters: 5.00,    // ₱5 coin
  dimes: 1.00,       // ₱1 coin
  nickels: 0.50,     // 50 centavos
  pennies: 0.25,     // 25 centavos
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
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function convertAmountToCoins(amount: number): CoinCount {
  let remaining = Math.round(amount * 100); // Convert to centavos
  
  const quarters = Math.floor(remaining / 500); // ₱5 coins
  remaining -= quarters * 500;
  
  const dimes = Math.floor(remaining / 100);    // ₱1 coins
  remaining -= dimes * 100;
  
  const nickels = Math.floor(remaining / 50);   // 50 centavos
  remaining -= nickels * 50;
  
  const pennies = Math.floor(remaining / 25);   // 25 centavos
  
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
    quarters: '₱5 Coins (₱5.00)',
    dimes: '₱1 Coins (₱1.00)',
    nickels: '50 Centavos (₱0.50)',
    pennies: '25 Centavos (₱0.25)',
  };
  
  return names[coinType];
}