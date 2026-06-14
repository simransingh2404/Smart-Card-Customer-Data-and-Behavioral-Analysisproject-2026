import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SchoolDashboard from './pages/school/SchoolDashboard';
import ViewQuotations from './pages/school/ViewQuotations';
import VendorDashboard from './pages/vendor/VendorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import SchoolProfile from './pages/school/SchoolProfile';
import VendorProfile from './pages/vendor/VendorProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/school/dashboard" element={<SchoolDashboard />} />
        <Route path="/school/profile" element={<SchoolProfile />} />
        <Route path="/school/rfq/:rfqId/quotations" element={<ViewQuotations />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/profile" element={<VendorProfile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;