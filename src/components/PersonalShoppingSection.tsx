import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, MessageSquare, Loader2, Sparkles } from 'lucide-react';

interface PersonalShoppingSectionProps {
  onNavigate?: (page: string, param?: string) => void;
}

export const PersonalShoppingSection: React.FC<PersonalShoppingSectionProps> = ({ onNavigate }) => {
  const [categoryType, setCategoryType] = useState<'Right bag for me' | 'Trolley wheels'>('Right bag for me');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState('');
  const [tripDetails, setTripDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !mobileNumber.trim()) {
      setErrorMessage('Please provide your full name and mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: fullName.trim(),
        phone: mobileNumber.trim(),
        email: email.trim() || undefined,
        budget: budget.trim() || undefined,
        categoryType: categoryType,
        requirement: tripDetails.trim() 
          ? `[${categoryType}] ${tripDetails.trim()}`
          : `[${categoryType}] Looking for personalized recommendations`,
        source: 'PERSONAL_SHOPPING',
        productName: categoryType === 'Trolley wheels' ? 'Replacement Trolley Wheels Consultation' : 'Curated Luggage Consultation'
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit inquiry. Please try again.');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Personal shopping submission error:', err);
      setErrorMessage(err.message || 'Network error. Please try again or reach out on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cleanPhone = mobileNumber.replace(/[^0-9]/g, '');
  const waPreFill = encodeURIComponent(
    `Hi Mohammad Shakil, I just submitted a Personal Shopping consultation on Shakil Bag Store for ${categoryType}. My name is ${fullName}${tripDetails ? ` and I am inquiring about: ${tripDetails}` : ''}.`
  );

  return (
    <section id="personal-shopping" className="bg-stone-950 text-stone-100 py-16 sm:py-24 border-y border-stone-850 relative overflow-hidden">
      {/* Ambient background glow matching site theme */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-stone-800/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Heading, Subtitle & Switcher Pills */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-[11px] font-mono tracking-[0.25em] text-amber-400 uppercase font-bold block mb-2">
                PERSONAL SHOPPING
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-white tracking-tight leading-[1.12]">
                Can’t find the <span className="italic text-amber-400 font-serif">right bag?</span>
              </h2>
            </div>

            <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed max-w-lg">
              Tell us where you’re headed and we’ll shortlist something considered — including hard-to-find replacement wheels.
            </p>

            {/* Switcher Pills */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                id="btn-switch-bag"
                onClick={() => setCategoryType('Right bag for me')}
                className={`font-mono text-xs px-5 py-2.5 rounded-xl transition-all duration-150 ${
                  categoryType === 'Right bag for me'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-stone-900/90 text-stone-300 hover:text-white border border-stone-800 hover:border-amber-400/50'
                }`}
              >
                Right bag for me
              </button>

              <button
                type="button"
                id="btn-switch-wheels"
                onClick={() => setCategoryType('Trolley wheels')}
                className={`font-mono text-xs px-5 py-2.5 rounded-xl transition-all duration-150 ${
                  categoryType === 'Trolley wheels'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-stone-900/90 text-stone-300 hover:text-white border border-stone-800 hover:border-amber-400/50'
                }`}
              >
                Trolley wheels
              </button>
            </div>

            <div className="pt-4 flex items-center gap-2 text-xs text-stone-400 font-light">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Direct personal advisory with Mohammad Shakil & certified luggage craftsmen.</span>
            </div>
          </div>

          {/* Right Column: Dark Luxury Form Card */}
          <div className="lg:col-span-6">
            <div className="bg-stone-900/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-stone-800 transition-all">
              {isSubmitted ? (
                <div className="py-6 space-y-5 text-left">
                  <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-serif">
                      Consultation Request Received!
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                      Thank you, <span className="font-semibold text-white">{fullName}</span>. Mohammad Shakil’s luggage atelier concierge will review your {categoryType.toLowerCase()} requirements and reach out via WhatsApp (<span className="font-mono text-emerald-400 font-semibold">{mobileNumber}</span>) with curated suggestions.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <a
                      href={`https://wa.me/917217876220?text=${waPreFill}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/25 transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-stone-950" />
                      <span>Chat on WhatsApp Now</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false);
                        setTripDetails('');
                      }}
                      className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl transition-colors border border-stone-700"
                    >
                      Submit Another Query
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl">
                      {errorMessage}
                    </div>
                  )}

                  {/* Full name */}
                  <div>
                    <input
                      id="ps-input-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full name *"
                      className="w-full bg-stone-950/70 border border-stone-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                    />
                  </div>

                  {/* Mobile number */}
                  <div>
                    <input
                      id="ps-input-phone"
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="Mobile number *"
                      className="w-full bg-stone-950/70 border border-stone-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                    />
                  </div>

                  {/* Email (optional) */}
                  <div>
                    <input
                      id="ps-input-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email (optional)"
                      className="w-full bg-stone-950/70 border border-stone-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                    />
                  </div>

                  {/* Budget (optional) */}
                  <div>
                    <input
                      id="ps-input-budget"
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="Budget (optional, e.g. ₹5,000 - ₹15,000)"
                      className="w-full bg-stone-950/70 border border-stone-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                    />
                  </div>

                  {/* Tell us about the trip or use case */}
                  <div>
                    <textarea
                      id="ps-input-message"
                      rows={3}
                      value={tripDetails}
                      onChange={(e) => setTripDetails(e.target.value)}
                      placeholder="Tell us about the trip or use case (destination, duration, baggage preferences)"
                      className="w-full bg-stone-950/70 border border-stone-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      id="ps-btn-submit"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 text-stone-950 font-bold text-xs tracking-[0.18em] uppercase rounded-xl transition-all duration-150 shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>GET A RECOMMENDATION</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Disclaimer */}
                  <p className="text-[11px] text-stone-500 pt-1 font-light leading-normal">
                    By submitting you agree to be contacted on WhatsApp or phone about your enquiry.
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
