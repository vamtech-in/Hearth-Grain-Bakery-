import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { bakeryApi } from '../services/api';

export default function AdminPortalModal() {
  const { isAdminOpen, setIsAdminOpen, showToast } = useCart();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'reservations' | 'menu' | 'analytics'
  
  // Data states
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');

  // New item form in Menu Tab
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'bread',
    price: '',
    description: '',
    tags: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, resRes, menuRes, statsRes] = await Promise.all([
        bakeryApi.getOrders(),
        bakeryApi.getReservations(),
        bakeryApi.getMenu(),
        bakeryApi.getStats()
      ]);

      if (ordersRes.success) setOrders(ordersRes.data);
      if (resRes.success) setReservations(resRes.data);
      if (menuRes.success) setMenuItems(menuRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showToast('Could not sync with bakery server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminOpen) {
      loadData();
    }
  }, [isAdminOpen]);

  if (!isAdminOpen) return null;

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await bakeryApi.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        showToast(`Order ${orderId} marked as "${newStatus}"`, 'success');
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        // refresh stats
        bakeryApi.getStats().then(s => s.success && setStats(s.data));
      }
    } catch (err) {
      showToast(err.message || 'Error updating status', 'error');
    }
  };

  const handleToggleStock = async (item) => {
    try {
      const updatedStock = !item.inStock;
      const res = await bakeryApi.updateMenuItem(item.id, { inStock: updatedStock });
      if (res.success) {
        showToast(`"${item.name}" marked as ${updatedStock ? 'In Stock' : 'Sold Out'}`, 'info');
        setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, inStock: updatedStock } : m));
      }
    } catch (err) {
      showToast('Error updating inventory', 'error');
    }
  };

  const handlePriceChange = async (itemId, newPrice) => {
    const val = Number(newPrice);
    if (isNaN(val) || val <= 0) return;
    try {
      const res = await bakeryApi.updateMenuItem(itemId, { price: val });
      if (res.success) {
        showToast('Price updated', 'success');
        setMenuItems(prev => prev.map(m => m.id === itemId ? { ...m, price: val } : m));
      }
    } catch (err) {
      showToast('Error updating price', 'error');
    }
  };

  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    try {
      const res = await bakeryApi.createMenuItem({
        name: newItem.name,
        category: newItem.category,
        price: Number(newItem.price),
        description: newItem.description,
        tags: newItem.tags ? newItem.tags.split(',').map(s => s.trim()) : [],
        image: newItem.category === 'coffee' ? '/images/image5.jpg' : newItem.category === 'pastry' ? '/images/image3.jpg' : '/images/image4.jpg'
      });

      if (res.success) {
        showToast(`Added ${res.data.name} to bakery menu!`, 'success');
        setMenuItems(prev => [...prev, res.data]);
        setNewItem({ name: '', category: 'bread', price: '', description: '', tags: '' });
        setShowAddForm(false);
      }
    } catch (err) {
      showToast('Failed to add item', 'error');
    }
  };

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status.toLowerCase().includes(orderFilter.toLowerCase());
  });

  return (
    <div className="modal-backdrop" onClick={() => setIsAdminOpen(false)}>
      <div 
        className="modal-content admin-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header admin-modal-header">
          <div className="admin-header-left">
            <span className="staff-pill">BAKERY BACKSTAGE</span>
            <h3>Staff Kitchen &amp; Oven Portal</h3>
          </div>
          <div className="admin-header-actions">
            <button className="button button-small" onClick={loadData} title="Refresh live data">
              ↻ Refresh
            </button>
            <button 
              className="modal-close-btn"
              onClick={() => setIsAdminOpen(false)}
              aria-label="Close admin modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="admin-nav-tabs">
          <button 
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            🥖 Live Orders ({orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            📅 Table Bookings ({reservations.length})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            🥐 Menu &amp; Stock ({menuItems.length})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics &amp; Stats
          </button>
        </div>

        <div className="admin-tab-body">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="admin-section">
              <div className="orders-filter-bar">
                <span className="filter-label">Filter:</span>
                {['all', 'received', 'baking', 'ready', 'completed'].map(f => (
                  <button
                    key={f}
                    className={`filter-btn ${orderFilter === f ? 'active' : ''}`}
                    onClick={() => setOrderFilter(f)}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>

              {filteredOrders.length === 0 ? (
                <div className="admin-empty">No orders found matching filter.</div>
              ) : (
                <div className="admin-orders-list">
                  {filteredOrders.map(order => (
                    <div key={order.id} className="admin-order-card">
                      <div className="order-top">
                        <div>
                          <strong className="order-id-tag">{order.id}</strong>
                          <span className="order-time">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`status-pill ${order.status.toLowerCase().replace(/[\s\/]/g, '-')}`}>
                          {order.status}
                        </div>
                      </div>

                      <div className="order-customer-info">
                        <strong>{order.customerName}</strong> • {order.customerPhone}
                        {order.fulfillmentType === 'delivery' ? (
                          <span className="badge-delivery">🚲 Delivery: {order.deliveryAddress}</span>
                        ) : (
                          <span className="badge-pickup">🏬 Pickup: {order.pickupTime}</span>
                        )}
                      </div>

                      {order.notes && (
                        <div className="order-note-alert">
                          <em>Note:</em> {order.notes}
                        </div>
                      )}

                      <div className="order-items-table">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="order-item-row">
                            <span>{it.quantity}x {it.name}</span>
                            <span>₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                        <div className="order-item-total">
                          <span>Total Paid / Due ({order.paymentMethod}):</span>
                          <strong>₹{order.total}</strong>
                        </div>
                      </div>

                      <div className="order-status-actions">
                        <span className="actions-label">Change Status:</span>
                        <button 
                          className="status-btn baking"
                          onClick={() => handleUpdateOrderStatus(order.id, 'In the Oven / Baking')}
                        >
                          🔥 Baking
                        </button>
                        <button 
                          className="status-btn ready"
                          onClick={() => handleUpdateOrderStatus(order.id, 'Ready for Pickup')}
                        >
                          🥖 Ready
                        </button>
                        <button 
                          className="status-btn complete"
                          onClick={() => handleUpdateOrderStatus(order.id, 'Completed')}
                        >
                          ✅ Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RESERVATIONS TAB */}
          {activeTab === 'reservations' && (
            <div className="admin-section">
              {reservations.length === 0 ? (
                <div className="admin-empty">No table bookings recorded yet.</div>
              ) : (
                <div className="admin-table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Guest</th>
                        <th>Date &amp; Time</th>
                        <th>Party</th>
                        <th>Occasion / Request</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map(res => (
                        <tr key={res.id}>
                          <td><strong>{res.id}</strong></td>
                          <td>
                            <strong>{res.name}</strong><br />
                            <small>{res.phone}</small>
                          </td>
                          <td>
                            {res.date}<br />
                            <strong>{res.time}</strong>
                          </td>
                          <td>{res.guests} people</td>
                          <td>
                            {res.occasion}
                            {res.specialRequests && <><br /><small>"{res.specialRequests}"</small></>}
                          </td>
                          <td>
                            <span className="status-pill completed">{res.status || 'Confirmed'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* MENU & INVENTORY TAB */}
          {activeTab === 'menu' && (
            <div className="admin-section">
              <div className="menu-admin-header">
                <p>Manage in-stock availability and prices live on the public website.</p>
                <button 
                  className="button button-small button-primary"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  {showAddForm ? '✕ Close Form' : '+ Add Artisan Item'}
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={handleCreateMenuItem} className="admin-add-item-form">
                  <h4>Add New Baked Good or Beverage</h4>
                  <div className="form-grid three-col">
                    <div className="form-group">
                      <label>Item Name *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Cardamom Bun"
                        value={newItem.name} 
                        onChange={e => setNewItem({ ...newItem, name: e.target.value })} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Category *</label>
                      <select 
                        value={newItem.category} 
                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                      >
                        <option value="bread">Bread</option>
                        <option value="pastry">Pastry</option>
                        <option value="coffee">Coffee</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Price (₹) *</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="160"
                        value={newItem.price} 
                        onChange={e => setNewItem({ ...newItem, price: e.target.value })} 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input 
                      type="text" 
                      placeholder="Artisan description..."
                      value={newItem.description} 
                      onChange={e => setNewItem({ ...newItem, description: e.target.value })} 
                    />
                  </div>
                  <button type="submit" className="button button-primary">Save to Menu</button>
                </form>
              )}

              <div className="admin-menu-list">
                {menuItems.map(item => (
                  <div key={item.id} className={`admin-menu-row ${!item.inStock ? 'sold-out-row' : ''}`}>
                    <div className="item-info">
                      <strong>{item.name}</strong>
                      <span className="category-tag">{item.category}</span>
                      <p>{item.description}</p>
                    </div>

                    <div className="item-controls">
                      <div className="price-edit-box">
                        <span>₹</span>
                        <input 
                          type="number" 
                          defaultValue={item.price}
                          onBlur={(e) => handlePriceChange(item.id, e.target.value)}
                        />
                      </div>

                      <button
                        className={`stock-toggle-btn ${item.inStock ? 'in-stock' : 'out-of-stock'}`}
                        onClick={() => handleToggleStock(item)}
                      >
                        {item.inStock ? '✓ In Stock' : '✕ Sold Out'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && stats && (
            <div className="admin-section">
              <div className="stats-dashboard-grid">
                <div className="stat-card">
                  <span className="stat-icon">💰</span>
                  <div className="stat-val">₹{stats.totalRevenue.toLocaleString()}</div>
                  <div className="stat-title">Total Bakery Revenue</div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🧾</span>
                  <div className="stat-val">{stats.totalOrders}</div>
                  <div className="stat-title">Total Orders Received</div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🔥</span>
                  <div className="stat-val">{stats.activeOrders}</div>
                  <div className="stat-title">Active / In-Oven Orders</div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">📅</span>
                  <div className="stat-val">{stats.totalReservations}</div>
                  <div className="stat-title">Table Bookings</div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🥖</span>
                  <div className="stat-val">{stats.inStockCount} / {stats.menuItemCount}</div>
                  <div className="stat-title">Items Available in Stock</div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">📬</span>
                  <div className="stat-val">{stats.subscribersCount}</div>
                  <div className="stat-title">Newsletter Subscribers</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
