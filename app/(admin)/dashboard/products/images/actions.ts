'use server';

import { createAdminClient } from '@/lib/supabase/server';

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
