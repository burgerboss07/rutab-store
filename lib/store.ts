import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const CURRENCY_CONFIG: Record<string, { rate: number; symbol: string; decimals: number; suffix?: boolean }> = {
  'KWD (K.D)': { rate: 1.0, symbol: 'K.D', decimals: 3, suffix: true },
  'USD ($)': { rate: 3.25, symbol: '$', decimals: 2, suffix: false },
  'PKR (Rs)': { rate: 900.0, symbol: 'Rs', decimals: 0, suffix: false },
  'AED (AED)': { rate: 12.0, symbol: 'AED', decimals: 2, suffix: true },
  'EUR (€)': { rate: 3.0, symbol: '€', decimals: 2, suffix: false }
};

export function formatPrice(value: number, currentCurrency: string = 'KWD (K.D)') {
  const config = CURRENCY_CONFIG[currentCurrency] || CURRENCY_CONFIG['KWD (K.D)'];
  const converted = value * config.rate;
  if (isNaN(converted)) return '0.00';
  const formatted = converted.toLocaleString(undefined, {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals
  });
  return config.suffix ? `${formatted} ${config.symbol}` : `${config.symbol}${formatted}`;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string | number;
  image_url: string;
  catalog?: string;
  subCatalog?: string;
  category?: string;
  subcategory?: string;
  stock?: number;
  stock_per_size?: Record<string, number> | Record<string, string>;
  product_type?: string;
  back_image_url?: string;
  is_featured: boolean;
  created_at: string;
  sku: string;
  sizes: string[];
  colors: string[];
  images?: string[];
}

export interface Catalog {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  subCatalogs: SubCatalog[];
  created_at: string;
}

export interface SubCatalog {
  id: string;
  name: string;
  description?: string;
  catalogId: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  size: string;
  color: string;
  quantity: number;
}

export interface UserProfile {
  email: string;
  name: string;
  phone: string;
  address: string;
  area: string;
}

export interface OrderItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export interface Order {
  id: string;
  created_at: string;
  total_price: number;
  status: string;
  address: string;
  phone: string;
  payment_method: string;
  items: OrderItem[];
}

export type StoreView = 'home' | 'shop' | 'checkout' | 'account' | 'admin';

interface StoreState {
  // Navigation & UI state
  activeView: StoreView;
  setActiveView: (view: StoreView) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  toastMessage: string | null;
  setToast: (msg: string | null) => void;

  // Shopping States
  currency: string;
  setCurrency: (currency: string) => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;

  wishlist: string[]; // Product IDs
  toggleWishlist: (productId: string) => void;

  // User Auth & Mock Session
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // UI / Navigation
      activeView: 'home',
      setActiveView: (view) => set({ activeView: view }),
      selectedProductId: null,
      setSelectedProductId: (id) => set({ selectedProductId: id }),
      isCartOpen: false,
      setCartOpen: (open) => set({ isCartOpen: open }),
      toastMessage: null,
      setToast: (msg) => {
        set({ toastMessage: msg });
        if (msg) {
          setTimeout(() => {
            set((state) => (state.toastMessage === msg ? { toastMessage: null } : {}));
          }, 3000);
        }
      },

      // Cart Actions
      currency: 'KWD (K.D)',
      setCurrency: (currency) => {
        set({ currency });
        if (typeof window !== 'undefined') {
          import('./supabase').then(async ({ getSupabase }) => {
            try {
              const client = getSupabase();
              const { data: { session } } = await client.auth.getSession();
              if (session?.user) {
                await client
                  .from('profiles')
                  .update({ preferred_currency: currency })
                  .eq('id', session.user.id);
              }
            } catch (err) {
              console.error('Failed to save preferred currency to profile:', err);
            }
          });
        }
      },
      cart: [],
      addToCart: (item, quantity = 1) => {
        const currentCart = get().cart;
        const existingIndex = currentCart.findIndex(
          (i) => i.id === item.id && i.size === item.size && i.color === item.color
        );

        if (existingIndex > -1) {
          const updated = [...currentCart];
          updated[existingIndex].quantity += quantity;
          set({ cart: updated });
        } else {
          set({ cart: [...currentCart, { ...item, quantity }] });
        }
        get().setToast(`Added ${item.name} (${item.size}) to cart`);
      },
      removeFromCart: (id, size, color) => {
        const updated = get().cart.filter(
          (i) => !(i.id === id && i.size === size && i.color === color)
        );
        set({ cart: updated });
        get().setToast('Removed item from cart');
      },
      updateQuantity: (id, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id, size, color);
          return;
        }
        const updated = get().cart.map((i) =>
          i.id === id && i.size === size && i.color === color ? { ...i, quantity } : i
        );
        set({ cart: updated });
      },
      clearCart: () => set({ cart: [] }),
      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getCartItemCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },

      // Wishlist Actions
      wishlist: [],
      toggleWishlist: (productId) => {
        const current = get().wishlist;
        const exists = current.includes(productId);
        const updated = exists
          ? current.filter((id) => id !== productId)
          : [...current, productId];
        set({ wishlist: updated });
        get().setToast(exists ? 'Removed from wishlist' : 'Added to wishlist');
      },

      // Authentication & Orders
      user: null,
      setUser: (user) => set({ user }),
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      setOrders: (orders) => set({ orders }),
    }),
    {
      name: 'rutab-store-storage',
      partialize: (state) => ({
        currency: state.currency,
        cart: state.cart,
        wishlist: state.wishlist,
        user: state.user,
        orders: state.orders,
      }),
    }
  )
);
