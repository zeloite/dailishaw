'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BellIcon,
  ChevronDownIcon,
  SearchIcon,
  MenuIcon,
  ChevronLeftIcon,
  LogOutIcon,
  ArrowLeft,
  Trash2,
  FolderOpen,
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
import { updateCategorySortOrder, getCategories as fetchCategoriesFromServer, deleteCategory } from '../actions';

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
  is_active: boolean;
  created_at: string;
}

export default function CreateCategoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setFetchingCategories(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setFetchingCategories(false);
    }
  };

  const handleMoveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    try {
      console.log(`Moving category ${categoryId} ${direction}`);
      const result = await updateCategorySortOrder(categoryId, direction);
      console.log('Move result:', result);
      if (result.success) {
        await fetchCategories();
      } else {
        console.error('Failed to move category:', result);
      }
    } catch (error) {
      console.error('Error moving category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    setCategoryToDelete({ id: categoryId, name: categoryName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setDeletingCategory(true);
      console.log(`Deleting category ${categoryToDelete.id}`);
      const result = await deleteCategory(categoryToDelete.id);
      console.log('Delete result:', result);
      if (result.success) {
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
        await fetchCategories();
      } else {
        console.error('Failed to delete category:', result);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setDeletingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const supabase = createClient();

      // Check if category name already exists
      const { data: existingCategory } = await supabase
        .from('product_categories')
        .select('id')
        .eq('name', categoryName.trim())
        .single();

      if (existingCategory) {
        setError('Category name already exists');
        setLoading(false);
        return;
      }

      // Get current user for created_by
      const { data: { user } } = await supabase.auth.getUser();

      // Insert category
      const { error: insertError } = await supabase
        .from('product_categories')
        .insert([
          {
            name: categoryName.trim(),
            description: description.trim() || null,
            created_by: user?.id || null,
          },
        ]);

      if (insertError) {
        console.error('Insert error:', insertError);
        setError('Failed to create category');
        setLoading(false);
        return;
      }

      setSuccess('Category created successfully!');
      
      // Refresh categories list
      await fetchCategories();
      
      // Clear form
      setCategoryName('');
      setDescription('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);

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
            Create Category
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
            {/* Create Category Form */}
            <Card className="bg-white rounded-xl shadow-md border border-gray-100">
              <CardContent className="p-6 lg:p-8">
                <h2 className="font-['Inter',Helvetica] font-semibold text-gray-900 text-xl mb-6">
                  Create New Category
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Category Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="categoryName"
                      className="font-['Inter',Helvetica] font-medium text-gray-900 text-base"
                    >
                      Category Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="categoryName"
                      type="text"
                      placeholder="e.g., Hair Care, Skin Care, etc."
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full h-12 bg-white rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#6aabfd] focus:ring-2 focus:ring-[#6aabfd]/20"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="font-['Inter',Helvetica] font-medium text-gray-900 text-base"
                    >
                      Description <span className="text-gray-400 text-sm">(Optional)</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the category..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={loading}
                      rows={4}
                      className="w-full bg-white rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#6aabfd] focus:ring-2 focus:ring-[#6aabfd]/20 resize-none"
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
                    disabled={loading || !categoryName.trim()}
                    className="w-full h-12 bg-[#f9831b] hover:bg-[#e67610] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Category'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Existing Categories List */}
            <Card className="bg-white rounded-xl shadow-md border border-gray-100">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-['Inter',Helvetica] font-semibold text-gray-900 text-xl">
                    All Categories
                  </h2>
                  <span className="text-sm text-gray-500">
                    {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                  </span>
                </div>

                {fetchingCategories ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f9831b]"></div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No categories yet</p>
                    <p className="text-gray-400 text-sm">Create your first category using the form</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {categories.map((category, index) => (
                      <div 
                        key={category.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-base">{category.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            category.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        {category.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {new Date(category.created_at).toLocaleDateString()}
                            </span>
                            
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => handleMoveCategory(category.id, 'up')}
                                disabled={index === 0 || fetchingCategories}
                                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Move up"
                              >
                                <ArrowUp className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => handleMoveCategory(category.id, 'down')}
                                disabled={index === categories.length - 1 || fetchingCategories}
                                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Move down"
                              >
                                <ArrowDown className="w-4 h-4 text-blue-600" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Link href={`/dashboard/products/create?category=${category.id}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-[#6aabfd] text-[#6aabfd] hover:bg-[#6aabfd] hover:text-white text-xs"
                              >
                                Add Products
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id, category.name)}
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

      {/* Delete Category Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <h2 className="text-xl font-semibold text-gray-900">Delete Category</h2>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete <span className="font-semibold">"{categoryToDelete?.name}"</span>?
            </p>
            <p className="text-gray-500 text-sm">
              This action will delete all products and images associated with this category. This cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingCategory}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteCategory}
              disabled={deletingCategory}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingCategory ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
