import React, { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, X, Search, ChevronDown, Check } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product, Category } from '../types';
import { useStore } from '../context/StoreContext';

interface ShopPageProps {
  onNavigate: (page: string, param?: string) => void;
  initialParams?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onNavigate, initialParams = '' }) => {
  const { categories } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Parse initial query params (e.g. category=cabin-trolley, search=wheels)
  useEffect(() => {
    if (initialParams) {
      const params = new URLSearchParams(initialParams);
      if (params.get('category')) setSelectedCategory(params.get('category') || 'all');
      if (params.get('search')) setSearchQuery(params.get('search') || '');
      if (params.get('bestseller') === 'true') setSortOption('popularity');
    }
  }, [initialParams]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortOption]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/products?sort=${sortOption}`;
      if (selectedCategory && selectedCategory !== 'all') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;
      if (selectedColor) url += `&color=${encodeURIComponent(selectedColor)}`;
      if (selectedMaterial) url += `&material=${encodeURIComponent(selectedMaterial)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.products) {
        let list: Product[] = data.products;
        if (inStockOnly) {
          list = list.filter((p) => p.stockQuantity > 0);
        }
        setProducts(list);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchProducts();
    setMobileFilterOpen(false);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedColor('');
    setSelectedMaterial('');
    setInStockOnly(false);
    setSortOption('newest');
  };

  const colors = ['Black', 'Silver', 'Navy', 'Rose Gold', 'Cognac Tan', 'Olive'];
  const materials = ['Polycarbonate', 'Leather', 'Nylon', 'Aluminum'];

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-8 pb-6 border-b border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <span className="cursor-pointer hover:text-white" onClick={() => onNavigate('home')}>Home</span>
              <span>/</span>
              <span className="text-amber-400">Atelier Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif mt-1">
              Luxury Travel & Luggage Collection
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Showing {products.length} crafted travel pieces certified under Mohammad Shakil standards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-4 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs font-semibold flex items-center gap-2 text-stone-200"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-400 hidden sm:inline">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-stone-900 border border-stone-800 text-stone-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-amber-400"
              >
                <option value="newest">Newest Releases</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Body with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-stone-900/50 p-5 rounded-2xl border border-stone-800/80 h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-amber-400" /> Filter Atelier
              </span>
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline"
              >
                Reset All
              </button>
            </div>

            {/* Search within catalog */}
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1.5">Search Keywords</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                  placeholder="e.g. Hinomoto, 55cm, TSA..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={fetchProducts}
                  className="absolute right-2 top-2 text-stone-400 hover:text-white"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-2">Category</label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                        : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-2">Price (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                  className="bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                  className="bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Color Filter */}
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-2">Color</label>
              <div className="flex flex-wrap gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(selectedColor === c ? '' : c)}
                    className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                      selectedColor === c
                        ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold'
                        : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Material Filter */}
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-2">Shell Material</label>
              <div className="flex flex-wrap gap-1.5">
                {materials.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMaterial(selectedMaterial === m ? '' : m)}
                    className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                      selectedMaterial === m
                        ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold'
                        : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* In stock only toggle */}
            <div className="pt-2 border-t border-stone-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span>In Stock items only</span>
              </label>
            </div>

            <button
              onClick={handleApplyFilters}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
            >
              Apply Filters
            </button>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-stone-900 rounded-xl h-80 border border-stone-800"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-stone-900/30 border border-stone-800/80 rounded-2xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">No Matching Luggage Pieces Found</h3>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  Try clearing your filters or search keywords to view the broader Shakil Bag Store collection.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase rounded-lg"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod._id} product={prod} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
