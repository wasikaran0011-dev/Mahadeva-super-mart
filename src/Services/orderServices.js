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

export const getUserOrders = async(userId) => {
    const { data,error } = await supabase
    .from('orders')
    .select(`*, orderitems(*)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

    if(error) {
        throw error;
    }

    return data;
};

export const getOrderItems = async(orderId) => {
    const { data,error } = await supabase
    .from('orderitems')
    .select('*')
    .eq('order_id', orderId);

    if(error) {
        throw error;
    }

    return data;
};

export const getOrderById = async(orderId) => {
    const { data,error } = await supabase 
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

    if(error) {
        throw error;
    }

    return data;
};

export const getOrderDetails = async(orderId, userId) => {
    const { data,error } = await supabase
    .from('orders')
    .select(`*, orderitems(*, Products(id, title, image, brand, weight))`)
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

    if(error) {
        // PGRST116 = no rows found (not a fatal error)
        if(error.code === 'PGRST116') return null;
        throw error;
    }

    return data;
};
