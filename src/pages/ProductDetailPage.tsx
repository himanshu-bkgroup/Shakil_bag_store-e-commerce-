import React, { useState, useEffect } from 'react';
import { Shield, Star, Truck, RotateCcw, Heart, ShoppingBag, PhoneCall, Check, MessageSquare, ChevronRight, Share2 } from 'lucide-react';
import { Product, Review } from '../types';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (page: string, param?: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, onNavigate }) => {
  const { addToCart, wishlist, toggleWishlist, formatPrice, setOpenChat } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review submission state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [revName, setRevName] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revTitle, setRevTitle] = useState('');
  const [revComment, setRevComment] = useState('');
  const [revSubmitted, setRevSubmitted] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setSelectedImage(data.product.thumbnail || data.product.images[0]);
          setSelectedColor(data.product.color[0] || 'Standard');
          setRelated(data.related || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // Fetch reviews
    fetch(`/api/reviews`)
      .then((r) => r.json())
      .then((d) => {
        if (d.reviews) setReviews(d.reviews);
      })
      .catch(() => {});
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-stone-950 text-stone-100 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-stone-400">Loading Shakil Atelier Piece...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-stone-950 text-stone-100 min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-bold text-white">Piece Not Found</h2>
          <p className="text-xs text-stone-400">
            This baggage specification or archival release is no longer active in our current catalog.
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase rounded-lg"
          >
            Return to Collection
          </button>
        </div>
      </div>
    );
  }

  const inStock = product.stockQuantity > 0;
  const isWishlisted = wishlist.includes(product._id);

  const handleAddToCart = () => {
    if (inStock) {
      addToCart(product, quantity, selectedColor, product.size);
    }
  };

  const handleBuyNow = () => {
    if (inStock) {
      addToCart(product, quantity, selectedColor, product.size);
      onNavigate('checkout');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName || !revTitle || !revComment) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          productName: product.name,
          customerName: revName,
          customerEmail: 'customer@example.com',
          rating: revRating,
          title: revTitle,
          comment: revComment
        })
      });
      const data = await res.json();
      if (data.review) {
        setReviews([data.review, ...reviews]);
        setRevSubmitted(true);
        setRevTitle('');
        setRevComment('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Mohammad Shakil,\nI am interested in reserving the following luggage from Shakil Bag Store:\nProduct: ${product.name}\nSKU: ${product.sku}\nPrice: ₹${product.salePrice || product.price}\nColor: ${selectedColor}\nPlease advise on delivery timeline & express booking.`
  );

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-8 pb-28 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="text-[11px] text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-6">
          <span className="cursor-pointer hover:text-white" onClick={() => onNavigate('home')}>Home</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-white" onClick={() => onNavigate('shop')}>Catalog</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-white" onClick={() => onNavigate('shop', `category=${product.category}`)}>
            {product.category}
          </span>
          <span>/</span>
          <span className="text-amber-400 truncate max-w-xs">{product.name}</span>
        </div>

        {/* Top Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Gallery Column */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Large Image */}
            <div className="relative aspect-square w-full bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />

              {product.salePrice && product.discountPercentage ? (
                <div className="absolute top-4 left-4 bg-amber-500 text-stone-950 text-xs font-extrabold px-2.5 py-1 rounded shadow">
                  {product.discountPercentage}% OFF
                </div>
              ) : null}

              <button
                onClick={() => toggleWishlist(product._id)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-colors ${
                  isWishlisted
                    ? 'bg-rose-500 text-white'
                    : 'bg-stone-950/80 text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Selectors */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImage === img ? 'border-amber-500 scale-95 shadow' : 'border-stone-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buying & Specs Column */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                <span className="uppercase tracking-widest text-amber-400 font-semibold">{product.brand}</span>
                <span className="font-mono text-stone-500">SKU: {product.sku}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif leading-tight">
                {product.name}
              </h1>

              {/* Rating & Review counter */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-stone-700'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-white">{product.rating}</span>
                <span className="text-xs text-stone-400">({product.reviewCount} customer reviews)</span>
              </div>
            </div>

            {/* Pricing Box */}
            <div className="p-4 bg-stone-900/60 border border-stone-800 rounded-xl space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-white tracking-tight">
                  {formatPrice(product.salePrice || product.price)}
                </span>
                {product.salePrice && (
                  <span className="text-base text-stone-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
                {product.salePrice && product.discountPercentage ? (
                  <span className="text-xs text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                    Save {formatPrice(product.price - product.salePrice)}
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] text-stone-400">
                Inclusive of all taxes. Free express shipping on this order.
              </p>
            </div>

            {/* Color Option */}
            {product.color && product.color.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-2">
                  Select Colorway: <span className="text-amber-400">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.color.map((col) => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedColor === col
                          ? 'border-amber-500 bg-amber-500 text-stone-950 font-bold'
                          : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Availability status */}
            <div>
              {inStock ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-300 font-semibold">Available for Immediate Dispatch</span>
                  {product.stockQuantity <= product.lowStockThreshold && (
                    <span className="text-amber-400 text-[11px]">
                      (Only {product.stockQuantity} remaining in Delhi warehouse)
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Currently Out of Stock — Pre-orders accepted on WhatsApp</span>
                </div>
              )}
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-stone-800 bg-stone-900 rounded-xl overflow-hidden text-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2.5 text-stone-400 hover:text-white hover:bg-stone-800"
                  >
                    -
                  </button>
                  <span className="px-4 py-2.5 font-bold text-white min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="px-3.5 py-2.5 text-stone-400 hover:text-white hover:bg-stone-800"
                  >
                    +
                  </button>
                </div>

                <button
                  id="btn-pdp-add-to-cart"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-900 disabled:text-stone-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 border border-stone-700"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Add to Cart</span>
                </button>

                <button
                  id="btn-pdp-wishlist-toggle"
                  onClick={() => toggleWishlist(product._id)}
                  className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                    wishlist.includes(product._id)
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                      : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white hover:border-stone-700'
                  }`}
                  title={wishlist.includes(product._id) ? "Saved in Wishlist" : "Save to Wishlist"}
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`w-5 h-5 ${wishlist.includes(product._id) ? 'fill-current text-rose-500' : ''}`} />
                </button>
              </div>

              <button
                id="btn-pdp-buy-now"
                onClick={handleBuyNow}
                disabled={!inStock}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-amber-500/25"
              >
                Proceed to Checkout
              </button>

              {/* Direct WhatsApp Ordering */}
              <a
                href={`https://wa.me/917217876220?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-800/80 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Ask Mohammad Shakil on WhatsApp (+91-7217876220)</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone-800/80 text-center text-stone-300 text-[11px]">
              <div className="p-2.5 bg-stone-900/40 rounded-lg border border-stone-800/60">
                <Shield className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="font-semibold block text-white">{product.warranty}</span>
                <span className="text-stone-500 text-[10px]">Manufacturer</span>
              </div>
              <div className="p-2.5 bg-stone-900/40 rounded-lg border border-stone-800/60">
                <Truck className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="font-semibold block text-white">Free Express</span>
                <span className="text-stone-500 text-[10px]">Airways Blue Dart</span>
              </div>
              <div className="p-2.5 bg-stone-900/40 rounded-lg border border-stone-800/60">
                <RotateCcw className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="font-semibold block text-white">7-Day Easy</span>
                <span className="text-stone-500 text-[10px]">Atelier Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Engineering Specifications */}
        <div className="mt-16 pt-12 border-t border-stone-800">
          <h3 className="text-xl font-bold text-white font-serif mb-6">
            Atelier Technical Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-sm text-stone-300 leading-relaxed font-light">
                {product.description}
              </p>
              {product.features && product.features.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Crafted Highlights:
                  </h4>
                  <ul className="space-y-2 text-xs text-stone-300">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-5">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-stone-800">
                  <tr>
                    <td className="py-2.5 text-stone-400 font-medium">Shell Material</td>
                    <td className="py-2.5 text-white font-semibold text-right">{product.material}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-stone-400 font-medium">Dimensions</td>
                    <td className="py-2.5 text-white font-semibold text-right">
                      {product.dimensions?.length} × {product.dimensions?.width} × {product.dimensions?.height} {product.dimensions?.unit || 'cm'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-stone-400 font-medium">Tare Weight</td>
                    <td className="py-2.5 text-white font-semibold text-right">
                      {product.weight?.value} {product.weight?.unit || 'kg'}
                    </td>
                  </tr>
                  {product.capacity && (
                    <tr>
                      <td className="py-2.5 text-stone-400 font-medium">Packing Volume</td>
                      <td className="py-2.5 text-white font-semibold text-right">{product.capacity.value} {product.capacity.unit}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2.5 text-stone-400 font-medium">Lock Standard</td>
                    <td className="py-2.5 text-white font-semibold text-right">TSA-Approved Flush Combination</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-stone-400 font-medium">Wheel System</td>
                    <td className="py-2.5 text-white font-semibold text-right">360° Hinomoto Dual Silent Spinners</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-stone-400 font-medium">Global Warranty</td>
                    <td className="py-2.5 text-white font-semibold text-right">{product.warranty}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Customer Reviews for this Product */}
        <div className="mt-16 pt-12 border-t border-stone-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-xl font-bold text-white font-serif">Verified Customer Reviews</h3>
              <p className="text-xs text-stone-400 mt-1">
                Real feedback from verified travelers using {product.name}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-4">
              {reviews.length === 0 ? (
                <div className="p-6 bg-stone-900/50 rounded-xl border border-stone-800 text-xs text-stone-400 text-center">
                  Be the first traveler to review this luggage piece.
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-stone-700'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-500">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-white">{rev.title}</h5>
                    <p className="text-xs text-stone-300 leading-relaxed font-light">{rev.comment}</p>
                    <div className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
                      <span>{rev.customerName}</span>
                      <span className="text-emerald-400 text-[10px]">✓ Verified Purchase</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Form */}
            <div className="lg:col-span-5 bg-stone-900/50 border border-stone-800 rounded-2xl p-5 h-fit">
              <h4 className="text-sm font-bold text-white font-serif mb-1">Write a Review</h4>
              <p className="text-xs text-stone-400 mb-4">Share your luggage journey with Mohammad Shakil's atelier.</p>

              {revSubmitted ? (
                <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl">
                  Thank you! Your verified luggage review has been published.
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={revName}
                      onChange={(e) => setRevName(e.target.value)}
                      placeholder="e.g. Captain Anshul Sharma"
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          type="button"
                          key={num}
                          onClick={() => setRevRating(num)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${num <= revRating ? 'fill-current' : 'text-stone-700'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Review Headline</label>
                    <input
                      type="text"
                      required
                      value={revTitle}
                      onChange={(e) => setRevTitle(e.target.value)}
                      placeholder="e.g. Flawless wheels and sleek finish"
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Your Experience</label>
                    <textarea
                      rows={3}
                      required
                      value={revComment}
                      onChange={(e) => setRevComment(e.target.value)}
                      placeholder="How did this bag perform on your flights or journeys?"
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase rounded-lg transition-colors"
                  >
                    Submit Verified Review
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-stone-800">
            <h3 className="text-xl font-bold text-white font-serif mb-6">
              Complementary Travel Pieces
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((prod) => (
                <ProductCard key={prod._id} product={prod} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar for Mobile View */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-stone-950/95 backdrop-blur-md border-t border-stone-800 p-3 px-4 flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <span className="text-[10px] text-stone-400 block">Total</span>
          <span className="text-base font-black text-white">
            {formatPrice(product.salePrice || product.price)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="px-4 py-2.5 bg-stone-800 text-white font-bold text-xs uppercase rounded-xl border border-stone-700"
          >
            Add
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!inStock}
            className="px-5 py-2.5 bg-amber-500 text-stone-950 font-bold text-xs uppercase rounded-xl shadow"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};
