import React, { Suspense, lazy } from "react";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { Toaster } from "@/components/ui/sonner";

// Eager load - always needed on first page
import HomePage from "./pages/HomePage.jsx";

// Lazy load pages - only loaded when navigated to
const BuyPage = lazy(() => import("./pages/BuyPage.jsx"));
const RentPage = lazy(() => import("./pages/RentPage.jsx"));
const SellPage = lazy(() => import("./pages/SellPage.jsx"));
const PropertiesPage = lazy(() => import("./pages/PropertiesPage.jsx"));
const PropertyDetailsPage = lazy(() => import("./pages/PropertyDetailsPage.jsx"));
const ServicesPage = lazy(() => import("./pages/ServicesPage.jsx"));
const EPANPage = lazy(() => import("./pages/EPANPage.jsx"));
const AgentsPage = lazy(() => import("./pages/AgentsPage.jsx"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const FAQPage = lazy(() => import("./pages/FAQPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));

// Loading fallback component
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/buy" element={<BuyPage />} />
            <Route path="/rent" element={<RentPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<PropertyDetailsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/epan" element={<EPANPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;