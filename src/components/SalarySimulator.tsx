import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { toPng } from 'html-to-image';
import fetchInflationData, { COUNTRIES } from '../services/inflationService';
import type { SalaryEntry, CalculationResult } from '../utils/calculationUtils';
import { 
  calculateInflationAdjustedSalary, 
  formatDate, 
  formatCurrency,
  getTotalPercentageLoss
} from '../utils/calculationUtils';
import { generateShareableImage, shareOnSocialMedia } from '../utils/socialSharingUtils';
import pkg from 'file-saver';
const { saveAs } = pkg;

const SalarySimulator: React.FC = () => {
  // State for user inputs
  const [salaryEntries, setSalaryEntries] = useState<SalaryEntry[]>([
    { date: '2020-01', amount: 50000 } // TODO: Replace with country median salary
  ]);
  const [selectedCountry, setSelectedCountry] = useState('USA');
  // TODO: Replace with a more dynamic way to set the default date range
  // It should be based on the salary entries and the current date
  const [startDate, setStartDate] = useState('2020-01');
  const [endDate, setEndDate] = useState('2025-01');
  
  // State for results and loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [showRealSalary, setShowRealSalary] = useState(false);
  const [calculationComplete, setCalculationComplete] = useState(false);
  const [shareableImage, setShareableImage] = useState<string | null>(null);
  
  // Ref for the chart for screenshot functionality
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Add a new salary entry
  const addSalaryEntry = () => {
    const lastEntry = salaryEntries[salaryEntries.length - 1];
    const nextDate = new Date(lastEntry.date);
    nextDate.setMonth(nextDate.getMonth() + 12); // Set next entry to one year later
    
    setSalaryEntries([
      ...salaryEntries,
      { 
        date: nextDate.toISOString().slice(0, 7), 
        amount: lastEntry.amount + (lastEntry.amount * 0.02) // Example: 2% increase
      }
    ]);
  };
  
  // Remove a salary entry
  const removeSalaryEntry = (index: number) => {
    if (salaryEntries.length > 1) {
      setSalaryEntries(salaryEntries.filter((_, i) => i !== index));
    }
  };
  
  // Update a salary entry
  const updateSalaryEntry = (index: number, field: keyof SalaryEntry, value: string | number) => {
    const updatedEntries = [...salaryEntries];
    updatedEntries[index] = { 
      ...updatedEntries[index],
      [field]: field === 'amount' ? Number(value) : value
    };
    setSalaryEntries(updatedEntries);
  };
  
  // Fetch data and calculate results
  const calculateResults = async () => {
    try {
      setLoading(true);
      setError(null);
      setCalculationComplete(false);
      setShowRealSalary(false);
      
      // Validate inputs
      if (salaryEntries.length === 0) {
        throw new Error('Please add at least one salary entry');
      }
      
      if (new Date(startDate) >= new Date(endDate)) {
        throw new Error('End date must be after start date');
      }
      
      // Fetch inflation data
      const inflationData = await fetchInflationData(selectedCountry, startDate, endDate);
      
      // Calculate inflation-adjusted salaries
      const calculationResults = calculateInflationAdjustedSalary(
        salaryEntries,
        inflationData,
        startDate,
        endDate
      );
      
      setResults(calculationResults);
      setCalculationComplete(true);
      
      // Show the real salary line after a short delay for animation effect
      setTimeout(() => {
        setShowRealSalary(true);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
          <p className="font-semibold">{formatDate(label)}</p>
          <p className="text-blue-500">
            Nominal Salary: {formatCurrency(payload[0].value)}
          </p>
          {payload.length > 1 && (
            <p className="text-red-500">
              Real Salary: {formatCurrency(payload[1].value)}
            </p>
          )}
          {payload.length > 1 && (
            <p className="font-medium">
              Loss: {payload[0].payload.percentDifference.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  // Generate and save chart image
  const saveChartImage = async () => {
    if (chartRef.current) {
      try {
        const dataUrl = await toPng(chartRef.current, { quality: 0.95 });
        saveAs(dataUrl, 'inflation-impact.png');
      } catch (err) {
        console.error('Error saving image:', err);
      }
    }
  };
  
  // Generate social media sharing text
  const generateSharingText = (): string => {
    if (results.length === 0) return '';
    
    const totalLoss = getTotalPercentageLoss(results);
    return `My salary lost ${totalLoss.toFixed(1)}% of its value due to inflation! Has yours? Find out here: #InflationImpact`;
  };
  
  // Share on social media platforms
  const handleShare = async (platform: 'twitter' | 'facebook' | 'linkedin') => {
    if (!chartRef.current || results.length === 0) return;
    
    try {
      const { dataUrl, text } = await generateShareableImage(chartRef.current, results);
      setShareableImage(dataUrl);
      
      // Share the anonymized image and text
      shareOnSocialMedia(
        platform,
        text,
        window.location.href,
        dataUrl
      );
    } catch (err) {
      console.error('Error sharing results:', err);
      // Fallback to sharing without image
      shareOnSocialMedia(
        platform,
        generateSharingText(),
        window.location.href
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Enter Your Salary History</h2>
        
        <div className="mb-6">
          {salaryEntries.map((entry, index) => (
            <div key={index} className="flex flex-wrap gap-4 mb-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor={`salary-date-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="month"
                  id={`salary-date-${index}`}
                  value={entry.date}
                  onChange={(e) => updateSalaryEntry(index, 'date', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  aria-label={`Salary change date ${index + 1}`}
                />
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label htmlFor={`salary-amount-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Salary
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id={`salary-amount-${index}`}
                    value={entry.amount}
                    onChange={(e) => updateSalaryEntry(index, 'amount', e.target.value)}
                    className="w-full pl-7 p-2 border border-gray-300 rounded-md"
                    aria-label={`Salary amount ${index + 1}`}
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={() => removeSalaryEntry(index)}
                  className="p-2 border border-red-300 text-red-500 rounded-md hover:bg-red-50"
                  aria-label="Remove salary entry"
                  disabled={salaryEntries.length <= 1}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addSalaryEntry}
            className="mt-2 py-1 px-3 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            + Add Another Salary Change
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              id="country"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              aria-label="Select your country"
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="month"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              aria-label="Analysis start date"
            />
          </div>
          
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="month"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              aria-label="Analysis end date"
            />
          </div>
        </div>
        
        <button
          type="button"
          onClick={calculateResults}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Calculate Inflation Impact'}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>
      
      {calculationComplete && results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Salary vs. Inflation Over Time</h3>
              <div className="flex gap-2">
                <button
                  onClick={saveChartImage}
                  className="py-1 px-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Download Chart
                </button>
              </div>
            </div>
            
            <div className="h-80" ref={chartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={results}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    minTickGap={30}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value).replace('$', '')}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="nominalSalary" 
                    name="Nominal Salary" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  {showRealSalary && (
                    <Line 
                      type="monotone" 
                      dataKey="realSalary" 
                      name="Real Salary (Inflation-Adjusted)" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {showRealSalary && results.length > 0 && (
                    <ReferenceLine 
                      y={results[0].nominalSalary} 
                      stroke="#64748b" 
                      strokeDasharray="3 3"
                      label={{ value: 'Initial Value', position: 'insideBottomRight' }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {showRealSalary && results.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 rounded-md">
                <h4 className="font-semibold text-red-700">Impact Summary</h4>
                <p className="mt-1">
                  Your purchasing power has decreased by 
                  <span className="font-bold"> {getTotalPercentageLoss(results).toFixed(1)}% </span> 
                  due to inflation.
                </p>
                <p className="mt-1">
                  While your nominal salary is {formatCurrency(results[results.length - 1].nominalSalary)},
                  its real value is only {formatCurrency(results[results.length - 1].realSalary)}.
                </p>
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium mb-3">Share Your Results</h3>
            <p className="mb-3">{generateSharingText()}</p>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleShare('twitter')}
                className="button-primary bg-[#1DA1F2] hover:bg-[#1a8cd8]"
              >
                Share on Twitter
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="button-primary bg-[#4267B2] hover:bg-[#365899]"
              >
                Share on Facebook
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="button-primary bg-[#0077B5] hover:bg-[#006097]"
              >
                Share on LinkedIn
              </button>
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-4">
            <details className="text-gray-700">
              <summary className="font-medium cursor-pointer">Learn more about inflation and its impact</summary>
              <div className="mt-3 pl-4">
                <p className="mb-2">
                  <strong>What is inflation?</strong> Inflation is the rate at which the general level of prices 
                  for goods and services rises, leading to a decrease in purchasing power.
                </p>
                <p className="mb-2">
                  <strong>How does it affect salaries?</strong> When inflation outpaces salary growth, your 
                  purchasing power decreases even if your nominal salary increases.
                </p>
                <p>
                  <strong>What can you do?</strong> Consider negotiating regular cost-of-living adjustments 
                  in your salary, investing to offset inflation, and tracking your purchasing power over time.
                </p>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalarySimulator;