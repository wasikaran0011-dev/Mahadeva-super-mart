import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../Services/supabase.js';
import toast from 'react-hot-toast';

const StoreSettingsContext = createContext();

export const StoreSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    storeName: 'Mahadeva Super Mart',
    phone: '',
    email: '',
    address: '',
    deliveryCharge: 0,
    freeDeliveryLimit: 0
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" if it doesn't exist
        throw error;
      }

      if (data) {
        setSettings({
          storeName: data.store_name || 'Mahadeva Super Mart',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          deliveryCharge: Number(data.delivery_charge) || 0,
          freeDeliveryLimit: Number(data.free_delivery_limit) || 0
        });
      }
    } catch (err) {
      console.error('Error fetching store settings:', err);
      // We can fail silently or log error, so we don't crash the page.
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <StoreSettingsContext.Provider
      value={{
        settings,
        loadingSettings,
        refreshSettings: fetchSettings
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => useContext(StoreSettingsContext);
