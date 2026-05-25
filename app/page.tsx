'use client';

import { useStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';

import FeaturedCategories from '@/components/FeaturedCategories';
import TrendingSlider from '@/components/TrendingSlider';
import SocialFeed from '@/components/SocialFeed';
import Footer from '@/components/Footer';

// Pages / Views
import ShopPage from '@/components/ShopPage';
import ProductDetails from '@/components/ProductDetails';
import CartDrawer from '@/components/CartDrawer';
import CheckoutForm from '@/components/CheckoutForm';
import UserDashboard from '@/components/UserDashboard';
import AdminDashboard from '@/components/AdminDashboard';

export default function Home() {
  const activeView = useStore((state) => state.activeView);
  const toastMessage = useStore((state) => state.toastMessage);
  const selectedProductId = useStore((state) => state.selectedProductId);

  // Render view dynamically
  const renderView = () => {
    switch (activeView) {
      case 'home':
        return (
          <>
            <Hero />

            <FeaturedCategories />
            <TrendingSlider />
            <SocialFeed />
            <Footer />
          </>
        );
      case 'shop':
        return <ShopPage />;
      case 'checkout':
        return <CheckoutForm />;
      case 'account':
        return <UserDashboard />;
      default:
        return <Hero />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#ff0000] selection:text-white relative">
      
      {/* Background glowing canvas grids */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.15),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.03),transparent_35%)] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none z-0" />

      {/* Global Navbar */}
      <Navbar />

      {/* Dynamic Main View */}
      <div className="relative z-10">
        {renderView()}
      </div>

      {/* Global Cart Slide Drawer Overlay */}
      <CartDrawer />

      {/* Global Product Details PDP Overlay Modal */}
      {selectedProductId && <ProductDetails />}

      {/* Premium Toast Micro-Notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0a0a0a] border border-[#ff0000]/40 text-white font-bold text-[10px] px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(255,0,0,0.3)] animate-fade-in-up uppercase tracking-widest flex items-center gap-2.5 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#ff0000] animate-ping" />
          {toastMessage}
        </div>
      )}

    </div>
  );
}
