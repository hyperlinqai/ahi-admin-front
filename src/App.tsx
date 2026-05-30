import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import AdminLayout from "./components/Layout/AdminLayout";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Categories from "./pages/Categories";
import CategoryForm from "./pages/CategoryForm";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import Coupons from "./pages/Coupons";
import CouponForm from "./pages/CouponForm";
import Inventory from "./pages/Inventory";
import Reviews from "./pages/Reviews";
import Returns from "./pages/Returns";
import CMS from "./pages/CMS";
import CMSForm from "./pages/CMSForm";
import Banners from "./pages/Banners";
import HomeLayout from "./pages/HomeLayout";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            fontSize: '14px',
            padding: '12px 20px',
          },
          success: {
            iconTheme: {
              primary: '#c49a3c',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id" element={<ProductForm />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/new" element={<CategoryForm />} />
            <Route path="/categories/:id" element={<CategoryForm />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/coupons/new" element={<CouponForm />} />
            <Route path="/coupons/:id/edit" element={<CouponForm />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/banners" element={<Banners />} />
            <Route path="/home-layout" element={<HomeLayout />} />
            <Route path="/cms" element={<CMS />} />
            <Route path="/cms/new" element={<CMSForm />} />
            <Route path="/cms/:slug" element={<CMSForm />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings/*" element={<Settings />} />
          </Route>
        </Route>

        {/* Catch all — send to login (avoids * → / → protected → login loops) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
