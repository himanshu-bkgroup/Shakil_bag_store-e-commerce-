import React, { useState, useEffect } from 'react';
import { ShieldCheck, Truck, CreditCard, Banknote, CheckCircle2, ArrowRight, ArrowLeft, Phone, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

interface CheckoutPageProps {
  onNavigate: (page: string, param?: string) => void;
  couponParam?: string;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, couponParam }) => {
  const { cart, cartId, cartSubtotal, clearCart, formatPrice, user, settings, setOpenExitSurvey } = useStore();

  // Multi-step: 1 = Details, 2 = Shipping, 3 = Payment, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsappOptIn, setWhatsappOptIn] = useState(user?.whatsappOptIn ?? true);

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');

  const [paymentMethod, setPaymentMethod] = useState<'PREPAID' | 'COD'>('PREPAID');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  // Voucher discount
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState(couponParam || '');

  useEffect(() => {
    if (couponParam) {
      fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponParam, cartTotal: cartSubtotal })
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.valid) {
            setDiscount(data.discountAmount);
            setAppliedCode(couponParam);
          }
        })
        .catch(() => {});
    }
  }, [couponParam, cartSubtotal]);

  // Update checkout session stage in background for abandoned cart tracking
  useEffect(() => {
    if (cart.length > 0) {
      const stageName = step === 1 ? 'DETAILS' : step === 2 ? 'SHIPPING' : 'PAYMENT';
      fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          customerName: name,
          phone,
          email,
          items: cart,
          cartTotal: cartSubtotal,
          stage: stageName,
          whatsappOptIn
        })
      }).catch(() => {});
    }
  }, [step, name, phone, email, whatsappOptIn, cart, cartId, cartSubtotal]);

  const shippingFee = cartSubtotal >= (settings.freeShippingThreshold || 999) ? 0 : 99;
  const grandTotal = Math.max(0, cartSubtotal - discount + shippingFee);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!name.trim() || !email.trim() || !phone.trim()) {
        setError('Please provide your full name, email, and mobile number.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!street.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
        setError('Please complete all shipping address fields.');
        return;
      }
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    setPlacingOrder(true);

    try {
      const payload = {
        cartId,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        items: cart,
        subtotal: cartSubtotal,
        discount,
        couponCode: appliedCode || undefined,
        shipping: shippingFee,
        tax: 0,
        total: grandTotal,
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'RAZORPAY',
        shippingAddress: {
          name,
          phone,
          street,
          city,
          state,
          pincode,
          country,
          isDefault: true
        }
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      setCompletedOrder(data.order);
      setStep(4);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Payment or order creation failed.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleExitAttempt = () => {
    setOpenExitSurvey(true);
  };

  // SUCCESS VIEW
  if (step === 4 && completedOrder) {
    return (
      <div className="bg-stone-950 text-stone-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-stone-900/90 border border-stone-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold tracking-[0.25em] text-amber-400 font-sans uppercase">
              RESERVATION CONFIRMED
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif mt-1">
              Thank You, {completedOrder.customerName}
            </h1>
            <p className="text-xs text-stone-400 mt-2">
              Your luxury baggage consignment has been booked under the direct supervision of Mohammad Shakil.
            </p>
          </div>

          <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl grid grid-cols-2 gap-4 text-left text-xs">
            <div>
              <span className="text-stone-500 block">Order Reference</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{completedOrder.orderId}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Consignment Tracking</span>
              <span className="font-mono font-bold text-white text-sm">{completedOrder.trackingNumber}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Express Courier</span>
              <span className="font-semibold text-white">{completedOrder.courier}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Total Amount</span>
              <span className="font-bold text-white">{formatPrice(completedOrder.total)}</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl text-xs text-emerald-300 flex items-center gap-3 text-left">
            <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>
              Real-time WhatsApp dispatch alerts and delivery ETA have been scheduled for <strong>+{completedOrder.customerPhone}</strong>.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('track-order', `orderId=${completedOrder.orderId}`)}
              className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow"
            >
              Track This Order Live
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="w-full sm:w-auto px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xl border border-stone-700"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with return button & exit intent trigger */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-800">
          <button
            onClick={handleExitAttempt}
            className="flex items-center gap-2 text-xs text-stone-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Mohammad Shakil Atelier Guarantee</span>
          </div>
        </div>

        {/* Stepper Header */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-4 sm:gap-8 text-xs font-semibold">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-amber-400' : 'text-stone-600'}`}>
              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Details</span>
            </div>
            <div className="w-8 sm:w-16 h-0.5 bg-stone-800"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-amber-400' : 'text-stone-600'}`}>
              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[11px] font-bold">2</span>
              <span>Shipping</span>
            </div>
            <div className="w-8 sm:w-16 h-0.5 bg-stone-800"></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-amber-400' : 'text-stone-600'}`}>
              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[11px] font-bold">3</span>
              <span>Payment</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Step Form */}
          <div className="lg:col-span-7">
            {step === 1 && (
              <form onSubmit={handleNextStep} className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-4">
                <h3 className="text-lg font-bold text-white font-serif mb-1">
                  1. Customer & Contact Details
                </h3>
                <p className="text-xs text-stone-400 mb-4">
                  We use your mobile number for real-time WhatsApp dispatch notifications.
                </p>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mohammad Shakil"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. himanshu.bkgroup@gmail.com"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">WhatsApp Mobile Phone</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 72178 76220"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* WhatsApp Consent check */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-emerald-950 bg-emerald-950/20 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsappOptIn}
                      onChange={(e) => setWhatsappOptIn(e.target.checked)}
                      className="accent-emerald-500 rounded mt-0.5"
                    />
                    <span>
                      <strong className="text-emerald-400 block">WhatsApp Order Tracking & Updates</strong>
                      Receive live consignment dispatch links, delivery ETA alerts, and travel care guides on WhatsApp.
                    </span>
                  </label>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow"
                  >
                    Continue to Shipping Address
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleNextStep} className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white font-serif">
                    2. Consignment Delivery Address
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    Edit Details
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Street Address / Suite / Apartment</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 42 Luxury Residency, Connaught Place"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. New Delhi"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Delhi NCR"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">PIN / Postal Code</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 110001"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Country</label>
                    <input
                      type="text"
                      disabled
                      value={country}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-xs text-stone-400"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 text-xs text-stone-400 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white font-serif">
                    3. Secure Payment Selection
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    Edit Shipping
                  </button>
                </div>

                <div className="space-y-3">
                  <label
                    onClick={() => setPaymentMethod('PREPAID')}
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'PREPAID'
                        ? 'border-amber-500 bg-amber-950/30'
                        : 'border-stone-800 bg-stone-950 hover:bg-stone-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'PREPAID'}
                      onChange={() => setPaymentMethod('PREPAID')}
                      className="accent-amber-500 mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white">Prepaid (UPI, Cards, Net Banking)</span>
                        <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-300 font-semibold px-2 py-0.5 rounded">
                          Fastest Dispatch
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1">
                        Secure instant checkout powered by Razorpay 256-Bit gateway.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('COD')}
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-amber-500 bg-amber-950/30'
                        : 'border-stone-800 bg-stone-950 hover:bg-stone-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="accent-amber-500 mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white">Cash on Delivery (COD)</span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1">
                        Inspect and pay cash/UPI directly to Blue Dart courier on delivery.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2.5 text-xs text-stone-400 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg"
                  >
                    {placingOrder ? 'Confirming with Atelier...' : `Confirm Order (${formatPrice(grandTotal)})`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Order Summary Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white font-serif pb-2 border-b border-stone-800">
                Consignment Items ({cart.length})
              </h4>

              <div className="divide-y divide-stone-800 max-h-64 overflow-y-auto pr-1 text-xs">
                {cart.map((item) => (
                  <div key={item.productId} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-stone-950" />
                      <div>
                        <h6 className="font-semibold text-white truncate max-w-[180px]">{item.name}</h6>
                        <span className="text-stone-400 text-[10px]">Qty: {item.quantity} • {item.color}</span>
                      </div>
                    </div>
                    <span className="font-bold text-white">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs text-stone-300 pt-3 border-t border-stone-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">{formatPrice(cartSubtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Privilege Discount ({appliedCode})</span>
                    <span className="font-semibold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Airways Delivery</span>
                  <span className="font-semibold text-white">
                    {shippingFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="pt-3 border-t border-stone-800 flex justify-between items-baseline text-white">
                  <span className="text-sm font-bold">Total Due</span>
                  <span className="text-xl font-black text-amber-400">{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
