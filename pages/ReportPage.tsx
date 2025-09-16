import React, { useMemo, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Transaction } from '../types';

const ReportPage: React.FC = () => {
    const { companyName } = useParams<{ companyName: string }>();
    const { transactions } = useAppContext();
    const [generationDate] = useState(new Date());
    
    // Get filter parameters from URL - same as CompanyHistoryPage
    const [searchParams] = useState(() => new URLSearchParams(window.location.search));
    const locationFilter = searchParams.get('location') || null;
    const filterType = searchParams.get('type') || 'all';
    const filterName = searchParams.get('name') || 'all';
    const searchTerm = searchParams.get('search') || '';
    
    // Check if we should show current date only (default behavior)
    const showAllDates = searchParams.get('showAllDates') === 'true';
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear().toString();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentDay = currentDate.getDate().toString().padStart(2, '0');
    
    // Get manual date filters from URL if showing all dates
    const filterYear = showAllDates ? (searchParams.get('year') || 'all') : currentYear;
    const filterMonth = showAllDates ? (searchParams.get('month') || 'all') : currentMonth;
    const filterDay = showAllDates ? (searchParams.get('day') || 'all') : currentDay;

    const decodedCompanyName = companyName ? decodeURIComponent(companyName) : '';

    useEffect(() => {
        // Automatically trigger print dialog when component mounts
        const timer = setTimeout(() => window.print(), 500);
        return () => clearTimeout(timer);
    }, []);
    
    const companyTransactions = useMemo(() => {
        let filtered = transactions.filter(tx => (tx.company || 'NA') === decodedCompanyName);
        
        // Apply location filter if specified
        if (locationFilter && locationFilter !== 'all') {
            filtered = filtered.filter(tx => tx.location === locationFilter);
        }
        
        // Apply date filters - default to current date unless showAllDates is true
        if (!showAllDates) {
            // Show current date only - same logic as CompanyHistoryPage
            const today = new Date();
            filtered = filtered.filter(tx => {
                const txDate = new Date(tx.date);
                return txDate.getFullYear() === today.getFullYear() &&
                       txDate.getMonth() === today.getMonth() &&
                       txDate.getDate() === today.getDate();
            });
        } else {
            // Apply manual date filters only if showAllDates is true
            if (filterYear !== 'all') {
                filtered = filtered.filter(tx => new Date(tx.date).getFullYear().toString() === filterYear);
            }
            if (filterMonth !== 'all') {
                filtered = filtered.filter(tx => (new Date(tx.date).getMonth() + 1).toString().padStart(2, '0') === filterMonth);
            }
            if (filterDay !== 'all') {
                filtered = filtered.filter(tx => new Date(tx.date).getDate().toString().padStart(2, '0') === filterDay);
            }
        }
        
        // Apply transaction type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(tx => tx.type === filterType);
        }
        
        // Apply person name filter (only if provided in URL)
        if (filterName && filterName !== 'all') {
            filtered = filtered.filter(tx => (tx.person || 'N/A') === filterName);
        }
        
        // Apply search filter - same logic as CompanyHistoryPage
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(tx => 
                tx.person?.toLowerCase().includes(searchLower) ||
                tx.amount.toString().includes(searchLower) ||
                tx.paymentMethod.toLowerCase().includes(searchLower)
            );
        }
        
        return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [transactions, decodedCompanyName, locationFilter, filterType, filterName, showAllDates, filterYear, filterMonth, filterDay, searchTerm]);

    const reportData = useMemo(() => {
        if (!companyTransactions.length) return null;

        const credits = companyTransactions.filter(tx => tx.type === 'credit');
        const debits = companyTransactions.filter(tx => tx.type === 'debit');

        const creditsByPerson = credits.reduce((acc, tx) => {
            const personName = tx.person || 'N/A';
            if (!acc[personName]) {
                acc[personName] = [];
            }
            acc[personName].push(tx);
            return acc;
        }, {} as {[key: string]: Transaction[]});

        const customers = Object.entries(creditsByPerson).map(([name, txs]: [string, Transaction[]]) => {
            const cash = txs.filter(tx => tx.paymentMethod === 'cash').map(tx => tx.amount);
            const upi = txs.filter(tx => tx.paymentMethod === 'upi').map(tx => tx.amount);
            const total = txs.reduce((sum, tx) => sum + tx.amount, 0);
            return { name, cash, upi, total };
        });

        const debitAmounts = debits.map(tx => tx.amount);
        const totalCredit = credits.reduce((sum, tx) => sum + tx.amount, 0);
        const totalDebit = debitAmounts.reduce((sum, amount) => sum + amount, 0);
        const closingBalance = totalCredit - totalDebit;

        return { customers, debitAmounts, totalCredit, totalDebit, closingBalance };
    }, [companyTransactions]);

    const formattedDate = (date: Date) => date.toLocaleString('en-IN', {
        day: '2-digit', month: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    });

    // Create a filter description for the report header
    const getFilterDescription = () => {
        const parts = [];
        if (!showAllDates) {
            parts.push(`Date: ${currentDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`);
        } else {
            if (filterYear !== 'all') parts.push(`Year: ${filterYear}`);
            if (filterMonth !== 'all') parts.push(`Month: ${filterMonth}`);
            if (filterDay !== 'all') parts.push(`Day: ${filterDay}`);
        }
        if (locationFilter && locationFilter !== 'all') parts.push(`Location: ${locationFilter}`);
        if (filterType !== 'all') parts.push(`Type: ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`);
        if (filterName !== 'all') parts.push(`Person: ${filterName}`);
        if (searchTerm.trim()) parts.push(`Search: "${searchTerm.trim()}"`);
        return parts.length > 0 ? parts.join(' | ') : 'All transactions';
    };

    if (!reportData) {
        return (
            <div className="text-center p-8">
                <p>No transactions found for {decodedCompanyName} matching the applied filters.</p>
                <p className="text-sm text-gray-600 mt-2">Filters applied: {getFilterDescription()}</p>
                <Link to={`/company/${companyName}`} className="text-blue-600 hover:underline mt-4 inline-block">Go Back</Link>
            </div>
        );
    }
    
    const currencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return (
        <div className="bg-white p-2 sm:p-4 md:p-6 lg:p-8 print-container min-w-0">
             <div className="text-center mb-2 sm:mb-4">
                 <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-black uppercase">Report for {decodedCompanyName}</h1>
                 <p className="text-xs sm:text-sm text-gray-600">Generated on: {formattedDate(generationDate)}</p>
                 <p className="text-xs sm:text-sm text-blue-600 font-medium">Filters: {getFilterDescription()}</p>
             </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-black text-xs sm:text-sm">
                    <thead className="font-bold bg-gray-100">
                        <tr>
                            <th rowSpan={2} className="border border-black p-1 sm:p-2 text-xs sm:text-sm">Customer Name</th>
                            <th colSpan={4} className="border border-black p-1 sm:p-2 text-xs sm:text-sm">Cash</th>
                            <th colSpan={4} className="border border-black p-1 sm:p-2 text-xs sm:text-sm">UPI</th>
                            <th rowSpan={2} className="border border-black p-1 sm:p-2 text-xs sm:text-sm">Total Credit</th>
                        </tr>
                        <tr>
                            <th className="border border-black p-1 sm:p-2 text-xs sm:text-sm">1st</th>
                            <th className="border border-black p-1 sm:p-2 text-xs sm:text-sm">2nd</th>
                            <th className="border border-black p-1 sm:p-2 text-xs sm:text-sm">3rd</th>
                            <th className="border border-black p-1 sm:p-2 text-xs sm:text-sm">4th</th>
                            <th className="border border-black p-1 sm:p-2 text-xs sm:text-sm">1st</th>
                            <th className="border border-black p-1 sm:p-2 text-xs sm:text-sm">2nd</th>
                            <th className="border border-black p-1 sm:p-2 text-xs sm:text-sm">3rd</th>
                            <th className="border border-black p-1 sm:p-2 text-xs sm:text-sm">4th</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.customers.map(customer => (
                            <tr key={customer.name}>
                                <td className="border border-black p-1 sm:p-2 font-semibold text-xs sm:text-sm">{customer.name}</td>
                                {[0, 1, 2, 3].map(i => <td key={`cash-${i}`} className="border border-black p-1 sm:p-2 text-right text-xs sm:text-sm">{customer.cash[i] ? currencyFormatter.format(customer.cash[i]) : ''}</td>)}
                                {[0, 1, 2, 3].map(i => <td key={`upi-${i}`} className="border border-black p-1 sm:p-2 text-right text-xs sm:text-sm">{customer.upi[i] ? currencyFormatter.format(customer.upi[i]) : ''}</td>)}
                                <td className="border border-black p-1 sm:p-2 text-right font-bold text-xs sm:text-sm">{currencyFormatter.format(customer.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="font-bold">
                        {/* Total Credit Row */}
                        <tr>
                            <td colSpan={9} className="border-t-2 border-black p-1 sm:p-2 text-right text-xs sm:text-sm">Total Credit</td>
                            <td className="border-t-2 border-black border-l border-black p-1 sm:p-2 text-right bg-green-100 text-xs sm:text-sm">{currencyFormatter.format(reportData.totalCredit)}</td>
                        </tr>

                        {/* Entry (Debit) Row */}
                        <tr>
                            <td className="border border-black p-1 sm:p-2 text-xs sm:text-sm">Entry</td>
                            {[0, 1, 2, 3].map(i => (
                                <td key={`debit-cash-${i}`} className="border border-black p-1 sm:p-2 text-right text-xs sm:text-sm">
                                    {reportData.debitAmounts[i] ? currencyFormatter.format(reportData.debitAmounts[i]) : ''}
                                </td>
                            ))}
                            {/* Empty cells to push the total to the end */}
                            <td colSpan={4} className="border-y border-r border-black p-1 sm:p-2"></td>
                            <td className="border border-black p-1 sm:p-2 text-right bg-red-100 text-xs sm:text-sm">{currencyFormatter.format(reportData.totalDebit)}</td>
                        </tr>

                        {/* Closing Balance Row */}
                        <tr>
                            <td colSpan={9} className="p-1 sm:p-2 text-right text-xs sm:text-sm">Closing Balance</td>
                            <td className={`border border-black p-1 sm:p-2 text-right text-xs sm:text-sm ${
                                reportData.closingBalance >= 0 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-600 font-bold'
                            }`}>
                                {reportData.closingBalance < 0 ? '-' : ''}₹{Math.abs(reportData.closingBalance).toLocaleString('en-IN')}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

             <div className="mt-4 sm:mt-8 text-center no-print">
                <Link to={`/company/${companyName}`} className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-gray-200 rounded-md hover:bg-gray-300">Go Back</Link>
                <button onClick={() => window.print()} className="ml-2 sm:ml-4 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Print Again</button>
            </div>
        </div>
    );
};

export default ReportPage;