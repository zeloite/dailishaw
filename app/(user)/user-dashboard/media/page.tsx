'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Minimize,
  Maximize,
  ArrowLeft,
  RotateCw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Hide scrollbar but keep functionality
const globalStyles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  :root, html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
    min-height: 100vh;
    min-width: 100vw;
    background: black;
    color: white;
  }
  
  /* Force landscape mode */
  @media (orientation: portrait) {
    html {
      transform: rotate(90deg);
      transform-origin: left top;
      width: 100vh !important;
      height: 100vw !important;
      position: absolute;
      top: 100%;
      left: 0;
    }
  }
`;

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  category_id: string;
  sort_order?: number;
}

interface ProductImage {
  id: string;
  image_url: string;
  product_id: string;
  product_name: string;
  category_id: string;
  category_name: string;
}

export default function UserMediaPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [orientationLocked, setOrientationLocked] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  
  // Zoom state
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [singleTouchStart, setSingleTouchStart] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
    fetchAllImages();
    // Auto enter fullscreen and lock orientation
    setTimeout(() => {
      enterFullscreen();
      lockOrientation();
    }, 100);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Reset zoom when image changes
  useEffect(() => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
    setIsZooming(false);
  }, [currentImageIndex]);

  const enterFullscreen = async () => {
    try {
      if (containerRef.current) {
        await containerRef.current.requestFullscreen();
      }
    } catch (err) {
      console.log('Fullscreen request failed:', err);
    }
  };

  const lockOrientation = async () => {
    try {
      // Try screen orientation lock (works in Chrome/Android)
      const screenAny = screen as any;
      if (screenAny.orientation && 'lock' in screenAny.orientation) {
        await (screenAny.orientation as any).lock('landscape');
        setOrientationLocked(true);
      } else if (screenAny.lockOrientation) {
        // Legacy API
        screenAny.lockOrientation('landscape');
        setOrientationLocked(true);
      } else if (screenAny.mozLockOrientation) {
        screenAny.mozLockOrientation('landscape');
        setOrientationLocked(true);
      } else if (screenAny.msLockOrientation) {
        screenAny.msLockOrientation('landscape');
        setOrientationLocked(true);
      }
    } catch (err) {
      console.log('Orientation lock failed:', err);
      setOrientationLocked(false);
    }
  };

  const unlockOrientation = () => {
    try {
      const screenAny = screen as any;
      if (screenAny.orientation && 'unlock' in screenAny.orientation) {
        (screenAny.orientation as any).unlock();
      }
      setOrientationLocked(false);
    } catch (err) {
      console.log('Orientation unlock failed:', err);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    unlockOrientation();
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
      lockOrientation();
    }
  };

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('product_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category_id, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAllProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchAllImages = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('product_images')
        .select(`
          id,
          image_url,
          product_id,
          products!inner (
            name,
            category_id,
            product_categories!inner (
              name
            )
          )
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const transformedImages = (data || []).map((img: any) => ({
        id: img.id,
        image_url: img.image_url,
        product_id: img.product_id,
        product_name: img.products.name,
        category_id: img.products.category_id,
        category_name: img.products.product_categories.name,
      }));

      setImages(transformedImages);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductsForCategory = (categoryId: string): Product[] => {
    // Filter products by category and only include those with images
    return allProducts
      .filter(product => 
        product.category_id === categoryId &&
        images.some(img => img.product_id === product.id)
      )
      .sort((a, b) => {
        const orderA = a.sort_order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.sort_order ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
      });
  };

  const handleCategoryClick = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const isHome = category?.name?.trim().toLowerCase() === 'home';

    if (isHome) {
      setSelectedCategoryId(categoryId);
      // Jump directly to first image of Home category
      const homeImages = images.filter(img => img.category_id === categoryId);
      if (homeImages.length > 0) {
        const firstIndex = images.findIndex(img => img.id === homeImages[0].id);
        setCurrentImageIndex(firstIndex);
      }
      return;
    }

    if (selectedCategoryId === categoryId) {
      // Collapse if same category clicked
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(categoryId);
    }
  };

  const handleProductClick = (productId: string) => {
    const imageIndex = images.findIndex(img => img.product_id === productId);
    if (imageIndex !== -1) {
      setCurrentImageIndex(imageIndex);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - for panning when zoomed
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
      setSingleTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
    } else if (e.touches.length === 2) {
      // Two finger touch - for pinch zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchDistance(distance);
      setLastTouchDistance(distance);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      // Single touch with zoom - for panning
      e.preventDefault();
      const currentX = e.targetTouches[0].clientX;
      const currentY = e.targetTouches[0].clientY;
      
      if (singleTouchStart) {
        const deltaX = currentX - singleTouchStart.x;
        const deltaY = currentY - singleTouchStart.y;
        setTranslateX(translateX + deltaX);
        setTranslateY(translateY + deltaY);
        setSingleTouchStart({ x: currentX, y: currentY });
      }
    } else if (e.touches.length === 1) {
      // Single touch without zoom - for swiping
      setTouchEnd(e.targetTouches[0].clientX);
    } else if (e.touches.length === 2 && lastTouchDistance !== null) {
      // Two finger touch - for pinch zoom
      e.preventDefault();
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      if (touchDistance !== null) {
        const delta = distance - touchDistance;
        const newScale = Math.max(1, Math.min(4, scale + delta * 0.01));
        setScale(newScale);
        setTouchDistance(distance);
        setIsZooming(newScale > 1);
      }
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    // Reset pan state
    setSingleTouchStart(null);
    
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Function to get the next image index considering product boundaries
    const getNextImageIndex = (currentIndex: number): number | null => {
      if (currentIndex === null || currentIndex >= images.length - 1) return null;
      
      const current = images[currentIndex];
      const next = images[currentIndex + 1];
      
      // If next image is in the same product, return next index
      if (next && next.product_id === current.product_id) {
        return currentIndex + 1;
      }
      
      // If next image is in the next product but same category
      if (next && next.category_id === current.category_id) {
        return currentIndex + 1;
      }
      
      // If next image is in the next category
      return currentIndex + 1;
    };

    // Function to get the previous image index considering product boundaries
    const getPreviousImageIndex = (currentIndex: number): number | null => {
      if (currentIndex === null || currentIndex <= 0) return null;
      
      const current = images[currentIndex];
      const prev = images[currentIndex - 1];
      
      // If previous image is in the same product, return previous index
      if (prev && prev.product_id === current.product_id) {
        return currentIndex - 1;
      }
      
      // If previous image is in the previous product but same category
      if (prev && prev.category_id === current.category_id) {
        return currentIndex - 1;
      }
      
      // If previous image is in the previous category
      return currentIndex - 1;
    };

    // Function to get the first image index of the next product
    const getNextProductFirstImageIndex = (currentIndex: number): number | null => {
      if (currentIndex === null) return null;
      
      const current = images[currentIndex];
      const currentProductIndex = allProducts.findIndex(p => p.id === current.product_id);
      
      // If no more products in current category, go to next category
      const currentCategoryIndex = categories.findIndex(c => c.id === current.category_id);
      if (currentProductIndex === allProducts.length - 1 || currentProductIndex === -1) {
        // No more products in current category
        if (currentCategoryIndex < categories.length - 1) {
          // Go to next category
          const nextCategoryId = categories[currentCategoryIndex + 1].id;
          const nextCategoryImages = images.filter(img => img.category_id === nextCategoryId);
          return nextCategoryImages.length > 0 ? 
            images.findIndex(img => img.id === nextCategoryImages[0].id) : null;
        }
        return null;
      }
      
      // Look for next product in same category
      const nextProduct = allProducts
        .filter(p => p.category_id === current.category_id)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .find((p, i, arr) => {
          const currentIdx = arr.findIndex(x => x.id === current.product_id);
          return i > currentIdx;
        });
      
      if (nextProduct) {
        const nextProductImages = images.filter(img => img.product_id === nextProduct.id);
        return nextProductImages.length > 0 ? 
          images.findIndex(img => img.id === nextProductImages[0].id) : null;
      }
      
      // If no more products in category, go to next category
      if (currentCategoryIndex < categories.length - 1) {
        const nextCategoryId = categories[currentCategoryIndex + 1].id;
        const nextCategoryImages = images.filter(img => img.category_id === nextCategoryId);
        return nextCategoryImages.length > 0 ? 
          images.findIndex(img => img.id === nextCategoryImages[0].id) : null;
      }
      
      return null;
    };

    // Function to get the last image index of the previous product
    const getPreviousProductLastImageIndex = (currentIndex: number): number | null => {
      if (currentIndex === null) return null;
      
      const current = images[currentIndex];
      const currentProductIndex = allProducts.findIndex(p => p.id === current.product_id);
      
      // If no previous products in current category, go to previous category
      const currentCategoryIndex = categories.findIndex(c => c.id === current.category_id);
      if (currentProductIndex === 0 || currentProductIndex === -1) {
        // Go to previous category
        if (currentCategoryIndex > 0) {
          const prevCategoryId = categories[currentCategoryIndex - 1].id;
          const prevCategoryImages = images.filter(img => img.category_id === prevCategoryId);
          return prevCategoryImages.length > 0 ? 
            images.findIndex(img => img.id === prevCategoryImages[prevCategoryImages.length - 1].id) : null;
        }
        return null;
      }
      
      // Look for previous product in same category
      const previousProduct = allProducts
        .filter(p => p.category_id === current.category_id)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .reverse()
        .find((p, i, arr) => {
          const currentIdx = arr.findIndex(x => x.id === current.product_id);
          return i > currentIdx;
        });
      
      if (previousProduct) {
        const previousProductImages = images.filter(img => img.product_id === previousProduct.id);
        return previousProductImages.length > 0 ? 
          images.findIndex(img => img.id === previousProductImages[previousProductImages.length - 1].id) : null;
      }
      
      // If no previous products in category, go to previous category
      if (currentCategoryIndex > 0) {
        const prevCategoryId = categories[currentCategoryIndex - 1].id;
        const prevCategoryImages = images.filter(img => img.category_id === prevCategoryId);
        return prevCategoryImages.length > 0 ? 
          images.findIndex(img => img.id === prevCategoryImages[prevCategoryImages.length - 1].id) : null;
      }
      
      return null;
    };

    if (currentImageIndex !== null && selectedCategoryId) {
      const currentImage = images[currentImageIndex];
      
      if (isLeftSwipe) {
        const nextIndex = getNextImageIndex(currentImageIndex);
        
        if (nextIndex !== null) {
          // Next image in the same product
          setCurrentImageIndex(nextIndex);
        } else {
          // Move to next product or category
          const nextProductFirstImageIndex = getNextProductFirstImageIndex(currentImageIndex);
          if (nextProductFirstImageIndex !== null) {
            setCurrentImageIndex(nextProductFirstImageIndex);
          }
        }
      }

      if (isRightSwipe) {
        const prevIndex = getPreviousImageIndex(currentImageIndex);
        
        if (prevIndex !== null) {
          // Previous image in the same product
          setCurrentImageIndex(prevIndex);
        } else {
          // Move to previous product or category
          const previousProductLastImageIndex = getPreviousProductLastImageIndex(currentImageIndex);
          if (previousProductLastImageIndex !== null) {
            setCurrentImageIndex(previousProductLastImageIndex);
          }
        }
      }
    } else if (currentImageIndex !== null) {
      // No category selected, swipe through all images
      if (isLeftSwipe && currentImageIndex < images.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
      }
      if (isRightSwipe && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1);
      }
    }
  };

  // Double tap to reset zoom
  const handleDoubleTap = (e: React.MouseEvent) => {
    if (scale > 1) {
      setScale(1);
      setTranslateX(0);
      setTranslateY(0);
      setIsZooming(false);
    } else {
      setScale(2);
      setIsZooming(true);
    }
  };

  const currentImage = currentImageIndex !== null ? images[currentImageIndex] : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <div 
        ref={containerRef}
        className="fixed inset-0 w-screen w-[100vw] h-screen bg-black overflow-hidden touch-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
      {/* Fullscreen/Orientation Control Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-14 z-[100] p-2 sm:p-2.5 md:p-3 rounded-full bg-white/60 border border-white/40 backdrop-blur-sm shadow-md hover:bg-white/70 transition-all"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? (
          <Minimize className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-black" />
        ) : (
          <Maximize className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-black" />
        )}
      </button>

      {/* Back Button */}
      <Link
        href="/user-dashboard"
        className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-6 md:left-6 z-[100] p-2 sm:p-2.5 md:p-3 rounded-full bg-white/60 border border-white/40 backdrop-blur-sm shadow-md hover:bg-white/70 transition-all flex items-center gap-2 text-black"
      >
        <ArrowLeft className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-black" />
        <span className="hidden sm:inline text-sm font-medium text-black">Back</span>
      </Link>

      {/* Main Content Area - Fullscreen Image */}
      <div className="absolute inset-0 top-0 bottom-[40px] w-[100vw] h-[calc(100vh-40px)] min-w-[100vw] min-h-0 overflow-hidden bg-black">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-b-4 border-[#f9831b]"></div>
            <p className="text-white mt-4 text-sm sm:text-base md:text-lg">Loading media...</p>
          </div>
        ) : currentImage ? (
          <div 
            ref={imageContainerRef}
            className="w-full h-full cursor-zoom-in relative overflow-hidden"
            onClick={handleDoubleTap as any}
            style={{
              transform: `scale(${scale}) translate(${scale === 1 ? translateX + 23 : translateX}px, ${translateY}px)`,
              transformOrigin: 'center center',
              transition: isZooming ? 'none' : 'transform 0.3s ease-out',
            }}
          >
            <Image
              src={currentImage.image_url}
              alt={currentImage.product_name}
              layout="fill"
              className="w-full h-full object-cover min-w-[100vw] min-h-[100vh]"
              priority
              sizes="100vw"
              quality={100}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl aspect-video">
              <Image
                src="/dashboard-logo.gif"
                alt="Dailishaw"
                layout="fill"
                className="object-contain min-w-[100vw] min-h-[100vh]"
                unoptimized
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 70vw, 60vw"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Category & Product Bar */}
      {isFullscreen ? (
        /* Fullscreen Mode - Buttons below image */
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-sm h-[2.5rem] flex items-center shadow-lg border-t border-white/20 px-1">
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 overflow-x-auto px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2.5 scrollbar-hide">
          {categories.map((category) => {
            const isHome = category.name.trim().toLowerCase() === 'home';
            const categoryProducts = isHome ? [] : getProductsForCategory(category.id);
            return (
              <div key={category.id} className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className={`px-3 py-1 sm:px-3.5 sm:py-1.5 md:px-4 md:py-2 rounded-lg sm:rounded-xl whitespace-nowrap font-semibold text-[11px] sm:text-xs md:text-sm transition-all shadow-xl backdrop-blur-md ${
                    selectedCategoryId === category.id
                      ? 'bg-[#f9831b]/90 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30 active:scale-95'
                  }`}
                >
                  {category.name}
                </button>
                
                {/* Product Buttons - Show inline when this category is selected */}
                {selectedCategoryId === category.id && !isHome && categoryProducts.length > 0 && (
                  <>
                    {categoryProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="px-3 py-1 sm:px-3.5 sm:py-1.5 md:px-4 md:py-2 rounded-lg sm:rounded-xl bg-blue-600/30 backdrop-blur-md text-white font-medium text-[11px] sm:text-xs md:text-sm hover:bg-blue-600/40 active:scale-95 transition-all shadow-xl whitespace-nowrap"
                      >
                        {product.name}
                      </button>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      ) : (
        /* Normal Mode - With black bar */
        <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md shadow-xl z-30">
          <div className="px-2.5 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2.5 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
              {categories.map((category) => {
                const isHome = category.name.trim().toLowerCase() === 'home';
                const categoryProducts = isHome ? [] : getProductsForCategory(category.id);
                return (
                  <div key={category.id} className="flex items-center gap-1 sm:gap-1.5">
                    <button
                      onClick={() => handleCategoryClick(category.id)}
                      className={`px-3 py-1 sm:px-3.5 sm:py-1.5 md:px-4 md:py-2 rounded-lg sm:rounded-xl whitespace-nowrap font-semibold text-[11px] sm:text-xs md:text-sm transition-all shadow-md ${
                        selectedCategoryId === category.id
                          ? 'bg-gradient-to-r from-[#f9831b] to-[#ff9f3d] text-white'
                          : 'bg-black/20 text-white hover:bg-black/30 active:scale-95 border border-white/20 sm:border-2'
                      }`}
                    >
                      {category.name}
                    </button>
                    
                    {/* Product Buttons - Show inline when this category is selected */}
                    {selectedCategoryId === category.id && !isHome && categoryProducts.length > 0 && (
                      <>
                        {categoryProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product.id)}
                            className="px-3 py-1 sm:px-3.5 sm:py-1.5 md:px-4 md:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-blue-600/30 text-white font-medium text-[11px] sm:text-xs md:text-sm hover:from-blue-500/40 hover:to-blue-600/40 active:scale-95 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                          >
                            {product.name}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
