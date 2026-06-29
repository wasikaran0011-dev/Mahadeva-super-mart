import { useState, useEffect } from 'react';
import { supabase } from '../../../Services/supabase.js';
import { FaSave, FaUserCircle, FaStore } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useStoreSettings } from '../../../Context/StoreSettingsContext.jsx';
import './Settings.css';
import '../Orders/Orders.css'; // For common skeleton loaders

const Settings = () => {
  const { settings, loadingSettings, refreshSettings } = useStoreSettings();
  const [loading, setLoading] = useState(true);
  
  // Store Settings State
  const [storeSettings, setStoreSettings] = useState({
    storeName: '',
    phone: '',
    email: '',
    address: '',
    deliveryCharge: 0,
    freeDeliveryThreshold: 0
  });
  const [isSavingStore, setIsSavingStore] = useState(false);

  // Admin Profile State
  const [adminProfile, setAdminProfile] = useState({
    name: '',
    email: '',
    role: 'Admin'
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!loadingSettings) {
      setStoreSettings({
        storeName: settings.storeName,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        deliveryCharge: settings.deliveryCharge,
        freeDeliveryThreshold: settings.freeDeliveryLimit
      });
    }
  }, [loadingSettings, settings]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Fetch Session / Profile
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;

        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();

          setAdminProfile({
            name: profile?.full_name || session.user.user_metadata?.full_name || '',
            email: session.user.email,
            role: 'Admin'
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    const handleProfileUpdate = () => {
      fetchProfile();
    };
    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, []);

  const handleStoreSettingsChange = (e) => {
    const { name, value } = e.target;
    setStoreSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setAdminProfile(prev => ({ ...prev, [name]: value }));
  };

  const saveStoreSettings = async (e) => {
    e.preventDefault();
    if (!storeSettings.storeName || !storeSettings.phone) {
      toast.error('Store Name and Phone are required.');
      return;
    }

    try {
      setIsSavingStore(true);
      
      const { error } = await supabase
        .from('store_settings')
        .update({
          store_name: storeSettings.storeName,
          phone: storeSettings.phone,
          email: storeSettings.email,
          address: storeSettings.address,
          delivery_charge: Number(storeSettings.deliveryCharge),
          free_delivery_limit: Number(storeSettings.freeDeliveryThreshold)
        })
        .eq('id', 1);

      if (error) throw error;

      await refreshSettings();
      toast.success('Store settings saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save store settings.');
    } finally {
      setIsSavingStore(false);
    }
  };

  const saveAdminProfile = async (e) => {
    e.preventDefault();
    if (!adminProfile.name) {
      toast.error('Display name cannot be empty.');
      return;
    }

    try {
      setIsSavingProfile(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session found');

      // Update name in profiles table for only the authenticated user's row
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: adminProfile.name })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // Update auth user metadata for consistency
      const { error } = await supabase.auth.updateUser({
        data: { full_name: adminProfile.name }
      });

      if (error) throw error;
      
      // Notify other components to refresh their display names
      window.dispatchEvent(new Event('profile-updated'));

      toast.success('Profile display name updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (loading || loadingSettings) {
    return (
      <div className="orders-skeleton-wrapper" style={{ padding: '24px' }}>
        <div className="skeleton-card" style={{ height: '400px' }}></div>
        <div className="skeleton-card" style={{ height: '200px' }}></div>
      </div>
    );
  }

  return (
    <div className="settings-page-container">
      
      {/* Store Settings Form */}
      <form className="settings-card" onSubmit={saveStoreSettings}>
        <div className="settings-card-header">
          <h2><FaStore style={{ marginRight: '8px', color: '#6b7280' }} /> Store Configurations</h2>
          <p>Update customer-facing details and logistics costs.</p>
        </div>

        <div className="settings-form-grid">
          <div className="settings-form-group">
            <label>Store Name *</label>
            <input 
              type="text" 
              name="storeName" 
              required 
              value={storeSettings.storeName} 
              onChange={handleStoreSettingsChange} 
            />
          </div>
          <div className="settings-form-group">
            <label>Support Phone *</label>
            <input 
              type="tel" 
              name="phone" 
              required 
              value={storeSettings.phone} 
              onChange={handleStoreSettingsChange} 
            />
          </div>
          <div className="settings-form-group">
            <label>Support Email</label>
            <input 
              type="email" 
              name="email" 
              value={storeSettings.email} 
              onChange={handleStoreSettingsChange} 
            />
          </div>
          <div className="settings-form-group">
            <label>Delivery Charge (₹)</label>
            <input 
              type="number" 
              name="deliveryCharge" 
              min="0"
              value={storeSettings.deliveryCharge} 
              onChange={handleStoreSettingsChange} 
            />
          </div>
          <div className="settings-form-group">
            <label>Free Delivery Threshold (₹)</label>
            <input 
              type="number" 
              name="freeDeliveryThreshold" 
              min="0"
              value={storeSettings.freeDeliveryThreshold} 
              onChange={handleStoreSettingsChange} 
            />
          </div>
          <div className="settings-form-group full-width">
            <label>Store Address</label>
            <textarea 
              name="address" 
              value={storeSettings.address} 
              onChange={handleStoreSettingsChange} 
            />
          </div>
        </div>

        <div className="settings-footer">
          <button type="submit" className="settings-btn" disabled={isSavingStore}>
            {isSavingStore ? 'Saving...' : <><FaSave /> Save Settings</>}
          </button>
        </div>
      </form>

      {/* Admin Profile Form */}
      <form className="settings-card" onSubmit={saveAdminProfile}>
        <div className="settings-card-header">
          <h2><FaUserCircle style={{ marginRight: '8px', color: '#6b7280' }} /> Admin Profile</h2>
          <p>Manage your personal admin account details.</p>
        </div>

        <div className="profile-info-row">
          <span className="profile-info-label">Account Email</span>
          <span className="profile-info-value">{adminProfile.email || 'N/A'}</span>
        </div>
        
        <div className="profile-info-row">
          <span className="profile-info-label">Current Role</span>
          <span className="profile-info-value" style={{ color: '#10b981' }}>{adminProfile.role}</span>
        </div>

        <div className="settings-form-grid" style={{ marginTop: '20px' }}>
          <div className="settings-form-group full-width">
            <label>Display Name</label>
            <input 
              type="text" 
              name="name" 
              required 
              value={adminProfile.name} 
              onChange={handleProfileChange} 
            />
          </div>
        </div>

        <div className="settings-footer">
          <button type="submit" className="settings-btn" disabled={isSavingProfile}>
            {isSavingProfile ? 'Updating...' : <><FaSave /> Update Profile</>}
          </button>
        </div>
      </form>

    </div>
  );
};

export default Settings;
