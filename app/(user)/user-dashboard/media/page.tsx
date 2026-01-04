"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Minimize,
  Maximize,
  X,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Wifi,
  WifiOff,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateProductSortOrder } from "@/app/(admin)/dashboard/products/actions";
import { SkeletonImageGrid } from "@/components/ui/Skeleton";
import { usePWA, useImagePreloader } from "@/lib/hooks/usePWA";

// Hide scrollbar but keep functionality
const globalStyles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [images, setImages] = useState<ProductImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // PWA hooks
  const { isOnline } = usePWA();
  const { isPreloading, preloadProgress, clearOldCache } = useImagePreloader(
    images.map((img) => img.image_url)
  );

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
    // Auto enter fullscreen
    enterFullscreen();

    // Clear old cache on mount (once per day)
    const lastCacheClear = localStorage.getItem("lastCacheClear");
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (!lastCacheClear || now - parseInt(lastCacheClear) > oneDayMs) {
      clearOldCache();
      localStorage.setItem("lastCacheClear", now.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Fetch images after categories are loaded
    if (categories.length > 0) {
      fetchAllImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const enterFullscreen = () => {
    setTimeout(() => {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.log("Fullscreen request failed:", err);
      });
    }, 100);
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("product_categories")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category_id")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      setAllProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchAllImages = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("product_images")
        .select(
          `
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
        `
        )
        .order("created_at", { ascending: false });

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

      // Don't set a default image - keep it null to show the dashboard GIF
      // Home category will be selected by default
      if (transformedImages.length > 0 && categories.length > 0) {
        const homeCategory = categories.find(
          (cat) => cat.name.trim().toLowerCase() === "home"
        );

        if (homeCategory) {
          setSelectedCategoryId(homeCategory.id);
        }
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProductsForCategory = (categoryId: string): Product[] => {
    // Filter products by category and only include those with images
    return allProducts.filter(
      (product) =>
        product.category_id === categoryId &&
        images.some((img) => img.product_id === product.id)
    );
  };

  const handleCategoryClick = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    const isHome = category?.name?.trim().toLowerCase() === "home";

    if (isHome) {
      setSelectedCategoryId(categoryId);
      // Reset to show the dashboard GIF
      setCurrentImageIndex(null);
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
    const imageIndex = images.findIndex((img) => img.product_id === productId);
    if (imageIndex !== -1) {
      setCurrentImageIndex(imageIndex);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (currentImageIndex !== null && selectedCategoryId) {
      // Get filtered images for current category
      const categoryImages = images.filter(
        (img) => img.category_id === selectedCategoryId
      );
      const currentIndexInCategory = categoryImages.findIndex(
        (img) => img.id === images[currentImageIndex].id
      );

      if (isLeftSwipe) {
        // Moving to next image
        if (currentIndexInCategory < categoryImages.length - 1) {
          // Next image in same category
          const nextGlobalIndex = images.findIndex(
            (img) => img.id === categoryImages[currentIndexInCategory + 1].id
          );
          setCurrentImageIndex(nextGlobalIndex);
        } else {
          // At end of category, go to next category
          const currentCategoryIndex = categories.findIndex(
            (cat) => cat.id === selectedCategoryId
          );
          if (currentCategoryIndex < categories.length - 1) {
            const nextCategoryId = categories[currentCategoryIndex + 1].id;
            const nextCategoryImages = images.filter(
              (img) => img.category_id === nextCategoryId
            );
            if (nextCategoryImages.length > 0) {
              setSelectedCategoryId(nextCategoryId);
              const firstImageIndex = images.findIndex(
                (img) => img.id === nextCategoryImages[0].id
              );
              setCurrentImageIndex(firstImageIndex);
            }
          }
        }
      }

      if (isRightSwipe) {
        // Moving to previous image
        if (currentIndexInCategory > 0) {
          // Previous image in same category
          const prevGlobalIndex = images.findIndex(
            (img) => img.id === categoryImages[currentIndexInCategory - 1].id
          );
          setCurrentImageIndex(prevGlobalIndex);
        } else {
          // At start of category, go to previous category
          const currentCategoryIndex = categories.findIndex(
            (cat) => cat.id === selectedCategoryId
          );
          if (currentCategoryIndex > 0) {
            const prevCategoryId = categories[currentCategoryIndex - 1].id;
            const prevCategoryImages = images.filter(
              (img) => img.category_id === prevCategoryId
            );
            if (prevCategoryImages.length > 0) {
              setSelectedCategoryId(prevCategoryId);
              const lastImageIndex = images.findIndex(
                (img) =>
                  img.id ===
                  prevCategoryImages[prevCategoryImages.length - 1].id
              );
              setCurrentImageIndex(lastImageIndex);
            }
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

  const currentImage =
    currentImageIndex !== null ? images[currentImageIndex] : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <div
        ref={containerRef}
        className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden touch-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Exit Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50 p-2 sm:p-2.5 md:p-3 rounded-full bg-gray-900/80 backdrop-blur-sm hover:bg-gray-900/90 transition-all shadow-lg"
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
          ) : (
            <Maximize className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
          )}
        </button>

        {/* Online/Offline Indicator */}
        <div className="absolute top-3 right-16 sm:top-4 sm:right-20 md:top-6 md:right-24 z-50">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-sm transition-all shadow-lg ${
              isOnline
                ? "bg-green-500/80 text-white"
                : "bg-red-500/80 text-white"
            }`}
          >
            {isOnline ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span className="hidden sm:inline text-xs font-medium">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {/* Preloading Indicator */}
        {isPreloading && (
          <div className="absolute top-16 right-3 sm:top-20 sm:right-4 md:top-24 md:right-6 z-50">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-500/80 backdrop-blur-sm text-white shadow-lg">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">{preloadProgress}%</span>
            </div>
          </div>
        )}

        {/* Back Button */}
        <Link
          href="/user-dashboard"
          className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-6 md:left-6 z-50 p-2 sm:p-2.5 md:p-3 rounded-full bg-gray-900/80 backdrop-blur-sm hover:bg-gray-900/90 transition-all flex items-center gap-2 text-white shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          <span className="hidden sm:inline text-sm font-medium">Back</span>
        </Link>

        {/* Main Content Area - Fullscreen */}
        <div className="relative w-full h-[calc(100vh-60px)] sm:h-[calc(100vh-65px)] md:h-[calc(100vh-70px)] flex items-center justify-center overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-4xl px-4">
                <SkeletonImageGrid />
              </div>
              <p className="text-white mt-4 text-sm sm:text-base md:text-lg">
                Loading media...
              </p>
            </div>
          ) : currentImageIndex === null || currentImage === null ? (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <div className="relative w-full h-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl">
                <Image
                  src="/dashboard-logo.gif"
                  alt="Dailishaw"
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 70vw, 60vw"
                />
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-full h-full max-h-full">
                <Image
                  src={currentImage.image_url}
                  alt={currentImage.product_name}
                  fill
                  className="object-contain"
                  priority
                  sizes="100vw"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Category & Product Bar */}
        {isFullscreen ? (
          /* Fullscreen Mode - Buttons directly on image */
          <div className="absolute bottom-0 left-0 right-0 z-30 bg-white/20 backdrop-blur-md border-t border-white/30">
            <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 overflow-x-auto px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 scrollbar-hide">
              {categories.map((category) => {
                const isHome = category.name.trim().toLowerCase() === "home";
                const categoryProducts = isHome
                  ? []
                  : getProductsForCategory(category.id);
                return (
                  <div
                    key={category.id}
                    className="flex items-center gap-1.5 sm:gap-2"
                  >
                    <button
                      onClick={() => handleCategoryClick(category.id)}
                      className={`px-4 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5 rounded-full whitespace-nowrap font-bold text-xs sm:text-sm md:text-base transition-all shadow-lg ${
                        selectedCategoryId === category.id
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                          : "bg-white/80 text-gray-900 hover:bg-white"
                      }`}
                    >
                      {category.name}
                    </button>

                    {/* Product Buttons - Show inline when this category is selected */}
                    {selectedCategoryId === category.id &&
                      !isHome &&
                      categoryProducts.length > 0 && (
                        <>
                          {categoryProducts.map((product) => {
                            const isActiveProduct =
                              currentImage?.product_id === product.id;
                            return (
                              <button
                                key={product.id}
                                onClick={() => handleProductClick(product.id)}
                                className={`px-3 py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 rounded-lg font-medium text-[10px] sm:text-xs md:text-sm transition-all shadow-md whitespace-nowrap ${
                                  isActiveProduct
                                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                                    : "bg-white/70 text-gray-900 hover:bg-white/90"
                                }`}
                              >
                                {product.name}
                              </button>
                            );
                          })}
                        </>
                      )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Normal Mode - With white bar */
          <div className="absolute bottom-0 left-0 right-0 bg-white/98 backdrop-blur-lg shadow-2xl z-30 border-t-2 border-gray-200">
            <div className="px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                {categories.map((category) => {
                  const isHome = category.name.trim().toLowerCase() === "home";
                  const categoryProducts = isHome
                    ? []
                    : getProductsForCategory(category.id);
                  return (
                    <div
                      key={category.id}
                      className="flex items-center gap-1.5 sm:gap-2"
                    >
                      <button
                        onClick={() => handleCategoryClick(category.id)}
                        className={`px-4 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5 rounded-full whitespace-nowrap font-bold text-xs sm:text-sm md:text-base transition-all shadow-lg ${
                          selectedCategoryId === category.id
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {category.name}
                      </button>

                      {/* Product Buttons - Show inline when this category is selected */}
                      {selectedCategoryId === category.id &&
                        !isHome &&
                        categoryProducts.length > 0 && (
                          <>
                            {categoryProducts.map((product) => {
                              const isActiveProduct =
                                currentImage?.product_id === product.id;
                              return (
                                <button
                                  key={product.id}
                                  onClick={() => handleProductClick(product.id)}
                                  className={`px-3 py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 rounded-lg font-medium text-[10px] sm:text-xs md:text-sm transition-all shadow-md whitespace-nowrap ${
                                    isActiveProduct
                                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                                      : "bg-white text-gray-700 hover:bg-gray-50"
                                  }`}
                                >
                                  {product.name}
                                </button>
                              );
                            })}
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
