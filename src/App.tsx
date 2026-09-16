import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { PolicyPage } from './pages/PolicyPages';
import { AIChatModal } from './components/AIChatModal';
import { ExitSurveyModal } from './components/ExitSurveyModal';
import { AuthModal } from './components/AuthModal';
import { MessageCircle, PhoneCall } from 'lucide-react';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParam, setPageParam] = useState<string>('');
  const { cart, setOpenExitSurvey, pendingExitNav, setPendingExitNav } = useStore();

  // Synchronize with URL and browser history with cart exit protection
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      const search = window.location.search.replace(/^\?/, '');

      // Abandoned cart interception on browser back/forward
      if (
        (currentPage === 'cart' || currentPage === 'checkout') &&
        cart.length > 0 &&
        path !== 'cart' &&
        path !== 'checkout'
      ) {
        window.history.pushState(null, '', window.location.href);
        const targetPage = !path || path === '' ? 'home' : path;
        setPendingExitNav({ page: targetPage, param: search });
        setOpenExitSurvey(true);
        return;
      }

      if (!path || path === '') {
        setCurrentPage('home');
        setPageParam(search);
      } else if (path.startsWith('product/')) {
        setCurrentPage('product');
        setPageParam(path.replace('product/', ''));
      } else if (['shop', 'cart', 'checkout', 'track-order', 'account', 'admin', 'shipping-policy', 'return-policy', 'privacy-policy', 'terms', 'faq'].includes(path)) {
        setCurrentPage(path);
        setPageParam(search);
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPage, cart.length, setPendingExitNav, setOpenExitSurvey]);

  // Desktop mouse exit intent detection
  useEffect(() => {
    let triggeredInCurrentVisit = false;
    const handleMouseLeave = (e: MouseEvent) => {
      if (
        !triggeredInCurrentVisit &&
        (currentPage === 'cart' || currentPage === 'checkout') &&
        cart.length > 0 &&
        e.clientY <= 8
      ) {
        triggeredInCurrentVisit = true;
        setOpenExitSurvey(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [currentPage, cart.length, setOpenExitSurvey]);

  const navigate = (page: string, param: string = '', bypassExitCheck: boolean = false) => {
    // Intercept navigation away from cart or checkout when user has items reserved
    if (
      !bypassExitCheck &&
      (currentPage === 'cart' || currentPage === 'checkout') &&
      cart.length > 0 &&
      page !== 'cart' &&
      page !== 'checkout'
    ) {
      setPendingExitNav({ page, param });
      setOpenExitSurvey(true);
      return;
    }

    setCurrentPage(page);
    setPageParam(param);

    let newUrl = '/';
    if (page === 'home') {
      newUrl = param ? `/?${param}` : '/';
    } else if (page === 'product') {
      newUrl = `/product/${param}`;
    } else {
      newUrl = param ? `/${page}?${param}` : `/${page}`;
    }

    window.history.pushState({}, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActivePage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'shop':
        return <ShopPage onNavigate={navigate} initialParams={pageParam} />;
      case 'product':
        return <ProductDetailPage slug={pageParam} onNavigate={navigate} />;
      case 'cart':
        return <CartPage onNavigate={navigate} />;
      case 'checkout':
        return <CheckoutPage onNavigate={navigate} couponParam={pageParam?.includes('coupon=') ? pageParam.split('coupon=')[1] : undefined} />;
      case 'track-order':
        return <TrackOrderPage initialOrderId={pageParam?.includes('orderId=') ? pageParam.split('orderId=')[1] : undefined} onNavigate={navigate} />;
      case 'account':
        return <AccountPage initialTab={pageParam?.includes('tab=') ? pageParam.split('tab=')[1] : undefined} onNavigate={navigate} />;
      case 'admin':
        return <AdminDashboard onNavigate={navigate} />;
      case 'shipping-policy':
      case 'return-policy':
      case 'privacy-policy':
      case 'terms':
      case 'faq':
        return <PolicyPage type={currentPage} onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950">
      {/* Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigate}
        onOpenCartDrawer={() => navigate('cart')}
      />

      {/* Main Routed Page */}
      <main className="flex-1">
        {renderActivePage()}
      </main>

      {/* Global Modals */}
      <AIChatModal />
      <ExitSurveyModal onNavigate={navigate} />
      <AuthModal />

      {/* Floating WhatsApp Action Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 group">
        <div className="hidden group-hover:block bg-stone-900 border border-stone-800 text-stone-200 text-xs px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap mb-1">
          Chat with Mohammad Shakil (+91-7217876220)
        </div>
        <a
          href="https://wa.me/917217876220?text=Hello%20Mohammad%20Shakil%2C%20I%20am%20browsing%20Shakil%20Bag%20Store%20and%20would%20like%20assistance."
          target="_blank"
          rel="noreferrer"
          className="w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105"
          aria-label="Direct WhatsApp Contact"
        >
          <PhoneCall className="w-6 h-6 text-stone-950" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-stone-950 rounded-full animate-ping"></span>
        </a>
      </div>

      {/* Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
