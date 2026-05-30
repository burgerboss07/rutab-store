<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:anchored-summary -->
# RUTAB Store — Anchored Summary

## Goal
Build a fully synced, real-time e-commerce platform where admin edits reflect instantly on the storefront, with order tracking, payment proof uploads, customer profile editing, and editable footer content.

## Constraints & Preferences
- All admin panels must show real Supabase data only, no mock fallback for profiles.
- Danger zone resets, user edits, and user deletes must work end-to-end (delete removes from both profiles and auth.users).
- Currency changes in shop must reflect in filter labels.
- Payment gateways: toggle, single details field, add/remove, save to Supabase.
- Meta title and favicon must be dynamically changeable from admin settings.
- Google Search requires same-domain favicon URL (proxied via /api/favicon).
- Catalogs must support sub-categories management inline.
- Customer auth: full system with login, signup, Google OAuth, protected routes, account dashboard.
- Customers can edit their own profile (name, phone, address) from account dashboard — changes sync to Zustand store and admin panel.
- Shipping & returns policy, social feed content must be editable from admin settings and reflected on storefront.
- Product filters (size, color) must be driven by actual DB data, not hardcoded.
- Feed cards in homepage must support add/remove and video URLs.
- Signup must work instantly without email confirmation (disabled in Supabase dashboard).
- Password reset flow removed — "Forgot?" link and forgot-password page deleted.
- Payment proof images must upload to Supabase Storage and be viewable in admin OrdersPanel.
- All storefront components (ShopPage, FeaturedCategories, TrendingSlider, CheckoutForm) must auto-refresh on DB changes via syncVersion.
- Footer content must be editable from admin settings.

## Progress
### Done
- Admin product main image, table thumbnails, gallery images sizes reduced.
- Storefront ProductCard, ShopPage, WishlistPage aspect ratios reverted to original.
- Product detail drawer: main image aspect-[3/4] → aspect-[1/1]; thumbnails sizes reduced.
- Price filter labels react to selected currency.
- Payment gateways: toggle, details field, add/remove, save to Supabase.
- Removed API Key / Secret Key / Merchant ID fields from payment gateways.
- Danger zone resets: removed references to non-existent tables; page reloads on success; clears Zustand localStorage.
- Users edit/delete: non-UUID mock IDs skipped; edit-profile skips Supabase for non-UUID ids; local state updated via onSaved callback.
- Select-all checkbox above users list.
- Mock profiles no longer seeded or fallen back to — only real Supabase profiles shown.
- All dashboardMock preview data removed from DashboardHome; sections hidden until hasData is true.
- Maintenance Mode and Dark/Light theme toggle removed.
- Google Analytics ID field removed from SEO section.
- Favicon: URL paste field added alongside file upload; client-side FaviconUpdater refreshes on page load; same-domain /api/favicon proxy for Google Search.
- Meta title and favicon dynamic: generateMetadata restored with force-dynamic layout; reads meta_title + store_logo from Supabase per-request.
- Favicon label renamed from "Store Logo / Favicon" → "Favicon".
- Image column in catalogs table shortened to 140px with truncate.
- Sub-categories management in Catalogs Panel: add/remove inline in edit form; expandable sub-count in table rows.
- Catalogs added to admin sidebar (Bookmark icon between Content and Home Page).
- Full customer auth system.
- Navbar shows user initial in red avatar circle when logged in; user icon when not.
- Admin Sync Users button: POST /api/admin/sync-users fetches all auth.users via service role, creates profiles for missing users.
- Delete user from admin panel now also calls adminClient.auth.admin.deleteUser(id) to remove from auth.users.
- Customer profile editing: inline edit mode in account dashboard for name and phone; saves to profiles table AND syncs to Zustand store.
- Removed non-existent profile fields (address, area, notes, status) from EditCustomerModal, CustomersPanel, and admin update-profile API route.
- Added preset size buttons (XS, S, M, L, XL, XXL, 3XL, One Size) and custom size input to product add/edit form and bulk edit modal.
- Added editable shipping & returns policy fields in admin Settings → Shipping; stored in store_settings JSON; displayed dynamically in ProductDetails accordion.
- Storefront product filters now driven by DB data: size filter checks p.sizes.includes(); color filter added from products' colors[] arrays.
- Added Social Feed editing section in admin Settings → Social Feed (title, subtitle, description, 4 feed cards with username, views, product name, image URL, video URL).
- Home Layout Studio feed cards support Add Card / Remove per card buttons.
- Feed data from store_settings.social_feed takes priority over home_settings feed config.
- Created service-role API route /api/admin/coupons for coupon CRUD (bypasses RLS); DiscountPanel rewritten with inline error/success messages.
- Created /api/admin/data generic service-role API route for admin writes to products, orders, categories, settings, banners.
- All admin panel Supabase writes converted from direct client calls to /api/admin/data service-role route (SettingsPanel, CatalogsPanel, ContentPanel, OrdersPanel, CustomersPanel).
- Created db/rls_enable.sql migration: enables RLS on categories, products, orders, order_items, coupons, settings, banners; creates read-public / write-admin policies.
- Auth callback page updated: shows "Email Confirmed" success screen with green checkmark or failure screen with "Try Again" link.
- Proxy.ts updated: handles ?code= redirect from root path to /auth/callback server-side.
- DiscountPanel rewritten: inline form error/success messages, resend cooldown, better UX.
- Custom SMTP (Resend) configured in Supabase for auth emails.
- Site URL in Supabase changed to https://www.rutab.store/auth/callback for production redirects.
- Catalog images: switched from Next.js `<Image fill>` to plain `<img>` tag; adjusted opacity/gradient for visibility.
- Broken image fallback in FeaturedCategories: `onError` handler switches to Unsplash fallback image.
- OrdersPage component created: full order history list with expandable details, status badges, payment method, address, items, "Track Order" button.
- 'orders' view added to StoreView type and page.tsx switch.
- Payment proof upload: migration_v3.sql adds payment_proof column; CheckoutForm uploads file to Supabase Storage bucket `payment_proofs`; stores public URL in DB and local Zustand store.
- Proof thumbnail column in admin OrdersPanel and ContentPanel with lightbox modal for full-size preview.
- CSV export in OrdersPanel includes payment_proof column.
- OrderTracking component created: visual progress stepper (Pending → Shipped → Delivered), cancelled/refunded state, order details, payment proof viewer.
- 'track' view and trackingOrderId state added to store; wired in page.tsx.
- Account dashboard (UserDashboard) fixes: Spent stat calculated from all orders total, Orders/Wishlist stat cards clickable, Address shows latest order address or hint, status badges use proper delviered/shipped/cancelled colors, currency from store.
- SyncProvider component with Supabase Realtime subscriptions for orders (with items), products, banners, categories, settings (store_settings + home_settings), and current user's profile. Updates Zustand store on every change and bumps syncVersion.
- Admin OrdersPanel has its own Realtime subscription for live re-fetch.
- Customer address editing in profile: migration_v4.sql adds address column; UserDashboard has editable address textarea; SyncProvider, refreshSession, and setUser all include address.
- CheckoutForm pre-fills address from saved profile: auto-extracts area, house, street, block via regex.
- Hardcoded social feed mock data removed; empty array used instead.
- All storefront data-fetching components (ShopPage, FeaturedCategories, TrendingSlider, CheckoutForm) now watch syncVersion and re-fetch on DB changes.
- **Footer editable**: HomePageEditor in admin Home Page section has full Footer editing (brand description, shop/company/social links, newsletter title/note, copyright text). Footer component reads from storeSettings.footer dynamically. Synced via SyncProvider.
- **Sizing Chart editable**: SettingsPanel has Sizing Chart section with editable table rows (size, chest, length, sleeve) and note. ProductDetails sizing modal reads from storeSettings.sizing_chart dynamically. Synced via SyncProvider.

### Blocked
- User must enable Realtime on Supabase tables (orders, products, banners, categories, settings, profiles) for live sync to work.
- User must run migration_v4.sql (`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;`) for address editing.
- User must create `payment_proofs` storage bucket in Supabase for payment proof uploads.

## Key Decisions
- Removed all mock profile fallback to prevent deleted users from reappearing.
- Seeded mock orders remain as fallback since they power stats/computation in dashboard.
- Dashboard sections with no real data source hidden behind hasData flag.
- Supabase service role key used for reset/delete/update/sync/admin APIs.
- Auth handled entirely client-side (browser Supabase client) rather than server API routes.
- Favicon proxied through same-domain /api/favicon to satisfy Google Search same-origin requirement.
- Sub-categories stored as JSONB array on categories table, managed inline in the catalog edit form.
- OAuth callback is a client page (not server route) so the browser client can exchange the code and store the session in its own storage.
- Admin coupon CRUD moved to service-role API route to bypass RLS (coupons table has admin-only RLS policy).
- Social feed content in store_settings.social_feed takes priority over home_settings feed section for simpler admin editing.
- All non-essential profile columns (address, area, notes, status) removed from code since they don't exist in DB schema.
- Size/color filter options derived dynamically from products' actual arrays rather than hardcoded lists.
- Email confirmation removed from signup flow (disabled in Supabase dashboard; signup page uses simple signUp() without OTP).
- Password reset flow removed entirely due to Supabase verification page redirect issues.
- All admin Supabase writes converted to /api/admin/data service-role route to prepare for RLS enablement.
- Payment proof stored in `payment_proofs` Supabase Storage bucket; proof URL saved to orders.payment_proof column.
- SyncProvider uses separate channels per table; syncVersion bumped on every change so components re-fetch reactively.
- All data-fetching components watch syncVersion as useEffect dependency instead of Zustand store data directly, avoiding large persisted state in localStorage.
- Footer data stored inside store_settings JSON as a `footer` key, same as shipping, social_feed, etc. Edited from HomePageEditor in admin Home Page section.

## Critical Context
- Reset-data API requires SUPABASE_SERVICE_ROLE_KEY env var; missing key returns clear error.
- Users with non-UUID IDs cannot be edited/deleted from DB — API skips them silently.
- All settings saved under store_settings key in Supabase settings table.
- Google OAuth requires redirect URL https://www.rutab.store/auth/callback configured in Supabase Authentication → Settings → Redirect URLs.
- createBrowserClient from @supabase/ssr uses cookie-based storage by default; singleton pattern caches client across calls.
- Proxy file is proxy.ts (not middleware.ts) — Next.js 16 uses proxy convention.
- Sub-categories are JSONB column sub_categories on the categories table; SubCatalog type has id, name, catalogId, created_at.
- Delete-user API iterates each valid UUID: deletes from profiles table then calls auth.admin.deleteUser(id).
- Customer profile edits go to profiles table via client-side Supabase client AND sync to Zustand store via useStore.getState().setUser().
- Coupons RLS policy requires profiles.role IN ('super_admin', 'manager'); service-role API route bypasses this.
- RLS disabled lint warnings exist for 6 public tables; db/rls_enable.sql migration provided to fix them.
- /api/admin/data generic route requires SUPABASE_SERVICE_ROLE_KEY; allowed tables: products, orders, order_items, categories, settings, banners.
- Signup no longer requires email confirmation — "Confirm email" toggle disabled in Supabase Dashboard.
- Password reset flow removed — "Forgot?" link deleted from login page, forgot-password page and send-reset-link API route deleted.
- Site URL in Supabase set to https://www.rutab.store/auth/callback for production redirects.
- Custom SMTP (Resend) configured in Supabase for auth emails.
- Payment proof images upload to `payment_proofs` Supabase Storage bucket (must be created manually as public bucket).
- Realtime must be enabled per-table in Supabase Dashboard → Database → Replication for SyncProvider to work.
- Migration v3: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_proof text;`
- Migration v4: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;`
- CheckoutForm extracts area/house/block/street from saved address via regex on the comma-separated string.
- SocialFeed uses empty array as fallback — no mock cards are hardcoded.
- All data-fetching components re-fetch when syncVersion changes (useEffect dependency), triggered by SyncProvider's Realtime subscriptions.
- Footer: SettingsPanel saves footer data in store_settings.footer JSON. Footer component reads from storeSettings.footer with fallback defaults. SyncProvider syncs automatically since it watches settings table.

## Relevant Files
- components/Footer.tsx: reads storeSettings.footer dynamically with fallback defaults.
- components/admin/HomePageEditor.tsx: has Footer editing section with brand description, shop/company/social links, newsletter title/note, copyright fields. Saves to store_settings.footer.
- components/SyncProvider.tsx: Realtime subscriptions for orders, products, banners, categories, settings, profiles.
- components/OrderTracking.tsx: progress stepper for single order tracking ('track' view).
- components/OrdersPage.tsx: customer order history list with expandable details.
- components/UserDashboard.tsx: profile editing with name, phone, address; stats and recent orders.
- components/CheckoutForm.tsx: payment proof upload to Supabase Storage; address pre-fill from profile.
- components/admin/OrdersPanel.tsx: payment proof column with lightbox modal; own Realtime subscription.
- components/admin/ContentPanel.tsx: payment proof column in orders table.
- components/SocialFeed.tsx: no hardcoded mock data — empty array fallback.
- app/page.tsx: reads homeSettings and storeSettings from Zustand store (sync'd by SyncProvider).
- lib/store.ts: UserProfile includes address; storeSettings, homeSettings, products, banners, categories, syncVersion added.
- db/migration_v3.sql: adds payment_proof column to orders table.
- db/migration_v4.sql: adds address column to profiles table.
- app/api/admin/reset-data/route.ts: all action now includes profiles auth deletion, settings cleanup, re-creates admin profile.
- components/admin/CatalogsPanel.tsx: catalog images use plain `<img>` tag.
- proxy.ts: protects /account and /api/account routes; handles ?code= redirect from root path to /auth/callback.
<!-- END:anchored-summary -->
