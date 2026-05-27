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
import AdminDashboard from '@/components/AdminDashboard';

export default function Home() {
  const activeView = useStore((state) => state.activeView);
  const toastMessage = useStore((state) => state.toastMessage);
  const selectedProductId = useStore((state) => state.selectedProductId);

  const [homeSettings, setHomeSettings] = useState<any>(null);

  useEffect(() => {
    // Client-side OAuth code exchange fallback (for redirect fallback to homepage Site URL)
    if (typeof window !== 'undefined') {
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        const client = getSupabase();
        client.auth.exchangeCodeForSession(code)
          .then(({ error }) => {
            if (error) {
              console.error('Client-side OAuth code exchange failed:', error);
            }
          })
          .catch((err) => {
            console.error('Error during client-side OAuth exchange:', err);
          })
          .finally(() => {
            // Always clean up query parameters from the URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
          });
      }
    }

    async function loadHomeSettings() {
      try {
        const client = getSupabase();
        const { data, error } = await client
          .from('settings')
          .select('value')
          .eq('key', 'home_settings')
          .single();
        if (data && data.value) {
          setHomeSettings(data.value);
        }
      } catch (err) {
        console.error('Failed to load home page settings:', err);
      }
    }

    // Set up Supabase Auth State listener to sync user & preferred currency locally
    const client = getSupabase();
    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await client
            .from('profiles')
            .select('full_name, phone, preferred_currency')
            .eq('id', session.user.id)
            .maybeSingle();

          const name = profile?.full_name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Rutab Member';
          const phone = profile?.phone || session.user.user_metadata?.phone || '+965 9999 8888';
          const preferred_currency = profile?.preferred_currency;

          // Upsert profile so Google/OAuth users get a profile row
          if (!profile) {
            await client.from('profiles').upsert({
              id: session.user.id,
              email: session.user.email || '',
              full_name: name,
              phone: phone,
            }, { onConflict: 'id' });
          }

          useStore.getState().setUser({
            email: session.user.email || '',
            name,
            phone,
            address: '',
            area: '',
          });

          if (preferred_currency) {
            useStore.getState().setCurrency(preferred_currency);
          }
        } catch (err) {
          console.error('Failed to sync user auth state:', err);
        }
      } else {
        useStore.getState().setUser(null);
      }
    });

    loadHomeSettings();

    return () => {
      subscription.unsubscribe();
    };
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
          return (
            <SocialFeed
              key="feed"
              title={sectionConfig.title}
              subtitle={sectionConfig.subtitle}
              description={sectionConfig.description}
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
