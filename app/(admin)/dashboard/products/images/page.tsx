"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  X,
  ImageIcon,
  Trash2,
  ChevronDownIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { createClient } from "@/lib/supabase/client";
import {
  uploadProductImage,
  deleteProductImage,
  ensureDefaultProduct,
} from "./actions";
import { SkeletonImageGrid, SkeletonProduct } from "@/components/ui/Skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

const navigationItems = [
  {
    icon: "/ix-user-management.svg",
    label: "User Management",
    active: false,
    href: "/dashboard/users",
  },
  {
    icon: "/pajamas-media.svg",
    label: "Media Management",
    active: true,
    href: "/dashboard/categories",
  },
  {
    icon: "/game-icons-expense.svg",
    label: "Expense Monitoring",
    active: false,
    href: "/dashboard/expenses",
  },
];

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
  file_size: bigint | null;
  sort_order: number;
  created_at: string;
}

export default function UploadProductImagesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productImages, setProductImages] = useState<
    Record<string, ProductImage[]>
  >({});
  const [uploadingImages, setUploadingImages] = useState<
    Record<string, boolean>
  >({});
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{
    imageId: string;
    productId: string;
    imageUrl: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Get product from URL params if available
    const productParam = searchParams.get("product");
    if (productParam) {
      setSelectedProductId(productParam);
      fetchProductCategory(productParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedCategoryId) {
      setProducts([]);
      setProductImages({});
      fetchProducts();
    } else {
      setProducts([]);
      setProductImages({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId]);

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("product_categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProductCategory = async (productId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("category_id")
        .eq("id", productId)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedCategoryId(data.category_id);
      }
    } catch (error) {
      console.error("Error fetching product category:", error);
    }
  };

  const fetchProducts = useCallback(async () => {
    if (!selectedCategoryId) return;

    setFetchingProducts(true);
    setProducts([]);
    setProductImages({});

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category_id")
        .eq("category_id", selectedCategoryId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;

      let productList = data || [];

      // If category is "Home" and has no products, create a default one
      const selectedCategory = categories.find(
        (c) => c.id === selectedCategoryId
      );
      const isHomeCategory =
        selectedCategory?.name?.trim().toLowerCase() === "home";

      if (isHomeCategory && productList.length === 0) {
        const { success, product } = await ensureDefaultProduct(
          selectedCategoryId
        );
        if (success && product) {
          productList = [product];
        }
      }

      setProducts(productList);

      // Fetch images for all products immediately
      if (productList.length > 0) {
        await Promise.all(
          productList.map((product) => fetchProductImages(product.id))
        );
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setFetchingProducts(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, categories]);

  const fetchProductImages = async (productId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order");

      if (error) throw error;
      setProductImages((prev) => ({
        ...prev,
        [productId]: data || [],
      }));
    } catch (error) {
      console.error("Error fetching product images:", error);
    }
  };

  const handleImageUpload = async (productId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setUploadingImages((prev) => ({ ...prev, [productId]: true }));
    setError("");

    try {
      const supabase = createClient();

      // Upload image to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError("Failed to upload image");
        setTimeout(() => setError(""), 3000);
        setUploadingImages((prev) => ({ ...prev, [productId]: false }));
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Get current max sort_order for this product
      const currentImages = productImages[productId] || [];
      const maxSortOrder =
        currentImages.length > 0
          ? Math.max(...currentImages.map((img) => img.sort_order))
          : -1;

      // Insert image record using server action
      const result = await uploadProductImage(
        productId,
        urlData.publicUrl,
        file.size,
        file.type,
        maxSortOrder + 1,
        user?.id || null
      );

      if (!result.success) {
        setError("Failed to save image record");
        setTimeout(() => setError(""), 3000);
        setUploadingImages((prev) => ({ ...prev, [productId]: false }));
        return;
      }

      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);

      // Refresh images for this product
      await fetchProductImages(productId);
    } catch (err) {
      console.error("Error:", err);
      setError("An unexpected error occurred");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUploadingImages((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleDeleteImage = async (
    imageId: string,
    productId: string,
    imageUrl: string
  ) => {
    setImageToDelete({ imageId, productId, imageUrl });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;

    setDeleting(true);
    try {
      const result = await deleteProductImage(
        imageToDelete.imageId,
        imageToDelete.imageUrl
      );

      if (!result.success) {
        setError("Failed to delete image");
        setTimeout(() => setError(""), 3000);
        setDeleteDialogOpen(false);
        setImageToDelete(null);
        return;
      }

      setSuccess("Image deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);

      // Refresh images
      await fetchProductImages(imageToDelete.productId);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to delete image");
      setTimeout(() => setError(""), 3000);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  return (
    <DashboardLayout
      navigationItems={navigationItems}
      pageTitle="Upload Product Images"
    >
      <Button
        onClick={() => router.push("/dashboard/categories")}
        variant="ghost"
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Categories
      </Button>
      <div className="flex-1 p-4 lg:p-6">
        {/* Category Selection */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-950/10 rounded-xl p-6 mb-6 border border-orange-100 dark:border-orange-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500 dark:bg-orange-600 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-['Inter',Helvetica] font-semibold text-gray-900 text-lg">
                Select Product Category
              </h2>
              <p className="text-sm text-gray-600">
                Choose a category to view and upload product images
              </p>
            </div>
          </div>

          <div className="max-w-xl">
            <Label
              htmlFor="category"
              className="font-['Inter',Helvetica] font-medium text-gray-900 text-sm mb-2 block"
            >
              Category <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <select
                id="category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full h-12 bg-white rounded-lg border-2 border-gray-200 text-gray-900 px-4 pr-10 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all appearance-none cursor-pointer font-medium"
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
                  No categories available.{" "}
                  <Link
                    href="/dashboard/categories/create"
                    className="text-orange-600 hover:underline font-medium"
                  >
                    Create one first →
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200 mb-6">
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-4 border border-green-200 mb-6">
            <p className="text-sm text-green-800 font-medium">{success}</p>
          </div>
        )}

        {/* Products Grid */}
        {!selectedCategoryId ? (
          <Card className="bg-white rounded-lg border border-gray-200">
            <CardContent className="p-12">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Select a category</p>
                <p className="text-gray-400 text-sm">
                  Choose a category to view products and upload images
                </p>
              </div>
            </CardContent>
          </Card>
        ) : fetchingProducts ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <SkeletonProduct key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="bg-white rounded-lg border border-gray-200">
            <CardContent className="p-12">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No products found</p>
                <p className="text-gray-400 text-sm mb-6">
                  Add products to this category first
                </p>
                <Link
                  href={`/dashboard/products/create?category=${selectedCategoryId}`}
                >
                  <Button className="bg-[#f9831b] hover:bg-[#e67610] text-white">
                    Add Products
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="bg-white rounded-lg border border-gray-200"
              >
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 text-lg mb-4">
                    {product.name}
                  </h3>

                  {/* Existing Images */}
                  {productImages[product.id] &&
                    productImages[product.id].length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {productImages[product.id].map((image) => (
                          <div key={image.id} className="relative group">
                            <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={image.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteImage(
                                  image.id,
                                  product.id,
                                  image.image_url
                                )
                              }
                              className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Upload Button */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#6aabfd] transition-colors">
                    <input
                      type="file"
                      id={`upload-${product.id}`}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(product.id, file);
                        e.target.value = "";
                      }}
                      disabled={uploadingImages[product.id]}
                      className="hidden"
                    />
                    <label
                      htmlFor={`upload-${product.id}`}
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {uploadingImages[product.id] ? (
                        <>
                          <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                          <p className="text-sm text-gray-500">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400" />
                          <p className="text-sm text-gray-700 font-medium">
                            Upload Image
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
