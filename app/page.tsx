'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { getSupabase } from '@/lib/supabase';
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
import WishlistPage from '@/components/WishlistPage';
import AdminDashboard from '@/components/AdminDashboard';

export default function Home() {
  const activeView = useStore((state) => state.activeView);
  const toastMessage = useStore((state) => state.toastMessage);
  const selectedProductId = useStore((state) => state.selectedProductId);

  const [homeSettings, setHomeSettings] = useState<any>(null);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const client = getSupabase();
        const [homeRes, storeRes] = await Promise.all([
          client.from('settings').select('value').eq('key', 'home_settings').single(),
          client.from('settings').select('value').eq('key', 'store_settings').single(),
        ]);
        if (homeRes.data?.value) setHomeSettings(homeRes.data.value);
        if (storeRes.data?.value) setStoreSettings(storeRes.data.value);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    loadSettings();
  }, []);

  const defaultLayout = ['hero', 'collections', 'trending', 'feed', 'footer'];
  const defaultSections = {
    hero: { active: true },
    collections: { active: true },
    trending: { active: true },
    feed: { active: true },
    footer: { active: true }
  };

  const layout = homeSettings?.layout || defaultLayout;
  const sections = homeSettings?.sections || defaultSections;

  const renderHomeSections = () => {
    return layout.map((sectionId: string) => {
      const sectionConfig = sections[sectionId] || { active: true };
      if (!sectionConfig.active) return null;

      switch (sectionId) {
        case 'hero':
          return (
            <Hero
              key="hero"
              title={sectionConfig.title}
              subtitle={sectionConfig.subtitle}
              slogan={sectionConfig.slogan}
              sloganHighlight={sectionConfig.sloganHighlight}
              description={sectionConfig.description}
            />
          );
        case 'collections':
          return (
            <FeaturedCategories
              key="collections"
              title={sectionConfig.title}
              subtitle={sectionConfig.subtitle}
              description={sectionConfig.description}
            />
          );
        case 'trending':
          return (
            <TrendingSlider
              key="trending"
              title={sectionConfig.title}
              subtitle={sectionConfig.subtitle}
            />
          );
        case 'feed':
          const socialFeedCfg = storeSettings?.social_feed;
          return (
            <SocialFeed
              key="feed"
              title={socialFeedCfg?.title || sectionConfig.title}
              subtitle={socialFeedCfg?.subtitle || sectionConfig.subtitle}
              description={socialFeedCfg?.description || sectionConfig.description}
              feeds={socialFeedCfg?.feeds || sectionConfig.feeds}
            />
          );
        case 'footer':
          return <Footer key="footer" />;
        default:
          return null;
      }
    });
  };

  // Render view dynamically
  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <>{renderHomeSections()}</>;
      case 'shop':
        return <ShopPage />;
      case 'checkout':
        return <CheckoutForm />;
      case 'wishlist':
        return <WishlistPage />;
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
