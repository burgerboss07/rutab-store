'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useStore, Order, OrderItem, formatPrice, KUWAIT_AREAS } from '../lib/store';
import { getSupabase } from '../lib/supabase';
import { Check, ShieldCheck, Lock, Loader2, ArrowRight, Copy, AlertCircle, Upload, ChevronDown } from 'lucide-react';
import Image from 'next/image';



type PaymentMethod =
  | 'Cash on Delivery'
  | 'Pickup'
  | 'Wamd'
  | 'Binance'
  | 'PayPal'
  | 'Skrill'
  | 'EasyPaisa'
  | 'Meezan Bank';

const paymentOptions: PaymentMethod[] = [
  'Cash on Delivery',
  'Pickup',
  'Wamd',
  'Binance',
  'PayPal',
  'Skrill',
  'EasyPaisa',
  'Meezan Bank',
];

// Delivery charge per method (KWD)
const deliveryCharges: Record<PaymentMethod, number> = {
  'Cash on Delivery': 1.0,
  'Pickup': 0.0,
  'Wamd': 1.0,
  'Binance': 1.0,
  'PayPal': 1.0,
  'Skrill': 1.0,
  'EasyPaisa': 1.0,
  'Meezan Bank': 1.0,
};

// Transfer account numbers / IDs
interface TransferField {
  label: string;
  value: string;
  copyable?: boolean;
}

interface TransferInfo {
  accountHolder?: string;
  fields: TransferField[];
}

// Transfer account numbers / IDs
const transferAccounts: Partial<Record<PaymentMethod, TransferInfo>> = {
  'Wamd': {
    fields: [
      { label: 'Wamd Number', value: '65145466', copyable: true },
    ],
  },
  'Binance': {
    fields: [
      { label: 'Binance ID', value: '958457145', copyable: true },
    ],
  },
  'PayPal': {
    fields: [
      { label: 'Email', value: 'abdullahadnan2034@gmail.com', copyable: true },
    ],
  },
  'Skrill': {
    fields: [
      { label: 'Email', value: 'abdullah.gamer369@gmail.com', copyable: true },
    ],
  },
  'EasyPaisa': {
    accountHolder: 'Mohammad Adnan Hanif',
    fields: [
      { label: 'Number', value: '03709571515', copyable: true },
    ],
  },
  'Meezan Bank': {
    accountHolder: 'Mohammad Adnan Hanif',
    fields: [
      { label: 'Current Account', value: '0811 01 13427693', copyable: true },
      { label: 'IBAN', value: 'PK32 MEZN 0008 1101 1342 7693', copyable: true },
    ],
  },
};

// Methods that require proof upload
const requiresProof: PaymentMethod[] = ['Wamd', 'Binance', 'PayPal', 'Skrill', 'EasyPaisa', 'Meezan Bank'];
// Methods only available in Kuwait
const kuwaitOnly: PaymentMethod[] = ['Cash on Delivery', 'Pickup'];
const defaultTransferInfo: TransferInfo = { fields: [{ label: 'Details', value: '', copyable: true }] };

export default function CheckoutForm() {
  const cart = useStore((state) => state.cart);
  const clearCart = useStore((state) => state.clearCart);
  const getCartTotal = useStore((state) => state.getCartTotal);
  const addOrder = useStore((state) => state.addOrder);
  const setActiveView = useStore((state) => state.setActiveView);
  const user = useStore((state) => state.user);
  const currency = useStore((state) => state.currency);
  const syncVersion = useStore((state) => state.syncVersion);

  const [authOk, setAuthOk] = useState<boolean | null>(null);
  useEffect(() => {
    getSupabase().auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        useStore.getState().setAuthUser(session.user);
        setAuthOk(true);
      } else {
        setAuthOk(false);
      }
    });
  }, []);
  
  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [isApplyingPromo, setApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Accordion control
  const [activeStep, setActiveStep] = useState<number>(1);

  // Shipping Form Data
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [area, setArea] = useState('Sharq');
  const [block, setBlock] = useState('');
  const [street, setStreet] = useState('');
  const [house, setHouse] = useState('');

  // Pre-fill address from saved profile
  const addrPrefilled = useRef(false);
  useEffect(() => {
    if (addrPrefilled.current || !user?.address) return;
    addrPrefilled.current = true;
    const addr = user.address;
    // Try to extract area from saved address
    const matchedArea = KUWAIT_AREAS.find((a) => addr.toLowerCase().includes(a.toLowerCase()));
    if (matchedArea) setArea(matchedArea);
    // Try to extract individual fields
    const parts = addr.split(',').map((p: string) => p.trim());
    const houseMatch = addr.match(/house\s*(\d+)/i);
    const blockMatch = addr.match(/block\s*(\d+)/i);
    const streetMatch = addr.match(/street\s*(\d+)/i);
    if (houseMatch) setHouse(houseMatch[1]);
    if (blockMatch) setBlock(blockMatch[1]);
    if (streetMatch) setStreet(streetMatch[1]);
  }, [user?.address]);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [activePaymentOptions, setActivePaymentOptions] = useState<PaymentMethod[]>([
    'Cash on Delivery',
    'Pickup',
    'Wamd',
    'Binance',
    'PayPal',
    'Skrill',
    'EasyPaisa',
    'Meezan Bank',
  ]);

  useEffect(() => {
    const storeSettings = useStore.getState().storeSettings;
    const pg = storeSettings?.payment_gateways;
    if (pg && typeof pg === 'object') {
      const loadedOptions = Object.entries(pg)
        .filter(([_, config]) => {
          if (typeof config === 'boolean') return config;
          if (typeof config === 'object' && config !== null) return (config as any).enabled === true;
          return false;
        })
        .map(([name]) => name as PaymentMethod);
      if (loadedOptions.length > 0) {
        setActivePaymentOptions(loadedOptions);
        if (!loadedOptions.includes(paymentMethod)) {
          setPaymentMethod(loadedOptions[0]);
        }
      }
    }
  }, [paymentMethod, syncVersion]);

  // Checkout flow control
  const [isSubmitting, setSubmitting] = useState(false);
  const orderSuccess = useStore((s) => s.orderSuccess);
  const setOrderSuccess = useStore((s) => s.setOrderSuccess);

  const subtotal = getCartTotal();
  let discountAmount = 0;
  let deliveryFee = deliveryCharges[paymentMethod];

  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = subtotal * (appliedCoupon.discount_value / 100);
    } else if (appliedCoupon.discount_type === 'fixed_amount') {
      discountAmount = appliedCoupon.discount_value;
    } else if (appliedCoupon.discount_type === 'free_shipping') {
      deliveryFee = 0;
    }
  }

  const finalSubtotal = Math.max(0, subtotal - discountAmount);
  const totalAmount = finalSubtotal + deliveryFee;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    setPromoError('');
    try {
      const client = getSupabase();
      const { data, error } = await client
        .from('coupons')
        .select('*')
        .eq('code', promoCode.trim().toUpperCase())
        .single();

      if (error || !data) {
        setPromoError('Invalid promo code.');
        setAppliedCoupon(null);
      } else {
        const coupon = data;
        const now = new Date();
        const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

        if (!coupon.is_active) {
          setPromoError('This promo code is no longer active.');
        } else if (expiresAt && now > expiresAt) {
          setPromoError('This promo code has expired.');
        } else if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
          setPromoError('This promo code has reached its usage limit.');
        } else if (subtotal < (coupon.min_order_amount || 0)) {
          setPromoError(`Minimum order amount of ${formatPrice(coupon.min_order_amount, currency)} required.`);
        } else {
          setAppliedCoupon(coupon);
        }
      }
    } catch (err) {
      console.error('Error applying promo code:', err);
      setPromoError('An error occurred. Please try again.');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedCoupon(null);
    setPromoCode('');
    setPromoError('');
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !block || !street || !house) {
      alert('Please fill in all shipping details.');
      return;
    }
    setActiveStep(2);
  };

  const handleCopyAccount = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(val);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleContinueToReview = () => {
    if (requiresProof.includes(paymentMethod) && !proofFile) {
      alert('Please upload your transaction proof to continue.');
      return;
    }
    setActiveStep(3);
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);

    try {
      const shippingAddress = `${house}, Street ${street}, Block ${block}, ${area}, Kuwait`;
      const finalPrice = parseFloat(totalAmount.toFixed(3));

      const client = getSupabase();

      // 0. Upload payment proof if file selected
      let proofUrl = '';
      if (proofFile) {
        const bucket = 'payment_proofs';
        const path = `orders/${Date.now()}-${proofFile.name}`;
        const { error: bucketErr } = await client.storage.from(bucket).upload(path, proofFile);
        if (!bucketErr) {
          const { data: urlData } = client.storage.from(bucket).getPublicUrl(path);
          proofUrl = urlData?.publicUrl || '';
        }
      }

      // 1. Insert into orders table in Supabase
      const session = (await client.auth.getSession()).data.session;
      const { data: orderData, error: orderError } = await client
        .from('orders')
        .insert({
          user_id: session?.user?.id || null,
          phone: phone,
          total_price: finalPrice,
          status: 'pending',
          address: shippingAddress,
          payment_method: paymentMethod,
          payment_proof: proofUrl || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Update coupon usage if code applied
      if (orderData && appliedCoupon) {
        await client
          .from('coupons')
          .update({ used_count: (appliedCoupon.used_count || 0) + 1 })
          .eq('id', appliedCoupon.id);
      }

      // 2. Insert order items
      if (orderData && cart.length > 0) {
        const orderItemsPayload = cart.map((item) => ({
          order_id: orderData.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        }));

        const { error: itemsError } = await client
          .from('order_items')
          .insert(orderItemsPayload);

        if (itemsError) throw itemsError;

        // 3. Decrement stock_per_size for each ordered item
        for (const item of cart) {
          if (!item.size) continue;
          const { data: product } = await client
            .from('products')
            .select('stock_per_size')
            .eq('id', item.id)
            .single();
          if (product?.stock_per_size) {
            const sps = { ...product.stock_per_size } as Record<string, number>;
            const raw = sps[item.size];
            const currentQty = raw === undefined || raw === null ? 0 : Number(raw);
            if (currentQty > 0) {
              sps[item.size] = Math.max(0, currentQty - item.quantity);
              await fetch('/api/admin/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  table: 'products',
                  action: 'update',
                  id: item.id,
                  data: { stock_per_size: sps },
                }),
              });
            }
          }
        }

        // 4. Log to Zustand Store
        const localItems: OrderItem[] = cart.map((item) => ({
          id: item.id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        }));

        const newStoreOrder: Order = {
          id: orderData.id,
          created_at: new Date().toISOString(),
          total_price: finalPrice,
          status: 'pending',
          address: shippingAddress,
          phone: phone,
          payment_method: paymentMethod,
          payment_proof: proofUrl || undefined,
          items: localItems,
        };

        addOrder(newStoreOrder);
      }

      setOrderSuccess(orderData.id);
      setProofFile(null);
      clearCart();
    } catch (err) {
      console.error('Error submitting order to Supabase:', err);
      alert('An error occurred while placing the order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatKWD = (value: number) => {
    return formatPrice(value, currency);
  };

  if (authOk === null) {
    return (
      <div className="pt-32 pb-24 px-6 text-center max-w-lg mx-auto bg-black text-white flex flex-col items-center">
        <div className="w-8 h-8 border-2 border-[#ff0000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authOk) {
    return (
      <div className="pt-32 pb-24 px-6 text-center max-w-lg mx-auto bg-black text-white flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[#ff0000]/10 border border-[#ff0000]/30 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-7 h-7 text-[#ff0000]" />
        </div>
        <h2 className="text-3xl font-black mb-4">Sign In to Checkout</h2>
        <p className="text-[#a1a1a1] mb-8">You need to be signed in to place an order.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setActiveView('home')}
            className="px-8 py-4 rounded-xl border border-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer">
            Back to Store
          </button>
          <a href="/auth/login"
            className="px-8 py-4 rounded-xl bg-[#ff0000] text-white hover:bg-[#d60000] font-bold text-xs uppercase tracking-widest transition cursor-pointer inline-block text-center">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !orderSuccess) {
    return (
      <div className="pt-32 pb-24 px-6 text-center max-w-lg mx-auto bg-black text-white flex flex-col items-center">
        <h2 className="text-3xl font-black mb-4">YOUR BAG IS EMPTY</h2>
        <p className="text-[#a1a1a1] mb-8">Add drops to your cart before proceeding to checkout.</p>
        <button
          onClick={() => setActiveView('shop')}
          className="px-8 py-4 rounded-xl bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-[#ff0000] hover:text-white transition cursor-pointer"
        >
          Explore drops
        </button>
      </div>
    );
  }

  // Success Screen
  if (orderSuccess) {
    return (
      <div className="pt-32 pb-24 px-6 max-w-xl mx-auto text-center space-y-8 animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500 flex items-center justify-center mx-auto text-green-500 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
          <Check className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <h2 className="text-4xl md:text-5xl font-black uppercase text-white">Order Confirmed</h2>
          <p className="text-[#a1a1a1] text-sm">
            Thank you for shopping with Rutab. Your order has been placed successfully.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-white/5 space-y-4 text-left text-xs text-[#e5e5e5]">
          <div className="flex justify-between">
            <span className="text-[#a1a1a1]">Invoice ID:</span>
            <strong className="text-white font-mono">{orderSuccess}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[#a1a1a1]">Fulfillment Area:</span>
            <strong className="text-white">{area}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[#a1a1a1]">Est. Delivery:</span>
            <strong className="text-green-500">Same Day / Tomorrow</strong>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-4 text-sm font-bold">
            <span className="text-[#a1a1a1]">Method:</span>
            <span className="text-[#ff0000]">{paymentMethod}</span>
          </div>
          <div className="flex justify-between font-bold text-sm">
            <span className="text-[#a1a1a1]">Total Paid:</span>
            <span className="text-white">{formatKWD(totalAmount)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setActiveView('account')}
            className="flex-1 py-4 bg-white text-black hover:bg-[#ff0000] hover:text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition cursor-pointer"
          >
            Track Order
          </button>

          <button
            onClick={() => {
              setOrderSuccess(null);
              setActiveView('home');
            }}
            className="flex-1 py-4 border border-white/10 rounded-2xl hover:border-white/30 text-white bg-white/5 font-bold text-xs uppercase tracking-widest transition cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const storeSettings = useStore((s) => s.storeSettings);
  const account = useMemo(() => {
    const pg = storeSettings?.payment_gateways?.[paymentMethod];
    const details = pg?.details?.trim();
    if (!details) return undefined;
    return {
      fields: details.split('\n').filter(Boolean).map((line: string) => {
        const sep: string = line.includes(':') ? ': ' : line.includes('=') ? ' = ' : '\n';
        const parts = sep === '\n' ? [line] : line.split(sep).map((p) => p.trim());
        return parts.length > 1
          ? { label: parts[0], value: parts.slice(1).join(sep), copyable: true }
          : { label: 'Details', value: parts[0], copyable: true };
      }),
    } as TransferInfo;
  }, [storeSettings, paymentMethod]);
  const whatsappNumber = useMemo(() => storeSettings?.whatsapp || '96565145466', [storeSettings?.whatsapp]);

  return (
    <div className="pt-24 min-h-screen bg-black text-white px-6 max-w-5xl mx-auto pb-24 grid lg:grid-cols-[1fr_380px] gap-10 items-start">

      {/* LEFT: Accordion checkout steps */}
      <div className="space-y-6">
        <h2 className="text-4xl font-black uppercase text-white tracking-wider mb-8">Checkout</h2>

        {/* STEP 1: Shipping Details Accordion */}
        <div className="border border-white/5 bg-[#0a0a0a] rounded-[30px] overflow-hidden shadow-xl">
          <button
            onClick={() => activeStep > 1 && setActiveStep(1)}
            className="w-full p-6 flex items-center justify-between font-black text-lg uppercase tracking-wider text-white border-b border-white/5"
          >
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                activeStep > 1 ? 'bg-green-500 text-black' : 'bg-[#ff0000] text-white'
              }`}>
                {activeStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </span>
              Shipping Details
            </div>
            {activeStep > 1 && <span className="text-xs text-green-500 font-bold">Completed</span>}
          </button>

          {activeStep === 1 && (
            <form onSubmit={handleShippingSubmit} className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-black border border-white/10 rounded-xl py-3.5 px-4 text-xs outline-none focus:border-[#ff0000] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+965 9999 9999"
                    className="w-full bg-black border border-white/10 rounded-xl py-3.5 px-4 text-xs outline-none focus:border-[#ff0000] text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-black border border-white/10 rounded-xl py-3.5 px-4 text-xs outline-none focus:border-[#ff0000] text-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Area in Kuwait</label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl py-3.5 px-4 text-xs outline-none focus:border-[#ff0000] text-white"
                  >
                    {KUWAIT_AREAS.map((ar) => (
                      <option key={ar} value={ar}>{ar}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Block</label>
                  <input
                    type="text"
                    required
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    placeholder="2"
                    className="w-full bg-black border border-white/10 rounded-xl py-3.5 px-4 text-xs outline-none focus:border-[#ff0000] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Street</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="12"
                    className="w-full bg-black border border-white/10 rounded-xl py-3.5 px-4 text-xs outline-none focus:border-[#ff0000] text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">House / Building No.</label>
                <input
                  type="text"
                  required
                  value={house}
                  onChange={(e) => setHouse(e.target.value)}
                  placeholder="House 44 / Floor 3 Apt 9"
                  className="w-full bg-black border border-white/10 rounded-xl py-3.5 px-4 text-xs outline-none focus:border-[#ff0000] text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-white text-black hover:bg-[#ff0000] hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                Proceed to Payment
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* STEP 2: Payment Method Accordion */}
        <div className="border border-white/5 bg-[#0a0a0a] rounded-[30px] overflow-hidden shadow-xl">
          <div
            className={`w-full p-6 flex items-center justify-between font-black text-lg uppercase tracking-wider ${
              activeStep < 2 ? 'text-white/40' : 'text-white'
            } border-b border-white/5`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                activeStep > 2
                  ? 'bg-green-500 text-black'
                  : activeStep === 2
                  ? 'bg-[#ff0000] text-white'
                  : 'bg-white/5 text-white/40'
              }`}>
                {activeStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </span>
              Select Payment Method
            </div>
          </div>

          {activeStep === 2 && (
            <div className="p-6 space-y-5">
              <p className="text-[10px] text-[#a1a1a1]">Choose how you would like to pay for your order.</p>

              {/* Custom Dropdown Selector */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border text-sm font-bold transition cursor-pointer ${
                    dropdownOpen ? 'border-[#ff0000] bg-[#ff0000]/5' : 'border-white/10 bg-black hover:border-white/30'
                  }`}
                >
                  <span>{paymentMethod}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-20 top-[calc(100%+6px)] left-0 w-full bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    {activePaymentOptions.map((method) => (
                      <button
                        key={method}
                        onClick={() => {
                          setPaymentMethod(method);
                          setDropdownOpen(false);
                          setProofFile(null);
                        }}
                        className={`w-full text-left px-4 py-3 text-xs font-semibold flex items-center gap-3 hover:bg-white/5 transition cursor-pointer ${
                          paymentMethod === method ? 'text-white bg-white/5' : 'text-[#a1a1a1]'
                        }`}
                      >
                        {paymentMethod === method && <Check className="w-3.5 h-3.5 text-[#ff0000]" />}
                        {paymentMethod !== method && <span className="w-3.5 h-3.5" />}
                        {method}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Method Detail Panel */}
              <div className="p-5 rounded-2xl border border-white/8 bg-white/3 space-y-4 animate-fade-in-up">
                <h4 className="font-black text-sm text-white">{paymentMethod}</h4>

                {/* Kuwait-only notice */}
                {kuwaitOnly.includes(paymentMethod) && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#ff0000]/8 border border-[#ff0000]/20">
                    <AlertCircle className="w-4 h-4 text-[#ff0000] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-[#ff0000] uppercase tracking-wider">Availability</p>
                      <p className="text-[10px] text-[#a1a1a1] mt-0.5">Only available for orders within Kuwait.</p>
                    </div>
                  </div>
                )}

                {/* Delivery charge */}
                <div className="text-xs text-[#a1a1a1]">
                  <span className="font-bold text-white">Delivery Charge: </span>
                  <span className={deliveryFee === 0 ? 'text-green-400 font-bold' : 'text-white font-bold'}>
                    {formatKWD(deliveryFee)}
                  </span>
                </div>

                {/* Pickup: WhatsApp */}
                {paymentMethod === 'Pickup' && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#a1a1a1]">
                      <span className="font-bold text-white">WhatsApp: </span>
                      Contact us on WhatsApp for address
                    </p>
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg bg-[#25D366] text-white font-bold text-[10px] uppercase tracking-wider hover:bg-[#1dab52] transition cursor-pointer"
                    >
                      WhatsApp
                    </a>
                  </div>
                )}

                {/* Transfer account details */}
                {account && (
                  <div className="space-y-2">
                    {/* Account Holder */}
                    {account.accountHolder && (
                      <div className="text-xs text-[#a1a1a1]">
                        <span className="font-bold text-white">Account Holder: </span>
                        {account.accountHolder}
                      </div>
                    )}

                    {/* Copyable fields */}
                    {account.fields.map((field) => (
                      <div key={field.label} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/8">
                        <div>
                          <p className="text-[9px] text-[#a1a1a1] uppercase tracking-wider">{field.label}</p>
                          <p className="text-sm font-black text-white mt-0.5 font-mono">{field.value}</p>
                        </div>
                        {field.copyable && (
                          <button
                            onClick={() => handleCopyAccount(field.value)}
                            className="p-2 rounded-lg border border-white/10 hover:border-[#ff0000]/40 hover:bg-[#ff0000]/5 transition cursor-pointer"
                          >
                            {copied === field.value ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-[#a1a1a1]" />
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Proof upload */}
                {requiresProof.includes(paymentMethod) && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">Upload Transaction Proof</p>
                    <label className="flex flex-col items-center justify-center w-full h-28 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#ff0000]/40 bg-black/20 cursor-pointer transition group">
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleProofUpload}
                        className="hidden"
                      />
                      {proofFile ? (
                        <div className="text-center px-4">
                          <Check className="w-6 h-6 text-green-400 mx-auto mb-1" />
                          <p className="text-xs text-green-400 font-bold truncate max-w-[200px]">{proofFile.name}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-7 h-7 text-[#a1a1a1] mx-auto mb-2 group-hover:text-[#ff0000] transition" />
                          <p className="text-[10px] text-[#a1a1a1] group-hover:text-white transition">Click or drag file to this area to upload</p>
                          <p className="text-[9px] text-white/30 mt-0.5">PNG, JPG up to 4MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                )}
              </div>

              <button
                onClick={handleContinueToReview}
                className="w-full py-4 bg-white text-black hover:bg-[#ff0000] hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                Continue to Review
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* STEP 3: Order Review & Placement Accordion */}
        <div className="border border-white/5 bg-[#0a0a0a] rounded-[30px] overflow-hidden shadow-xl">
          <div
            className={`w-full p-6 flex items-center justify-between font-black text-lg uppercase tracking-wider ${
              activeStep < 3 ? 'text-white/40' : 'text-white'
            } border-b border-white/5`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                activeStep === 3 ? 'bg-[#ff0000] text-white' : 'bg-white/5 text-white/40'
              }`}>
                3
              </span>
              Review &amp; Place Order
            </div>
          </div>

          {activeStep === 3 && (
            <div className="p-6 space-y-6">
              {/* Order Summary Confirmation details */}
              <div className="space-y-4 text-xs text-[#e5e5e5]">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#a1a1a1]">Deliver To:</span>
                  <span className="text-white font-bold">{name} ({phone})</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#a1a1a1]">Area / Address:</span>
                  <span className="text-white font-bold">{area}, Block {block}, Street {street}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#a1a1a1]">Payment:</span>
                  <span className="text-[#ff0000] font-bold">{paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#a1a1a1]">Delivery Fee:</span>
                  <span className={`font-bold ${deliveryFee === 0 ? 'text-green-400' : 'text-white'}`}>
                    {deliveryFee === 0 ? 'FREE (Pickup)' : formatKWD(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-white">
                  <span>Total:</span>
                  <span className="text-[#ff0000]">{formatKWD(totalAmount)}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <p className="text-[10px] text-[#a1a1a1] leading-relaxed">
                  Your payment is processed securely. Clicking &apos;Place Order&apos; will reserve your stock items and generate invoice.
                </p>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-4.5 bg-[#ff0000] text-white hover:bg-[#d60000] disabled:bg-zinc-700 font-bold text-sm uppercase tracking-widest rounded-2xl transition cursor-pointer flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,0,0,0.4)]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Place Order &amp; Pay {formatKWD(totalAmount)}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT: Order items list summary */}
      <aside className="bg-[#0a0a0a] border border-white/5 rounded-[30px] p-6 shadow-xl space-y-6 lg:sticky lg:top-28">
        <h3 className="text-lg font-black uppercase tracking-wider border-b border-white/10 pb-4">
          Order Summary
        </h3>

        <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
          {cart.map((item) => (
            <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
              <div className="w-12 h-16 relative rounded-xl border border-white/10 bg-black overflow-hidden shrink-0">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs uppercase text-white truncate">{item.name}</h4>
                <p className="text-[10px] text-[#a1a1a1] uppercase mt-0.5">
                  Size: {item.size} • Qty: {item.quantity}
                </p>
                <p className="text-xs font-bold text-[#ff0000] mt-1">{formatKWD(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Promo Code Input */}
        <div className="border-t border-white/10 pt-4 space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Promo Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. WELCOME10"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              disabled={appliedCoupon !== null}
              className="flex-1 bg-black border border-white/10 rounded-xl py-2 px-3 text-xs outline-none focus:border-[#ff0000] text-white uppercase font-mono placeholder:text-[#555] focus:bg-black"
            />
            {appliedCoupon ? (
              <button
                type="button"
                onClick={handleRemovePromo}
                className="px-4 py-2 border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000]/10 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={isApplyingPromo || !promoCode.trim()}
                className="px-4 py-2 bg-white text-black hover:bg-[#ff0000] hover:text-white disabled:bg-zinc-700 disabled:text-zinc-500 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                {isApplyingPromo ? '...' : 'Apply'}
              </button>
            )}
          </div>
          {promoError && <p className="text-[10px] text-[#ff0000] font-bold mt-1">{promoError}</p>}
          {appliedCoupon && (
            <p className="text-[10px] text-green-400 font-bold mt-1">
              ✓ Applied ({appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}% off` : appliedCoupon.discount_type === 'fixed_amount' ? `${appliedCoupon.discount_value} KWD off` : 'Free Shipping'})
            </p>
          )}
        </div>

        {/* Pricing Subtotals */}
        <div className="border-t border-white/10 pt-4 space-y-3 text-xs">
          <div className="flex justify-between text-[#a1a1a1]">
            <span>Subtotal</span>
            <span className="text-white font-semibold">{formatKWD(subtotal)}</span>
          </div>
          {appliedCoupon && discountAmount > 0 && (
            <div className="flex justify-between text-[#a1a1a1]">
              <span>Discount</span>
              <span className="text-green-400 font-semibold">-{formatKWD(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-[#a1a1a1]">
            <span>Delivery Fee</span>
            <span className={`font-bold ${deliveryFee === 0 ? 'text-green-400' : 'text-white'}`}>
              {deliveryFee === 0 ? 'FREE' : formatKWD(deliveryFee)}
            </span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-3 text-sm font-black uppercase tracking-wider text-white">
            <span>Total Amount</span>
            <span className="text-[#ff0000]">{formatKWD(totalAmount)}</span>
          </div>
        </div>
      </aside>

    </div>
  );
}
