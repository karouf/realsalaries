import React, { useState, useEffect } from 'react';

interface InflationRates {
  [year: string]: number;
}

// Simplified inflation data for demonstration
// In a real application, this would come from the OECD API
const SAMPLE_INFLATION_RATES: InflationRates = {
  '2020': 1.4,
  '2021': 3.1,
  '2022': 6.5,
  '2023': 4.0,
  '2024': 2.7,
  '2025': 2.3,
};

const QuickCalculator: React.FC = () => {
  const [originalSalary, setOriginalSalary] = useState<number | ''>('');
  const [year, setYear] = useState<string>('2020');
  const [adjustedSalary, setAdjustedSalary] = useState<number | null>(null);
  const [percentageLoss, setPercentageLoss] = useState<number | null>(null);

  useEffect(() => {
    calculateAdjustedSalary();
  }, [originalSalary, year]);

  const calculateAdjustedSalary = () => {
    if (originalSalary === '' || isNaN(Number(originalSalary))) {
      setAdjustedSalary(null);
      setPercentageLoss(null);
      return;
    }

    const salary = Number(originalSalary);
    let inflationFactor = 1;
    
    // Calculate cumulative inflation from selected year to current year
    const selectedYear = parseInt(year);
    const currentYear = 2025;
    
    for (let y = selectedYear; y < currentYear; y++) {
      if (SAMPLE_INFLATION_RATES[y.toString()]) {
        inflationFactor *= (1 + SAMPLE_INFLATION_RATES[y.toString()] / 100);
      }
    }
    
    const adjusted = salary / inflationFactor;
    const percentLoss = ((salary - adjusted) / salary) * 100;
    
    setAdjustedSalary(adjusted);
    setPercentageLoss(percentLoss);
  };

  return (
    <div className="bg-tropical-3/20 p-6 rounded-lg shadow-md" id="quick-check">
      <h2 className="text-tropical-1 text-xl font-bold mb-4">Quick Inflation Calculator</h2>
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="original-salary" className="block text-sm font-medium text-tropical-1 mb-1">
            Original Salary
          </label>
          <div className="relative rounded-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-tropical-2 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="original-salary"
              className="block w-full pl-7 pr-12 py-2 rounded-md border-tropical-3 shadow-sm focus:border-tropical-1 focus:ring-tropical-1"
              placeholder="0.00"
              value={originalSalary}
              onChange={(e) => setOriginalSalary(e.target.value === '' ? '' : Number(e.target.value))}
              aria-label="Enter your original salary"
            />
          </div>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="year" className="block text-sm font-medium text-tropical-1 mb-1">
            From Year
          </label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="block w-full py-2 px-3 border border-tropical-3 bg-white rounded-md shadow-sm focus:outline-none focus:ring-tropical-1 focus:border-tropical-1"
            aria-label="Select the year of your original salary"
          >
            {Object.keys(SAMPLE_INFLATION_RATES).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      
      {adjustedSalary !== null && (
        <div className="bg-white p-4 rounded-md border border-tropical-3 shadow-md">
          <h3 className="font-bold text-lg mb-2 text-tropical-1">Result</h3>
          <p className="text-tropical-2">Your salary of <span className="font-semibold">${originalSalary.toLocaleString()}</span> from {year} would be worth:</p>
          <p className="text-2xl font-bold text-tropical-5 my-2">
            ${adjustedSalary.toFixed(2).toLocaleString()} today
          </p>
          <p className="text-tropical-5">
            That's a <span className="font-bold">{percentageLoss?.toFixed(1)}%</span> loss in purchasing power!
          </p>
        </div>
      )}
      
      <div className="mt-4 text-sm text-tropical-2">
        <p>This simplified calculation is based on average annual inflation rates. For a more detailed analysis with your complete salary history, use our <a href="/simulator" className="text-tropical-5 hover:text-tropical-1 hover:underline transition-colors">full simulator</a>.</p>
      </div>
    </div>
  );
};

export default QuickCalculator;