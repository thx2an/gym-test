import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import BranchManagement from './pages/admin/BranchManagement';
import StaffManagement from './pages/admin/StaffManagement';
import PackageManagement from './pages/admin/PackageManagement';
import UserProfile from './pages/user/UserProfile';
import PackagesList from './pages/member/PackagesList';
import MyMembership from './pages/member/MyMembership';
import CheckoutPage from './pages/payment/CheckoutPage';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import RefundManagement from './pages/admin/RefundManagement';
import TrainerList from './pages/member/TrainerList';
import BookingCalendar from './pages/member/BookingCalendar';
import MyBookings from './pages/member/MyBookings';
import AIPlanner from './pages/member/AIPlanner';

// Placeholder for protected dashboard
const Dashboard = () => {
  return <Navigate to="/my-membership" />;
};

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  console.log('ProtectedRoute: Token is', token);
  if (!token) {
    console.log('ProtectedRoute: Redirecting to login');
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/branches" element={
              <ProtectedRoute>
                <BranchManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/staff" element={
              <ProtectedRoute>
                <StaffManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/packages" element={
              <ProtectedRoute>
                <PackageManagement />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />

            <Route path="/packages" element={
              <ProtectedRoute>
                <PackagesList />
              </ProtectedRoute>
            } />
            <Route path="/my-membership" element={
              <ProtectedRoute>
                <MyMembership />
              </ProtectedRoute>
            } />
            <Route path="/payment/checkout" element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } />
            <Route path="/payment/success" element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            } />
            <Route path="/admin/refunds" element={
              <ProtectedRoute>
                <RefundManagement />
              </ProtectedRoute>
            } />
            <Route path="/trainers" element={
              <ProtectedRoute>
                <TrainerList />
              </ProtectedRoute>
            } />
            <Route path="/trainers/:trainerId/book" element={
              <ProtectedRoute>
                <BookingCalendar />
              </ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } />
            <Route path="/ai-planner" element={
              <ProtectedRoute>
                <AIPlanner />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
