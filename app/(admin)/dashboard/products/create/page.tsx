'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BellIcon,
  ChevronDownIcon,
  SearchIcon,
  MenuIcon,
  ChevronLeftIcon,
  LogOutIcon,
  ArrowLeft,
  Trash2,
  Package,
  FolderOpen,
  Plus,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { logoutAction } from '@/app/actions/logout';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/Dialog';
import { createClient } from '@/lib/supabase/client';
import { updateProductSortOrder, deleteProduct } from '../actions';

const navigationItems = [
  {
    icon: '/ix-user-management.svg',
    label: 'User Management',
    active: false,
    href: '/dashboard/users',
  },
  {
    icon: '/pajamas-media.svg',
    label: 'Media Management',
    active: true,
    href: '/dashboard/categories',
  },
  {
    icon: '/game-icons-expense.svg',
    label: 'Expense Monitoring',
    active: false,
    href: '/dashboard/expenses',
  },
];

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  is_active: boolean;
  created_at: string;
  sort_order?: number;
}

export default function AddProductsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Get category from URL params if available
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      console.log('Setting category from URL:', categoryParam);
      setSelectedCategoryId(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedCategoryId) {
      console.log('Fetching products for category:', selectedCategoryId);
      fetchProducts();
    } else {
      setProducts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId]);

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('product_categories')
        .select('id, name, description')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    if (!selectedCategoryId) return;
    
    setFetchingProducts(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', selectedCategoryId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setFetchingProducts(false);
    }
  };

  const handleMoveProduct = async (productId: string, direction: 'up' | 'down') => {
    try {
      console.log(`Moving product ${productId} ${direction}`);
      const result = await updateProductSortOrder(productId, direction);
      console.log('Move result:', result);
      if (result.success) {
        await fetchProducts();
      } else {
        console.error('Failed to move product:', result);
      }
    } catch (error) {
      console.error('Error moving product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    setProductToDelete({ id: productId, name: productName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setDeletingProduct(true);
      console.log(`Deleting product ${productToDelete.id}`);
      const result = await deleteProduct(productToDelete.id);
      console.log('Delete result:', result);
      if (result.success) {
        setDeleteDialogOpen(false);
        setProductToDelete(null);
        await fetchProducts();
      } else {
        console.error('Failed to delete product:', result);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setDeletingProduct(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedCategoryId) {
      setError('Please select a category');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Check if product name already exists in this category
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', selectedCategoryId)
        .eq('name', productName.trim())
        .single();

      if (existingProduct) {
        setError('Product name already exists in this category');
        setLoading(false);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Insert product
      const { error: insertError } = await supabase
        .from('products')
        .insert([
          {
            category_id: selectedCategoryId,
            name: productName.trim(),
            description: productDescription.trim() || null,
            created_by: user?.id || null,
          },
        ]);

      if (insertError) {
        console.error('Insert error:', insertError);
        setError('Failed to create product');
        setLoading(false);
        return;
      }

      setSuccess('Product added successfully!');
      
      // Refresh products list
      await fetchProducts();
      
      // Clear form
      setProductName('');
      setProductDescription('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);

      setLoading(false);

    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
  };

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
          <Link href="/dashboard" className="relative w-[200px] h-[80px] cursor-pointer">
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
              className="relative flex items-center gap-7 px-8 py-4 cursor-pointer hover:bg-gray-50"
            >
              {item.active && (
                <div className="absolute left-0 top-0 w-1 h-full bg-[#fa841c]" />
              )}
              <div className="relative w-6 h-6">
                <Image 
                  src={item.icon} 
                  alt={item.label} 
                  fill
                  className={item.active ? '[filter:invert(56%)_sepia(89%)_saturate(1821%)_hue-rotate(187deg)_brightness(101%)_contrast(98%)]' : ''}
                />
              </div>
              <span
                className={`font-['Inter',Helvetica] font-normal text-base ${
                  item.active ? 'text-[#6aabfd]' : 'text-[#5d5d5d]'
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

          <Link
            href="/dashboard/categories"
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </Link>

          <h1 className="font-['Inter',Helvetica] font-medium text-black text-xl lg:text-[32px] whitespace-nowrap">
            Add Products
          </h1>

          <div className="ml-auto flex items-center gap-3 lg:gap-6">
            <BellIcon className="w-5 h-5 lg:w-6 lg:h-6 cursor-pointer text-gray-900" />

            <div className="hidden sm:flex items-center gap-3 cursor-pointer">
              <Avatar className="w-[30px] h-[30px]">
                <AvatarImage src="/ellipse-1.svg" alt="Admin" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline font-['Inter',Helvetica] font-normal text-black text-[15px] whitespace-nowrap">
                Admin
              </span>
              <ChevronDownIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-900" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Product Form */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-['Inter',Helvetica] font-semibold text-gray-900 text-xl">
                    Add New Product
                  </h2>
                  <p className="text-sm text-gray-600">
                    Create a product under selected category
                  </p>
                </div>
              </div>
                
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="font-['Inter',Helvetica] font-medium text-gray-900 text-sm"
                    >
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <select
                        id="category"
                        value={selectedCategoryId || ''}
                        onChange={(e) => {
                          console.log('Category changed to:', e.target.value);
                          setSelectedCategoryId(e.target.value);
                        }}
                        required
                        disabled={loading}
                        className="w-full h-12 bg-white rounded-lg border-2 border-gray-200 text-gray-900 px-4 pr-10 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all appearance-none cursor-pointer font-medium"
                      >
                        <option value="">-- Select a category --</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {categories.length === 0 && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                          No categories available.{' '}
                          <Link href="/dashboard/categories/create" className="text-blue-600 hover:underline font-medium">
                            Create one first →
                          </Link>
                        </p>
                      </div>
                    )}
                </div>

                {/* Product Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="productName"
                    className="font-['Inter',Helvetica] font-medium text-gray-900 text-sm"
                  >
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="productName"
                    type="text"
                    placeholder="e.g., P1, ZPTO, etc."
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    disabled={loading || !selectedCategoryId}
                    className="w-full h-12 bg-white rounded-lg border-2 border-gray-200 text-gray-900 px-4 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label
                    htmlFor="productDescription"
                    className="font-['Inter',Helvetica] font-medium text-gray-900 text-sm"
                  >
                    Description <span className="text-gray-400 text-xs">(Optional)</span>
                  </Label>
                  <Textarea
                    id="productDescription"
                    placeholder="Brief description of the product..."
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    disabled={loading || !selectedCategoryId}
                    rows={4}
                    className="w-full bg-white rounded-lg border-2 border-gray-200 text-gray-900 px-4 py-3 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none transition-all"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                    <p className="text-sm text-green-800 font-medium">{success}</p>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  type="submit"
                  disabled={loading || !selectedCategoryId || !productName.trim()}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Product'}
                </Button>
              </form>
            </div>

            {/* Products List */}
            <Card className="bg-white rounded-xl shadow-md border border-gray-100">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-['Inter',Helvetica] font-semibold text-gray-900 text-xl">
                    {selectedCategoryId 
                      ? `Products in ${categories.find(c => c.id === selectedCategoryId)?.name || 'Category'}`
                      : 'Products'}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {products.length} {products.length === 1 ? 'product' : 'products'}
                  </span>
                </div>

                {!selectedCategoryId ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">Select a category</p>
                    <p className="text-gray-400 text-sm">Choose a category to view and add products</p>
                  </div>
                ) : fetchingProducts ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f9831b]"></div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No products yet</p>
                    <p className="text-gray-400 text-sm">Add your first product using the form</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {products.map((product, index) => (
                      <div 
                        key={product.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-base">{product.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        {product.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {new Date(product.created_at).toLocaleDateString()}
                            </span>
                            
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => handleMoveProduct(product.id, 'up')}
                                disabled={index === 0 || fetchingProducts}
                                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Move up"
                              >
                                <ArrowUp className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => handleMoveProduct(product.id, 'down')}
                                disabled={index === products.length - 1 || fetchingProducts}
                                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Move down"
                              >
                                <ArrowDown className="w-4 h-4 text-blue-600" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Link href={`/dashboard/products/images?product=${product.id}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-[#6aabfd] text-[#6aabfd] hover:bg-[#6aabfd] hover:text-white text-xs"
                              >
                                Add Images
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Delete Product Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <h2 className="text-xl font-semibold text-gray-900">Delete Product</h2>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete <span className="font-semibold">'{productToDelete?.name}'</span>?
            </p>
            <p className="text-gray-500 text-sm">
              This action will delete all images associated with this product. This cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingProduct}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteProduct}
              disabled={deletingProduct}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingProduct ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>    </div>
  );
}