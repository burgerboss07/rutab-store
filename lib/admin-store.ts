import { create } from 'zustand';

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  time: string;
  read: boolean;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

interface AdminState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (crumbs: Breadcrumb[]) => void;

  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: () => number;

  // Quick-generated mock activities for the feed
  activities: Activity[];

  // Dark mode toggle
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;

  // RBAC
  userRole: string;
  setUserRole: (role: string) => void;
  hasPermission: (perm: string) => boolean;
}

const mockNotifications: Notification[] = [
  { id: 'n1', type: 'warning', message: 'Stock running low — "Travis Scott" only 2 left', time: '2m ago', read: false },
  { id: 'n2', type: 'success', message: 'Order #a1b2c3 marked as delivered', time: '15m ago', read: false },
  { id: 'n3', type: 'info', message: 'New user registered: hamad@example.com', time: '1h ago', read: false },
  { id: 'n4', type: 'error', message: 'Payment failed for order #x9y8z7', time: '3h ago', read: true },
];

const mockActivities: Activity[] = [
  { id: 'a1', user: 'Admin', action: 'updated', target: 'product "Travis Scott"', time: 'Just now' },
  { id: 'a2', user: 'System', action: 'processed', target: 'order #a1b2c3', time: '5m ago' },
  { id: 'a3', user: 'Admin', action: 'added', target: 'new product "Kuwait Hoodie"', time: '12m ago' },
  { id: 'a4', user: 'User (hamad)', action: 'registered', target: 'new account', time: '1h ago' },
  { id: 'a5', user: 'Admin', action: 'updated', target: 'store settings', time: '2h ago' },
  { id: 'a6', user: 'System', action: 'refunded', target: 'order #x9y8z7', time: '3h ago' },
];

// ─── Dashboard mock data ─────────────────────────────────────────────
export interface SalesAnalytics {
  revenueByCategory: { label: string; value: number; color: string }[];
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  topProducts: { name: string; revenue: number; growth: string }[];
}

export interface InventoryItem {
  name: string; sku: string; stock: number; threshold: number;
  category: string; image_url?: string;
}

export interface CustomerSegment {
  label: string; count: number; percentage: number; color: string;
}

export interface FunnelStage {
  stage: string; count: number; dropoff: string;
}

export interface SocialPlatform {
  platform: string; followers: number; engagement: string;
  posts: number; growth: string; color: string;
}

export interface ShippingStats {
  status: string; count: number; color: string;
}

export interface LiveActivity {
  id: string; type: string; message: string; time: string;
}

export interface SEOMetric {
  keyword: string; position: number; change: number;
  volume: number; url: string;
}

export interface PayoutRecord {
  id: string; date: string; amount: number; status: string;
  method: string; description: string;
}

// ─── Catalog Management ────────────────────────────────────────
export interface Catalog {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  subCatalogs: SubCatalog[];
  created_at: string;
  updated_at?: string;
}

export interface SubCatalog {
  id: string;
  name: string;
  description?: string;
  catalogId: string;
  created_at: string;
}

export const mockCatalogs: Catalog[] = [
  {
    id: 'c1',
    name: 'Hoodies',
    description: 'Premium hooded sweatshirts',
    image_url: '/placeholder.svg',
    subCatalogs: [
      { id: 'sc1', name: 'Streetwear', description: 'Urban street style', catalogId: 'c1', created_at: '2026-05-01T00:00:00Z' },
      { id: 'sc2', name: 'Classic', description: 'Timeless logo designs', catalogId: 'c1', created_at: '2026-05-01T00:00:00Z' },
    ],
    created_at: '2026-05-01T00:00:00Z'
  },
  {
    id: 'c2',
    name: 'T-Shirts',
    description: 'Premium graphic tees',
    image_url: '/placeholder.svg',
    subCatalogs: [
      { id: 'sc3', name: 'Graphic Tees', description: 'Kuwait heritage designs', catalogId: 'c2', created_at: '2026-04-15T00:00:00Z' },
      { id: 'sc4', name: 'Summer', description: 'Lightweight summer collection', catalogId: 'c2', created_at: '2026-06-01T00:00:00Z' },
    ],
    created_at: '2026-04-15T00:00:00Z'
  },
  {
    id: 'c3',
    name: 'Caps',
    description: 'Headwear collections',
    image_url: '/placeholder.svg',
    subCatalogs: [
      { id: 'sc5', name: 'Heritage', description: 'Arabic poetry designs', catalogId: 'c3', created_at: '2026-03-20T00:00:00Z' },
      { id: 'sc6', name: 'Limited', description: 'Exclusive drops', catalogId: 'c3', created_at: '2026-05-25T00:00:00Z' },
    ],
    created_at: '2026-03-20T00:00:00Z'
  },
  {
    id: 'c4',
    name: 'Accessories',
    description: 'Bags, socks, and more',
    image_url: '/placeholder.svg',
    subCatalogs: [],
    created_at: '2026-05-10T00:00:00Z'
  },
  {
    id: 'c5',
    name: 'Bottoms',
    description: 'Pants and shorts',
    image_url: '/placeholder.svg',
    subCatalogs: [],
    created_at: '2026-05-10T00:00:00Z'
  },
];

// ─── Mock data for admin panels when Supabase is unavailable ────────
import { Product, Order } from './store';

export const mockProducts: Product[] = [
  { id: 'p1', name: 'Travis Scott Hoodie', description: 'Limited edition Travis Scott merch', price: 45.000, image_url: '/placeholder.svg', catalog: 'Hoodies', subCatalog: 'Streetwear', stock: 12, is_featured: true, created_at: '2026-05-01T00:00:00Z', sku: 'TS-HD-001', sizes: ['S','M','L','XL'], colors: ['Black','Grey'] },
  { id: 'p2', name: 'Kuwait City Tee', description: 'Premium Kuwait graphic tee', price: 22.500, image_url: '/placeholder.svg', catalog: 'T-Shirts', subCatalog: 'Graphic Tees', stock: 45, is_featured: true, created_at: '2026-04-15T00:00:00Z', sku: 'KW-TE-002', sizes: ['S','M','L','XL','XXL'], colors: ['White','Black'] },
  { id: 'p3', name: 'Arabic Poetry Cap', description: 'Classic cap with Arabic calligraphy', price: 18.000, image_url: '/placeholder.svg', catalog: 'Caps', subCatalog: 'Heritage', stock: 28, is_featured: false, created_at: '2026-03-20T00:00:00Z', sku: 'AP-CP-003', sizes: ['One Size'], colors: ['Black','White','Navy'] },
  { id: 'p4', name: 'Classic Logo Hoodie', description: 'Signature RUTAB logo hoodie', price: 38.000, image_url: '/placeholder.svg', catalog: 'Hoodies', subCatalog: 'Classic', stock: 8, is_featured: true, created_at: '2026-05-10T00:00:00Z', sku: 'CL-HD-004', sizes: ['M','L','XL'], colors: ['Black','Grey'] },
  { id: 'p5', name: 'Summer 2026 Tee', description: 'Limited summer collection tee', price: 25.000, image_url: '/placeholder.svg', catalog: 'T-Shirts', subCatalog: 'Summer', stock: 60, is_featured: false, created_at: '2026-06-01T00:00:00Z', sku: 'SM-TE-005', sizes: ['S','M','L','XL'], colors: ['White','Yellow','Blue'] },
  { id: 'p6', name: 'Limited Edition Cap', description: 'Exclusive drop cap', price: 22.000, image_url: '/placeholder.svg', catalog: 'Caps', subCatalog: 'Limited', stock: 0, is_featured: false, created_at: '2026-05-25T00:00:00Z', sku: 'LE-CP-006', sizes: ['One Size'], colors: ['Black'] },
];

export const mockOrders: Order[] = [
  { id: 'a1b2c3d4', created_at: '2026-05-24T14:30:00Z', total_price: 67.500, status: 'delivered', address: 'Salmiya, Block 3, Street 12', phone: '+965 9000 0001', payment_method: 'KNET', items: [{ id: 'i1', product_name: 'Travis Scott Hoodie', price: 45.000, quantity: 1, size: 'L', color: 'Black' }, { id: 'i2', product_name: 'Arabic Poetry Cap', price: 18.000, quantity: 1, size: 'One Size', color: 'Black' }] },
  { id: 'e5f6g7h8', created_at: '2026-05-23T10:15:00Z', total_price: 38.000, status: 'shipped', address: 'Kuwait City, Sharq, Tower A', phone: '+965 9000 0002', payment_method: 'Tabby', items: [{ id: 'i3', product_name: 'Classic Logo Hoodie', price: 38.000, quantity: 1, size: 'XL', color: 'Grey' }] },
  { id: 'i9j0k1l2', created_at: '2026-05-22T18:45:00Z', total_price: 45.000, status: 'pending', address: 'Hawally, Street 45, Building 7', phone: '+965 9000 0003', payment_method: 'Cash on Delivery', items: [{ id: 'i4', product_name: 'Travis Scott Hoodie', price: 45.000, quantity: 1, size: 'M', color: 'Grey' }] },
  { id: 'm3n4o5p6', created_at: '2026-05-21T09:00:00Z', total_price: 85.000, status: 'pending', address: 'Ahmadi, Block 2, Street 8', phone: '+965 9000 0004', payment_method: 'KNET', items: [{ id: 'i5', product_name: 'Kuwait City Tee', price: 22.500, quantity: 2, size: 'L', color: 'White' }, { id: 'i6', product_name: 'Summer 2026 Tee', price: 25.000, quantity: 1, size: 'XL', color: 'Blue' }, { id: 'i7', product_name: 'Arabic Poetry Cap', price: 18.000, quantity: 1, size: 'One Size', color: 'Navy' }] },
  { id: 'q7r8s9t0', created_at: '2026-05-20T16:20:00Z', total_price: 22.500, status: 'delivered', address: 'Fahaheel, Main Street', phone: '+965 9000 0005', payment_method: 'KNET', items: [{ id: 'i8', product_name: 'Kuwait City Tee', price: 22.500, quantity: 1, size: 'S', color: 'Black' }] },
];

export const mockProfiles = [
  { id: 'u1', email: 'ahmed@example.com', full_name: 'Ahmed Al-Rashid', phone: '+965 9000 0001', address: 'Salmiya, Block 3', area: 'Salmiya', notes: 'VIP customer', status: 'vip' as const, created_at: '2026-01-15T00:00:00Z' },
  { id: 'u2', email: 'fatima@example.com', full_name: 'Fatima Al-Sabah', phone: '+965 9000 0002', address: 'Kuwait City, Sharq', area: 'Kuwait City', notes: '', status: 'active' as const, created_at: '2026-02-20T00:00:00Z' },
  { id: 'u3', email: 'khalid@example.com', full_name: 'Khalid Al-Mutairi', phone: '+965 9000 0003', address: 'Hawally, Street 45', area: 'Hawally', notes: 'Frequently orders hoodies', status: 'active' as const, created_at: '2026-03-10T00:00:00Z' },
  { id: 'u4', email: 'noor@example.com', full_name: 'Noor Al-Abdullah', phone: '+965 9000 0004', address: 'Ahmadi, Block 2', area: 'Ahmadi', notes: '', status: 'inactive' as const, created_at: '2026-01-05T00:00:00Z' },
  { id: 'u5', email: 'saud@example.com', full_name: 'Saud Al-Harbi', phone: '+965 9000 0005', address: 'Fahaheel, Main Street', area: 'Fahaheel', notes: 'Payment issues', status: 'flagged' as const, created_at: '2026-04-01T00:00:00Z' },
  { id: 'u6', email: 'laila@example.com', full_name: 'Laila Al-Anzi', phone: '+965 9000 0006', address: 'Salmiya, Block 7', area: 'Salmiya', notes: 'New customer', status: 'active' as const, created_at: '2026-05-20T00:00:00Z' },
];

export const dashboardMock = {
  salesAnalytics: {
    revenueByCategory: [
      { label: 'Hoodies', value: 42300, color: '#ff0000' },
      { label: 'T-Shirts', value: 28500, color: '#3b82f6' },
      { label: 'Caps', value: 12100, color: '#22c55e' },
      { label: 'Accessories', value: 8900, color: '#f59e0b' },
      { label: 'Bottoms', value: 6200, color: '#a855f7' },
    ] as SalesAnalytics['revenueByCategory'],
    monthlyRevenue: [
      { month: 'Jan', revenue: 18400, orders: 142 },
      { month: 'Feb', revenue: 22100, orders: 168 },
      { month: 'Mar', revenue: 19800, orders: 155 },
      { month: 'Apr', revenue: 26400, orders: 189 },
      { month: 'May', revenue: 31200, orders: 224 },
      { month: 'Jun', revenue: 28700, orders: 201 },
    ] as SalesAnalytics['monthlyRevenue'],
    topProducts: [
      { name: 'Travis Scott Hoodie', revenue: 2284.2, growth: '+24%' },
      { name: 'Kuwait City Tee', revenue: 1578.2, growth: '+18%' },
      { name: 'Arabic Poetry Cap', revenue: 1223.6, growth: '+32%' },
      { name: 'Classic Logo Hoodie', revenue: 869.4, growth: '+11%' },
    ] as SalesAnalytics['topProducts'],
  },

  inventory: [
    { name: 'Travis Scott Hoodie', sku: 'TS-HD-001', stock: 3, threshold: 10, category: 'Hoodies' },
    { name: 'Kuwait City Tee', sku: 'KW-TE-002', stock: 12, threshold: 10, category: 'T-Shirts' },
    { name: 'Arabic Poetry Cap', sku: 'AP-CP-003', stock: 2, threshold: 15, category: 'Caps' },
    { name: 'Classic Logo Hoodie', sku: 'CL-HD-004', stock: 8, threshold: 8, category: 'Hoodies' },
    { name: 'Summer 2026 Tee', sku: 'SM-TE-005', stock: 25, threshold: 10, category: 'T-Shirts' },
    { name: 'Limited Edition Cap', sku: 'LE-CP-006', stock: 0, threshold: 5, category: 'Caps' },
  ] as InventoryItem[],

  customerSegments: [
    { label: 'VIP', count: 24, percentage: 8, color: '#f59e0b' },
    { label: 'Active', count: 96, percentage: 32, color: '#22c55e' },
    { label: 'New', count: 108, percentage: 36, color: '#3b82f6' },
    { label: 'Inactive', count: 72, percentage: 24, color: '#6b7280' },
  ] as CustomerSegment[],

  funnel: [
    { stage: 'Visitors', count: 12450, dropoff: '—' },
    { stage: 'Add to Cart', count: 3820, dropoff: '69.3%' },
    { stage: 'Checkout', count: 2150, dropoff: '43.7%' },
    { stage: 'Purchases', count: 1640, dropoff: '23.7%' },
  ] as FunnelStage[],

  socialMedia: [
    { platform: 'Instagram', followers: 28400, engagement: '4.2%', posts: 48, growth: '+12%', color: '#e1306c' },
    { platform: 'TikTok', followers: 15600, engagement: '6.8%', posts: 32, growth: '+24%', color: '#000000' },
    { platform: 'Snapchat', followers: 8900, engagement: '3.1%', posts: 18, growth: '+5%', color: '#fffc00' },
  ] as SocialPlatform[],

  shipping: [
    { status: 'Pending', count: 8, color: '#f59e0b' },
    { status: 'Shipped', count: 15, color: '#3b82f6' },
    { status: 'In Transit', count: 22, color: '#a855f7' },
    { status: 'Delivered', count: 142, color: '#22c55e' },
  ] as ShippingStats[],

  liveActivity: [
    { id: 'la1', type: 'visit', message: 'New visitor from Instagram', time: 'Just now' },
    { id: 'la2', type: 'cart', message: 'Cart started — 2 items, 48.500 KWD', time: '1m ago' },
    { id: 'la3', type: 'order', message: 'Order #a1b2c3 placed — 32.400 KWD', time: '3m ago' },
    { id: 'la4', type: 'visit', message: 'New visitor from Google Search', time: '3m ago' },
    { id: 'la5', type: 'cart', message: 'Cart abandoned — 1 item, 22.000 KWD', time: '5m ago' },
    { id: 'la6', type: 'order', message: 'Order #d4e5f6 placed — 18.900 KWD', time: '7m ago' },
  ] as LiveActivity[],

  seo: [
    { keyword: 'kuwait streetwear', position: 3, change: 2, volume: 3400, url: '/shop' },
    { keyword: 'luxury hoodie kuwait', position: 5, change: -1, volume: 1800, url: '/shop/hoodies' },
    { keyword: 'travis scott merch kuwait', position: 2, change: 1, volume: 4200, url: '/product/ts-hoodie' },
    { keyword: 'kuwait graphic tees', position: 8, change: 3, volume: 1100, url: '/shop/tees' },
    { keyword: 'buy cap online kuwait', position: 12, change: -2, volume: 900, url: '/shop/caps' },
  ] as SEOMetric[],

  payouts: [
    { id: 'PAY-001', date: '2026-05-20', amount: 4280.50, status: 'completed', method: 'Bank Transfer', description: 'May 1-15 settlement' },
    { id: 'PAY-002', date: '2026-05-06', amount: 3150.00, status: 'completed', method: 'Bank Transfer', description: 'Apr 16-30 settlement' },
    { id: 'PAY-003', date: '2026-05-25', amount: 1890.75, status: 'pending', method: 'KNET', description: 'May 16-20 settlement' },
    { id: 'PAY-004', date: '2026-04-21', amount: 5620.00, status: 'completed', method: 'Bank Transfer', description: 'Apr 1-15 settlement' },
    { id: 'PAY-005', date: '2026-05-25', amount: 420.00, status: 'pending', method: 'Tabby', description: 'May BNPL settlement' },
  ] as PayoutRecord[],
};

export const useAdminStore = create<AdminState>()((set, get) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  breadcrumbs: [{ label: 'Dashboard', href: '/admin/dashboard' }],
  setBreadcrumbs: (crumbs) => set({ breadcrumbs: crumbs }),

  notifications: mockNotifications,
  addNotification: (n) =>
    set((s) => ({
      notifications: [
        { ...n, id: `n${Date.now()}`, time: 'Just now', read: false },
        ...s.notifications,
      ],
    })),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  clearNotifications: () => set({ notifications: [] }),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  activities: mockActivities,

  darkMode: false,
  setDarkMode: (dark) => set({ darkMode: dark }),

  userRole: 'super_admin',
  setUserRole: (role) => set({ userRole: role }),
  hasPermission: (perm) => {
    const role = get().userRole;
    if (role === 'super_admin') return true;
    return false; // Simplified — expand per role matrix later
  },
}));
