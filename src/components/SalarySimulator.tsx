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
import { 
  generateShareableImage, 
  shareOnSocialMedia,
  shareToMastodon,
  shareToBlueSky
} from '../utils/socialSharingUtils';
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
        <div className="bg-white p-4 border border-tropical-3 shadow-md rounded-md">
          <p className="font-semibold text-tropical-1">{formatDate(label)}</p>
          <p className="text-tropical-2">
            Nominal Salary: {formatCurrency(payload[0].value)}
          </p>
          {payload.length > 1 && (
            <p className="text-tropical-5">
              Real Salary: {formatCurrency(payload[1].value)}
            </p>
          )}
          {payload.length > 1 && (
            <p className="font-medium text-tropical-1">
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

  // Handle share on Mastodon and Bluesky
  const handleMastodonShare = async () => {
    if (!chartRef.current || results.length === 0) return;
    
    try {
      const { dataUrl, text } = await generateShareableImage(chartRef.current, results);
      setShareableImage(dataUrl);
      
      // For Mastodon, we'll open a dialog to ask the user for their instance
      const instance = window.prompt('Enter your Mastodon instance URL (e.g., mastodon.social):', 'mastodon.social');
      if (!instance) return;
      
      // Use the utility function to share to Mastodon
      shareToMastodon(instance, text, window.location.href);
    } catch (err) {
      console.error('Error sharing results to Mastodon:', err);
    }
  };
  
  const handleBlueSkyShare = async () => {
    if (!chartRef.current || results.length === 0) return;
    
    try {
      const { dataUrl, text } = await generateShareableImage(chartRef.current, results);
      setShareableImage(dataUrl);
      
      // Use the utility function to share to BlueSky
      await shareToBlueSky(text, window.location.href);
    } catch (err) {
      console.error('Error sharing results to BlueSky:', err);
      // Fallback to basic text sharing
      const shareText = generateSharingText() + ' ' + window.location.href;
      navigator.clipboard.writeText(shareText).then(() => {
        window.open('https://bsky.app', '_blank');
        alert('Share text copied to clipboard. Please paste it in your BlueSky post.');
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero section similar to home page */}
      <section className="relative py-10 mb-12 bg-gradient-to-br from-tropical-1 to-tropical-2 text-white rounded-2xl overflow-hidden shadow-xl">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <svg className="absolute bottom-0 left-0 transform translate-y-1/4" width="2000" height="2000" fill="none">
            <circle cx="1000" cy="1000" r="800" stroke="white" strokeWidth="100" strokeOpacity="0.2" />
            <circle cx="1000" cy="1000" r="400" stroke="white" strokeWidth="100" strokeOpacity="0.4" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Visualize How <span className="text-tropical-4">Inflation</span> Affects Your Salary
            </h1>
            <p className="text-xl mb-4">
              Enter your salary history below to see the real impact of inflation over time.
            </p>
          </div>
        </div>
      </section>

      <div className="mb-12 bg-white p-6 lg:p-8 rounded-2xl shadow-lg border border-tropical-3/20">
        <div className="inline-block px-4 py-1 rounded-full bg-tropical-5 text-white font-medium text-sm mb-4">SALARY SIMULATOR</div>
        <h2 className="text-2xl font-bold mb-6 text-tropical-1">Enter Your Salary History</h2>
        
        <div className="mb-8 space-y-6">
          {salaryEntries.map((entry, index) => (
            <div key={index} className="flex flex-wrap gap-4 items-end p-4 bg-tropical-3/10 rounded-xl border border-tropical-3/20">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor={`salary-date-${index}`} className="block text-sm font-medium text-tropical-2 mb-2">
                  Date
                </label>
                <input
                  type="month"
                  id={`salary-date-${index}`}
                  value={entry.date}
                  onChange={(e) => updateSalaryEntry(index, 'date', e.target.value)}
                  className="w-full p-3 border-2 border-tropical-3 rounded-lg focus:ring-tropical-1 focus:border-tropical-1 shadow-sm"
                  aria-label={`Salary change date ${index + 1}`}
                />
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label htmlFor={`salary-amount-${index}`} className="block text-sm font-medium text-tropical-2 mb-2">
                  Monthly Salary
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-tropical-2 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id={`salary-amount-${index}`}
                    value={entry.amount}
                    onChange={(e) => updateSalaryEntry(index, 'amount', e.target.value)}
                    className="w-full pl-7 p-3 border-2 border-tropical-3 rounded-lg focus:ring-tropical-1 focus:border-tropical-1 shadow-sm"
                    aria-label={`Salary amount ${index + 1}`}
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={() => removeSalaryEntry(index)}
                  className="p-3 border-2 border-tropical-5/30 text-tropical-5 rounded-lg hover:bg-tropical-5/10 transition-colors"
                  aria-label="Remove salary entry"
                  disabled={salaryEntries.length <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addSalaryEntry}
            className="w-full py-3 px-4 bg-tropical-3/20 text-tropical-2 rounded-lg hover:bg-tropical-3/30 transition-colors flex items-center justify-center shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Another Salary Change
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-tropical-3/10 p-5 rounded-xl border border-tropical-3/20">
            <label htmlFor="country" className="block text-sm font-bold text-tropical-1 mb-2">
              Country
            </label>
            <select
              id="country"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full p-3 border-2 border-tropical-3 bg-white rounded-lg focus:ring-tropical-1 focus:border-tropical-1 shadow-sm"
              aria-label="Select your country"
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
          </div>
          
          <div className="bg-tropical-3/10 p-5 rounded-xl border border-tropical-3/20">
            <label htmlFor="start-date" className="block text-sm font-bold text-tropical-1 mb-2">
              Start Date
            </label>
            <input
              type="month"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 border-2 border-tropical-3 rounded-lg focus:ring-tropical-1 focus:border-tropical-1 shadow-sm"
              aria-label="Analysis start date"
            />
          </div>
          
          <div className="bg-tropical-3/10 p-5 rounded-xl border border-tropical-3/20">
            <label htmlFor="end-date" className="block text-sm font-bold text-tropical-1 mb-2">
              End Date
            </label>
            <input
              type="month"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 border-2 border-tropical-3 rounded-lg focus:ring-tropical-1 focus:border-tropical-1 shadow-sm"
              aria-label="Analysis end date"
            />
          </div>
        </div>
        
        <button
          type="button"
          onClick={calculateResults}
          disabled={loading}
          className="w-full py-4 px-6 bg-tropical-1 text-white rounded-lg hover:bg-tropical-1/90 focus:outline-none focus:ring-2 focus:ring-tropical-1 disabled:opacity-50 transition-all transform hover:scale-105 shadow-lg font-bold text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calculating...
            </span>
          ) : (
            'Calculate Inflation Impact'
          )}
        </button>
        
        {error && (
          <div className="mt-6 p-4 bg-tropical-5/10 text-tropical-5 rounded-xl border-l-4 border-tropical-5">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          </div>
        )}
      </div>
      
      {calculationComplete && results.length > 0 && (
        <div className="mb-12 bg-white p-8 rounded-2xl shadow-lg border border-tropical-3/20">
          <div className="inline-block px-4 py-1 rounded-full bg-tropical-1 text-white font-medium text-sm mb-4">RESULTS</div>
          <h2 className="text-3xl font-bold mb-6 text-tropical-1">Your Inflation Impact Results</h2>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-tropical-2">Salary vs. Inflation Over Time</h3>
              <div className="flex gap-2">
                <button
                  onClick={saveChartImage}
                  className="py-2 px-4 bg-tropical-3/20 text-tropical-2 rounded-lg hover:bg-tropical-3/30 transition-colors flex items-center shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Chart
                </button>
              </div>
            </div>
            
            <div className="h-80 bg-white p-4 rounded-xl shadow-inner border-2 border-tropical-3/20" ref={chartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={results}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#B4CF66" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    minTickGap={30}
                    tick={{ fill: '#146152' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value).replace('$', '')}
                    tick={{ fill: '#146152' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#146152' }} />
                  <Line 
                    type="monotone" 
                    dataKey="nominalSalary" 
                    name="Nominal Salary" 
                    stroke="#44803F" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  {showRealSalary && (
                    <Line 
                      type="monotone" 
                      dataKey="realSalary" 
                      name="Real Salary (Inflation-Adjusted)" 
                      stroke="#FF5A33" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {showRealSalary && results.length > 0 && (
                    <ReferenceLine 
                      y={results[0].nominalSalary} 
                      stroke="#B4CF66" 
                      strokeDasharray="3 3"
                      label={{ value: 'Initial Value', position: 'insideBottomRight', fill: '#44803F' }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {showRealSalary && results.length > 0 && (
              <div className="mt-8 p-0">
                <h4 className="text-2xl font-bold text-tropical-1 mb-6">Impact Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-tropical-5/10 to-tropical-5/20 p-6 rounded-xl shadow-sm border border-tropical-5/30">
                    <div className="flex items-center gap-4">
                      <div className="bg-tropical-5 rounded-full p-3 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-tropical-1 font-medium">Purchasing Power Decreased By</p>
                        <p className="text-4xl font-bold text-tropical-1 my-2">{getTotalPercentageLoss(results).toFixed(1)}%</p>
                        <p className="text-sm text-tropical-2">The silent tax of inflation has eroded your salary's value</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-tropical-1/10 to-tropical-1/20 p-6 rounded-xl shadow-sm border border-tropical-1/30">
                    <div className="flex items-center gap-4">
                      <div className="bg-tropical-1 rounded-full p-3 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-tropical-1 font-medium">Your Salary's Real Value</p>
                        <p className="text-4xl font-bold text-tropical-1 my-2">
                          {formatCurrency(results[results.length - 1].realSalary)}
                        </p>
                        <p className="text-sm text-tropical-2">vs nominal {formatCurrency(results[results.length - 1].nominalSalary)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t-2 border-tropical-3/20 pt-8 mt-8">
            <h3 className="text-2xl font-bold mb-4 text-tropical-1">Learn More About Inflation</h3>
            <div className="bg-gradient-to-br from-tropical-3/5 to-tropical-3/10 p-6 rounded-xl border border-tropical-3/20 mb-8">
              <div className="space-y-4">
                <div className="flex gap-3 items-center">
                  <div className="bg-tropical-1 rounded-full p-2 text-white shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <strong className="text-tropical-1">What is inflation?</strong>
                    <p>
                      Inflation is the rate at which the general level of prices 
                      for goods and services rises, leading to a decrease in purchasing power.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-center">
                  <div className="bg-tropical-5 rounded-full p-2 text-white shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <strong className="text-tropical-1">How does it affect salaries?</strong>
                    <p>
                      When inflation outpaces salary growth, your 
                      purchasing power decreases even if your nominal salary increases.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-center">
                  <div className="bg-tropical-4 rounded-full p-2 text-tropical-1 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <strong className="text-tropical-1">What can you do?</strong>
                    <p>
                      Consider negotiating regular cost-of-living adjustments 
                      in your salary, investing to offset inflation, and tracking your purchasing power over time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-4 text-tropical-1">Share Your Results</h3>
            {showRealSalary && results.length > 0 && (
              <p className="mb-6 text-tropical-2 p-4 bg-tropical-3/10 rounded-xl italic border-l-4 border-tropical-4">
                "{generateSharingText()}"
              </p>
            )}
            
            <div className="flex flex-wrap gap-4">
              {/* Mastodon Share Button */}
              <button
                onClick={handleMastodonShare}
                className="px-5 py-3 bg-[#6364FF] text-white rounded-lg hover:bg-[#6364FF]/90 transition-all flex items-center shadow-md transform hover:scale-105"
                disabled={!showRealSalary || results.length === 0}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"/>
                </svg>
                Mastodon
              </button>

              {/* BlueSky Share Button */}
              <button
                onClick={handleBlueSkyShare}
                className="px-5 py-3 bg-[#0085FF] text-white rounded-lg hover:bg-[#0085FF]/90 transition-all flex items-center shadow-md transform hover:scale-105"
                disabled={!showRealSalary || results.length === 0}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm-1.67 15.5v-5.137L16.5 17.5l-6.17-5.13v-3.1l10.67 8.63-10.67-2.155V17.5z"/>
                </svg>
                BlueSky
              </button>

              <button
                onClick={() => handleShare('linkedin')}
                className="px-5 py-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#0A66C2]/90 transition-all flex items-center shadow-md transform hover:scale-105"
                disabled={!showRealSalary || results.length === 0}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>

              <button
                onClick={() => handleShare('facebook')}
                className="px-5 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#1877F2]/90 transition-all flex items-center shadow-md transform hover:scale-105"
                disabled={!showRealSalary || results.length === 0}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              
              <button
                onClick={() => handleShare('twitter')}
                className="px-5 py-3 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1DA1F2]/90 transition-all flex items-center shadow-md transform hover:scale-105"
                disabled={!showRealSalary || results.length === 0}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.1 10.1 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalarySimulator;
