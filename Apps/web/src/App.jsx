import React from "react";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { Toaster } from "@/components/ui/sonner";
import HomePage from "./pages/HomePage.jsx";
import BuyPage from "./pages/BuyPage.jsx";
import RentPage from "./pages/RentPage.jsx";
import SellPage from "./pages/SellPage.jsx";
import PropertiesPage from "./pages/PropertiesPage.jsx";
import PropertyDetailsPage from "./pages/PropertyDetailsPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import EPANPage from "./pages/EPANPage.jsx";
import AgentsPage from "./pages/AgentsPage.jsx";
import ReviewsPage from "./pages/ReviewsPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import FAQPage from "./pages/FAQPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
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
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
