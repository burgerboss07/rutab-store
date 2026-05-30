'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useStore, type StoreView } from '@/lib/store';
import { getSupabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';

// Lazy-loaded view components — only loaded when their view is activated
const FeaturedCategories = dynamic(() => import('@/components/FeaturedCategories'), { ssr: false });
const TrendingSlider = dynamic(() => import('@/components/TrendingSlider'), { ssr: false });
const SocialFeed = dynamic(() => import('@/components/SocialFeed'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });
const ShopPage = dynamic(() => import('@/components/ShopPage'), { ssr: false });
const ProductDetails = dynamic(() => import('@/components/ProductDetails'), { ssr: false });
const CartDrawer = dynamic(() => import('@/components/CartDrawer'), { ssr: false });
const CheckoutForm = dynamic(() => import('@/components/CheckoutForm'), { ssr: false });
const UserDashboard = dynamic(() => import('@/components/UserDashboard'), { ssr: false });
const OrdersPage = dynamic(() => import('@/components/OrdersPage'), { ssr: false });
const OrderTracking = dynamic(() => import('@/components/OrderTracking'), { ssr: false });
const WishlistPage = dynamic(() => import('@/components/WishlistPage'), { ssr: false });
const StoryPage = dynamic(() => import('@/components/StoryPage'), { ssr: false });
const AdminDashboard = dynamic(() => import('@/components/AdminDashboard'), { ssr: false });

export default function Home() {
  const activeView = useStore((state) => state.activeView);
  const toastMessage = useStore((state) => state.toastMessage);
  const selectedProductId = useStore((state) => state.selectedProductId);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('code')) {
      window.location.href = '/auth/callback' + window.location.search;
    }
    const viewParam = params.get('view') as StoreView | null;
    if (viewParam) {
      useStore.getState().setActiveView(viewParam);
    }
  }, []);

  const storeSettings = useStore((s) => s.storeSettings);
  const homeSettings = useStore((s) => s.homeSettings);
  const setStoreSettings = useStore((s) => s.setStoreSettings);
  const setHomeSettings = useStore((s) => s.setHomeSettings);

  useEffect(() => {
    if (homeSettings && storeSettings) return;
    async function loadSettings() {
      try {
        const client = getSupabase();
          const [homeRes, storeRes] = await Promise.all([
            client.from('settings').select('value').eq('key', 'home_settings').maybeSingle(),
            client.from('settings').select('value').eq('key', 'store_settings').maybeSingle(),
          ]);
        if (homeRes.data?.value) setHomeSettings(homeRes.data.value);
        if (storeRes.data?.value) setStoreSettings(storeRes.data.value);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    loadSettings();
  }, [homeSettings, storeSettings, setHomeSettings, setStoreSettings]);

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
      case 'orders':
        return <OrdersPage />;
      case 'track':
        return <OrderTracking />;
      case 'story':
        return <StoryPage />;
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
