import { CoinCount } from '@/types/pledge';

// Coin values in Philippine Pesos
export const COIN_VALUES = {
  twentyPesos: 20.00,        // ₱20 coin
  tenPesos: 10.00,           // ₱10 coin
  fivePesos: 5.00,           // ₱5 coin
  onePeso: 1.00,             // ₱1 coin
  fiftyCentavos: 0.50,       // 50 centavos
  twentyFiveCentavos: 0.25,  // 25 centavos
  tenCentavos: 0.10,         // 10 centavos
  fiveCentavos: 0.05,        // 5 centavos
  oneCentavo: 0.01,          // 1 centavo
} as const;

export function calculateCoinTotal(coinCount: Partial<CoinCount>): number {
  const total = (
    (coinCount.twentyPesos || 0) * COIN_VALUES.twentyPesos +
    (coinCount.tenPesos || 0) * COIN_VALUES.tenPesos +
    (coinCount.fivePesos || 0) * COIN_VALUES.fivePesos +
    (coinCount.onePeso || 0) * COIN_VALUES.onePeso +
    (coinCount.fiftyCentavos || 0) * COIN_VALUES.fiftyCentavos +
    (coinCount.twentyFiveCentavos || 0) * COIN_VALUES.twentyFiveCentavos +
    (coinCount.tenCentavos || 0) * COIN_VALUES.tenCentavos +
    (coinCount.fiveCentavos || 0) * COIN_VALUES.fiveCentavos +
    (coinCount.oneCentavo || 0) * COIN_VALUES.oneCentavo
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
  
  const twentyPesos = Math.floor(remaining / 2000); // ₱20 coins
  remaining -= twentyPesos * 2000;
  
  const tenPesos = Math.floor(remaining / 1000);    // ₱10 coins
  remaining -= tenPesos * 1000;
  
  const fivePesos = Math.floor(remaining / 500);    // ₱5 coins
  remaining -= fivePesos * 500;
  
  const onePeso = Math.floor(remaining / 100);      // ₱1 coins
  remaining -= onePeso * 100;
  
  const fiftyCentavos = Math.floor(remaining / 50); // 50 centavos
  remaining -= fiftyCentavos * 50;
  
  const twentyFiveCentavos = Math.floor(remaining / 25); // 25 centavos
  remaining -= twentyFiveCentavos * 25;
  
  const tenCentavos = Math.floor(remaining / 10);   // 10 centavos
  remaining -= tenCentavos * 10;
  
  const fiveCentavos = Math.floor(remaining / 5);   // 5 centavos
  remaining -= fiveCentavos * 5;
  
  const oneCentavo = remaining; // 1 centavo (remaining)
  
  return {
    twentyPesos,
    tenPesos,
    fivePesos,
    onePeso,
    fiftyCentavos,
    twentyFiveCentavos,
    tenCentavos,
    fiveCentavos,
    oneCentavo,
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
  if (coinCount.twentyPesos && coinCount.twentyPesos > 500) {
    errors.push('Too many ₱20 coins (max 500)');
  }
  if (coinCount.tenPesos && coinCount.tenPesos > 1000) {
    errors.push('Too many ₱10 coins (max 1000)');
  }
  if (coinCount.fivePesos && coinCount.fivePesos > 1000) {
    errors.push('Too many ₱5 coins (max 1000)');
  }
  if (coinCount.onePeso && coinCount.onePeso > 1000) {
    errors.push('Too many ₱1 coins (max 1000)');
  }
  if (coinCount.fiftyCentavos && coinCount.fiftyCentavos > 1000) {
    errors.push('Too many 50 centavos (max 1000)');
  }
  if (coinCount.twentyFiveCentavos && coinCount.twentyFiveCentavos > 1000) {
    errors.push('Too many 25 centavos (max 1000)');
  }
  if (coinCount.tenCentavos && coinCount.tenCentavos > 2000) {
    errors.push('Too many 10 centavos (max 2000)');
  }
  if (coinCount.fiveCentavos && coinCount.fiveCentavos > 2000) {
    errors.push('Too many 5 centavos (max 2000)');
  }
  if (coinCount.oneCentavo && coinCount.oneCentavo > 5000) {
    errors.push('Too many 1 centavo (max 5000)');
  }
  
  return errors;
}

export function getCoinDisplayName(coinType: keyof Omit<CoinCount, 'total'>): string {
  const names = {
    twentyPesos: '₱20 Coins (₱20.00)',
    tenPesos: '₱10 Coins (₱10.00)',
    fivePesos: '₱5 Coins (₱5.00)',
    onePeso: '₱1 Coins (₱1.00)',
    fiftyCentavos: '50 Centavos (₱0.50)',
    twentyFiveCentavos: '25 Centavos (₱0.25)',
    tenCentavos: '10 Centavos (₱0.10)',
    fiveCentavos: '5 Centavos (₱0.05)',
    oneCentavo: '1 Centavo (₱0.01)',
  };
  
  return names[coinType];
}