/**
 * Utility functions for salary and inflation calculations
 */

import type { InflationData } from '../services/inflationService';

export interface SalaryEntry {
  date: string; // YYYY-MM format
  amount: number;
}

export interface CalculationResult {
  date: string; // YYYY-MM format
  nominalSalary: number;
  realSalary: number;
  percentDifference: number;
}

/**
 * Calculates the inflation-adjusted salary for each month based on salary history and inflation data
 *
 * @param salaryHistory - Array of salary change entries with dates
 * @param inflationData - Monthly inflation rates from OECD
 * @param startDate - Start date for the calculation in YYYY-MM format
 * @param endDate - End date for the calculation in YYYY-MM format
 * @returns Array of monthly data with nominal and inflation-adjusted values
 */
export const calculateInflationAdjustedSalary = (
  salaryHistory: SalaryEntry[],
  inflationData: InflationData,
  startDate: string,
  endDate: string
): CalculationResult[] => {
  // Sort salary history by date
  const sortedSalaryHistory = [...salaryHistory].sort((a, b) => a.date.localeCompare(b.date));
  
  // Sort inflation data by date
  const sortedInflationData = [...inflationData.data].sort((a, b) => a.date.localeCompare(b.date));
  
  const result: CalculationResult[] = [];
  
  // Convert start and end dates to Date objects for comparison
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Initialize cumulative inflation factor (starts at 1.0 = no inflation)
  let cumulativeInflationFactor = 1.0;
  
  // Get the initial salary (use the first entry or 0 if none exists)
  let currentSalary = sortedSalaryHistory.length > 0 ? sortedSalaryHistory[0].amount : 0;
  let salaryIndex = 0;
  
  // Generate monthly data
  const current = new Date(start);
  while (current <= end) {
    const currentDateString = current.toISOString().slice(0, 7); // YYYY-MM format
    
    // Update current salary if we've reached a salary change date
    while (
      salaryIndex < sortedSalaryHistory.length &&
      sortedSalaryHistory[salaryIndex].date <= currentDateString
    ) {
      currentSalary = sortedSalaryHistory[salaryIndex].amount;
      salaryIndex++;
    }
    
    // Find the monthly inflation rate for the current month
    const monthlyInflation = sortedInflationData.find(item => item.date === currentDateString);
    
    // Update the cumulative inflation factor
    if (monthlyInflation) {
      // Convert annual inflation percentage to monthly factor
      // Note: This is a simplification. A more accurate approach would be to use compound interest formula
      const monthlyInflationRate = monthlyInflation.value / 12 / 100;
      cumulativeInflationFactor *= (1 + monthlyInflationRate);
    }
    
    // Calculate real (inflation-adjusted) salary
    const realSalary = currentSalary / cumulativeInflationFactor;
    
    // Calculate percentage difference
    const percentDifference = ((currentSalary - realSalary) / currentSalary) * 100;
    
    // Add to results
    result.push({
      date: currentDateString,
      nominalSalary: currentSalary,
      realSalary: realSalary,
      percentDifference: percentDifference,
    });
    
    // Move to the next month
    current.setMonth(current.getMonth() + 1);
  }
  
  return result;
};

/**
 * Formats a date string (YYYY-MM) to a more readable format (Month Year)
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

/**
 * Formats a number as currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Gets the total percentage loss due to inflation over the entire period
 */
export const getTotalPercentageLoss = (results: CalculationResult[]): number => {
  if (results.length === 0) return 0;
  
  const lastResult = results[results.length - 1];
  return lastResult.percentDifference;
};