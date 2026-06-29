import { useState, useEffect } from 'react';
import { supabase } from '../../../Services/supabase.js';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaRegTimesCircle, 
  FaSync, 
  FaBan,
  FaCheck,
  FaImage
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../Components/ConfirmationModal/ConfirmationModal';
import '../Orders/Orders.css'; // Re-use common table styles
import './Products.css';

const initialFormState = {
  title: '',
  description: '',
  category_id: '',
  brand: '',
  weight: '',
  price: '',
  original_price: '',
  stock: '',
  delivery_time: '',
  rating: '',
  image: '',
  is_new_arrival: false,
  is_offer_product: false,
  offer_percentage: ''
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(''); // 'Active', 'Inactive'

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('Products').select('*').order('created_at', { ascending: false }),
        supabase.from('Categories').select('id, name')
      ]);

      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    // Search
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch = 
      (p.title || '').toLowerCase().includes(search) ||
      (p.brand || '').toLowerCase().includes(search);
    if (!matchesSearch) return false;

    // Category Filter
    if (selectedCategory && p.category_id !== selectedCategory) return false;

    // Status Filter
    if (selectedStatus) {
      if (selectedStatus === 'Active' && !p.is_active) return false;
      if (selectedStatus === 'Inactive' && p.is_active) return false;
    }

    return true;
  });

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  };

  const handleToggleStatus = async (product) => {
    try {
      setUpdatingId(product.id);
      const newStatus = !product.is_active;
      const { error: updateErr } = await supabase
        .from('Products')
        .update({ is_active: newStatus })
        .eq('id', product.id);

      if (updateErr) throw updateErr;
      
      toast.success(`${product.title} is now ${newStatus ? 'Active' : 'Inactive'}`);
      await fetchData();
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Failed to update product status');
    } finally {
      setUpdatingId(null);
    }
  };

  const openAddModal = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEditModal = (product) => {
    setFormData({
      title: product.title || '',
      description: product.description || '',
      category_id: product.category_id || '',
      brand: product.brand || '',
      weight: product.weight || '',
      price: product.price || '',
      original_price: product.original_price || '',
      stock: product.stock || '',
      delivery_time: product.delivery_time || '',
      rating: product.rating || '',
      image: product.image || '',
      is_new_arrival: product.is_new_arrival || false,
      is_offer_product: product.is_offer_product || false,
      offer_percentage: product.offer_percentage || ''
    });
    setEditingId(product.id);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.category_id) {
      toast.error('Title, Price, and Category are required');
      return;
    }

    // Validate offer percentage when offer product is enabled
    if (formData.is_offer_product) {
      const pct = Number(formData.offer_percentage);
      if (!formData.offer_percentage || isNaN(pct) || pct < 1 || pct > 99) {
        toast.error('Offer Percentage must be between 1 and 99');
        return;
      }
    }

    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        original_price: formData.original_price ? Number(formData.original_price) : null,
        stock: formData.stock ? Number(formData.stock) : 0,
        rating: formData.rating ? Number(formData.rating) : null,
        is_new_arrival: Boolean(formData.is_new_arrival),
        is_offer_product: Boolean(formData.is_offer_product),
        offer_percentage: formData.is_offer_product ? Number(formData.offer_percentage) : null,
      };

      if (editingId) {
        const { error: updateErr } = await supabase
          .from('Products')
          .update(payload)
          .eq('id', editingId);
        if (updateErr) throw updateErr;
        toast.success('Product updated successfully');
      } else {
        payload.is_active = true;
        payload.is_new_arrival = true; // Auto-set for new products
        const { error: insertErr } = await supabase
          .from('Products')
          .insert([payload]);
        if (insertErr) throw insertErr;
        toast.success('Product added successfully');
      }

      setIsFormOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setUpdatingId(productToDelete.id);
      
      const { error: delErr } = await supabase
        .from('Products')
        .delete()
        .eq('id', productToDelete.id);

      if (delErr) throw delErr;

      toast.success('Product deleted successfully');
      await fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete product');
    } finally {
      setUpdatingId(null);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // Clear offer_percentage when offer product is unchecked
      ...(name === 'is_offer_product' && !checked ? { offer_percentage: '' } : {})
    }));
  };

  return (
    <div className="products-page-container orders-page-container">
      <section className="orders-controls">
        <div className="controls-header">
          <div className="search-box-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products by title or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="add-product-btn" onClick={openAddModal}>
            <FaPlus /> Add Product
          </button>
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <span className="filter-group-label">Category:</span>
            <select 
              className="search-input" 
              style={{ width: 'auto', padding: '6px 12px' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <span className="filter-group-label">Status:</span>
            {['Active', 'Inactive'].map(s => (
              <button
                key={s}
                onClick={() => setSelectedStatus(selectedStatus === s ? '' : s)}
                className={`filter-btn ${selectedStatus === s ? 'active' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="orders-skeleton-wrapper">
           <div className="skeleton-card"><div className="skeleton-block text-long"></div></div>
           <div className="skeleton-card"><div className="skeleton-block text-long"></div></div>
        </div>
      ) : error ? (
        <div className="orders-error-state">
          <FaRegTimesCircle className="error-icon" />
          <h3>Error Loading Products</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchData}><FaSync /> Retry</button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="orders-empty-state">
          <div className="empty-icon">📦</div>
          <h3>No Products Found</h3>
          <p>We couldn't find any products matching your criteria.</p>
        </div>
      ) : (
        <div className="desktop-orders-table-wrapper">
          <table className="desktop-orders-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="product-thumb" />
                    ) : (
                      <div className="product-thumb-placeholder"><FaImage /></div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{p.title}</div>
                    {p.brand && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{p.brand}</div>}
                  </td>
                  <td>{getCategoryName(p.category_id)}</td>
                  <td>
                    <strong>₹{p.price}</strong>
                    {p.original_price && <div style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: '#9ca3af' }}>₹{p.original_price}</div>}
                  </td>
                  <td>
                    <span style={{ fontWeight: '600', color: p.stock < 10 ? '#ef4444' : '#111827' }}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${p.is_active ? 'active' : 'inactive'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="product-actions">
                      <button 
                        className="action-btn edit" 
                        title="Edit"
                        onClick={() => openEditModal(p)}
                        disabled={updatingId === p.id}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn" 
                        title={p.is_active ? 'Disable' : 'Enable'}
                        onClick={() => handleToggleStatus(p)}
                        disabled={updatingId === p.id}
                      >
                        {p.is_active ? <FaBan /> : <FaCheck />}
                      </button>
                      <button 
                        className="action-btn delete" 
                        title="Delete"
                        disabled={updatingId === p.id}
                        onClick={() => {
                          setProductToDelete(p);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {isFormOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="admin-modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setIsFormOpen(false)}>
                <FaRegTimesCircle />
              </button>
            </header>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body product-form-grid">
                <div className="form-group full-width">
                  <label>Title *</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} />
                </div>
                
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select name="category_id" required value={formData.category_id} onChange={handleInputChange}>
                    <option value="">Select Category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input type="number" step="0.01" name="price" required value={formData.price} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Original Price (₹)</label>
                  <input type="number" step="0.01" name="original_price" value={formData.original_price} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Weight (e.g. 500g)</label>
                  <input type="text" name="weight" value={formData.weight} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Delivery Time (e.g. 30 Mins)</label>
                  <input type="text" name="delivery_time" value={formData.delivery_time} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input type="text" name="image" value={formData.image} onChange={handleInputChange} />
                </div>

                {/* New Arrival & Offer Controls */}
                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_new_arrival"
                      checked={formData.is_new_arrival}
                      onChange={handleInputChange}
                    />
                    New Arrival
                  </label>
                </div>

                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_offer_product"
                      checked={formData.is_offer_product}
                      onChange={handleInputChange}
                    />
                    Offer Product
                  </label>
                </div>

                {formData.is_offer_product && (
                  <div className="form-group">
                    <label>Offer Percentage (%)</label>
                    <input
                      type="number"
                      name="offer_percentage"
                      min="1"
                      max="99"
                      placeholder="e.g. 20"
                      value={formData.offer_percentage}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}
              </div>
              <footer className="modal-footer">
                <button type="button" className="close-btn" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="modal-action-btn" disabled={isSaving}>
                  {isSaving ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Product')}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
};

export default Products;
