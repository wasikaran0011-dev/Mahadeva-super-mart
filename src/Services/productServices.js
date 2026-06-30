import { supabase } from './supabase';

export const getProductsByCategory = async(categoryId) => {
    const { data,error } = 
    await supabase
    .from('Products')
    .select('*')
    .eq('category_id', categoryId);

    if(error) {
        throw error;
    }

    return data;
};

export const searchProducts = async(searchTerm) => {
    const { data,error } =
    await supabase
    .from("Products")
    .select('*')
    .ilike('title', `%${searchTerm}%`);

    if(error) {
        throw error;
    }
    return data;
};

export const getSearchSuggestions = async(searchTerm) => {
    const { data,error } = 
    await supabase      
    .from("Products")
    .select('id,title,image')
    .ilike('title', `%${searchTerm}%`)
    .limit(5);

    if(error) {
        throw error;
    }
    
    return data;
}

export const getProductById = async (id) => {
    const { data,error } = await supabase
        .from("Products")
        .select('*')
        .eq('id', id)
        .single();

        if(error) {
            throw error;
        }

        return data;
}

export const getNewArrivals = async (limitCount = 8) => {
    let query = supabase
        .from('Products')
        .select('*')
        .eq('is_new_arrival', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (limitCount) {
        query = query.limit(limitCount);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data;
};

export const getOfferProducts = async (limitCount = 8) => {
    let query = supabase
        .from('Products')
        .select('*')
        .eq('is_offer_product', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (limitCount) {
        query = query.limit(limitCount);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data;
};