import React from 'react';
import { DENOMINATIONS } from '../constants';
import { NoteCounts } from '../types';

interface CurrencyCounterProps {
  value: NoteCounts;
  onChange: (newCounts: NoteCounts) => void;
}

const CurrencyCounter: React.FC<CurrencyCounterProps> = ({ value, onChange }) => {

  const handleCountChange = (denomination: number, count: number) => {
    const newCount = Math.max(0, count);
    onChange({ ...value, [denomination]: newCount });
  };

  return (
    <div className="space-y-2">
      {DENOMINATIONS.map((denom) => {
        const count = value[denom] || 0;
        const total = count * denom;
        return (
          <div key={denom} className="flex items-center justify-between gap-4">
            <label htmlFor={`denom-${denom}`} className="w-20 text-md font-medium text-gray-700 dark:text-gray-300">
              ₹{denom === 1 ? '1 Coin' : denom}
            </label>
            <input
              id={`denom-${denom}`}
              type="number"
              min="0"
              value={value[denom] || ''}
              onChange={(e) => handleCountChange(denom, parseInt(e.target.value, 10) || 0)}
              className="w-full max-w-xs px-3 py-1.5 text-center bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <span className="w-24 text-right text-md text-gray-600 dark:text-gray-400">
              = ₹{total.toLocaleString('en-IN')}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CurrencyCounter;
