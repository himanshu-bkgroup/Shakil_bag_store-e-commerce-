import React from 'react';
import { ShieldCheck, Truck, RotateCcw, HelpCircle, PhoneCall, Mail } from 'lucide-react';

interface PolicyPageProps {
  type: 'shipping-policy' | 'return-policy' | 'privacy-policy' | 'terms' | 'faq';
  onNavigate: (page: string, param?: string) => void;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ type, onNavigate }) => {
  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-stone-900/50 border border-stone-800 rounded-3xl p-6 sm:p-12 space-y-8 shadow-xl">
        {type === 'shipping-policy' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-amber-400">
              <Truck className="w-8 h-8" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                Express Airways Shipping & Delivery
              </h1>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              At Shakil Bag Store, every piece of baggage is inspected and custom-boxed at our central Delhi fulfillment atelier under the supervision of Mohammad Shakil before release to premium courier networks.
            </p>

            <div className="space-y-4 text-xs text-stone-300">
              <h3 className="text-sm font-bold text-white">1. Complimentary Delivery Threshold</h3>
              <p>
                All luggage consignments exceeding <strong>₹999</strong> qualify for complimentary express airways delivery across India. Orders below this threshold incur a nominal ₹99 standard handling and transit surcharge.
              </p>

              <h3 className="text-sm font-bold text-white">2. Courier Partners & Dispatch Windows</h3>
              <p>
                Orders placed before 2:00 PM IST are dispatched on the same business day. We partner exclusively with Blue Dart, Delhivery Air, and DTDC Express. Metro deliveries typically arrive within 24 to 48 hours; non-metro locations take 3 to 4 business days.
              </p>

              <h3 className="text-sm font-bold text-white">3. Real-Time WhatsApp Tracking</h3>
              <p>
                Upon airway bill generation, you will receive an automatic WhatsApp notification with a direct Blue Dart consignment tracking link and expected gate delivery time.
              </p>
            </div>
          </div>
        )}

        {type === 'return-policy' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-amber-400">
              <RotateCcw className="w-8 h-8" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                7-Day Atelier Return & Warranty Policy
              </h1>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              We stand firmly behind the durability of our virgin German Bayer Polycarbonate shells and Hinomoto wheel assemblies.
            </p>

            <div className="space-y-4 text-xs text-stone-300">
              <h3 className="text-sm font-bold text-white">1. 7-Day Hassle-Free Exchange</h3>
              <p>
                If your baggage size, color, or packing configuration does not match your travel requirements, you may initiate a return or exchange within 7 days of delivery, provided protective film is intact and wheels are unrolled on pavement.
              </p>

              <h3 className="text-sm font-bold text-white">2. 5-Year Global Hardware Warranty</h3>
              <p>
                Our flagship cabin and check-in trolleys carry a comprehensive 5-year warranty against cracked shells, broken telescopic handles, and malfunctioning TSA locks. In the event of airline baggage handler damage, we provide replacement wheels and lock hardware with free installation guidance.
              </p>
            </div>
          </div>
        )}

        {type === 'faq' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-amber-400">
              <HelpCircle className="w-8 h-8" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                Traveler's FAQ & Bag Care Guide
              </h1>
            </div>

            <div className="space-y-6 text-xs text-stone-300">
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <h3 className="text-sm font-bold text-white">
                  Q: Will the Shakil 55cm Cabin Trolley fit into domestic airline overhead bins?
                </h3>
                <p className="text-stone-400 leading-relaxed">
                  Yes. Our 55cm cabin carry-on is engineered specifically to meet IATA, IndiGo, Air India, Emirates, and Singapore Airlines domestic and international cabin hand-luggage allowances (55 x 40 x 23 cm).
                </p>
              </div>

              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <h3 className="text-sm font-bold text-white">
                  Q: How do I reset the 3-digit TSA Combination Lock?
                </h3>
                <p className="text-stone-400 leading-relaxed">
                  All locks are factory set to <strong>0-0-0</strong>. To reset: (1) Use a pen tip to depress the small reset button until it clicks. (2) Turn dials to your desired 3-digit code. (3) Slide the open button; the reset button will snap back with a firm click, locking in your custom code.
                </p>
              </div>

              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <h3 className="text-sm font-bold text-white">
                  Q: What makes Hinomoto 360° wheels superior?
                </h3>
                <p className="text-stone-400 leading-relaxed">
                  Hinomoto (Japan) uses patented Lisof® synthetic rubber compound wheels with built-in silicone oil lubrication reservoirs. They roll with nearly zero decibels of noise and reduce rolling friction by 40% compared to standard generic wheels.
                </p>
              </div>
            </div>
          </div>
        )}

        {(type === 'privacy-policy' || type === 'terms') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-amber-400">
              <ShieldCheck className="w-8 h-8" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                {type === 'privacy-policy' ? 'Privacy & WhatsApp Consent Policy' : 'Terms & Conditions'}
              </h1>
            </div>
            <div className="space-y-4 text-xs text-stone-300 leading-relaxed">
              <p>
                Shakil Bag Store is committed to preserving the privacy of travelers and clients. Contact information provided during checkout is used solely for order dispatch, courier coordination, warranty verification, and WhatsApp transactional updates.
              </p>
              <p>
                WhatsApp notifications are strictly transactional (order confirmation, live airway bill updates, and inactivity cart reminders). You can opt out at any moment by replying "STOP" or unchecking WhatsApp notifications in your customer profile settings.
              </p>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-stone-400">
            Have questions for Mohammad Shakil? Call or WhatsApp{' '}
            <a href="https://wa.me/917217876220" className="text-emerald-400 font-bold">
              +91-7217876220
            </a>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold uppercase rounded-xl"
          >
            Explore Collection
          </button>
        </div>
      </div>
    </div>
  );
};
