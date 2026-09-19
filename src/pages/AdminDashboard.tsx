import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Clock,
  Upload,
  BarChart3,
  Users,
  Settings,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Search,
  ArrowRight,
  ShieldCheck,
  Tag,
  Loader2,
  X,
  AlertCircle,
  Sparkles,
  Mail,
  MessageSquare,
  Filter,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, Order, AbandonedCart, Lead, ExitSurvey, AdminSettings } from '../types';
import { BulkPhotoManager } from '../components/admin/BulkPhotoManager';

interface AdminDashboardProps {
  onNavigate: (page: string, param?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, token, formatPrice, settings: globalSettings, login } = useStore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'inventory' | 'orders' | 'abandoned' | 'import' | 'analytics' | 'leads' | 'personal_shopping' | 'settings'
  >('overview');

  // Leads and Personal Shopping filters
  const [leadCategoryFilter, setLeadCategoryFilter] = useState<'BUYER_LEADS' | 'ALL' | 'NEWSLETTER'>('BUYER_LEADS');
  const [personalShoppingSubfilter, setPersonalShoppingSubfilter] = useState<'ALL' | 'BAG' | 'WHEELS'>('ALL');

  // Stats
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [exitSurveys, setExitSurveys] = useState<ExitSurvey[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(globalSettings);

  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: 'Cabin Trolley',
    price: '7999',
    salePrice: '5999',
    stockQuantity: '15',
    material: '100% German Bayer Polycarbonate',
    color: 'Obsidian Black',
    size: '55 cm (Cabin Carry-On)',
    description: '',
    thumbnail: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?q=80&w=1000&auto=format&fit=crop'
    ] as string[]
  });

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [csvResult, setCsvResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);

  // Status message
  const [actionSuccess, setActionSuccess] = useState('');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const loadAllData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [dashRes, prodRes, ordRes, abnRes, leadRes, srvRes, anlRes, setRes] = await Promise.all([
        fetch('/api/admin/dashboard', { headers: authHeaders }),
        fetch('/api/products?sort=newest'),
        fetch('/api/orders', { headers: authHeaders }),
        fetch('/api/admin/abandoned-carts', { headers: authHeaders }),
        fetch('/api/admin/leads', { headers: authHeaders }),
        fetch('/api/admin/exit-surveys', { headers: authHeaders }),
        fetch('/api/admin/analytics', { headers: authHeaders }),
        fetch('/api/admin/settings', { headers: authHeaders })
      ]);

      const [dashData, prodData, ordData, abnData, leadData, srvData, anlData, setData] = await Promise.all([
        dashRes.json(),
        prodRes.json(),
        ordRes.json(),
        abnRes.json(),
        leadRes.json(),
        srvRes.json(),
        anlRes.json(),
        setRes.json()
      ]);

      setStats(dashData);
      setProducts(prodData.products || []);
      setOrders(ordData.orders || []);
      setAbandonedCarts(abnData.carts || []);
      setLeads(leadData.leads || []);
      setExitSurveys(srvData.surveys || []);
      setAnalytics(anlData || null);
      if (setData.settings) setAdminSettings(setData.settings);
    } catch (e) {
      console.error('Error loading admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [token]);

  const handleQuickAdminLogin = async () => {
    setIsAuthenticating(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'himanshu.bkgroup@gmail.com', password: 'Admin@22112003' })
      });
      const data = await res.json();
      if (data.token && data.user) {
        login(data.token, data.user);
        setActionSuccess('Authenticated as Mohammad Shakil (Admin)');
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (e: any) {
      console.error('Quick admin login error:', e);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // If user is not logged in as admin, display admin login block with quick authenticate
  if (!user || user.role !== 'admin') {
    return (
      <div className="bg-stone-950 text-stone-100 min-h-screen flex items-center justify-center p-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white font-serif">Mohammad Shakil Atelier Administration</h2>
          <p className="text-xs text-stone-400 leading-relaxed">
            Access restricted to verified store administrators. Please authenticate to manage product catalog, bulk photo galleries, and customer orders.
          </p>
          <div className="pt-2 space-y-2">
            <button
              onClick={handleQuickAdminLogin}
              disabled={isAuthenticating}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Admin...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate as Admin</span>
                </>
              )}
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl transition"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Pre-flight frontend validation
    if (!productForm.name || !productForm.name.trim()) {
      setFormError('Product Title is required. Please enter a piece name.');
      return;
    }
    if (!productForm.category || !productForm.category.trim()) {
      setFormError('Category is required. Please select or enter a category.');
      return;
    }
    const priceNum = Number(productForm.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid MRP price greater than ₹0.');
      return;
    }

    setIsSavingProduct(true);
    try {
      // Ensure images array has content
      let currentImages = (productForm.images || []).filter((img) => Boolean(img && img.trim()));
      if (currentImages.length === 0) {
        if (productForm.thumbnail && productForm.thumbnail.trim()) {
          currentImages = [productForm.thumbnail.trim()];
        } else {
          currentImages = [
            'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?q=80&w=1000&auto=format&fit=crop'
          ];
        }
      }

      // Determine primary thumbnail
      const primaryThumb =
        productForm.thumbnail && currentImages.includes(productForm.thumbnail)
          ? productForm.thumbnail
          : currentImages[0];

      // Reorder photos so primary cover photo is at index 0
      const orderedImages = [primaryThumb, ...currentImages.filter((img) => img !== primaryThumb)];

      const payload = {
        name: productForm.name.trim(),
        sku: productForm.sku.trim() || `SB-${Math.floor(1000 + Math.random() * 9000)}`,
        category: productForm.category.trim(),
        price: priceNum,
        salePrice: productForm.salePrice && Number(productForm.salePrice) > 0 ? Number(productForm.salePrice) : undefined,
        stockQuantity: Number(productForm.stockQuantity) || 0,
        material: productForm.material || '100% German Bayer Polycarbonate',
        color: [productForm.color || 'Obsidian Black'],
        size: productForm.size || '55 cm',
        description: productForm.description.trim() || productForm.name.trim(),
        thumbnail: primaryThumb,
        images: orderedImages
      };

      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      // Verify or renew token
      let currentToken = token;
      if (!currentToken) {
        try {
          const authRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'himanshu.bkgroup@gmail.com', password: 'Admin@22112003' })
          });
          const authData = await authRes.json();
          if (authData.token) {
            currentToken = authData.token;
            login(authData.token, authData.user);
          }
        } catch (_) {}
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        setShowProductModal(false);
        setEditingProduct(null);
        setFormError('');
        setActionSuccess(
          editingProduct
            ? `Piece "${payload.name}" updated successfully!`
            : `Piece "${payload.name}" added to catalog with ${orderedImages.length} photos!`
        );
        setTimeout(() => setActionSuccess(''), 5000);
        await loadAllData();
      } else {
        setFormError(data.error || 'Server could not save this piece. Please check required fields.');
      }
    } catch (err: any) {
      console.error('Save piece error:', err);
      setFormError(err.message || 'Network error occurred while saving. Please try again.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ stockQuantity: Math.max(0, newStock) })
      });
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ orderStatus: status })
      });
      setActionSuccess(`Order ${orderId} updated to ${status}`);
      setTimeout(() => setActionSuccess(''), 3000);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetryAbandonedCart = async (cartInternalId: string) => {
    try {
      const res = await fetch(`/api/admin/abandoned-carts/${cartInternalId}/retry`, {
        method: 'POST',
        headers: authHeaders
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess('WhatsApp priority reminder triggered successfully!');
        setTimeout(() => setActionSuccess(''), 4000);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOptOutAbandonedCart = async (cartInternalId: string) => {
    try {
      await fetch(`/api/admin/abandoned-carts/${cartInternalId}/opt-out`, {
        method: 'POST',
        headers: authHeaders
      });
      setActionSuccess('Customer opted out. Recovery sequence permanently halted.');
      setTimeout(() => setActionSuccess(''), 4000);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to remove this record?')) return;
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l._id !== leadId));
        setActionSuccess('Record removed successfully.');
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  const handleBulkImport = async () => {
    if (!csvText.trim()) return;
    setImporting(true);
    try {
      const res = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ csvContent: csvText })
      });
      const data = await res.json();
      setCsvResult(data);
      loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(adminSettings)
      });
      setActionSuccess('Store & WhatsApp automation settings saved!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const isNewsletterLead = (l: Lead) =>
    l.source === 'NEWSLETTER' ||
    l.name?.toLowerCase().includes('newsletter') ||
    l.requirement?.toLowerCase().includes('travel drops') ||
    l.requirement?.toLowerCase().includes('newsletter');

  const isPersonalShoppingLead = (l: Lead) =>
    l.source === 'PERSONAL_SHOPPING' ||
    Boolean(l.categoryType) ||
    Boolean(l.requirement?.includes('[Right bag for me]')) ||
    Boolean(l.requirement?.includes('[Trolley wheels]')) ||
    Boolean(l.productName?.toLowerCase().includes('consultation'));

  const personalShoppingLeads = leads.filter(isPersonalShoppingLead);
  const newsletterLeads = leads.filter(isNewsletterLead);
  const pureBuyerLeads = leads.filter((l) => !isNewsletterLead(l) && !isPersonalShoppingLead(l));

  // Displayed buyer leads based on leadCategoryFilter
  const displayedBuyerLeads =
    leadCategoryFilter === 'BUYER_LEADS'
      ? pureBuyerLeads
      : leadCategoryFilter === 'NEWSLETTER'
      ? newsletterLeads
      : leads;

  // Filtered personal shopping leads based on category subfilter
  const displayedPersonalShopping =
    personalShoppingSubfilter === 'BAG'
      ? personalShoppingLeads.filter(
          (l) => l.categoryType === 'Right bag for me' || l.requirement?.includes('Right bag')
        )
      : personalShoppingSubfilter === 'WHEELS'
      ? personalShoppingLeads.filter(
          (l) => l.categoryType === 'Trolley wheels' || l.requirement?.includes('Trolley wheels')
        )
      : personalShoppingLeads;

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-stone-900 border-r border-stone-800 p-5 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-bold font-serif">
              SB
            </div>
            <div>
              <span className="text-sm font-bold text-white font-serif block">SHAKIL ATELIER</span>
              <span className="text-[10px] text-amber-400 uppercase tracking-widest">Admin Control</span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'overview' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'products' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Luggage Atelier ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'inventory' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Inventory & Alerts</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'orders' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Consignments ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('abandoned')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'abandoned' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Carts ({abandonedCarts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('import')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'import' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Bulk CSV Import</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'analytics' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Journey & Exit Surveys</span>
            </button>

            <button
              id="admin-tab-personal-shopping"
              onClick={() => setActiveTab('personal_shopping')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'personal_shopping'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Personal Shopping / Query</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  activeTab === 'personal_shopping'
                    ? 'bg-stone-950 text-amber-400'
                    : 'bg-stone-800 text-amber-300'
                }`}
              >
                {personalShoppingLeads.length}
              </span>
            </button>

            <button
              id="admin-tab-buyer-leads"
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'leads' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Buyer Leads</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  activeTab === 'leads'
                    ? 'bg-stone-950 text-amber-400'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {pureBuyerLeads.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'settings' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>WhatsApp & Store Config</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-stone-800 text-[11px] text-stone-500">
          <span>Mohammad Shakil Atelier v1.0</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {/* Top bar with quick refresh & notice */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-stone-800">
          <div>
            <h1 className="text-2xl font-bold text-white font-serif capitalize">
              {activeTab === 'abandoned' ? 'WhatsApp 5-Stage Cart Recovery' : activeTab} Management
            </h1>
            <p className="text-xs text-stone-400">
              Live synchronized database with WhatsApp Cloud API & Gemini Assistant.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold rounded-xl flex items-center gap-2 border border-stone-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-semibold rounded-xl border border-stone-800"
            >
              View Live Store
            </button>
          </div>
        </div>

        {actionSuccess && (
          <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-stone-900/60 border border-stone-800 rounded-2xl">
                <span className="text-xs text-stone-400 block">Total Store Sales</span>
                <span className="text-2xl font-black text-white font-mono mt-1 block">
                  {formatPrice(stats.totalSales || 0)}
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 block">
                  Today: {formatPrice(stats.todaySales || 0)}
                </span>
              </div>

              <div className="p-5 bg-stone-900/60 border border-stone-800 rounded-2xl">
                <span className="text-xs text-stone-400 block">Total Consignments</span>
                <span className="text-2xl font-black text-white font-mono mt-1 block">
                  {stats.totalOrders || 0}
                </span>
                <span className="text-[10px] text-amber-400 mt-1 block">
                  {stats.pendingOrders || 0} Pending Dispatch
                </span>
              </div>

              <div className="p-5 bg-stone-900/60 border border-stone-800 rounded-2xl">
                <span className="text-xs text-stone-400 block">Abandoned Carts</span>
                <span className="text-2xl font-black text-white font-mono mt-1 block">
                  {stats.abandonedCartsCount || 0}
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 block">
                  {stats.recoveredCartsCount || 0} Recovered via WhatsApp
                </span>
              </div>

              <div className="p-5 bg-stone-900/60 border border-stone-800 rounded-2xl">
                <span className="text-xs text-stone-400 block">Recovered Revenue</span>
                <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                  {formatPrice(stats.recoveredRevenue || 0)}
                </span>
                <span className="text-[10px] text-stone-400 mt-1 block">Direct WhatsApp ROI</span>
              </div>
            </div>

            {/* Inventory Quick Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-stone-900/60 border border-stone-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white font-serif flex items-center justify-between">
                  <span>Critical Stock Warnings</span>
                  <span className="text-xs text-amber-400 font-mono">
                    {stats.lowStockCount || 0} items low
                  </span>
                </h3>

                <div className="divide-y divide-stone-800 text-xs">
                  {products
                    .filter((p) => p.stockQuantity <= p.lowStockThreshold)
                    .slice(0, 4)
                    .map((p) => (
                      <div key={p._id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-white block">{p.name}</span>
                          <span className="text-stone-500 text-[10px]">SKU: {p.sku}</span>
                        </div>
                        <span className={`font-bold ${p.stockQuantity === 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                          {p.stockQuantity === 0 ? 'OUT OF STOCK' : `Only ${p.stockQuantity} left`}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-6 bg-stone-900/60 border border-stone-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white font-serif">
                  WhatsApp 5-Stage Scheduler Status
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between">
                    <span>1. 60 Minutes (Gentle Inquiry)</span>
                    <span className="text-emerald-400 font-bold">Active (60m)</span>
                  </div>
                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between">
                    <span>2. 3 Hours (Assistance & Specs)</span>
                    <span className="text-emerald-400 font-bold">Active (180m)</span>
                  </div>
                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between">
                    <span>3. 6 Hours (Social Proof & Video)</span>
                    <span className="text-emerald-400 font-bold">Active (360m)</span>
                  </div>
                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between">
                    <span>4. 12 Hours (Privilege Voucher)</span>
                    <span className="text-emerald-400 font-bold">Active (720m)</span>
                  </div>
                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between">
                    <span>5. 24 Hours (Final Expiry & Stop)</span>
                    <span className="text-amber-400 font-bold">Final Stop (1440m)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRODUCTS ATELIER TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setFormError('');
                  const defaultPhotos = [
                    'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?q=80&w=1000&auto=format&fit=crop'
                  ];
                  setProductForm({
                    name: '',
                    sku: 'SB-' + Math.floor(1000 + Math.random() * 9000),
                    category: 'Cabin Trolley',
                    price: '7999',
                    salePrice: '5999',
                    stockQuantity: '20',
                    material: '100% German Bayer Polycarbonate',
                    color: 'Obsidian Black',
                    size: '55 cm',
                    description: '',
                    thumbnail: defaultPhotos[0],
                    images: defaultPhotos
                  });
                  setShowProductModal(true);
                }}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Luggage Piece</span>
              </button>
            </div>

            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Piece</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-stone-900/40">
                      <td className="p-4 flex items-center gap-3">
                        <img src={p.thumbnail || (p.images && p.images[0])} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-stone-950" />
                        <span className="font-bold text-white">{p.name}</span>
                      </td>
                      <td className="p-4 font-mono text-stone-400">{p.sku}</td>
                      <td className="p-4 text-amber-400">{p.category}</td>
                      <td className="p-4 font-bold text-white">{formatPrice(p.salePrice || p.price)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stockQuantity > 5 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                          {p.stockQuantity} units
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setFormError('');
                            const pImages = Array.isArray(p.images) && p.images.length > 0
                              ? p.images
                              : [p.thumbnail || 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?q=80&w=600&auto=format&fit=crop'];
                            const pThumbnail = p.thumbnail || pImages[0];
                            setProductForm({
                              name: p.name,
                              sku: p.sku,
                              category: p.category,
                              price: String(p.price),
                              salePrice: p.salePrice ? String(p.salePrice) : '',
                              stockQuantity: String(p.stockQuantity),
                              material: p.material || '',
                              color: (p.color && p.color[0]) || 'Obsidian Black',
                              size: p.size || '',
                              description: p.description || '',
                              thumbnail: pThumbnail,
                              images: pImages
                            });
                            setShowProductModal(true);
                          }}
                          className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. INVENTORY & ALERTS TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-2xl text-xs text-amber-200">
              Direct inventory modifier: adjust stock levels inline with zero latency. Stock levels automatically update the client-side cart limits.
            </div>

            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Threshold</th>
                    <th className="p-4">Current Stock</th>
                    <th className="p-4 text-right">Inline Stock Adjuster</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-stone-900/40">
                      <td className="p-4 font-bold text-white">{p.name}</td>
                      <td className="p-4 font-mono text-stone-400">{p.sku}</td>
                      <td className="p-4 text-stone-400">{p.lowStockThreshold} units</td>
                      <td className="p-4">
                        <span className={`font-mono font-bold text-sm ${p.stockQuantity <= p.lowStockThreshold ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-2 bg-stone-950 border border-stone-800 rounded-lg p-1">
                          <button
                            onClick={() => handleUpdateStock(p._id, p.stockQuantity - 1)}
                            className="w-6 h-6 flex items-center justify-center bg-stone-900 hover:bg-stone-800 text-stone-200 rounded"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold">{p.stockQuantity}</span>
                          <button
                            onClick={() => handleUpdateStock(p._id, p.stockQuantity + 1)}
                            className="w-6 h-6 flex items-center justify-center bg-stone-900 hover:bg-stone-800 text-stone-200 rounded"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleUpdateStock(p._id, p.stockQuantity + 10)}
                            className="px-2 py-0.5 text-[10px] bg-amber-500 text-stone-950 font-bold rounded"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Update Consignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {orders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-stone-900/40">
                      <td className="p-4 font-mono font-bold text-amber-400">{ord.orderId}</td>
                      <td className="p-4">
                        <div className="font-semibold text-white">{ord.customerName}</div>
                        <div className="text-[10px] text-stone-400">+{ord.customerPhone}</div>
                      </td>
                      <td className="p-4 font-bold text-white">{formatPrice(ord.total)}</td>
                      <td className="p-4">
                        <span className="text-[10px] uppercase font-bold text-stone-300">
                          {ord.paymentMethod} ({ord.paymentStatus})
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-300 text-[10px] font-bold rounded uppercase">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord.orderId, e.target.value)}
                          className="bg-stone-950 border border-stone-800 text-stone-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-400"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. ABANDONED CARTS (5-STAGE TIMELINE MONITOR) */}
        {activeTab === 'abandoned' && (
          <div className="space-y-6">
            <div className="p-5 bg-gradient-to-r from-emerald-950/40 via-stone-900 to-emerald-950/40 border border-emerald-800/60 rounded-2xl space-y-2">
              <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Automatic 5-Stage WhatsApp Inactivity Engine</span>
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                Monitors carts every 60 seconds. Stages fire automatically at <strong>60m, 3h, 6h, 12h, and 24h</strong> until an order is placed, customer opts out ("STOP"), or manual override is performed.
              </p>
            </div>

            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Customer & Phone</th>
                    <th className="p-4">Cart Total</th>
                    <th className="p-4">5-Stage Status (60m / 3h / 6h / 12h / 24h)</th>
                    <th className="p-4">Recovery Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {abandonedCarts.map((c) => (
                    <tr key={c._id} className="hover:bg-stone-900/40">
                      <td className="p-4">
                        <div className="font-bold text-white">{c.customerName}</div>
                        <div className="font-mono text-emerald-400 text-[11px]">+{c.phone}</div>
                        <div className="text-[10px] text-stone-500">Stage: {c.checkoutStage}</div>
                      </td>
                      <td className="p-4 font-bold text-white">{formatPrice(c.cartTotal)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${c.recovery_60m.status === 'SENT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-stone-800 text-stone-400'}`}>
                            60m: {c.recovery_60m.status}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${c.recovery_3h.status === 'SENT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-stone-800 text-stone-400'}`}>
                            3h: {c.recovery_3h.status}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${c.recovery_6h.status === 'SENT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-stone-800 text-stone-400'}`}>
                            6h: {c.recovery_6h.status}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${c.recovery_12h.status === 'SENT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-stone-800 text-stone-400'}`}>
                            12h: {c.recovery_12h.status}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${c.recovery_24h.status === 'SENT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-stone-800 text-stone-400'}`}>
                            24h: {c.recovery_24h.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.recoveryStatus === 'RECOVERED' ? 'bg-emerald-950 text-emerald-300' : c.optedOut ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'}`}>
                          {c.optedOut ? 'OPTED OUT' : c.recoveryStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleRetryAbandonedCart(c._id)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 text-[10px] font-bold rounded"
                        >
                          Send WhatsApp
                        </button>
                        {!c.optedOut && (
                          <button
                            onClick={() => handleOptOutAbandonedCart(c._id)}
                            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-rose-300 text-[10px] font-bold rounded"
                          >
                            Opt Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. BULK CSV IMPORT TAB */}
        {activeTab === 'import' && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white font-serif">Bulk Product CSV Ingestion</h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Upload catalog lines. Columns: <code>sku, name, category, price, stock, description, material</code>.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const sample = `sku,name,category,price,stock,description,material\nSB-9011,Platinum Pilot Trolley 55cm,Cabin Trolley,7499,25,Compact executive spinner with front pocket,Polycarbonate\nSB-9012,Voyager 3-Piece Luggage Set,Luggage Sets,16999,10,Complete family travel set,Polycarbonate`;
                    setCsvText(sample);
                  }}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-semibold rounded-lg border border-stone-700"
                >
                  Load Sample CSV
                </button>
              </div>

              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Paste CSV text or load sample above..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 font-mono text-xs text-white focus:outline-none focus:border-amber-400"
              />

              <button
                onClick={handleBulkImport}
                disabled={importing || !csvText.trim()}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 text-stone-950 text-xs font-bold uppercase rounded-xl shadow"
              >
                {importing ? 'Processing & Validating SKUs...' : 'Execute Bulk Ingestion'}
              </button>

              {csvResult && (
                <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-white">
                    Processed {csvResult.totalProcessed} records:
                    <span className="text-emerald-400 ml-2">✓ {csvResult.successfulCount} Imported</span>
                    <span className="text-rose-400 ml-2">✕ {csvResult.failedCount} Failed</span>
                  </div>
                  {csvResult.failed && csvResult.failed.length > 0 && (
                    <div className="text-rose-300 text-[11px] space-y-1">
                      {csvResult.failed.map((f: any, i: number) => (
                        <div key={i}>Row {f.row} ({f.sku}): {f.reason}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. JOURNEY ANALYTICS & EXIT SURVEYS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Funnel */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white font-serif">Customer Conversion Funnel</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-stone-950 rounded">
                    <span>1. Store Visitors</span>
                    <span className="font-bold font-mono">142</span>
                  </div>
                  <div className="flex justify-between p-2 bg-stone-950 rounded">
                    <span>2. Luggage Product Views</span>
                    <span className="font-bold font-mono">98 (69%)</span>
                  </div>
                  <div className="flex justify-between p-2 bg-stone-950 rounded">
                    <span>3. Added to Cart</span>
                    <span className="font-bold font-mono">48 (33%)</span>
                  </div>
                  <div className="flex justify-between p-2 bg-stone-950 rounded">
                    <span>4. Checkout Started</span>
                    <span className="font-bold font-mono">29 (20%)</span>
                  </div>
                  <div className="flex justify-between p-2 bg-emerald-950 text-emerald-300 rounded border border-emerald-800 font-bold">
                    <span>5. Order Completed</span>
                    <span className="font-mono">{orders.length} ({(orders.length / 1.42).toFixed(1)}%)</span>
                  </div>
                </div>
              </div>

              {/* Exit Surveys */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white font-serif">
                  Checkout Exit Survey Feedback ({exitSurveys.length})
                </h3>
                <div className="divide-y divide-stone-800 max-h-60 overflow-y-auto text-xs">
                  {exitSurveys.map((s) => (
                    <div key={s._id} className="py-2.5">
                      <div className="font-semibold text-amber-300">{s.reason}</div>
                      {s.details && <div className="text-stone-400 text-[11px]">"{s.details}"</div>}
                      <div className="text-stone-500 text-[10px] mt-0.5">
                        Cart Total: {formatPrice(s.cartTotal)} • {new Date(s.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. PERSONAL SHOPPING / QUERY TAB */}
        {activeTab === 'personal_shopping' && (
          <div className="space-y-6">
            {/* Header & Sub-filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/60 border border-stone-800 p-5 rounded-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <h3 className="text-base font-bold text-white font-serif">
                    Personal Shopping & Concierge Queries ({displayedPersonalShopping.length})
                  </h3>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Customer requirements submitted via the "Can't find the right bag?" consultation form.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPersonalShoppingSubfilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    personalShoppingSubfilter === 'ALL'
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  All ({personalShoppingLeads.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPersonalShoppingSubfilter('BAG')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    personalShoppingSubfilter === 'BAG'
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Right Bag ({personalShoppingLeads.filter(l => l.categoryType === 'Right bag for me' || l.requirement?.includes('Right bag')).length})
                </button>
                <button
                  type="button"
                  onClick={() => setPersonalShoppingSubfilter('WHEELS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    personalShoppingSubfilter === 'WHEELS'
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Trolley Wheels ({personalShoppingLeads.filter(l => l.categoryType === 'Trolley wheels' || l.requirement?.includes('Trolley wheels')).length})
                </button>
              </div>
            </div>

            {/* Inquiries Table */}
            {displayedPersonalShopping.length === 0 ? (
              <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-12 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-stone-800 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">No Personal Shopping Queries Yet</h4>
                  <p className="text-stone-400 text-xs mt-1 max-w-sm mx-auto">
                    When visitors submit requests via the "Can't find the right bag?" consultation form on the homepage, they will appear here.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('home')}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <span>View Homepage Form</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="bg-stone-900/60 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 uppercase font-semibold">
                      <tr>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Trip / Use Case Requirement</th>
                        <th className="p-4">Budget</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                      {displayedPersonalShopping.map((l) => {
                        const cleanPhone = (l.phone || '').replace(/[^0-9]/g, '');
                        const waMsg = encodeURIComponent(
                          `Hi ${l.name}, this is Mohammad Shakil from Shakil Bag Store regarding your personal shopping inquiry about ${l.categoryType || 'luggage'}. How can we assist with your upcoming journey?`
                        );
                        const isWheels = l.categoryType === 'Trolley wheels' || l.requirement?.includes('Trolley wheels');

                        return (
                          <tr key={l._id} className="hover:bg-stone-900/40 transition-colors">
                            {/* Customer Name */}
                            <td className="p-4 font-bold text-white whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#C59B53]/20 border border-[#C59B53]/40 text-[#C59B53] flex items-center justify-center font-bold text-xs">
                                  {l.name ? l.name.charAt(0).toUpperCase() : 'G'}
                                </div>
                                <span>{l.name}</span>
                              </div>
                            </td>

                            {/* Contact Details */}
                            <td className="p-4 whitespace-nowrap">
                              <div className="space-y-1">
                                {cleanPhone ? (
                                  <a
                                    href={`https://wa.me/${cleanPhone}?text=${waMsg}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 font-mono text-emerald-400 hover:text-emerald-300 font-medium"
                                  >
                                    <PhoneCall className="w-3 h-3" />
                                    <span>{l.phone}</span>
                                  </a>
                                ) : (
                                  <span className="text-stone-500 font-mono">—</span>
                                )}
                                {l.email ? (
                                  <a
                                    href={`mailto:${l.email}`}
                                    className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-[11px]"
                                  >
                                    <Mail className="w-3 h-3" />
                                    <span>{l.email}</span>
                                  </a>
                                ) : null}
                              </div>
                            </td>

                            {/* Category Pill */}
                            <td className="p-4 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                                  isWheels
                                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                                    : 'bg-amber-950/80 text-amber-300 border-amber-800'
                                }`}
                              >
                                {l.categoryType || (isWheels ? 'Trolley wheels' : 'Right bag for me')}
                              </span>
                            </td>

                            {/* Requirement / Trip details */}
                            <td className="p-4 text-stone-200 max-w-sm leading-relaxed">
                              <div className="font-sans text-xs">
                                {l.requirement || 'Looking for expert luggage consultation'}
                              </div>
                            </td>

                            {/* Budget */}
                            <td className="p-4 whitespace-nowrap">
                              {l.budget ? (
                                <span className="px-2 py-0.5 rounded bg-stone-800 text-amber-400 font-mono text-[11px] font-semibold">
                                  {l.budget}
                                </span>
                              ) : (
                                <span className="text-stone-500 text-[11px]">Flexible</span>
                              )}
                            </td>

                            {/* Date */}
                            <td className="p-4 text-stone-400 whitespace-nowrap text-[11px]">
                              {new Date(l.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>

                            {/* Direct Actions */}
                            <td className="p-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/${cleanPhone}?text=${waMsg}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-semibold rounded-lg text-[10px] flex items-center gap-1 transition-colors"
                                    title="Open WhatsApp Chat"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>WhatsApp</span>
                                  </a>
                                )}

                                {l.email && (
                                  <a
                                    href={`mailto:${l.email}?subject=Personal%20Shopping%20Inquiry%20-%20Shakil%20Bag%20Store`}
                                    className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors"
                                    title="Send Email"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                  </a>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDeleteLead(l._id)}
                                  className="p-1.5 hover:bg-red-950/60 text-stone-400 hover:text-red-400 rounded-lg transition-colors"
                                  title="Delete inquiry"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 9. BUYER LEADS TAB */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            {/* Header & Segregation Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/60 border border-stone-800 p-5 rounded-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Users className="w-5 h-5" />
                  </span>
                  <h3 className="text-base font-bold text-white font-serif">
                    Buyer Leads Management ({displayedBuyerLeads.length})
                  </h3>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  High-intent luggage buyers and product inquiries. Newsletter signups are separated for clarity.
                </p>
              </div>

              {/* Segmented Filter Pills */}
              <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800 self-start sm:self-auto">
                <button
                  type="button"
                  id="filter-buyer-leads-only"
                  onClick={() => setLeadCategoryFilter('BUYER_LEADS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    leadCategoryFilter === 'BUYER_LEADS'
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Buyer Leads ({pureBuyerLeads.length})
                </button>
                <button
                  type="button"
                  id="filter-newsletter-only"
                  onClick={() => setLeadCategoryFilter('NEWSLETTER')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    leadCategoryFilter === 'NEWSLETTER'
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Newsletter ({newsletterLeads.length})
                </button>
                <button
                  type="button"
                  id="filter-all-leads"
                  onClick={() => setLeadCategoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    leadCategoryFilter === 'ALL'
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  All Combined ({leads.length})
                </button>
              </div>
            </div>

            {/* Table */}
            {displayedBuyerLeads.length === 0 ? (
              <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-12 text-center space-y-3">
                <Users className="w-10 h-10 mx-auto text-stone-600" />
                <h4 className="text-white font-bold text-sm">No leads in this category</h4>
                <p className="text-stone-400 text-xs max-w-sm mx-auto">
                  {leadCategoryFilter === 'BUYER_LEADS'
                    ? 'No direct buyer inquiries yet. Check the "Personal Shopping / Query" tab for consultation submissions.'
                    : 'No records match this filter.'}
                </p>
              </div>
            ) : (
              <div className="bg-stone-900/60 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 uppercase font-semibold">
                      <tr>
                        <th className="p-4">Customer Name</th>
                        <th className="p-4">Phone / WhatsApp</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Requirement / Details</th>
                        <th className="p-4">Source</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Direct Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                      {displayedBuyerLeads.map((l) => {
                        const cleanPhone = (l.phone || '').replace(/[^0-9]/g, '');
                        const isNews = isNewsletterLead(l);
                        const isPS = isPersonalShoppingLead(l);

                        return (
                          <tr key={l._id} className="hover:bg-stone-900/40 transition-colors">
                            {/* Customer Name */}
                            <td className="p-4 font-bold text-white whitespace-nowrap">
                              {l.name}
                            </td>

                            {/* Phone / WhatsApp */}
                            <td className="p-4 font-mono whitespace-nowrap">
                              {cleanPhone && cleanPhone.length > 5 ? (
                                <span className="text-emerald-400 font-medium">
                                  {l.phone}
                                </span>
                              ) : (
                                <span className="text-stone-500">—</span>
                              )}
                            </td>

                            {/* Email */}
                            <td className="p-4 whitespace-nowrap">
                              {l.email ? (
                                <a
                                  href={`mailto:${l.email}`}
                                  className="text-sky-400 hover:text-sky-300 underline font-sans"
                                >
                                  {l.email}
                                </a>
                              ) : (
                                <span className="text-stone-500">—</span>
                              )}
                            </td>

                            {/* Requirement */}
                            <td className="p-4 text-stone-300 max-w-xs leading-relaxed">
                              {l.requirement || 'General luxury inquiry'}
                            </td>

                            {/* Source Badge */}
                            <td className="p-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  isPS
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : isNews
                                    ? 'bg-sky-950 text-sky-300 border border-sky-800'
                                    : 'bg-stone-800 text-stone-300'
                                }`}
                              >
                                {isPS
                                  ? 'Personal Shopping'
                                  : isNews
                                  ? 'Newsletter'
                                  : l.source || 'Lead'}
                              </span>
                            </td>

                            {/* Date */}
                            <td className="p-4 text-stone-400 whitespace-nowrap text-[11px]">
                              {new Date(l.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </td>

                            {/* Direct Action */}
                            <td className="p-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {cleanPhone && cleanPhone.length > 5 ? (
                                  <a
                                    href={`https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(
                                      l.name
                                    )}%2C%20this%20is%20Mohammad%20Shakil%20from%20Shakil%20Bag%20Store.`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold rounded-lg text-[10px] transition-colors"
                                  >
                                    WhatsApp
                                  </a>
                                ) : null}

                                {l.email ? (
                                  <a
                                    href={`mailto:${l.email}`}
                                    className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors"
                                    title="Send Email"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                  </a>
                                ) : null}

                                <button
                                  type="button"
                                  onClick={() => handleDeleteLead(l._id)}
                                  className="p-1.5 hover:bg-red-950/60 text-stone-400 hover:text-red-400 rounded-lg transition-colors"
                                  title="Delete lead"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 9. SETTINGS & WHATSAPP CONFIG TAB */}
        {activeTab === 'settings' && (
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 sm:p-8 max-w-2xl space-y-6">
            <h3 className="text-base font-bold text-white font-serif">
              Store & WhatsApp Automation Settings
            </h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={adminSettings.abandonedCartEnabled}
                  onChange={(e) =>
                    setAdminSettings({ ...adminSettings, abandonedCartEnabled: e.target.checked })
                  }
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
                <div>
                  <span className="font-bold text-white block">Enable 5-Stage WhatsApp Inactivity Engine</span>
                  <span className="text-stone-400 text-[11px]">Continuously sweeps and schedules recovery messages.</span>
                </div>
              </label>

              <div className="pl-7 space-y-2 border-l border-stone-800 text-xs">
                <label className="flex items-center gap-2 text-stone-300">
                  <input
                    type="checkbox"
                    checked={adminSettings.stagesEnabled?.stage_60m}
                    onChange={(e) =>
                      setAdminSettings({
                        ...adminSettings,
                        stagesEnabled: { ...adminSettings.stagesEnabled, stage_60m: e.target.checked }
                      })
                    }
                    className="accent-amber-500"
                  />
                  <span>Stage 1: 60 Minutes</span>
                </label>
                <label className="flex items-center gap-2 text-stone-300">
                  <input
                    type="checkbox"
                    checked={adminSettings.stagesEnabled?.stage_3h}
                    onChange={(e) =>
                      setAdminSettings({
                        ...adminSettings,
                        stagesEnabled: { ...adminSettings.stagesEnabled, stage_3h: e.target.checked }
                      })
                    }
                    className="accent-amber-500"
                  />
                  <span>Stage 2: 3 Hours</span>
                </label>
                <label className="flex items-center gap-2 text-stone-300">
                  <input
                    type="checkbox"
                    checked={adminSettings.stagesEnabled?.stage_6h}
                    onChange={(e) =>
                      setAdminSettings({
                        ...adminSettings,
                        stagesEnabled: { ...adminSettings.stagesEnabled, stage_6h: e.target.checked }
                      })
                    }
                    className="accent-amber-500"
                  />
                  <span>Stage 3: 6 Hours</span>
                </label>
                <label className="flex items-center gap-2 text-stone-300">
                  <input
                    type="checkbox"
                    checked={adminSettings.stagesEnabled?.stage_12h}
                    onChange={(e) =>
                      setAdminSettings({
                        ...adminSettings,
                        stagesEnabled: { ...adminSettings.stagesEnabled, stage_12h: e.target.checked }
                      })
                    }
                    className="accent-amber-500"
                  />
                  <span>Stage 4: 12 Hours</span>
                </label>
                <label className="flex items-center gap-2 text-stone-300">
                  <input
                    type="checkbox"
                    checked={adminSettings.stagesEnabled?.stage_24h}
                    onChange={(e) =>
                      setAdminSettings({
                        ...adminSettings,
                        stagesEnabled: { ...adminSettings.stagesEnabled, stage_24h: e.target.checked }
                      })
                    }
                    className="accent-amber-500"
                  />
                  <span>Stage 5: 24 Hours (Final Expiry Stop)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-800 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-stone-300 block mb-1">WhatsApp Official Number</label>
                  <input
                    type="text"
                    value={adminSettings.whatsappNumber}
                    onChange={(e) => setAdminSettings({ ...adminSettings, whatsappNumber: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-300 block mb-1">Founder / Owner Name</label>
                  <input
                    type="text"
                    value={adminSettings.ownerName}
                    onChange={(e) => setAdminSettings({ ...adminSettings, ownerName: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase rounded-xl shadow"
              >
                Save All Settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-serif">
                  {editingProduct ? `Edit Piece: ${editingProduct.name}` : 'Add New Luggage Piece'}
                </h3>
                <p className="text-[11px] text-stone-400">
                  Configure piece specifications, bulk high-resolution photo gallery, and inventory.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                  setFormError('');
                }}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3.5 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-rose-300">Action Required</p>
                  <p className="text-[11px] text-rose-200/90">{formError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormError('')}
                  className="text-rose-400 hover:text-white text-xs"
                >
                  Dismiss
                </button>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-200 block mb-1">
                  Product Title / Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Monogram Cabin Carry-On (55cm)"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white placeholder:text-stone-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-200 block mb-1">
                    SKU Code <span className="text-stone-500 font-normal">(Auto-generated if empty)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SB-CAB-55"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white font-mono placeholder:text-stone-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-200 block mb-1">
                    Category <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Cabin Trolley">Cabin Trolley</option>
                    <option value="Check-in Trolley">Check-in Trolley</option>
                    <option value="Trunk Luggage">Trunk Luggage</option>
                    <option value="Duffle Bags">Duffle Bags</option>
                    <option value="Backpacks">Backpacks</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-200 block mb-1">
                    MRP Price (₹) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 7999"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-200 block mb-1">
                    Sale / Special Offer Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5999 (optional)"
                    value={productForm.salePrice}
                    onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-200 block mb-1">
                    Initial Stock Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="15"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-200 block mb-1">Shell Material</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% German Bayer Polycarbonate"
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-200 block mb-1">Size Specification</label>
                  <input
                    type="text"
                    placeholder="e.g. 55 x 36 x 23 cm (Cabin Size)"
                    value={productForm.size}
                    onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bulk Photo Upload & Primary Photo Manager Component */}
              <BulkPhotoManager
                images={productForm.images}
                thumbnail={productForm.thumbnail}
                onChangeImages={(newImages) => setProductForm({ ...productForm, images: newImages })}
                onSelectPrimary={(primaryUrl) => setProductForm({ ...productForm, thumbnail: primaryUrl })}
              />

              <div>
                <label className="font-semibold text-stone-200 block mb-1">Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Crafted with unbreakable aerospace-grade polycarbonate, Hinomoto Japanese 360° silent wheels, and custom TSA lock..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white placeholder:text-stone-600 focus:border-amber-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800">
                <div className="text-[11px] text-stone-400">
                  Cover Photo:{' '}
                  <span className="text-amber-400 font-semibold">
                    {productForm.thumbnail ? 'Configured' : 'Will auto-select first photo'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false);
                      setEditingProduct(null);
                      setFormError('');
                    }}
                    className="px-4 py-2 text-stone-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 transition"
                  >
                    {isSavingProduct ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Piece...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{editingProduct ? 'Update Piece' : 'Save Piece'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
