import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';
import Reports from './pages/Reports';
import UserProfile from './pages/UserProfile';
import AdminPaymentMethod from './pages/AdminPaymentMethod';
import AdminGeneralSettings from './pages/AdminGeneralSettings';
import AdminReviews from './pages/AdminReviews';
import SettingsGeneral from './pages/SettingsGeneral';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import OrderHistory from './pages/OrderHistory';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import SettingsSecurity from './pages/SettingsSecurity';
import SettingsNotifications from './pages/SettingsNotifications';
import WishlistPage from './pages/WishlistPage';
import { WishlistProvider } from './context/WishlistContext';

const AppLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <CartDrawer />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/settings" element={<AdminGeneralSettings />} />
          <Route path="/admin/payment-method" element={<AdminPaymentMethod />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/settings/general" element={<SettingsGeneral />} />
          <Route path="/settings/security" element={<SettingsSecurity />} />
          <Route path="/settings/notifications" element={<SettingsNotifications />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppLayout />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
