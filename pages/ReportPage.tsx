import React, { useMemo, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Transaction } from '../types';

const ReportPage: React.FC = () => {
    const { companyName } = useParams<{ companyName: string }>();
    const { transactions } = useAppContext();
    const [generationDate] = useState(new Date());

    const decodedCompanyName = companyName ? decodeURIComponent(companyName) : '';

    useEffect(() => {
        // Automatically trigger print dialog when component mounts
        const timer = setTimeout(() => window.print(), 500);
        return () => clearTimeout(timer);
    }, []);
    
    const companyTransactions = useMemo(() => {
        return transactions
            .filter(tx => (tx.company || 'NA') === decodedCompanyName)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [transactions, decodedCompanyName]);

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

    if (!reportData) {
        return (
            <div className="text-center p-8">
                <p>No transactions found for {decodedCompanyName} to generate a report.</p>
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