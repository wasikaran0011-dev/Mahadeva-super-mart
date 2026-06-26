import { supabase } from './supabase';

export const getCategories = async () => {

    const { data, error } = await supabase
        .from('Categories')
        .select('*');

    console.log('DATA:', data);
    console.log('ERROR:', error);

    if (error) {
        throw error;
    }

    return data;
};