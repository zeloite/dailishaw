'use server';

import { createAdminClient } from '@/lib/supabase/server';

const DEFAULT_HOME_PRODUCT_NAME = 'Home Media';

export async function ensureDefaultProduct(categoryId: string) {
  const supabase = createAdminClient();

  // Check if a default product already exists for this category
  const { data: existing, error: selectError } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .ilike('name', `${DEFAULT_HOME_PRODUCT_NAME}%`)
    .limit(1)
    .maybeSingle();

  if (selectError && selectError.code !== 'PGRST116') {
    return { success: false, error: selectError.message };
  }

  if (existing) {
    return { success: true, product: existing };
  }

  // Create a default product for Home category
  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        category_id: categoryId,
        name: DEFAULT_HOME_PRODUCT_NAME,
        description: 'Default container for home media uploads',
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, product: data };
}

export async function uploadProductImage(
  productId: string,
  imageUrl: string,
  fileSize: number,
  mimeType: string,
  sortOrder: number,
  userId: string | null
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('product_images')
    .insert([
      {
        product_id: productId,
        image_url: imageUrl,
        file_size: fileSize,
        mime_type: mimeType,
        sort_order: sortOrder,
        created_by: userId,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Insert error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deleteProductImage(imageId: string, imageUrl: string) {
  const supabase = createAdminClient();

  // Extract file path from URL
  const urlParts = imageUrl.split('/products/');
  const filePath = urlParts.length > 1 ? `products/${urlParts[1]}` : null;

  // Delete from storage
  if (filePath) {
    const { error: storageError } = await supabase.storage
      .from('media')
      .remove([filePath]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      return { success: false, error: storageError.message };
    }
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId);

  if (dbError) {
    console.error('Database delete error:', dbError);
    return { success: false, error: dbError.message };
  }

  return { success: true };
}
