import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
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
import SettingsGeneral from './pages/SettingsGeneral';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import OrderHistory from './pages/OrderHistory';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import SettingsSecurity from './pages/SettingsSecurity';
import SettingsNotifications from './pages/SettingsNotifications';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
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
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/settings" element={<AdminGeneralSettings />} />
                <Route path="/admin/payment-method" element={<AdminPaymentMethod />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/settings/general" element={<SettingsGeneral />} />
                <Route path="/settings/security" element={<SettingsSecurity />} />
                <Route path="/settings/notifications" element={<SettingsNotifications />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
