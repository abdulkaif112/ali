// Test script to verify Google Apps Script connection
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzih_hnu752ZC1u3WdPZ5KLNJGhF1UdZzbZVUknSXUh0ALOyH8FW81ucfc2R9O2hco/exec';

async function testConnection() {
  console.log('🔄 Testing Google Apps Script connection...');
  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL + '?action=test', {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const responseText = await response.text();
      console.log('✅ Response:', responseText);
      return responseText === 'OK';
    } else {
      console.log('❌ Response not OK');
      return false;
    }
  } catch (error) {
    console.error('💥 Connection error:', error);
    return false;
  }
}

async function testAddTransaction() {
  console.log('🔄 Testing add transaction...');
  try {
    const testTransaction = {
      action: 'add',
      data: {
        id: 'test_' + new Date().getTime(),
        date: new Date().toISOString(),
        type: 'credit',
        paymentMethod: 'cash',
        company: 'TEST_COMPANY',
        person: 'Test Person',
        location: 'TEST',
        recordedBy: 'Test User',
        amount: 500,
        notes: 'Test transaction from browser',
        breakdown: JSON.stringify({500: 1}),
        timestamp: new Date().toISOString()
      }
    };
    
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testTransaction)
    });
    
    console.log('Add transaction response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Add transaction response:', result);
      return result.success === true;
    } else {
      console.log('❌ Failed to add transaction');
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return false;
    }
  } catch (error) {
    console.error('💥 Add transaction error:', error);
    return false;
  }
}

async function testGetAllTransactions() {
  console.log('🔄 Testing get all transactions...');
  try {
    const url = new URL(GOOGLE_APPS_SCRIPT_URL);
    url.searchParams.append('action', 'getAll');
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log('Get all transactions response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Get transactions response:', result);
      console.log('✅ Found', result.transactions?.length || 0, 'transactions');
      return true;
    } else {
      console.log('❌ Failed to get transactions');
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return false;
    }
  } catch (error) {
    console.error('💥 Get transactions error:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Google Apps Script tests...');
  
  const connectionTest = await testConnection();
  if (!connectionTest) {
    console.log('❌ Connection test failed, stopping tests');
    return;
  }
  
  await testAddTransaction();
  await testGetAllTransactions();
  
  console.log('✅ All tests completed');
}

// Run tests when script is loaded
runAllTests();