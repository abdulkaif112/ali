import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import LoginPage from './pages/LoginPage';
import TransactionPage from './pages/TransactionPage';
import HistoryPage from './pages/HistoryPage';
import VaultPage from './pages/VaultPage';
import SummaryPage from './pages/SummaryPage';
import UserProfilePage from './pages/UserProfilePage';
import CompanyHistoryPage from './pages/CompanyHistoryPage';
import DebitEntryPage from './pages/DebitEntryPage';
import UpiCreditPage from './pages/UpiCreditPage';
import ReportPage from './pages/ReportPage';
import EditTransactionPage from './pages/EditTransactionPage';


const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <div className="flex flex-col min-h-screen">
                    {/* Header - Hidden on small screens, shown on larger screens */}
                    <div className="hidden md:block">
                      <Header />
                    </div>
                    
                    {/* Main content with responsive padding */}
                    <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4 sm:p-6 lg:p-8 overflow-y-auto">
                      <Routes>
                        <Route path="/" element={<TransactionPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/vault" element={<VaultPage />} />
                        <Route path="/summary" element={<SummaryPage />} />
                        <Route path="/profile" element={<UserProfilePage />} />
                        <Route path="/company/:companyName" element={<CompanyHistoryPage />} />
                        <Route path="/debit-entry" element={<DebitEntryPage />} />
                        <Route path="/upi-credit" element={<UpiCreditPage />} />
                        <Route path="/report/:companyName" element={<ReportPage />} />
                        <Route path="/edit/:transactionId" element={<EditTransactionPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                    
                    {/* Bottom Navigation - Only on mobile/tablet */}
                    <div className="md:hidden">
                      <BottomNavigation />
                    </div>
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;