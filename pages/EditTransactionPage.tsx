import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Transaction, NoteCounts, TransactionType } from '../types';
import { DENOMINATIONS } from '../constants';
import CurrencyCounter from '../components/CurrencyCounter';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import { UserIcon } from '../components/icons/UserIcon';
import { BuildingOfficeIcon } from '../components/icons/BuildingOfficeIcon';
import { MapPinIcon } from '../components/icons/MapPinIcon';
import { TrendingUpIcon } from '../components/icons/TrendingUpIcon';
import { TrendingDownIcon } from '../components/icons/TrendingDownIcon';

const EditTransactionPage: React.FC = () => {
    const { transactionId } = useParams<{ transactionId: string }>();
    const navigate = useNavigate();
    const { transactions, updateTransaction, companyNames, locations } = useAppContext();

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    
    // Form state
    const [person, setPerson] = useState('');
    const [company, setCompany] = useState('');
    const [location, setLocation] = useState('');
    const [recordedBy, setRecordedBy] = useState('');
    const [transactionType, setTransactionType] = useState<TransactionType>('credit');
    const [amount, setAmount] = useState<number>(0);
    const [breakdown, setBreakdown] = useState<NoteCounts>({});

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const txToEdit = transactions.find(t => t.id === transactionId);
        if (txToEdit) {
            setTransaction(txToEdit);
            setPerson(txToEdit.person || '');
            setCompany(txToEdit.company || 'NA');
            setLocation(txToEdit.location);
            setRecordedBy(txToEdit.recordedBy);
            setTransactionType(txToEdit.type);
            setAmount(txToEdit.amount);
            if (txToEdit.paymentMethod === 'cash' && txToEdit.breakdown) {
                setBreakdown(txToEdit.breakdown);
            }
        } else {
            navigate('/history');
        }
    }, [transactionId, transactions, navigate]);

    const totalAmount = useMemo(() => {
        if (transaction?.paymentMethod === 'cash') {
             return DENOMINATIONS.reduce((sum, denom) => sum + (breakdown[denom] || 0) * denom, 0);
        }
        return amount;
    }, [breakdown, amount, transaction]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transaction) return;
        
        if (totalAmount <= 0) {
            setError("Total amount must be greater than zero.");
            return;
        }
        if (!location) {
          setError("Location is a required field.");
          return;
        }

        setError(null);
        setIsSubmitting(true);

        const updatedTx: Transaction = {
            ...transaction,
            person,
            company: company || 'NA',
            location,
            recordedBy,
            type: transactionType,
            amount: totalAmount,
            breakdown: transaction.paymentMethod === 'cash' ? breakdown : {},
        };

        try {
            await updateTransaction(updatedTx);
            setSuccessMessage('Transaction updated successfully!');
            setTimeout(() => {
                navigate('/history');
            }, 1500);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            setIsSubmitting(false);
        }
    };

    if (!transaction) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading transaction...</p>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/history" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                    <ArrowLeftIcon className="h-5 w-5"/>
                    <span>Back to History</span>
                </Link>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Transaction</h2>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
                {successMessage && (
                    <div className="bg-green-100 dark:bg-green-900/50 border border-green-400 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
                        {successMessage}
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
                       {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                     <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Name (Optional)</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon className="h-5 w-5 text-gray-400" /></div>
                            <input type="text" id="customerName" value={person} onChange={e => setPerson(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><BuildingOfficeIcon className="h-5 w-5 text-gray-400" /></div>
                            <select id="companyName" value={company} onChange={e => setCompany(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 appearance-none">
                                {companyNames.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPinIcon className="h-5 w-5 text-gray-400" /></div>
                            <select id="location" value={location} onChange={e => setLocation(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 appearance-none" required>
                                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />
                    
                    {transaction.paymentMethod === 'cash' ? (
                         <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Cash Denominations</h3>
                            <CurrencyCounter value={breakdown} onChange={setBreakdown} />
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount ({transaction.paymentMethod.toUpperCase()})</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">₹</span></div>
                                <input type="number" id="amount" value={amount} onChange={e => setAmount(Number(e.target.value))} className="block w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700" placeholder="0.00" required />
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            Total Amount: ₹{totalAmount.toLocaleString('en-IN')}
                        </h3>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction Type</label>
                        <fieldset className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <input type="radio" id="credit" value="credit" checked={transactionType === 'credit'} onChange={() => setTransactionType('credit')} className="sr-only peer" />
                                <label htmlFor="credit" className="flex items-center justify-center gap-2 p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-500">
                                    <TrendingUpIcon className="h-5 w-5 text-green-500" /><span>Credit</span>
                                </label>
                            </div>
                            <div className="relative">
                                <input type="radio" id="debit" value="debit" checked={transactionType === 'debit'} onChange={() => setTransactionType('debit')} className="sr-only peer" />
                                <label htmlFor="debit" className="flex items-center justify-center gap-2 p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer peer-checked:border-red-500 peer-checked:ring-2 peer-checked:ring-red-500">
                                    <TrendingDownIcon className="h-5 w-5 text-red-500" /><span>Debit</span>
                                </label>
                            </div>
                        </fieldset>
                    </div>

                    <div>
                        <button type="submit" disabled={isSubmitting || totalAmount === 0} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTransactionPage;
