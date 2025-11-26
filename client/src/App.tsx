import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import MainLayout from './layouts/MainLayout';
import AuthGuard from './components/AuthGuard';
import RoleGuard from './components/RoleGuard';
import CustomersPage from './features/customers/CustomersPage';
import CustomerDetailPage from './features/customers/CustomerDetailPage';
import TransactionClientsPage from './features/customers/TransactionClientsPage';
import TransactionClientDetailPage from './features/customers/TransactionClientDetailPage';
import ColdLeadsPage from './features/cold-leads/ColdLeadsPage';
import ReportingPage from './features/reporting/ReportingPage';
import UsersPage from './features/users/UsersPage';
import ImportPage from './features/import/ImportPage';
import TransactionsPage from './features/transactions/TransactionsPage';
import { Box, Typography } from '@mui/material';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }>
          <Route path="dashboard" element={<Box><Typography variant="h4">Welcome to CRM</Typography></Box>} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/transaction-clients" element={<TransactionClientsPage />} />
          <Route path="customers/transaction-client/:client" element={<TransactionClientDetailPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="cold-leads" element={<ColdLeadsPage />} />
          <Route path="reports" element={<ReportingPage />} />
          <Route path="users" element={
            <RoleGuard roles={['admin']}>
              <UsersPage />
            </RoleGuard>
          } />
          <Route path="import" element={
            <RoleGuard roles={['admin', 'manager']}>
              <ImportPage />
            </RoleGuard>
          } />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
