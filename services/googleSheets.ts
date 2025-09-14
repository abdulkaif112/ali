// Google Apps Script integration service
import { Transaction } from '../types';

// Configuration for Google Apps Script Web App
const GOOGLE_APPS_SCRIPT_CONFIG = {
  webAppUrl: process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwf7p8I32uclFZtgcdpGsRd9qshpHiehPTiDdIMG3U5dieymkCQyKWCkRendyIG5l33/exec',
};

// Convert transaction to the format expected by Google Apps Script
const transactionToData = (transaction: Transaction) => {
  return {
    id: transaction.id,
    date: transaction.date,
    type: transaction.type,
    paymentMethod: transaction.paymentMethod,
    company: transaction.company || '',
    person: transaction.person || '',
    location: transaction.location,
    recordedBy: transaction.recordedBy,
    amount: transaction.amount,
    notes: transaction.notes,
    breakdown: JSON.stringify(transaction.breakdown),
    timestamp: new Date().toISOString()
  };
};

// Google Apps Script service
export class GoogleSheetsService {
  private static instance: GoogleSheetsService;
  private webAppUrl: string;

  private constructor() {
    this.webAppUrl = GOOGLE_APPS_SCRIPT_CONFIG.webAppUrl;
  }

  public static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService();
    }
    return GoogleSheetsService.instance;
  }

  // Test connection to Google Apps Script
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing connection to Google Apps Script:', this.webAppUrl);
      const response = await fetch(this.webAppUrl + '?action=test', {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        }
      });
      console.log('Test connection response status:', response.status);
      if (response.ok) {
        const responseText = await response.text();
        console.log('Test connection response:', responseText);
        return responseText === 'OK';
      }
      return false;
    } catch (error) {
      console.error('Failed to connect to Google Apps Script:', error);
      return false;
    }
  }

  // Initialize Google Sheets (this will be handled by the Apps Script)
  async initializeSheet(): Promise<boolean> {
    try {
      console.log('Initializing Google Sheets via Apps Script:', this.webAppUrl);
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          action: 'initialize'
        })
      });
      console.log('Initialize response status:', response.status);
      if (response.ok) {
        const result = await response.json();
        console.log('Initialize response:', result);
        return result.success === true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize Google Sheets:', error);
      return false;
    }
  }

  // Add transaction to Google Sheets
  async addTransaction(transaction: Transaction): Promise<boolean> {
    try {
      const data = transactionToData(transaction);
      console.log('Adding transaction to Google Sheets:', transaction.id, data);
      
      const requestBody = {
        action: 'add',
        data: data
      };
      console.log('Request body:', JSON.stringify(requestBody));
      
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Add transaction response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Add transaction response:', result);
        console.log('Transaction saved to Google Sheets:', transaction.id);
        return result.success === true;
      } else {
        console.error('Failed to save transaction - response not ok:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        return false;
      }
    } catch (error) {
      console.error('Failed to add transaction to Google Sheets:', error);
      return false;
    }
  }

  // Update transaction in Google Sheets
  async updateTransaction(transaction: Transaction): Promise<boolean> {
    try {
      const data = transactionToData(transaction);
      console.log('Updating transaction in Google Sheets:', transaction.id, data);
      
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          data: data
        })
      });

      console.log('Update transaction response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Update transaction response:', result);
        console.log('Transaction updated in Google Sheets:', transaction.id);
        return result.success === true;
      } else {
        console.error('Failed to update transaction:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Failed to update transaction in Google Sheets:', error);
      return false;
    }
  }

  // Delete transaction from Google Sheets
  async deleteTransaction(transactionId: string): Promise<boolean> {
    try {
      console.log('Deleting transaction from Google Sheets:', transactionId);
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          id: transactionId
        })
      });

      console.log('Delete transaction response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Delete transaction response:', result);
        console.log('Transaction deleted from Google Sheets:', transactionId);
        return result.success === true;
      } else {
        console.error('Failed to delete transaction:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Failed to delete transaction from Google Sheets:', error);
      return false;
    }
  }

  // Get all transactions from Google Sheets (filtered by current user)
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      console.log('Fetching all transactions from Google Sheets');
      
      // Get current user for filtering
      const user = localStorage.getItem('ali_enterprises_user');
      const userData = user ? JSON.parse(user) : null;
      const currentUserName = userData?.displayName || userData?.email || 'Unknown User';
      
      const url = new URL(this.webAppUrl);
      url.searchParams.append('action', 'getAll');
      url.searchParams.append('recordedBy', currentUserName);
      
      console.log('Fetching transactions for user:', currentUserName);
      console.log('Request URL:', url.toString());
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        // Removed no-cors mode to allow reading response
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('Get all transactions response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received data from Google Sheets:', data);
        if (data.transactions && Array.isArray(data.transactions)) {
          console.log('Parsed', data.transactions.length, 'transactions from Google Sheets for user:', currentUserName);
          return data.transactions.map((row: any): Transaction => ({
            id: row.id || '',
            date: row.date || new Date().toISOString(),
            type: (row.type as 'credit' | 'debit') || 'credit',
            paymentMethod: (row.paymentMethod as 'cash' | 'upi') || 'cash',
            company: row.company || '',
            person: row.person || '',
            location: row.location || '',
            recordedBy: row.recordedBy || '',
            amount: parseFloat(row.amount) || 0,
            notes: row.notes || '',
            breakdown: row.breakdown ? JSON.parse(row.breakdown) : {},
          }));
        }
      } else {
        console.error('Failed to fetch transactions:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
      console.log('No transactions found or error parsing response');
      return [];
    } catch (error) {
      console.error('Failed to fetch transactions from Google Sheets:', error);
      return [];
    }
  }

  // Sync local data with Google Sheets
  async syncWithSheets(localTransactions: Transaction[]): Promise<Transaction[]> {
    try {
      const sheetTransactions = await this.getAllTransactions();
      
      // Simple sync strategy: Google Sheets is the source of truth
      // In a production app, you'd want more sophisticated conflict resolution
      if (sheetTransactions.length > 0) {
        return sheetTransactions;
      }
      
      // If sheets is empty, upload local transactions
      for (const transaction of localTransactions) {
        await this.addTransaction(transaction);
      }
      
      return localTransactions;
    } catch (error) {
      console.error('Failed to sync with Google Sheets:', error);
      return localTransactions;
    }
  }
}

// Export singleton instance
export const googleSheets = GoogleSheetsService.getInstance();