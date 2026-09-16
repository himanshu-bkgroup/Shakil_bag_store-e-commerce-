import React, { useState } from 'react';
import {
  X,
  Gift,
  ShoppingBag,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  HelpCircle,
  Plane,
  Truck,
  Banknote,
  Sparkles,
  Share2,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ExitSurveyModalProps {
  onNavigate: (page: string, param?: string, bypassExitCheck?: boolean) => void;
  onApplyDiscountCode?: (code: string) => void;
}

export const ExitSurveyModal: React.FC<ExitSurveyModalProps> = ({
  onNavigate,
  onApplyDiscountCode
}) => {
  const {
    openExitSurvey,
    setOpenExitSurvey,
    cart,
    cartId,
    cartSubtotal,
    cartTotalCount,
    formatPrice,
    user,
    pendingExitNav,
    setPendingExitNav
  } = useStore();

  const [activeTab, setActiveTab] = useState<'options' | 'whatsapp' | 'feedback' | 'dimensions'>('options');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customFeedback, setCustomFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);

  if (!openExitSurvey || cart.length === 0) return null;

  const handleClose = () => {
    setOpenExitSurvey(false);
  };

  const handleLeaveAnyway = () => {
    setOpenExitSurvey(false);
    if (pendingExitNav) {
      const { page, param } = pendingExitNav;
      setPendingExitNav(null);
      onNavigate(page, param, true);
    } else {
      onNavigate('shop', '', true);
    }
  };

  const handleClaimVoucher = () => {
    if (onApplyDiscountCode) {
      onApplyDiscountCode('SHAKIL500');
    }
    fetch('/api/abandoned-carts/exit-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartId,
        action: 'CLAIM_VOUCHER_SHAKIL500',
        stage: 'CHECKOUT',
        cartTotal: cartSubtotal,
        phone: user?.phone
      })
    }).catch(() => {});

    setOpenExitSurvey(false);
    setPendingExitNav(null);
    onNavigate('checkout', 'coupon=SHAKIL500', true);
  };

  const handleSaveToWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setSavingPhone(true);
    try {
      await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          customerName: user?.name || 'Customer',
          phone: phoneNumber.trim(),
          email: user?.email,
          items: cart,
          cartTotal: cartSubtotal,
          stage: 'ABANDONED_RECOVERY_WHATSAPP',
          whatsappOptIn: true
        })
      });

      await fetch('/api/abandoned-carts/exit-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          action: 'SAVE_TO_WHATSAPP',
          phone: phoneNumber.trim(),
          cartTotal: cartSubtotal
        })
      });

      setPhoneSaved(true);

      // Construct WhatsApp share link with cart details
      const itemsSummary = cart.map((i) => `• ${i.name} (Qty: ${i.quantity}, ${formatPrice(i.price)})`).join('\n');
      const origin = window.location.origin;
      const recoveryLink = `${origin}/checkout?cartId=${cartId}&coupon=SHAKIL500`;
      const waText = encodeURIComponent(
        `*Shakil Bag Store - Cart Saved Successfully*\n\nHello! Here is your reserved travel bag itinerary:\n\n${itemsSummary}\n\n*Cart Total:* ${formatPrice(cartSubtotal)}\n*VIP Code Applied:* SHAKIL500 (₹500 OFF)\n\n*Resume & Complete Your Order Here:*\n${recoveryLink}\n\nFor any customization or flight dimension inquiries, feel free to reply directly to Mohammad Shakil here.`
      );

      // Open WhatsApp chat
      window.open(`https://wa.me/917217876220?text=${waText}`, '_blank');
    } catch (err) {
      setPhoneSaved(true);
    } finally {
      setSavingPhone(false);
    }
  };

  const handleDirectConsultWhatsApp = () => {
    const itemsSummary = cart.map((i) => `${i.name}`).join(', ');
    const waText = encodeURIComponent(
      `Hello Mohammad Shakil,\nI have reserved luggage in my bag: ${itemsSummary} (${formatPrice(cartSubtotal)}).\nI had a few questions regarding dimensions/specifications before completing my purchase. Please assist.`
    );
    window.open(`https://wa.me/917217876220?text=${waText}`, '_blank');
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;

    try {
      await fetch('/api/abandoned-carts/exit-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          action: 'EXIT_SURVEY_FEEDBACK',
          reason: selectedReason,
          details: customFeedback,
          cartTotal: cartSubtotal,
          phone: user?.phone
        })
      });
      setFeedbackSubmitted(true);
    } catch {
      setFeedbackSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-amber-500/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-stone-200 flex flex-col max-h-[90vh]">
        {/* Top Header Urgency Bar */}
        <div className="bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-stone-900 border-b border-amber-500/30 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-amber-300">
              Hold On! Items Still Reserved in Bag
            </span>
          </div>
          <button
            id="btn-close-exit-modal"
            onClick={handleClose}
            className="text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800/80 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Reservation Summary */}
          <div className="flex items-center justify-between bg-stone-950/70 border border-stone-800 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3 overflow-hidden">
                {cart.slice(0, 3).map((item, idx) => (
                  <img
                    key={idx}
                    src={item.image}
                    alt={item.name}
                    className="inline-block h-11 w-11 rounded-lg object-cover ring-2 ring-stone-900 bg-stone-950"
                  />
                ))}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {cartTotalCount} Handcrafted Bag{cartTotalCount > 1 ? 's' : ''} Reserved
                </span>
                <span className="text-[11px] text-stone-400">
                  Total Value: <strong className="text-amber-400 font-medium">{formatPrice(cartSubtotal)}</strong>
                </span>
              </div>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 uppercase">
              High Demand
            </span>
          </div>

          {/* VIEW: MAIN OPTIONS */}
          {activeTab === 'options' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-serif tracking-tight">
                  Wait, Don't Leave Your Baggage Behind!
                </h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Before you head back, explore these exclusive perks prepared by Mohammad Shakil to ensure a seamless travel booking:
                </p>
              </div>

              {/* OPTION 1: VIP ₹500 VOUCHER (HIGHLIGHTED) */}
              <div className="bg-gradient-to-r from-amber-950/80 via-amber-900/40 to-stone-900 border-2 border-amber-500/80 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
                <div className="absolute top-2.5 right-3 bg-amber-500 text-stone-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
                  Recommended
                </div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-amber-400">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Option 1: Claim ₹500 Privilege Voucher</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </h4>
                    <p className="text-[11px] text-amber-200/80 mt-0.5">
                      Use code <strong className="font-mono text-amber-300">SHAKIL500</strong> for an immediate ₹500 reduction on your order today!
                    </p>
                  </div>
                </div>

                <button
                  id="btn-exit-claim-voucher"
                  onClick={handleClaimVoucher}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-amber-500/25 flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  <span>Apply ₹500 Voucher & Go to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* GRID OF ALTERNATIVE RECOVERY OPTIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* OPTION 2: SAVE TO WHATSAPP */}
                <button
                  id="btn-exit-save-whatsapp"
                  onClick={() => setActiveTab('whatsapp')}
                  className="p-3.5 bg-stone-950/80 hover:bg-stone-950 border border-stone-800 hover:border-emerald-500/60 rounded-xl text-left transition-all group flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Option 2: Save to WhatsApp</span>
                      <span className="text-[10px] text-stone-400">Receive recovery link on your phone</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold group-hover:underline flex items-center gap-1">
                    Send Link to My Mobile →
                  </span>
                </button>

                {/* OPTION 3: DIRECT FOUNDER CHAT */}
                <button
                  id="btn-exit-ask-shakil"
                  onClick={handleDirectConsultWhatsApp}
                  className="p-3.5 bg-stone-950/80 hover:bg-stone-950 border border-stone-800 hover:border-amber-500/60 rounded-xl text-left transition-all group flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800/80 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Option 3: Consult Founder</span>
                      <span className="text-[10px] text-stone-400">Speak with Mohammad Shakil directly</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400 font-semibold group-hover:underline flex items-center gap-1">
                    WhatsApp (+91-7217876220) →
                  </span>
                </button>
              </div>

              {/* QUICK REASONS & ASSISTANCE */}
              <div className="p-3.5 bg-stone-950/60 border border-stone-800/80 rounded-xl space-y-2.5">
                <span className="text-[11px] font-semibold text-stone-300 block">
                  Quick answers to common questions:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    onClick={() => setActiveTab('dimensions')}
                    className="p-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg text-stone-300 hover:text-white flex items-center gap-1.5 transition-colors text-left"
                  >
                    <Plane className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    <span className="truncate">Airline Cabin Size Chart</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className="p-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg text-stone-300 hover:text-white flex items-center gap-1.5 transition-colors text-left"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="truncate">Tell Us Why Leaving</span>
                  </button>
                </div>
              </div>

              {/* OPTION 5: LEAVE ANYWAY */}
              <div className="pt-2 flex items-center justify-between border-t border-stone-800/80 text-xs">
                <span className="text-stone-500 text-[11px]">
                  Your cart items will be preserved in this browser.
                </span>
                <button
                  id="btn-exit-leave-anyway"
                  onClick={handleLeaveAnyway}
                  className="text-stone-400 hover:text-rose-400 transition-colors underline text-xs"
                >
                  Leave without purchasing
                </button>
              </div>
            </div>
          )}

          {/* VIEW: SAVE CART TO WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <button
                onClick={() => setActiveTab('options')}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                ← Back to Options
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif">Save Cart to WhatsApp</h3>
                  <p className="text-xs text-stone-400">
                    We'll send your reserved bags & a 1-click recovery link directly to your WhatsApp.
                  </p>
                </div>
              </div>

              {!phoneSaved ? (
                <form onSubmit={handleSaveToWhatsApp} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      Your WhatsApp Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      We only send your cart link and reservation confirmation. No spam.
                    </span>
                  </div>

                  <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl space-y-1.5 text-xs text-stone-300">
                    <div className="flex justify-between text-[11px]">
                      <span>Items to Save:</span>
                      <strong className="text-white">{cartTotalCount} items</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Reserved Total:</span>
                      <strong className="text-amber-400">{formatPrice(cartSubtotal)}</strong>
                    </div>
                    <div className="flex justify-between text-[11px] text-emerald-400">
                      <span>Voucher Attached:</span>
                      <strong>SHAKIL500 (₹500 OFF)</strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingPhone || !phoneNumber.trim()}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {savingPhone ? 'Saving...' : 'Send Recovery Link to WhatsApp'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 space-y-3 bg-stone-950/60 border border-stone-800 rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-600 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Cart Saved & WhatsApp Opened!</h4>
                  <p className="text-xs text-stone-300 max-w-xs mx-auto">
                    We have preserved your reservation with voucher code <strong>SHAKIL500</strong>. You can resume anytime from WhatsApp.
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={handleClaimVoucher}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                    >
                      Complete Order Now with ₹500 OFF
                    </button>
                    <button
                      onClick={handleLeaveAnyway}
                      className="text-stone-400 hover:text-white text-xs py-1"
                    >
                      Continue Browsing Store
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: AIRLINE CABIN DIMENSION GUIDE */}
          {activeTab === 'dimensions' && (
            <div className="space-y-4">
              <button
                onClick={() => setActiveTab('options')}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                ← Back to Options
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif">Indian & Global Airline Luggage Sizing</h3>
                  <p className="text-xs text-stone-400">All Shakil Cabin Trolleys strictly comply with standard overhead bins:</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between">
                  <div>
                    <strong className="text-white block">Cabin / Carry-On (55cm / 20-inch)</strong>
                    <span className="text-stone-400 text-[11px]">Dimensions: 55 x 36 x 23 cm (Approx 38L)</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-[10px] px-2 py-0.5 bg-emerald-950 rounded border border-emerald-800">
                    Indigo / Air India / Emirates OK
                  </span>
                </div>

                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between">
                  <div>
                    <strong className="text-white block">Medium Check-In (65cm / 24-inch)</strong>
                    <span className="text-stone-400 text-[11px]">Dimensions: 65 x 44 x 27 cm (Approx 68L)</span>
                  </div>
                  <span className="text-amber-400 font-bold text-[10px] px-2 py-0.5 bg-amber-950 rounded border border-amber-800">
                    Up to 23 KG Check-in
                  </span>
                </div>

                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between">
                  <div>
                    <strong className="text-white block">Large Check-In (75cm / 28-inch)</strong>
                    <span className="text-stone-400 text-[11px]">Dimensions: 75 x 52 x 31 cm (Approx 105L)</span>
                  </div>
                  <span className="text-amber-400 font-bold text-[10px] px-2 py-0.5 bg-amber-950 rounded border border-amber-800">
                    Up to 32 KG Check-in
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs text-amber-200">
                💡 Need confirmation for a specific airline? Mohammad Shakil (+91-7217876220) verifies all flight allowances free of charge.
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleClaimVoucher}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Fits My Needs: Claim ₹500 & Order
                </button>
              </div>
            </div>
          )}

          {/* VIEW: FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <button
                onClick={() => setActiveTab('options')}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                ← Back to Options
              </button>

              <div>
                <h3 className="text-base font-bold text-white font-serif">Quick Feedback</h3>
                <p className="text-xs text-stone-400">
                  What was the primary reason preventing your order today?
                </p>
              </div>

              {!feedbackSubmitted ? (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <div className="space-y-2">
                    {[
                      'Total price exceeds my travel budget',
                      'Concerned about delivery timeline / need urgent delivery',
                      'Want Cash on Delivery (COD) confirmation',
                      'Need to verify color or material with family',
                      'Just researching prices for future journey'
                    ].map((reason, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          selectedReason === reason
                            ? 'border-amber-500 bg-amber-950/40 text-amber-200'
                            : 'border-stone-800 bg-stone-950/60 hover:bg-stone-800/60 text-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reasonRadio"
                          checked={selectedReason === reason}
                          onChange={() => setSelectedReason(reason)}
                          className="accent-amber-500"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>

                  <textarea
                    placeholder="Specific requests or preferred custom price? (Optional)"
                    rows={2}
                    value={customFeedback}
                    onChange={(e) => setCustomFeedback(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                  />

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!selectedReason}
                      className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-900 disabled:text-stone-600 text-white font-bold text-xs uppercase rounded-xl transition-colors"
                    >
                      Submit Feedback
                    </button>
                    <button
                      type="button"
                      onClick={handleClaimVoucher}
                      className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase rounded-xl transition-colors"
                    >
                      Claim ₹500 Instead
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4 space-y-3 bg-stone-950/60 border border-stone-800 rounded-2xl p-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Thank You for Your Valuable Feedback!</h4>
                  <p className="text-xs text-stone-300">
                    As a token of our appreciation, we have credited voucher code <strong>SHAKIL500</strong> (₹500 OFF) to your order.
                  </p>
                  <button
                    onClick={handleClaimVoucher}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                  >
                    Use ₹500 Voucher & Proceed
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
