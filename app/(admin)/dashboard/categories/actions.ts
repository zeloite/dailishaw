'use server';

import { createAdminClient } from '@/lib/supabase/server';

export async function updateCategorySortOrder(
  categoryId: string,
  direction: 'up' | 'down'
) {
  try {
    const supabase = createAdminClient();

    // Get all categories ordered by sort_order, then by created_at for consistency
    const { data: categories, error: fetchError } = await supabase
      .from('product_categories')
      .select('id, sort_order, created_at')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }
    if (!categories || categories.length === 0) {
      console.error('No categories found');
      return { success: false };
    }

    // Initialize sort_order if all are the same or missing
    const uniqueSortOrders = new Set(categories.map(c => c.sort_order));
    if (uniqueSortOrders.size === 1 || categories.some(c => c.sort_order === null || c.sort_order === undefined)) {
      console.log('Initializing sort_order values...');
      for (let i = 0; i < categories.length; i++) {
        const { error: updateError } = await supabase
          .from('product_categories')
          .update({ sort_order: i })
          .eq('id', categories[i].id);
        
        if (updateError) {
          console.error(`Failed to initialize sort_order for ${categories[i].id}:`, updateError);
        }
      }
      
      // Re-fetch after initialization
      const { data: updatedCategories, error: refetchError } = await supabase
        .from('product_categories')
        .select('id, sort_order, created_at')
        .order('sort_order', { ascending: true });
      
      if (refetchError) throw refetchError;
      categories.splice(0, categories.length, ...updatedCategories);
    }

    // Find the current category and its position
    const currentIndex = categories.findIndex((cat) => cat.id === categoryId);
    if (currentIndex === -1) {
      console.error('Category not found:', categoryId);
      return { success: false };
    }

    // Determine the swap target
    let targetIndex = -1;
    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < categories.length - 1) {
      targetIndex = currentIndex + 1;
    }

    if (targetIndex === -1) {
      console.error('Cannot move further in direction:', direction);
      return { success: false };
    }

    // Swap sort_order values
    const currentSort = categories[currentIndex].sort_order;
    const targetSort = categories[targetIndex].sort_order;
    const targetCategoryId = categories[targetIndex].id;

    console.log(`Swapping: ${categoryId}(${currentSort}) <-> ${targetCategoryId}(${targetSort})`);

    // Update both categories
    const { error: error1 } = await supabase
      .from('product_categories')
      .update({ sort_order: targetSort })
      .eq('id', categoryId);

    if (error1) {
      console.error('Update error 1:', error1);
      throw error1;
    }

    const { error: error2 } = await supabase
      .from('product_categories')
      .update({ sort_order: currentSort })
      .eq('id', targetCategoryId);

    if (error2) {
      console.error('Update error 2:', error2);
      throw error2;
    }

    console.log('Update successful');
    return { success: true };
  } catch (error) {
    console.error('Error updating category sort order:', error);
    return { success: false };
  }
}

export async function getCategories() {
  try {
    const supabase = createAdminClient();

    const { data: categories, error } = await supabase
      .from('product_categories')
      .select('id, name, sort_order, is_active')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    const supabase = createAdminClient();

    // Delete the category (cascades to products and images due to FK constraints)
    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }

    console.log('Category deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false };
  }
}
