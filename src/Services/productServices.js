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