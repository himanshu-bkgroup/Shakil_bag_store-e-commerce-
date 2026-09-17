import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Truck, Check, ArrowRight, ChevronDown, Star, PhoneCall, Compass, Luggage } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product, Category } from '../types';
import { useStore } from '../context/StoreContext';
import { INITIAL_PRODUCTS } from '../data/initialData';

interface HomePageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { setOpenChat, categories } = useStore();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch((err) => {
        console.warn('Backend /api/products response not available, using catalogue cache:', err);
      });
  }, []);

  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);
  const trolleys = products.filter((p) => p.category.toLowerCase().includes('trolley')).slice(0, 4);

  const faqs = [
    {
      q: 'Are your 55cm cabin trolleys approved by Indian and international airlines?',
      a: 'Yes, absolutely. Our 55cm (20-inch) cabin spinners strictly adhere to IATA, IndiGo, Air India, Emirates, and Lufthansa carry-on dimensional boundaries (55 x 40 x 20 cm) ensuring frictionless boarding.'
    },
    {
      q: 'What is covered under the 5-Year Mohammad Shakil Global Warranty?',
      a: 'Our 5-year warranty covers all structural defects in the 100% Bayer polycarbonate shell, telescopic aluminum handles, TSA combination locks, and Hinomoto double spinner wheel assemblies.'
    },
    {
      q: 'Can I purchase replacement wheels or locks if needed in the future?',
      a: 'Yes! Unlike mass-market brands that force you to discard luggage, Shakil Bag Store maintains a dedicated spare parts atelier with direct replacement 360° silent wheels and TSA lock units.'
    },
    {
      q: 'How does your automated WhatsApp delivery and cart assistance work?',
      a: 'If you leave items in your cart or place an order, our WhatsApp service (+91-7217876220) automatically sends you instant dispatch tracking, delivery updates, and personalized care instructions.'
    }
  ];

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 border-b border-stone-900">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-stone-700/20 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-300 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Handcrafted Precision • Est. 2026 by Mohammad Shakil
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-serif leading-[1.15]">
                The Art of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
                  Enduring Travel.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-400 max-w-2xl leading-relaxed font-light">
                Engineered in lightweight German Bayer polycarbonate, Japanese Hinomoto 360° silent spinners, and certified TSA flush locks. Crafted to effortlessly glide through global terminals.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  id="btn-hero-shop-collection"
                  onClick={() => onNavigate('shop')}
                  className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="btn-hero-explore-cabin"
                  onClick={() => onNavigate('shop', 'category=cabin-trolley')}
                  className="w-full sm:w-auto px-7 py-4 bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-800 font-semibold text-xs uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Luggage className="w-4 h-4 text-amber-400" />
                  <span>Cabin Trolleys (55cm)</span>
                </button>

                <a
                  href="https://wa.me/917217876220?text=Hi%20Mohammad%20Shakil%2C%20I%20would%20like%20to%20inquire%20about%20ordering%20a%20luxury%20bag."
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-4 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Shakil</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-stone-800/80 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-xl font-bold text-white font-serif">100%</div>
                  <div className="text-xs text-stone-400">Virgin Polycarbonate</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white font-serif">5 Years</div>
                  <div className="text-xs text-stone-400">Global Warranty</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white font-serif">IATA</div>
                  <div className="text-xs text-stone-400">Cabin Approved</div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-stone-800 shadow-2xl bg-stone-900/70 p-2">
                <img
                  src="https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?q=80&w=1200&auto=format&fit=crop"
                  alt="Mohammad Shakil Signature Platinum Polycarbonate Trolley"
                  className="w-full h-[460px] object-cover rounded-xl"
                />
                <div className="absolute bottom-6 left-6 right-6 bg-stone-950/90 backdrop-blur-md border border-stone-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Flagship Series</span>
                    <h4 className="text-sm font-bold text-white">Shakil Signature Cabin Spinner</h4>
                    <p className="text-xs text-stone-400">55cm • Hinomoto Spinners • TSA Lock</p>
                  </div>
                  <button
                    onClick={() => onNavigate('shop', 'category=cabin-trolley')}
                    className="p-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES BAR */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase font-sans">
              Precision Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif mt-1">
              Curated Luggage Categories
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 uppercase tracking-wider flex items-center gap-1"
          >
            <span>View All 20 Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              name: 'Cabin Trolley',
              slug: 'cabin-trolley',
              img: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?q=80&w=400&auto=format&fit=crop',
              desc: '55cm IATA approved'
            },
            {
              name: 'Luggage Sets',
              slug: 'luggage-sets',
              img: 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?q=80&w=400&auto=format&fit=crop',
              desc: '3-piece matching sets'
            },
            {
              name: 'Leather Backpacks',
              slug: 'backpacks',
              img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop',
              desc: 'Executive laptop bags'
            },
            {
              name: 'Duffel Bags',
              slug: 'duffel-bags',
              img: 'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?q=80&w=400&auto=format&fit=crop',
              desc: 'Weekend all-weather'
            },
            {
              name: 'Trolley Wheels',
              slug: 'trolley-wheels',
              img: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?q=80&w=400&auto=format&fit=crop',
              desc: 'Silent replacement spares'
            },
            {
              name: 'Travel Accessories',
              slug: 'accessories',
              img: 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?q=80&w=400&auto=format&fit=crop',
              desc: 'Tags, locks, organizers'
            }
          ].map((cat, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('shop', `category=${cat.slug}`)}
              className="group bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-xl p-3 cursor-pointer transition-all duration-300 hover:-translate-y-1 text-center flex flex-col items-center"
            >
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-stone-950 mb-3">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-amber-300 truncate w-full">
                {cat.name}
              </h4>
              <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BEST SELLERS SHOWCASE */}
      <section className="py-16 bg-stone-900/30 border-y border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase font-sans">
                Most Revered By Frequent Flyers
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif mt-1">
                Best Sellers Collection
              </h2>
            </div>
            <button
              onClick={() => onNavigate('shop', 'bestseller=true')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 uppercase tracking-wider flex items-center gap-1"
            >
              <span>Explore All Best Sellers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((prod) => (
              <ProductCard key={prod._id} product={prod} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. TROLLEY ENGINEERING BREAKDOWN */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase font-sans">
                Atelier Engineering Standards
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif leading-tight">
                Designed to Survive 1,000,000 Kilometers.
              </h2>
              <p className="text-sm text-stone-300 leading-relaxed font-light">
                Under Mohammad Shakil's supervision, every trolley is subjected to rigorous drop testing, wheel abrasion trials, and handle pull endurance before it reaches your boarding gate.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">100% German Bayer Polycarbonate</h5>
                    <p className="text-xs text-stone-400">Flexes on high-altitude cargo impact and bounces back to original mold without cracking.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">Hinomoto 360° Dual Silent Spinners</h5>
                    <p className="text-xs text-stone-400">Patented Japanese rubber compounds reduce terminal floor vibration and gliding noise by 85%.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">TSA008 Flush Integrated Lock</h5>
                    <p className="text-xs text-stone-400">Allows international customs and TSA officers to inspect your luggage without damaging zippers.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate('shop', 'category=cabin-trolley')}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                >
                  Explore All Cabin Spinners
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-stone-800 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1581553680321-4fffae59fccd?q=80&w=1000&auto=format&fit=crop"
                  alt="Internal and external architecture of Shakil Bag Store Trolley"
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase font-sans">
              Latest Atelier Releases
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif mt-1">
              New Arrivals & Limited Editions
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', 'newarrival=true')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 uppercase tracking-wider flex items-center gap-1"
          >
            <span>View All New Arrivals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((prod) => (
            <ProductCard key={prod._id} product={prod} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* 6. VERIFIED CUSTOMER REVIEWS */}
      <section className="py-16 bg-stone-900/40 border-y border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase font-sans">
              Customer Testimonials
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif mt-1">
              Endorsed by Discerning Travelers
            </h2>
            <p className="text-xs text-stone-400 mt-2">
              Over 1,400+ verified luggage reviews across India & international flight routes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Kavita Sengupta',
                route: 'Frequent Flyer • Delhi to London',
                title: 'Glides like silk through Heathrow airport',
                comment:
                  'The Hinomoto wheels on Shakil’s 55cm cabin spinner are genuinely miraculous. My previous luggage struggled on carpets; this one glided effortlessly. Truly premium quality.',
                rating: 5
              },
              {
                name: 'Rajeev Singhal',
                route: 'Corporate Executive • Mumbai',
                title: 'Remarkable leather backpack and service',
                comment:
                  'The leather laptop backpack has survived 30+ flights this quarter without a single scratch. Mohammad Shakil’s team even assisted with WhatsApp tracking before departure.',
                rating: 5
              },
              {
                name: 'Ananya Verma',
                route: 'Family Travel • Dubai Vacation',
                title: '3-Piece Set was perfect for our trip',
                comment:
                  'We purchased the 3-piece polycarbonate luggage set. Survived baggage carousel handling without a single dent. 5-year warranty gives complete peace of mind.',
                rating: 5
              }
            ].map((rev, idx) => (
              <div
                key={idx}
                className="p-6 bg-stone-900/90 border border-stone-800 rounded-2xl flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <h4 className="text-sm font-bold text-white font-serif">{rev.title}</h4>
                  <p className="text-xs text-stone-300 mt-2 leading-relaxed font-light">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="pt-4 border-t border-stone-800/80">
                  <div className="text-xs font-bold text-white">{rev.name}</div>
                  <div className="text-[11px] text-amber-400/80">{rev.route}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase font-sans">
            Help & Guidance
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-sm font-semibold text-white hover:text-amber-300"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-stone-300 leading-relaxed font-light border-t border-stone-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
