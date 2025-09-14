import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Transaction, NoteCounts } from '../types';
import { COMPANY_NAMES, LOCATIONS, DENOMINATIONS } from '../constants';
import { googleSheets } from '../services/googleSheets';

// Define the shape of the context
interface AppContextType {
  transactions: Transaction[];
  vault: NoteCounts;
  companyNames: string[];
  locations: string[];
  addTransaction: (newTransaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  updateTransaction: (updatedTransaction: Transaction) => Promise<void>;
  deleteTransactionsByIds: (ids: string[]) => Promise<void>;
  googleSheetsConnected: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  manualSync: () => Promise<void>;
}

// Create the context with a default undefined value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// The provider component
interface AppProviderProps {
  children: ReactNode;
}

const initializeVault = (): NoteCounts => {
    const freshVault: NoteCounts = {};
    DENOMINATIONS.forEach(d => freshVault[d] = 0);
    return freshVault;
};


export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [vault, setVault] = useState<NoteCounts>(() => initializeVault());
  const [googleSheetsConnected, setGoogleSheetsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Get current user
  const getCurrentUser = () => {
    const user = localStorage.getItem('ali_enterprises_user');
    return user ? JSON.parse(user) : null;
  };

  // Filter transactions by current user for privacy
  const transactions = allTransactions.filter(tx => {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    const currentUserName = currentUser.displayName || currentUser.email || 'Unknown User';
    return tx.recordedBy === currentUserName;
  });

  // Recalculate vault based on current user's transactions only
  const recalculateVault = useCallback((transactions: Transaction[], currentUserName?: string) => {
    const newVault = initializeVault();
    
    // If no user name provided, get current user
    if (!currentUserName) {
      const currentUser = getCurrentUser();
      currentUserName = currentUser?.displayName || currentUser?.email || 'Unknown User';
    }
    
    // Only process transactions for the current user
    const userTransactions = transactions.filter(tx => tx.recordedBy === currentUserName);
    
    userTransactions.forEach(tx => {
      if (tx.paymentMethod === 'cash' && tx.breakdown && typeof tx.breakdown === 'object') {
        for (const denomStr in tx.breakdown) {
          const denom = parseInt(denomStr, 10);
          const count = tx.breakdown[denom] || 0;
          if (DENOMINATIONS.includes(denom)) {
            if (tx.type === 'credit') {
              newVault[denom] = (newVault[denom] || 0) + count;
            } else if (tx.type === 'debit') {
              newVault[denom] = (newVault[denom] || 0) - count;
            }
          }
        }
      }
    });
    
    return newVault;
  }, []);

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      // --- ROBUST TRANSACTIONS MIGRATION ---
      const storedTransactions = localStorage.getItem('transactions');
      let finalTransactions: Transaction[] = [];
      if (storedTransactions) {
        let parsedTransactions: any[] = JSON.parse(storedTransactions);

        if (Array.isArray(parsedTransactions)) {
            finalTransactions = parsedTransactions
            .map((tx: any): Transaction | null => {
              // Very defensive migration for each transaction
              if (!tx || typeof tx !== 'object' || !tx.id || typeof tx.id !== 'string') {
                  return null; // Discard invalid entry
              }

              const migratedTx: any = {};
              
              migratedTx.id = tx.id;
              migratedTx.type = ['credit', 'debit'].includes(tx.type) ? tx.type : 'credit';
              migratedTx.paymentMethod = ['cash', 'upi'].includes(tx.paymentMethod) ? tx.paymentMethod : 'cash';
              migratedTx.amount = typeof tx.amount === 'number' && isFinite(tx.amount) ? tx.amount : 0;
              migratedTx.date = (tx.date && !isNaN(new Date(tx.date).getTime())) ? tx.date : new Date().toISOString();
              migratedTx.location = typeof tx.location === 'string' ? tx.location : 'NA';
              migratedTx.company = typeof tx.company === 'string' ? tx.company : 'NA';
              migratedTx.person = typeof tx.person === 'string' ? tx.person : '';
              migratedTx.recordedBy = typeof tx.recordedBy === 'string' ? tx.recordedBy : 'system';
              migratedTx.notes = typeof tx.notes === 'string' ? tx.notes : '';

              // Sanitize breakdown: This is CRITICAL
              const sanitizedBreakdown: NoteCounts = {};
              if (migratedTx.paymentMethod === 'cash' && tx.breakdown && typeof tx.breakdown === 'object') {
                  DENOMINATIONS.forEach(denom => {
                      const count = tx.breakdown[denom];
                      if (typeof count === 'number' && isFinite(count) && count >= 0) {
                          sanitizedBreakdown[denom] = Math.floor(count); // Ensure it's an integer
                      }
                  });
              }
              migratedTx.breakdown = sanitizedBreakdown;
              
              return migratedTx as Transaction;
          })
          .filter((tx): tx is Transaction => tx !== null); // Filter out discarded entries
        }
      }
      setAllTransactions(finalTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      
      // --- ROBUST VAULT MIGRATION ---
      const storedVault = localStorage.getItem('vault');
      let finalVault = initializeVault();
      if (storedVault) {
        const parsedVault = JSON.parse(storedVault);
        if (parsedVault && typeof parsedVault === 'object' && !Array.isArray(parsedVault)) {
           const sanitizedVault = initializeVault();
           DENOMINATIONS.forEach(denom => {
              const count = parsedVault[denom];
              // Allow negative counts for vault (debits can make vault negative)
              if(typeof count === 'number' && isFinite(count)) {
                sanitizedVault[denom] = Math.floor(count);
              }
           });
           finalVault = sanitizedVault;
        }
      }
       setVault(finalVault);

    // Check Google Apps Script connection and load existing data
    const checkGoogleSheetsConnection = async () => {
      try {
        console.log('🔄 Starting Google Sheets connection check...');
        setSyncStatus('syncing');
        
        // Test connection to Google Apps Script
        console.log('📡 Testing connection to Google Apps Script...');
        const isConnected = await googleSheets.testConnection();
        console.log('📡 Connection test result:', isConnected);
        
        if (isConnected) {
          console.log('✅ Google Apps Script connected successfully');
          // Try to initialize the sheet
          console.log('🔧 Initializing Google Sheets...');
          await googleSheets.initializeSheet();
          setGoogleSheetsConnected(true);
          
          // Load all existing transactions from Google Sheets
          console.log('📥 Loading existing transactions from Google Sheets...');
          const sheetTransactions = await googleSheets.getAllTransactions();
          console.log('📥 Loaded', sheetTransactions.length, 'transactions from Google Sheets');
          
          if (sheetTransactions.length > 0) {
            console.log('🔄 Merging sheet transactions with local transactions...');
            // Merge with local transactions, giving priority to sheet data
            const mergedTransactions = [...sheetTransactions];
            // Add any local transactions that don't exist in sheets
            finalTransactions.forEach(localTx => {
              if (!sheetTransactions.find(sheetTx => sheetTx.id === localTx.id)) {
                console.log('➕ Adding local transaction not found in sheets:', localTx.id);
                mergedTransactions.push(localTx);
              }
            });
            console.log('📊 Final merged transaction count:', mergedTransactions.length);
            setAllTransactions(mergedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            
            // Recalculate vault based on all transactions
            console.log('🧮 Recalculating vault from all transactions...');
            const recalculatedVault = recalculateVault(mergedTransactions);
            setVault(recalculatedVault);
            console.log('🧮 Vault recalculated:', recalculatedVault);
          } else {
            console.log('ℹ️ No transactions found in Google Sheets, keeping local transactions');
            // If sheets has no data, check if we should upload local transactions
            if (finalTransactions.length > 0) {
              console.log('📤 Uploading', finalTransactions.length, 'local transactions to Google Sheets...');
              for (const tx of finalTransactions) {
                try {
                  await googleSheets.addTransaction(tx);
                  console.log('✅ Uploaded transaction:', tx.id);
                } catch (error) {
                  console.warn('⚠️ Failed to upload transaction:', tx.id, error);
                }
              }
              
              // Recalculate vault for local transactions too
              console.log('🧮 Recalculating vault from local transactions...');
              const recalculatedVault = recalculateVault(finalTransactions);
              setVault(recalculatedVault);
              console.log('🧮 Vault recalculated:', recalculatedVault);
            }
          }
          
          setSyncStatus('success');
          console.log('✅ Google Sheets initialization completed successfully');
        } else {
          setGoogleSheetsConnected(false);
          setSyncStatus('error');
          console.warn('❌ Google Apps Script connection failed');
        }
      } catch (error) {
        setGoogleSheetsConnected(false);
        setSyncStatus('error');
        console.error('💥 Google Apps Script connection failed:', error);
      }
    };

    checkGoogleSheetsConnection();

    } catch (error) {
      console.error("CRITICAL: Corrupted localStorage data detected. Resetting application state.", error);
      // If anything fails, wipe the slate clean to prevent crash loops
      localStorage.removeItem('transactions');
      localStorage.removeItem('vault');
      setAllTransactions([]);
      setVault(initializeVault());
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('transactions', JSON.stringify(allTransactions));
    } catch (error) {
      console.error("Failed to save transactions to localStorage", error);
    }
  }, [allTransactions]);

  useEffect(() => {
    try {
      localStorage.setItem('vault', JSON.stringify(vault));
    } catch (error) {
      console.error("Failed to save vault to localStorage", error);
    }
  }, [vault]);
  

  const addTransaction = useCallback(async (newTransactionData: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...newTransactionData,
      id: `txn_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
    };

    // Save to local state first
    setAllTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    // Update vault for cash transactions
    if (newTransaction.paymentMethod === 'cash' && newTransaction.breakdown) {
        setVault(prevVault => {
            const updatedVault = { ...prevVault };
            for(const denom in newTransaction.breakdown) {
                const denomNum = parseInt(denom, 10);
                const count = newTransaction.breakdown[denomNum];
                
                if (newTransaction.type === 'credit') {
                    // Add to vault for credit
                    updatedVault[denomNum] = (updatedVault[denomNum] || 0) + count;
                } else if (newTransaction.type === 'debit') {
                    // Subtract from vault for debit (can go negative)
                    updatedVault[denomNum] = (updatedVault[denomNum] || 0) - count;
                }
            }
            return updatedVault;
        });
    }

    // Save to Google Sheets (async, non-blocking)
    try {
      setSyncStatus('syncing');
      await googleSheets.addTransaction(newTransaction);
      setSyncStatus('success');
      console.log('Transaction synced to Google Sheets:', newTransaction.id);
    } catch (error) {
      setSyncStatus('error');
      console.warn('Failed to sync to Google Sheets:', error);
      // Reset to idle after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  }, []);

  const updateTransaction = useCallback(async (updatedTransaction: Transaction) => {
    setVault(prevVault => {
        const originalTransaction = transactions.find(tx => tx.id === updatedTransaction.id);
        if (!originalTransaction) {
            console.error("Original transaction not found for vault update.");
            return prevVault;
        }

        const newVault = { ...prevVault };
        
        // Revert old transaction's vault impact
        if (originalTransaction.paymentMethod === 'cash' && originalTransaction.breakdown) {
            for (const denomStr in originalTransaction.breakdown) {
                const denom = parseInt(denomStr, 10);
                if (DENOMINATIONS.includes(denom)) {
                    const count = originalTransaction.breakdown[denom] || 0;
                    if (originalTransaction.type === 'credit') {
                        newVault[denom] = (newVault[denom] || 0) - count;
                    } else if (originalTransaction.type === 'debit') {
                        newVault[denom] = (newVault[denom] || 0) + count;
                    }
                }
            }
        }

        // Apply new transaction's vault impact
        if (updatedTransaction.paymentMethod === 'cash' && updatedTransaction.breakdown) {
            for (const denomStr in updatedTransaction.breakdown) {
                const denom = parseInt(denomStr, 10);
                if (DENOMINATIONS.includes(denom)) {
                    const count = updatedTransaction.breakdown[denom] || 0;
                    if (updatedTransaction.type === 'credit') {
                        newVault[denom] = (newVault[denom] || 0) + count;
                    } else if (updatedTransaction.type === 'debit') {
                        newVault[denom] = (newVault[denom] || 0) - count;
                    }
                }
            }
        }

        return newVault;
    });

    setAllTransactions(prevTransactions => {
        const updatedTransactions = prevTransactions.map(tx => 
            tx.id === updatedTransaction.id ? updatedTransaction : tx
        );
        return updatedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    // Update in Google Sheets (async, non-blocking)
    try {
      await googleSheets.updateTransaction(updatedTransaction);
      console.log('Transaction updated in Google Sheets:', updatedTransaction.id);
    } catch (error) {
      console.warn('Failed to update in Google Sheets:', error);
    }
  }, [transactions]);

  const deleteTransactionsByIds = useCallback(async (ids: string[]) => {
    const transactionsToDelete = transactions.filter(tx => ids.includes(tx.id));
    
    setVault(prevVault => {
        const updatedVault = { ...prevVault };
        transactionsToDelete.forEach(tx => {
            if (tx.paymentMethod === 'cash' && tx.breakdown && typeof tx.breakdown === 'object') {
                for(const denom in tx.breakdown) {
                    const denomNum = parseInt(denom, 10);
                    const count = tx.breakdown[denomNum];
                    if (tx.type === 'credit') {
                        // Remove from vault (reverse credit)
                        updatedVault[denomNum] = (updatedVault[denomNum] || 0) - count;
                    } else if (tx.type === 'debit') {
                        // Add back to vault (reverse debit)
                        updatedVault[denomNum] = (updatedVault[denomNum] || 0) + count;
                    }
                }
            }
        });
        return updatedVault;
    });

    setAllTransactions(prev => prev.filter(tx => !ids.includes(tx.id)));

    // Delete from Google Sheets (async, non-blocking)
    try {
      for (const id of ids) {
        await googleSheets.deleteTransaction(id);
      }
      console.log('Transactions deleted from Google Sheets:', ids);
    } catch (error) {
      console.warn('Failed to delete from Google Sheets:', error);
    }
  }, [transactions]);

  const manualSync = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      console.log('Manual sync started...');
      
      // Load all existing transactions from Google Sheets
      const sheetTransactions = await googleSheets.getAllTransactions();
      console.log('Manual sync - loaded transactions:', sheetTransactions.length);
      
      if (sheetTransactions.length > 0) {
        console.log('Manual sync - updating local state with', sheetTransactions.length, 'transactions');
        setAllTransactions(sheetTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        
        // Recalculate vault from synced transactions
        console.log('Manual sync - recalculating vault...');
        const recalculatedVault = recalculateVault(sheetTransactions);
        setVault(recalculatedVault);
        console.log('Manual sync - vault recalculated:', recalculatedVault);
        
        setSyncStatus('success');
        console.log('Manual sync completed successfully');
      } else {
        console.log('Manual sync - no transactions found in Google Sheets');
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
      setSyncStatus('error');
    }
  }, [recalculateVault]);
  

  const value = {
    transactions,
    vault,
    companyNames: COMPANY_NAMES,
    locations: LOCATIONS,
    addTransaction,
    updateTransaction,
    deleteTransactionsByIds,
    googleSheetsConnected,
    syncStatus,
    manualSync,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};