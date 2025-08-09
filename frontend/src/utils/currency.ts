// Currency conversion utilities for Malaysian Government Transparency Platform

// Exchange rate: 1 MATIC = 3 MYR (approximate)
const MATIC_TO_MYR_RATE = 3.0;

/**
 * Convert MATIC amount to MYR and format as currency
 * @param maticAmount - Amount in MATIC (as string or number)
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted MYR currency string
 */
export const formatMYRFromMATIC = (maticAmount: string | number, showDecimals: boolean = true): string => {
  const matic = typeof maticAmount === 'string' ? parseFloat(maticAmount) : maticAmount;
  if (isNaN(matic)) return 'RM 0.00';
  
  const myr = matic * MATIC_TO_MYR_RATE;
  
  if (showDecimals) {
    // For amounts over 1 million, show in millions
    if (myr >= 1000000) {
      return `RM ${(myr / 1000000).toFixed(2)}M`;
    }
    // For amounts over 1 thousand, show in thousands
    if (myr >= 1000) {
      return `RM ${(myr / 1000).toFixed(1)}K`;
    }
    // For smaller amounts, show with 2 decimal places
    return `RM ${myr.toFixed(2)}`;
  } else {
    // For large amounts without decimals
    if (myr >= 1000000) {
      return `RM ${Math.round(myr / 1000000)}M`;
    }
    if (myr >= 1000) {
      return `RM ${Math.round(myr / 1000)}K`;
    }
    return `RM ${Math.round(myr)}`;
  }
};

/**
 * Format percentage
 * @param value - Percentage value
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Format rating with stars
 * @param rating - Rating value (0-5)
 * @returns Formatted rating string
 */
export const formatRating = (rating: number): string => {
  return `${rating.toFixed(1)}⭐`;
};

/**
 * Get the conversion rate for display purposes
 * @returns Current MATIC to MYR rate
 */
export const getExchangeRate = (): number => {
  return MATIC_TO_MYR_RATE;
};

/**
 * Format large numbers for charts (used in Y-axis labels)
 * @param value - Number to format
 * @returns Formatted number string
 */
export const formatChartCurrency = (value: number): string => {
  const myr = value * MATIC_TO_MYR_RATE;
  return `RM ${(myr / 1000000).toFixed(0)}M`;
};