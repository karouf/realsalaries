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
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (originalSalary !== '' && !isNaN(Number(originalSalary))) {
      calculateAdjustedSalary();
    }
  }, [originalSalary, year]);

  const calculateAdjustedSalary = () => {
    if (originalSalary === '' || isNaN(Number(originalSalary))) {
      setAdjustedSalary(null);
      setPercentageLoss(null);
      return;
    }

    // Start animation
    setIsAnimating(true);
    
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
    
    // End animation after a short delay
    setTimeout(() => setIsAnimating(false), 800);
  };

  return (
    <div className="p-2" id="quick-check">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="original-salary" className="block text-base font-bold text-tropical-1 mb-2">
              What was your salary?
            </label>
            <div className="relative rounded-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-tropical-2 sm:text-lg font-medium">$</span>
              </div>
              <input
                type="number"
                id="original-salary"
                className="block w-full pl-8 pr-12 py-3 rounded-lg border-2 border-tropical-3 text-xl shadow-sm focus:border-tropical-1 focus:ring focus:ring-tropical-1/30 transition-all"
                placeholder="e.g. 50000"
                value={originalSalary}
                onChange={(e) => setOriginalSalary(e.target.value === '' ? '' : Number(e.target.value))}
                aria-label="Enter your original salary"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="year" className="block text-base font-bold text-tropical-1 mb-2">
              From which year?
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="block w-full py-3 px-4 border-2 border-tropical-3 bg-white rounded-lg shadow-sm text-lg focus:outline-none focus:ring focus:ring-tropical-1/30 focus:border-tropical-1 transition-all"
              aria-label="Select the year of your original salary"
            >
              {Object.keys(SAMPLE_INFLATION_RATES).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className={`bg-gradient-to-br from-tropical-1 to-tropical-2 p-5 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-500 ${
          adjustedSalary !== null ? 'opacity-100' : 'opacity-80'
        }`}>
          {adjustedSalary !== null ? (
            <div className="text-center text-white">
              <p className="text-tropical-4 font-medium mb-1">Adjusted for inflation</p>
              <h3 className="font-bold text-3xl mb-3 text-white">
                ${Math.round(adjustedSalary).toLocaleString()}
              </h3>
              <div className={`transition-all duration-500 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
                <div className="bg-tropical-5/90 rounded-full py-2 px-4 inline-block">
                  <p className="font-bold">
                    {percentageLoss?.toFixed(1)}% Loss
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-tropical-4/90">
                That's how much your ${originalSalary.toLocaleString()} from {year} is worth today
              </p>
            </div>
          ) : (
            <div className="text-center text-white/90 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-tropical-4/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p className="text-xl">Enter your salary to see its inflation-adjusted value</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 text-sm text-tropical-2 bg-tropical-3/10 p-3 rounded-lg">
        <p>This is a simplified calculation based on average annual inflation rates. For a more detailed analysis with your complete salary history, try our <a href="/simulator" className="text-tropical-5 hover:text-tropical-1 hover:underline font-medium transition-colors">full simulator →</a></p>
      </div>
    </div>
  );
};

export default QuickCalculator;