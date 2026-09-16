import React, { useState } from 'react';
import { Phone, Mail, MapPin, Shield, RotateCcw, Truck, Award, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FooterProps {
  onNavigate: (page: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { categories } = useStore();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Newsletter Subscriber',
            phone: 'Not provided',
            email: newsletterEmail.trim(),
            requirement: 'Subscribed to luxury travel drops & private sales',
            source: 'CONTACT_FORM'
          })
        });
        setSubscribed(true);
        setNewsletterEmail('');
      } catch (err) {
        setSubscribed(true);
      }
    }
  };

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      {/* Brand Value Props Banner */}
      <div className="border-b border-stone-800/80 bg-stone-900/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-stone-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-800/60 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wide">Complimentary Shipping</h4>
              <p className="text-xs text-stone-400 mt-0.5">Express delivery on orders over ₹999 across India</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-800/60 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wide">5-Year Global Warranty</h4>
              <p className="text-xs text-stone-400 mt-0.5">Virgin polycarbonate & aircraft aluminum components</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-800/60 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wide">7-Day Hassle-Free Returns</h4>
              <p className="text-xs text-stone-400 mt-0.5">Straightforward exchanges on all unused items</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-800/60 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wide">Direct from Shakil</h4>
              <p className="text-xs text-stone-400 mt-0.5">Handcrafted authenticity certified by Mohammad Shakil</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="cursor-pointer" onClick={() => onNavigate('home')}>
              <span className="text-2xl font-black tracking-[0.2em] text-white font-serif uppercase">
                SHAKIL
              </span>
              <span className="block text-[10px] tracking-[0.35em] text-amber-400 font-sans uppercase font-medium">
                LUXURY LUGGAGE & TRAVEL ATELIER
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-md">
              Founded by Mohammad Shakil, Shakil Bag Store crafts world-class polycarbonate spinners, executive leather backpacks, and heavy-duty travel accessories built to endure the rigors of modern international voyages.
            </p>
            <div className="pt-2 space-y-2 text-sm text-stone-300">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400" />
                <a href="tel:+917217876220" className="hover:text-amber-300 transition-colors">
                  +91-7217876220 (Call & WhatsApp)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400" />
                <a href="mailto:himanshu.bkgroup@gmail.com" className="hover:text-amber-300 transition-colors">
                  himanshu.bkgroup@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Delhi & NCR Hub, India • Worldwide Airline Standards</span>
              </div>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-[0.15em] text-white uppercase">Luggage & Bags</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={() => onNavigate('shop', 'category=cabin-trolley')} className="hover:text-amber-300 transition-colors">
                  Cabin Trolleys (55cm)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'category=medium-trolley')} className="hover:text-amber-300 transition-colors">
                  Medium Trolleys (68cm)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'category=large-trolley')} className="hover:text-amber-300 transition-colors">
                  Large Check-In (78cm)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'category=luggage-sets')} className="hover:text-amber-300 transition-colors">
                  3-Piece Luggage Sets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'category=backpacks')} className="hover:text-amber-300 transition-colors">
                  Laptop Backpacks
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'category=duffel-bags')} className="hover:text-amber-300 transition-colors">
                  All-Weather Duffels
                </button>
              </li>
            </ul>
          </div>

          {/* Hardware & Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-[0.15em] text-white uppercase">Customer Care</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={() => onNavigate('track-order')} className="hover:text-amber-300 transition-colors text-amber-400">
                  Track Your Consignment
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'category=trolley-wheels')} className="hover:text-amber-300 transition-colors">
                  Silent Replacement Wheels
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'category=locks')} className="hover:text-amber-300 transition-colors">
                  TSA Combination Locks
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shipping-policy')} className="hover:text-amber-300 transition-colors">
                  Shipping & Delivery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('return-policy')} className="hover:text-amber-300 transition-colors">
                  Returns & Exchanges
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-amber-300 transition-colors">
                  Luggage Sizing FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter / Lead Capture */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-[0.15em] text-white uppercase">Exclusive Travel Desk</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Subscribe for private archival drops, bespoke luggage releases, and direct invites from Mohammad Shakil.
            </p>
            {subscribed ? (
              <div className="p-3 bg-amber-950/50 border border-amber-800 text-amber-200 text-xs rounded-lg">
                Thank you. You are enrolled in Shakil Bag Store private updates.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
            <div className="pt-2">
              <button
                onClick={() => onNavigate('admin')}
                className="text-[11px] text-stone-500 hover:text-amber-400 transition-colors underline"
              >
                Store Administration Portal →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright & payment trust */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © 2026 SHAKIL BAG STORE. All Rights Reserved. Owned & Managed by Mohammad Shakil.
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <button onClick={() => onNavigate('privacy-policy')} className="hover:text-stone-200">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => onNavigate('terms')} className="hover:text-stone-200">Terms of Service</button>
            <span>•</span>
            <span>Razorpay / UPI Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
