/**
 * Google Apps Script for ALI ENTERPRISES Transaction Management
 * 
 * This script handles HTTP requests from the web application and 
 * manages transaction data in Google Sheets.
 * 
 * Deploy this as a web app with:
 * - Execute as: Me
 * - Who has access: Anyone
 */

// Configuration
const SHEET_NAME = 'Transactions'; // Name of the sheet tab
const HEADERS = [
  'ID', 'Date', 'Type', 'Payment Method', 'Company', 
  'Person', 'Location', 'Recorded By', 'Amount', 
  'Notes', 'Breakdown', 'Timestamp'
];

/**
 * Handle GET requests
 */
function doGet(e) {
  try {
    Logger.log('GET request received');
    Logger.log('Event object: ' + JSON.stringify(e));
    
    // Check if event object and parameter exist
    if (!e) {
      Logger.log('Event object is undefined');
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No event object received' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (!e.parameter) {
      Logger.log('No parameters in request');
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No parameters received' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = e.parameter.action;
    Logger.log('Action: ' + action);
    
    switch (action) {
      case 'test':
        Logger.log('Test endpoint called');
        return ContentService.createTextOutput('OK');
        
      case 'getAll':
        Logger.log('GetAll endpoint called');
        const recordedBy = e.parameter.recordedBy; // Optional filter by user
        const transactions = getAllTransactions(recordedBy);
        return ContentService
          .createTextOutput(JSON.stringify({ transactions: transactions }))
          .setMimeType(ContentService.MimeType.JSON);
        
      default:
        Logger.log('Unknown action: ' + action);
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Unknown action: ' + action }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log('GET Error: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: error.toString(),
        stack: error.stack 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    Logger.log('POST request received');
    Logger.log('Event object: ' + JSON.stringify(e));
    
    // Check if event object exists
    if (!e) {
      Logger.log('Event object is undefined');
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No event object received' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check if postData exists
    if (!e.postData) {
      Logger.log('No postData in request');
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No POST data received' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check if postData.contents exists
    if (!e.postData.contents) {
      Logger.log('No contents in postData');
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No content in POST data' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    Logger.log('Post data: ' + e.postData.contents);
    
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      Logger.log('JSON parse error: ' + parseError.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Invalid JSON in request body' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = data.action;
    Logger.log('Action: ' + action);
    
    switch (action) {
      case 'initialize':
        Logger.log('Initializing sheet');
        initializeSheet();
        return ContentService
          .createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);
        
      case 'add':
        Logger.log('Adding transaction: ' + JSON.stringify(data.data));
        addTransaction(data.data);
        return ContentService
          .createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);
        
      case 'update':
        Logger.log('Updating transaction: ' + JSON.stringify(data.data));
        updateTransaction(data.data);
        return ContentService
          .createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);
        
      case 'delete':
        Logger.log('Deleting transaction: ' + data.id);
        deleteTransaction(data.id);
        return ContentService
          .createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);
        
      default:
        Logger.log('Unknown action: ' + action);
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log('POST Error: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: error.toString(),
        stack: error.stack 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Initialize the sheet with headers
 */
function initializeSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  
  // Add headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    
    // Format headers
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
  }
}

/**
 * Add a new transaction
 */
function addTransaction(transactionData) {
  const sheet = getOrCreateSheet();
  
  const row = [
    transactionData.id,
    transactionData.date,
    transactionData.type,
    transactionData.paymentMethod,
    transactionData.company,
    transactionData.person,
    transactionData.location,
    transactionData.recordedBy,
    transactionData.amount,
    transactionData.notes,
    transactionData.breakdown,
    transactionData.timestamp
  ];
  
  sheet.appendRow(row);
}

/**
 * Update an existing transaction
 */
function updateTransaction(transactionData) {
  try {
    Logger.log('Updating transaction with data: ' + JSON.stringify(transactionData));
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    Logger.log('Sheet has ' + data.length + ' rows');
    
    // Find the row with matching ID
    for (let i = 1; i < data.length; i++) { // Start from 1 to skip headers
      Logger.log('Checking row ' + i + ', ID: ' + data[i][0]);
      if (data[i][0] === transactionData.id) { // ID is in first column
        Logger.log('Found matching transaction at row ' + (i + 1));
        const row = [
          transactionData.id || '',
          transactionData.date || new Date().toISOString(),
          transactionData.type || 'credit',
          transactionData.paymentMethod || 'cash',
          transactionData.company || '',
          transactionData.person || '',
          transactionData.location || '',
          transactionData.recordedBy || '',
          transactionData.amount || 0,
          transactionData.notes || '',
          transactionData.breakdown || '',
          transactionData.timestamp || new Date().toISOString()
        ];
        
        Logger.log('Updating row with: ' + JSON.stringify(row));
        sheet.getRange(i + 1, 1, 1, HEADERS.length).setValues([row]);
        Logger.log('Transaction updated successfully');
        return;
      }
    }
    
    // If not found, add as new transaction
    Logger.log('Transaction not found, adding as new');
    addTransaction(transactionData);
  } catch (error) {
    Logger.log('Error in updateTransaction: ' + error.toString());
    throw error;
  }
}

/**
 * Delete a transaction
 */
function deleteTransaction(transactionId) {
  try {
    Logger.log('Deleting transaction with ID: ' + transactionId);
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    // Find the row with matching ID
    for (let i = 1; i < data.length; i++) { // Start from 1 to skip headers
      if (data[i][0] === transactionId) { // ID is in first column
        Logger.log('Found transaction at row: ' + (i + 1));
        sheet.deleteRow(i + 1); // +1 because sheet rows are 1-indexed
        Logger.log('Transaction deleted successfully');
        return;
      }
    }
    Logger.log('Transaction not found with ID: ' + transactionId);
  } catch (error) {
    Logger.log('Error in deleteTransaction: ' + error.toString());
    throw error;
  }
}

/**
 * Get all transactions (optionally filtered by recordedBy)
 */
function getAllTransactions(recordedByFilter) {
  try {
    Logger.log('Getting all transactions');
    if (recordedByFilter) {
      Logger.log('Filtering by recordedBy: ' + recordedByFilter);
    }
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    Logger.log('Sheet has ' + data.length + ' rows (including headers)');
    
    if (data.length <= 1) { // Only headers or empty
      Logger.log('No transactions found');
      return [];
    }
    
    const transactions = [];
    
    // Skip header row (index 0)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Apply recordedBy filter if specified
      if (recordedByFilter && row[7] !== recordedByFilter) {
        continue; // Skip this row if it doesn't match the filter
      }
      
      transactions.push({
        id: row[0],
        date: row[1],
        type: row[2],
        paymentMethod: row[3],
        company: row[4],
        person: row[5],
        location: row[6],
        recordedBy: row[7],
        amount: row[8],
        notes: row[9],
        breakdown: row[10],
        timestamp: row[11]
      });
    }
    
    Logger.log('Returning ' + transactions.length + ' transactions');
    return transactions;
  } catch (error) {
    Logger.log('Error in getAllTransactions: ' + error.toString());
    throw error;
  }
}

/**
 * Get or create the transactions sheet
 */
function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    initializeSheet();
    sheet = spreadsheet.getSheetByName(SHEET_NAME);
  }
  
  return sheet;
}

/**
 * Test function - you can run this manually to test
 */
function testScript() {
  Logger.log('Script is working!');
  initializeSheet();
  
  // Test adding a transaction
  const testTransaction = {
    id: 'test_' + new Date().getTime(),
    date: new Date().toISOString(),
    type: 'credit',
    paymentMethod: 'cash',
    company: 'TEST_COMPANY',
    person: 'Test Person',
    location: 'TEST',
    recordedBy: 'Script Test',
    amount: 1000,
    notes: 'Test transaction',
    breakdown: JSON.stringify({500: 2}),
    timestamp: new Date().toISOString()
  };
  
  addTransaction(testTransaction);
  Logger.log('Test transaction added!');
}

/**
 * Debug function to check what's in the sheet
 */
function debugSheet() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  
  Logger.log('Sheet name: ' + sheet.getName());
  Logger.log('Total rows: ' + data.length);
  Logger.log('Headers: ' + JSON.stringify(data[0]));
  
  for (let i = 1; i < Math.min(data.length, 6); i++) { // Show first 5 data rows
    Logger.log('Row ' + i + ': ' + JSON.stringify(data[i]));
  }
}

/**
 * Clear all data except headers (for testing)
 */
function clearTestData() {
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, HEADERS.length).clear();
    Logger.log('Cleared ' + (lastRow - 1) + ' rows of data');
  } else {
    Logger.log('No data to clear');
  }
}