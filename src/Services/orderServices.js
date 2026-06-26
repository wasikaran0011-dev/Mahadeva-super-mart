import { supabase } from './supabase';

export const createOrder = async(orderData) => {
    const { data,error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();

    if(error) {
        throw error;
    }

    return data;
};

export const createOrderItems = async(items) => {
    const { error } = await supabase
    .from('orderitems')
    .insert(items);

    if(error) {
        throw error;
    }
};
