'use server';

import { createAdminClient } from '@/lib/supabase/server';

export async function updateProductSortOrder(
  productId: string,
  direction: 'up' | 'down'
) {
  try {
    const supabase = createAdminClient();

    // Get the product first to find its category
    const { data: product, error: fetchProductError } = await supabase
      .from('products')
      .select('id, sort_order, category_id, created_at')
      .eq('id', productId)
      .single();

    if (fetchProductError || !product) {
      console.error('Product fetch error:', fetchProductError);
      return { success: false };
    }

    // Get all products in the same category ordered by sort_order
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, sort_order, created_at')
      .eq('category_id', product.category_id)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }
    if (!products || products.length === 0) {
      console.error('No products found');
      return { success: false };
    }

    // Initialize sort_order if all are the same or missing
    const uniqueSortOrders = new Set(products.map(p => p.sort_order));
    if (uniqueSortOrders.size === 1 || products.some(p => p.sort_order === null || p.sort_order === undefined)) {
      console.log('Initializing sort_order values...');
      for (let i = 0; i < products.length; i++) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ sort_order: i })
          .eq('id', products[i].id);
        
        if (updateError) {
          console.error(`Failed to initialize sort_order for ${products[i].id}:`, updateError);
        }
      }
      
      // Re-fetch after initialization
      const { data: updatedProducts, error: refetchError } = await supabase
        .from('products')
        .select('id, sort_order, created_at')
        .eq('category_id', product.category_id)
        .order('sort_order', { ascending: true });
      
      if (refetchError) throw refetchError;
      products.splice(0, products.length, ...updatedProducts);
    }

    // Find the current product and its position
    const currentIndex = products.findIndex((p) => p.id === productId);
    if (currentIndex === -1) {
      console.error('Product not found in list:', productId);
      return { success: false };
    }

    // Determine the swap target
    let targetIndex = -1;
    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < products.length - 1) {
      targetIndex = currentIndex + 1;
    }

    if (targetIndex === -1) {
      console.error('Cannot move further in direction:', direction);
      return { success: false };
    }

    // Swap sort_order values
    const currentSort = products[currentIndex].sort_order;
    const targetSort = products[targetIndex].sort_order;
    const targetProductId = products[targetIndex].id;

    console.log(`Swapping: ${productId}(${currentSort}) <-> ${targetProductId}(${targetSort})`);

    // Update both products
    const { error: error1 } = await supabase
      .from('products')
      .update({ sort_order: targetSort })
      .eq('id', productId);

    if (error1) {
      console.error('Update error 1:', error1);
      throw error1;
    }

    const { error: error2 } = await supabase
      .from('products')
      .update({ sort_order: currentSort })
      .eq('id', targetProductId);

    if (error2) {
      console.error('Update error 2:', error2);
      throw error2;
    }

    console.log('Update successful');
    return { success: true };
  } catch (error) {
    console.error('Error updating product sort order:', error);
    return { success: false };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const supabase = createAdminClient();

    // Delete the product (cascades to images due to FK constraints)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }

    console.log('Product deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false };
  }
}
