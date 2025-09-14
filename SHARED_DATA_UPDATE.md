# Shared Data Access Update

## Changes Made

This update modifies the application to show all transaction records from Google Sheets regardless of which user is logged in, while maintaining user attribution for new transactions.

### Modified Files:

1. **context/AppContext.tsx**
   - Removed user filtering when displaying transactions
   - Now shows all transactions from `allTransactions` array
   - Added logic to load existing transactions from Google Sheets on initialization

2. **services/googleSheets.ts**
   - Updated `getAllTransactions()` method to fetch all transactions without user filtering
   - Removed `recordedBy` parameter filtering

3. **google-apps-script.js**
   - Modified `getAllTransactions()` function to ignore user filters
   - Returns all transactions from all users

4. **pages/UserProfilePage.tsx**
   - Updated data privacy notice to reflect shared data access
   - Changed "Your data only" to "All users data"

### Behavior Changes:

**Before:**
- Users could only see transactions they recorded themselves
- History page showed only user-specific data
- Google Sheets queries filtered by `recordedBy` field

**After:**
- All users can see all transactions from all users
- History page shows complete transaction history
- Google Sheets returns all records regardless of user
- New transactions still get attributed to the creating user via `recordedBy` field

### Authentication Still Required:
- Users still need to log in to access the application
- New transactions are still attributed to the logged-in user
- User profile information is still personalized

This change enables shared visibility of all transaction data while maintaining proper attribution of new entries.