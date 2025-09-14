# Google Sheets Integration Setup Guide

## Overview
This application now supports automatic synchronization with Google Sheets. All transactions are saved both locally and to your Google Sheet.

## Setup Steps

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google Sheets API:
   - Go to APIs & Services > Library
   - Search for "Google Sheets API"
   - Click and Enable it

### 2. Create API Key
1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. (Optional) Restrict the key to Google Sheets API only

### 3. Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Copy the Spreadsheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
4. Make sure the sheet is publicly viewable or shared with your Google account

### 4. Configure Environment Variables
1. Open `.env.local` file in the project root
2. Add your credentials:
   ```
   GOOGLE_SHEETS_API_KEY=your_api_key_here
   GOOGLE_SHEETS_ID=your_spreadsheet_id_here
   ```

### 5. Sheet Structure
The application will automatically create these columns in your sheet:
- ID
- Date  
- Type (Credit/Debit)
- Payment Method (Cash/UPI)
- Company
- Person
- Location
- Recorded By
- Amount
- Notes
- Breakdown (JSON)
- Timestamp

## Features

### ✅ Automatic Sync
- All new transactions are automatically saved to Google Sheets
- Updates and deletions are synced in real-time
- Local storage serves as backup if Google Sheets is unavailable

### ✅ Offline Support
- App works even when Google Sheets is not accessible
- Data is saved locally and will sync when connection is restored

### ✅ Data Export
- All your transaction data is available in Google Sheets
- Easy to create reports, charts, and analysis
- Can be shared with team members

## Troubleshooting

### API Key Issues
- Make sure the API key has access to Google Sheets API
- Check that the key is not restricted to specific IPs/domains unless needed

### Spreadsheet Access
- Ensure the spreadsheet is accessible (public or shared)
- The spreadsheet ID should be from the URL, not the sheet name

### Sync Issues
- Check browser console for error messages
- Verify environment variables are set correctly
- Make sure you have internet connection

## Security Notes
- Never commit your `.env.local` file to version control
- Consider using restricted API keys for production
- Regularly rotate your API keys
- Use Google Cloud IAM for team access management

## Testing
1. After setup, create a test transaction
2. Check your Google Sheet - it should appear automatically
3. Try editing and deleting transactions
4. Verify data appears correctly in the sheet

## Support
If you encounter issues:
1. Check the browser console for errors
2. Verify your API key and spreadsheet ID
3. Ensure Google Sheets API is enabled
4. Test with a simple spreadsheet first