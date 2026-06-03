'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';

export default function SyncProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supabase = getSupabase();

    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initialized) return;
    setInitialized(true);

    const supabase = getSupabase();

    const bump = () => useStore.getState().bumpSync();

    // —— INITIAL FETCH: populate store with current DB data ———
    (async () => {
      const [ordersRes, productsRes, bannersRes, catsRes, storeRes, homeRes] = await Promise.all([
        supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
        supabase.from('products').select('*'),
        supabase.from('banners').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('settings').select('value').eq('key', 'store_settings').maybeSingle(),
        supabase.from('settings').select('value').eq('key', 'home_settings').maybeSingle(),
      ]);
      if (ordersRes.data) {
        const mapped = ordersRes.data.map((o: any) => ({
          id: o.id, created_at: o.created_at, total_price: o.total_price,
          status: o.status, address: o.address || '', phone: o.phone || '',
          payment_method: o.payment_method || '', payment_proof: o.payment_proof || undefined,
          items: (o.order_items || []).map((i: any) => ({
            id: i.product_id || i.id, product_name: i.product_name || '',
            price: i.price, quantity: i.quantity, size: i.size || '', color: i.color || '',
          })),
        }));
        useStore.getState().setOrders(mapped);
      }
      if (productsRes.data) useStore.getState().setProducts(productsRes.data);
      if (bannersRes.data) useStore.getState().setBanners(bannersRes.data);
      if (catsRes.data) useStore.getState().setCategories(catsRes.data);
      if (storeRes.data?.value) useStore.getState().setStoreSettings(storeRes.data.value);
      if (homeRes.data?.value) useStore.getState().setHomeSettings(homeRes.data.value);
      bump();
    })();

    // —— ORDERS ——
    const ordersChannel = supabase
      .channel('public:orders:sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
        bump();
        const { data } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
        if (data) {
          const mapped = data.map((o: any) => ({
            id: o.id,
            created_at: o.created_at,
            total_price: o.total_price,
            status: o.status,
            address: o.address || '',
            phone: o.phone || '',
            payment_method: o.payment_method || '',
            payment_proof: o.payment_proof || undefined,
            items: (o.order_items || []).map((i: any) => ({
              id: i.product_id || i.id,
              product_name: i.product_name || '',
              price: i.price,
              quantity: i.quantity,
              size: i.size || '',
              color: i.color || '',
            })),
          }));
          useStore.getState().setOrders(mapped);
        }
      })
      .subscribe();

    // —— PRODUCTS ——
    const productsChannel = supabase
      .channel('public:products:sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
        bump();
        const { data } = await supabase.from('products').select('*');
        if (data) useStore.getState().setProducts(data);
      })
      .subscribe();

    // —— BANNERS ——
    const bannersChannel = supabase
      .channel('public:banners:sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, async () => {
        bump();
        const { data } = await supabase.from('banners').select('*');
        if (data) useStore.getState().setBanners(data);
      })
      .subscribe();

    // —— CATEGORIES ——
    const categoriesChannel = supabase
      .channel('public:categories:sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => {
        bump();
        const { data } = await supabase.from('categories').select('*');
        if (data) useStore.getState().setCategories(data);
      })
      .subscribe();

    // —— SETTINGS (store_settings & home_settings) ——
    const settingsChannel = supabase
      .channel('public:settings:sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, async () => {
        bump();
        const [storeRes, homeRes] = await Promise.all([
          supabase.from('settings').select('value').eq('key', 'store_settings').maybeSingle(),
          supabase.from('settings').select('value').eq('key', 'home_settings').maybeSingle(),
        ]);
        if (storeRes.data?.value) useStore.getState().setStoreSettings(storeRes.data.value);
        if (homeRes.data?.value) useStore.getState().setHomeSettings(homeRes.data.value);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(bannersChannel);
      supabase.removeChannel(categoriesChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [initialized]);

  // Profile sync (re-subscribes when userId changes)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!userId) return;

    const supabase = getSupabase();
    const profileChannel = supabase
      .channel('public:profiles:sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        async () => {
          const session = (await supabase.auth.getSession()).data.session;
          if (!session?.user) return;
          const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (data) {
            useStore.getState().setUser({
              email: data.email || session.user.email || '',
              name: data.full_name || '',
              phone: data.phone || '',
              address: data.address || '',
              area: '',
              customerSizes: data.customer_sizes || {},
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [userId]);

  return <>{children}</>;
}
