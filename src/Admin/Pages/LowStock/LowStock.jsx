import { useState, useEffect } from 'react';
import { supabase } from '../../../Services/supabase.js';
import { FaSync, FaRegTimesCircle, FaImage, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import '../Orders/Orders.css'; // Common table styles
import '../Products/Products.css'; // For product thumbnail

const LowStock = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stock update modal state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const LOW_STOCK_THRESHOLD = 10;

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products with stock < threshold, and categories for mapping
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('Products')
          .select('*')
          .lt('stock', LOW_STOCK_THRESHOLD)
          .order('stock', { ascending: true }),
        supabase.from('Categories').select('id, name')
      ]);

      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error('Error fetching low stock:', err);
      setError(err.message || 'Failed to fetch low stock products');
      toast.error('Failed to load low stock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  };

  const handleOpenUpdate = (product) => {
    setSelectedProduct(product);
    setNewStock(product.stock.toString());
    setIsUpdateModalOpen(true);
  };

  const submitStockUpdate = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    try {
      setIsSaving(true);
      const updatedStock = Number(newStock);
      
      const { error: updateErr } = await supabase
        .from('Products')
        .update({ stock: updatedStock })
        .eq('id', selectedProduct.id);

      if (updateErr) throw updateErr;

      toast.success(`Stock updated for ${selectedProduct.title}`);
      setIsUpdateModalOpen(false);
      setSelectedProduct(null);
      
      // Refresh list to automatically hide products that are no longer low stock
      await fetchLowStockProducts();
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update stock');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="orders-page-container">
      {/* Header controls for Low Stock */}
      <section className="orders-controls" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Low Stock Alerts</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
            Products with less than {LOW_STOCK_THRESHOLD} items in stock.
          </p>
        </div>
        <button className="filter-btn" onClick={fetchLowStockProducts}>
          <FaSync /> Refresh
        </button>
      </section>

      {/* Main Content Area */}
      {loading ? (
        <div className="orders-skeleton-wrapper">
          <div className="skeleton-card"><div className="skeleton-block text-long"></div></div>
          <div className="skeleton-card"><div className="skeleton-block text-long"></div></div>
        </div>
      ) : error ? (
        <div className="orders-error-state">
          <FaRegTimesCircle className="error-icon" />
          <h3>Error Loading Low Stock Data</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchLowStockProducts}><FaSync /> Retry</button>
        </div>
      ) : products.length === 0 ? (
        <div className="orders-empty-state">
          <div className="empty-icon">✅</div>
          <h3>Inventory is Healthy</h3>
          <p>There are currently no products under the low stock threshold.</p>
        </div>
      ) : (
        <div className="desktop-orders-table-wrapper">
          <table className="desktop-orders-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
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
                    <span style={{ fontWeight: '700', fontSize: '1.1rem', color: p.stock === 0 ? '#ef4444' : '#f59e0b' }}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${p.stock === 0 ? 'out-of-stock' : 'low-stock'}`}>
                      {p.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="advance-status-action"
                      style={{ backgroundColor: '#111827', color: '#fff' }}
                      onClick={() => handleOpenUpdate(p)}
                    >
                      Update Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Update Modal */}
      {isUpdateModalOpen && selectedProduct && (
        <div className="admin-modal-overlay" onClick={() => setIsUpdateModalOpen(false)}>
          <div className="admin-modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>Update Stock</h2>
              <button className="modal-close" onClick={() => setIsUpdateModalOpen(false)}>
                <FaRegTimesCircle />
              </button>
            </header>
            <form onSubmit={submitStockUpdate}>
              <div className="modal-body">
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Product:</span>
                  <div style={{ fontWeight: '600', color: '#111827' }}>{selectedProduct.title}</div>
                </div>
                <div className="form-group">
                  <label>New Stock Quantity</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    value={newStock} 
                    onChange={(e) => setNewStock(e.target.value)} 
                    autoFocus
                  />
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="close-btn" onClick={() => setIsUpdateModalOpen(false)}>Cancel</button>
                <button type="submit" className="modal-action-btn" disabled={isSaving}>
                  {isSaving ? 'Updating...' : <><FaCheck /> Update Stock</>}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStock;
