import React from 'react';
import { Heart, ShoppingBag, Star, Shield, ArrowUpRight } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, param?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addToCart, wishlist, toggleWishlist, formatPrice } = useStore();
  const isWishlisted = wishlist.includes(product._id);
  const inStock = product.stockQuantity > 0;
  const isLowStock = inStock && product.stockQuantity <= product.lowStockThreshold;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inStock) {
      addToCart(product, 1);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  return (
    <div
      onClick={() => onNavigate('product', product.slug)}
      className="group relative bg-stone-900/60 border border-stone-800/80 hover:border-amber-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-950/20 cursor-pointer flex flex-col"
    >
      {/* Visual Thumbnail & Badges */}
      <div className="relative aspect-[4/3] sm:aspect-square w-full bg-stone-950 overflow-hidden">
        <img
          src={product.thumbnail || product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.salePrice && product.discountPercentage ? (
            <span className="bg-amber-500 text-stone-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider shadow">
              {product.discountPercentage}% OFF
            </span>
          ) : null}
          {product.isBestSeller && (
            <span className="bg-stone-950/90 border border-amber-400/40 text-amber-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider backdrop-blur-sm">
              Best Seller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider backdrop-blur-sm">
              New Arrival
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`btn-wishlist-toggle-${product._id}`}
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isWishlisted
              ? 'bg-rose-500 text-white shadow-md shadow-rose-950/50 scale-105'
              : 'bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800 hover:scale-105'
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          title={isWishlisted ? "Saved in Wishlist (Click to remove)" : "Save to Wishlist"}
        >
          <Heart className={`w-4 h-4 transition-transform ${isWishlisted ? 'fill-current text-white scale-105' : ''}`} />
        </button>

        {/* Stock status overlay if out of stock */}
        {!inStock && (
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center">
            <span className="px-3 py-1 bg-stone-800 border border-stone-700 text-stone-300 text-xs uppercase font-bold tracking-widest rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="uppercase tracking-wider text-[10px] text-amber-400/90 font-medium">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-semibold text-stone-200">{product.rating}</span>
              <span className="text-[10px] text-stone-500">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Micro Specs Badge */}
          <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">
            {product.material} • {product.size}
          </p>
        </div>

        {/* Pricing and Action */}
        <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                {formatPrice(product.salePrice || product.price)}
              </span>
              {product.salePrice && (
                <span className="text-xs text-stone-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            {isLowStock ? (
              <span className="text-[10px] text-amber-400 font-medium block">
                Only {product.stockQuantity} left
              </span>
            ) : inStock ? (
              <span className="text-[10px] text-emerald-400/80 font-medium block">In Stock</span>
            ) : null}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              inStock
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm active:scale-95'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed'
            }`}
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
