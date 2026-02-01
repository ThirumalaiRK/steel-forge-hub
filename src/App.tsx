import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import FaaS from "./pages/FaaS";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AdminLayout from "./components/admin/AdminLayout";
import MainLayout from "./components/MainLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminHeroBanners from "./pages/admin/AdminHeroBanners";
import AdminEnquiries from "./pages/admin/AdminEnquiries";
import AdminSubCategories from "./pages/admin/AdminSubCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminOffers from "./pages/admin/AdminOffers";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import IndustriesPage from "./pages/IndustriesPage";
import IndustryPage from "./pages/IndustryPage";
import AboutPage from "./pages/AboutPage";
import ProductPage from "./pages/ProductPage";
import WishlistPage from "./pages/WishlistPage";
import ComparisonPage from "./pages/ComparisonPage";
import CartPage from "./pages/CartPage";
import ConfiguratorPage from "./pages/ConfiguratorPage";
import InstantQuotePage from "./pages/InstantQuotePage";
import ProjectShowcasePage from "./pages/ProjectShowcasePage";
import ResourceLibraryPage from "./pages/ResourceLibraryPage";
import AdminResources from "./pages/admin/AdminResources";
import ScrollToTop from "@/components/ScrollToTop";
import { Navigate } from "react-router-dom";
import { WebsiteLoader } from "@/components/animations/WebsiteLoader";
import ManufacturingPage from "./pages/company/ManufacturingPage";
import TeamPage from "./pages/company/TeamPage";
import CaseStudiesPage from "./pages/company/CaseStudiesPage";
import CaseStudyDetail from "./pages/company/CaseStudyDetail";
import AdminCaseStudies from "./pages/admin/AdminCaseStudies";
import AdminCaseStudyForm from "./pages/admin/AdminCaseStudyForm";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminFaasQuotations from "./pages/admin/AdminFaasQuotations";
import SalesChatWidget from "@/components/SalesChatWidget";
import FaasProducts from "./pages/FaasProducts";
import FaasProductDetail from "./pages/FaasProductDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <WishlistProvider>
          <ComparisonProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <WebsiteLoader minDisplayTime={2500} />
                <SalesChatWidget />
                <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  }}
                >
                  <ScrollToTop />
                  <Routes>
                    {/* Public Routes with MainLayout */}
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/product/:productSlug" element={<ProductPage />} />
                      <Route path="/products/:categorySlug" element={<CategoryPage />} />
                      <Route path="/products/:categorySlug/:subCategorySlug" element={<CategoryPage />} />
                      <Route path="/industries" element={<IndustriesPage />} />
                      <Route path="/industries/:industrySlug" element={<IndustryPage />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/faas" element={<FaaS />} />
                      <Route path="/faas/products" element={<FaasProducts />} />
                      <Route path="/faas/products/:slug" element={<FaasProductDetail />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/comparison" element={<ComparisonPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/configure" element={<ConfiguratorPage />} />
                      <Route path="/quote" element={<InstantQuotePage />} />
                      <Route path="/showcase" element={<ProjectShowcasePage />} />
                      <Route path="/resources" element={<ResourceLibraryPage />} />

                      {/* Company Pages */}
                      <Route path="/company/manufacturing" element={<ManufacturingPage />} />
                      <Route path="/company/team" element={<TeamPage />} />
                      <Route path="/company/case-studies" element={<CaseStudiesPage />} />
                      <Route path="/company/case-studies/:slug" element={<CaseStudyDetail />} />
                    </Route>

                    {/* Auth routes without MainLayout */}
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/signup" element={<Signup />} />

                    {/* Protected Admin Routes */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="categories" element={<AdminCategories />} />
                      <Route path="sub-categories" element={<AdminSubCategories />} />
                      <Route path="hero-banners" element={<AdminHeroBanners />} />
                      <Route path="offers" element={<AdminOffers />} />
                      <Route path="enquiries" element={<AdminEnquiries />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="faas-quotations" element={<AdminFaasQuotations />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="resources" element={<AdminResources />} />
                      <Route path="notifications" element={<AdminNotifications />} />
                      {/* Case Studies */}
                      <Route path="case-studies" element={<AdminCaseStudies />} />
                      <Route path="case-studies/new" element={<AdminCaseStudyForm />} />
                      <Route path="case-studies/:id" element={<AdminCaseStudyForm />} />
                    </Route>

                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </CartProvider>
          </ComparisonProvider>
        </WishlistProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;