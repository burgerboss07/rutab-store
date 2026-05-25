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
