import React, { useState } from 'react';
import { Trash2, ArrowRight, ShieldCheck, Tag, ShoppingBag, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CartPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { cart, updateCartQuantity, removeFromCart, cartSubtotal, formatPrice, settings } = useStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const freeShippingThreshold = settings.freeShippingThreshold || 999;
  const isFreeShipping = cartSubtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : settings.standardShippingFee || 99;
  const diffToFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponError('');
    setCouponLoading(true);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), cartTotal: cartSubtotal })
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCouponError(data.message || 'Invalid or expired coupon code.');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
      }
    } catch (err: any) {
      setCouponError('Failed to validate voucher.');
    } finally {
      setCouponLoading(false);
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  if (cart.length === 0) {
    return (
      <div className="bg-stone-950 text-stone-100 min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-stone-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white font-serif">Your Travel Bag is Empty</h2>
          <p className="text-xs text-stone-400">
            Explore our handcrafted cabin trolleys, executive backpacks, and 3-piece sets to begin your journey.
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
          >
            Explore Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              Your Travel Bag Reservation
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Review your selected luggage pieces before entering express dispatch & shipping details.
            </p>
          </div>
          <button
            id="btn-cart-continue-shopping"
            onClick={() => onNavigate('shop')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-semibold rounded-xl border border-stone-800 transition-colors w-fit"
          >
            <span>← Continue Shopping</span>
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="mb-8 p-4 bg-stone-900/60 border border-stone-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-stone-200">
              <Truck className="w-4 h-4 text-amber-400" />
              {isFreeShipping ? (
                <span className="text-emerald-400 font-semibold">
                  Congratulations! You have unlocked Complimentary Express Blue Dart Delivery.
                </span>
              ) : (
                <span>
                  Add <span className="text-amber-400 font-bold">{formatPrice(diffToFreeShipping)}</span> more for Complimentary Free Express Shipping.
                </span>
              )}
            </div>
            <span className="font-bold text-stone-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Cart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="divide-y divide-stone-800/80 bg-stone-900/40 border border-stone-800 rounded-2xl p-4 sm:p-6">
              {cart.map((item) => (
                <div key={item.productId} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-stone-950 border border-stone-800 flex-shrink-0"
                    />
                    <div>
                      <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block">
                        SKU: {item.sku}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-snug">{item.name}</h4>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Color: <span className="text-stone-200">{item.color}</span> • Size: <span className="text-stone-200">{item.size}</span>
                      </p>
                      <div className="text-sm font-extrabold text-white mt-1">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800/60">
                    <div className="flex items-center border border-stone-800 bg-stone-900 rounded-lg overflow-hidden text-xs">
                      <button
                        onClick={() => updateCartQuantity(item.productId, -1)}
                        className="px-2.5 py-1.5 text-stone-400 hover:text-white hover:bg-stone-800"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 font-bold text-white min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, 1)}
                        className="px-2.5 py-1.5 text-stone-400 hover:text-white hover:bg-stone-800"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[5rem]">
                      <span className="text-sm font-black text-white block">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-2 text-stone-500 hover:text-rose-400 transition-colors"
                      title="Remove piece"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 space-y-5">
              <h3 className="text-base font-bold text-white font-serif pb-3 border-b border-stone-800">
                Reservation Summary
              </h3>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="text-xs font-semibold text-stone-300 block flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" /> Have a Privilege Voucher?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SHAKIL10, SAVE500"
                    className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-white uppercase placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-900 text-amber-300 font-bold text-xs uppercase rounded-lg border border-stone-700"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-rose-400">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-[11px] text-emerald-400 font-medium">
                    ✓ Voucher {appliedCoupon.coupon.code} applied! Saved {formatPrice(discountAmount)}
                  </p>
                )}
              </form>

              {/* Pricing Breakdown */}
              <div className="space-y-2.5 text-xs text-stone-300 pt-3 border-t border-stone-800">
                <div className="flex justify-between">
                  <span>Luggage Subtotal</span>
                  <span className="font-semibold text-white">{formatPrice(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Privilege Discount</span>
                    <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Express Airways Shipping</span>
                  <span className="font-semibold text-white">
                    {shippingFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated GST & Handling</span>
                  <span className="font-semibold text-white">Included</span>
                </div>

                <div className="pt-3 border-t border-stone-800 flex justify-between items-baseline text-white">
                  <span className="text-sm font-bold">Grand Total</span>
                  <span className="text-2xl font-black text-amber-400 tracking-tight">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              <button
                id="btn-cart-proceed-checkout"
                onClick={() => onNavigate('checkout', appliedCoupon ? `coupon=${appliedCoupon.coupon.code}` : undefined)}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-stone-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>256-Bit SSL Encrypted & Verified Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
