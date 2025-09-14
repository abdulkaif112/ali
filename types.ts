// Implementing the application's shared TypeScript types
export type NoteCounts = {
  [denomination: number]: number;
};

export type TransactionType = 'credit' | 'debit';
export type PaymentMethod = 'cash' | 'upi';

export interface Transaction {
  id: string;
  date: string; // ISO string format
  type: TransactionType;
  paymentMethod: PaymentMethod;
  company?: string; // Optional
  person?: string; // Optional
  location: string;
  recordedBy: string;
  amount: number;
  notes: string;
  breakdown: NoteCounts; // For cash transactions only
}

export interface CompanySummary {
  companyName: string;
  totalCredit: number;
  totalDebit: number;
  netBalance: number;
}
