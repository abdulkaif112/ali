import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
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
          <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Header />
                  <main className="container mx-auto p-4 sm:p-6 lg:p-8">
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