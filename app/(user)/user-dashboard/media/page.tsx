'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BellIcon,
  ChevronDownIcon,
  SearchIcon,
  MenuIcon,
  ChevronLeftIcon,
  LogOutIcon,
  PlayCircle,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/Avatar';
import { logoutAction } from '@/app/actions/logout';
import { createClient } from '@/lib/supabase/client';

const navigationItems = [
  {
    icon: PlayCircle,
    label: 'Media Viewer',
    active: true,
    href: '/user-dashboard/media',
  },
  {
    icon: TrendingUp,
    label: 'Expense Management',
    active: false,
    href: '/user-dashboard/expenses',
  },
];

interface Category {
  id: string;
  name: string;
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState<ProductImage | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchImages();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchImages();
    }
  }, [selectedCategoryId]);

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

  const fetchImages = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Fetch products with their images and category info
      let query = supabase
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
        .order('created_at', { ascending: false });

      // Filter by category if not "all"
      if (selectedCategoryId !== 'all') {
        query = query.eq('products.category_id', selectedCategoryId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data
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

  const openFullscreen = (image: ProductImage, index: number) => {
    setFullscreenImage(image);
    setCurrentImageIndex(index);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!fullscreenImage) return;
    
    const newIndex = direction === 'prev' 
      ? (currentImageIndex - 1 + images.length) % images.length
      : (currentImageIndex + 1) % images.length;
    
    setCurrentImageIndex(newIndex);
    setFullscreenImage(images[newIndex]);
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  const filteredImages = selectedCategoryId === 'all' 
    ? images 
    : images.filter(img => img.category_id === selectedCategoryId);

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50
        w-[264px] bg-white flex-shrink-0 flex flex-col h-screen overflow-hidden
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <Link href="/user-dashboard" className="relative w-[200px] h-[80px] cursor-pointer">
            <Image
              src="/dashboard-logo.gif"
              alt="Dailishaw Logo"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        <nav className="mt-8 flex-1">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-4 cursor-pointer transition-colors ${
                item.active
                  ? 'bg-[#f9831b1a] border-l-4 border-[#f9831b]'
                  : 'hover:bg-gray-50'
              }`}
            >
              <item.icon
                className={`w-6 h-6 ${
                  item.active ? 'text-[#f9831b]' : 'text-[#5d5d5d]'
                }`}
              />
              <span
                className={`font-['Inter',Helvetica] font-normal text-base ${
                  item.active ? 'text-[#f9831b]' : 'text-[#5d5d5d]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOutIcon className="w-6 h-6 text-[#5d5d5d]" />
            <span className="font-['Inter',Helvetica] font-normal text-base text-[#5d5d5d]">
              Logout
            </span>
          </button>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col w-full transition-all duration-300 ${sidebarOpen ? 'lg:ml-[264px]' : 'ml-0'}`}>
        <header className="h-20 bg-white shadow-[0px_2px_4px_#d9d9d940] flex items-center px-4 lg:px-6 gap-3 lg:gap-6">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <MenuIcon className="w-6 h-6 text-gray-900" />
            </button>
          )}

          <h1 className="font-['Inter',Helvetica] font-medium text-black text-xl lg:text-[32px] whitespace-nowrap">
            Media Viewer
          </h1>

          <div className="hidden md:flex flex-1 max-w-[327px] relative ml-6">
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search media..."
                className="w-full h-[41px] pl-12 pr-4 bg-white rounded-[10px] border border-black font-['Inter',Helvetica] font-medium text-[15px] placeholder:text-[#b8b3b3]"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 lg:gap-6">
            <BellIcon className="w-5 h-5 lg:w-6 lg:h-6 cursor-pointer text-gray-900" />

            <div className="hidden sm:flex items-center gap-3 cursor-pointer">
              <Avatar className="w-[30px] h-[30px]">
                <AvatarImage src="/ellipse-1.svg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline font-['Inter',Helvetica] font-normal text-black text-[15px] whitespace-nowrap">
                User
              </span>
              <ChevronDownIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-900" />
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col p-4 lg:p-6">
          {/* Image Gallery */}
          <div className="flex-1 overflow-y-auto mb-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f9831b]"></div>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <PlayCircle className="w-24 h-24 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No media available</h3>
                <p className="text-gray-500">
                  {selectedCategoryId === 'all' 
                    ? 'No media has been uploaded yet' 
                    : 'No media in this category'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredImages.map((image, index) => (
                  <div
                    key={image.id}
                    onClick={() => openFullscreen(image, index)}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-gray-100"
                  >
                    <Image
                      src={image.image_url}
                      alt={image.product_name}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-end p-3">
                      <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <p className="font-semibold text-sm">{image.product_name}</p>
                        <p className="text-xs opacity-80">{image.category_name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter - Bottom Bar */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                  selectedCategoryId === 'all'
                    ? 'bg-[#f9831b] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                    selectedCategoryId === category.id
                      ? 'bg-[#f9831b] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center">
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
          >
            <X className="w-8 h-8 text-white" />
          </button>

          <button
            onClick={() => navigateImage('prev')}
            className="absolute left-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>

          <button
            onClick={() => navigateImage('next')}
            className="absolute right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>

          <div className="relative w-full h-full max-w-6xl max-h-[90vh] p-8">
            <div className="relative w-full h-full">
              <Image
                src={fullscreenImage.image_url}
                alt={fullscreenImage.product_name}
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
              <h2 className="text-white text-2xl font-semibold mb-1">
                {fullscreenImage.product_name}
              </h2>
              <p className="text-white text-lg opacity-80">
                {fullscreenImage.category_name}
              </p>
              <p className="text-white text-sm opacity-60 mt-2">
                {currentImageIndex + 1} / {images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
