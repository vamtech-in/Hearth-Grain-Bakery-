import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { bakeryApi } from '../services/api';

// Web Audio API Chime Synthesizer
function playArtisanChime(type = 'order') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'order') {
      // Pleasant double-chime (Ding-Dong / Oven Timer)
      const now = ctx.currentTime;
      
      // Note 1 (E5 - 659.25Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Note 2 (G#5 - 830.6Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(830.6, now + 0.18);
      gain2.gain.setValueAtTime(0.35, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 1.0);
    } else if (type === 'bell') {
      // Single warm bakery bell chime (C6 - 1046.5Hz)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1046.5, now);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  } catch (e) {
    console.warn('Audio chime playback error:', e);
  }
}

export default function AdminPortalModal() {
  const { isAdminOpen, setIsAdminOpen, showToast } = useCart();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('hg_admin_auth') === 'true';
  });
  const [adminPin, setAdminPin] = useState('');
  const [adminRole, setAdminRole] = useState('Head Baker');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Tabs: 'orders' | 'reservations' | 'menu' | 'analytics'
  const [activeTab, setActiveTab] = useState('orders');

  // Audio chimes & Polling settings
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('hg_sound_enabled') !== 'false';
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(8);

  // Data states
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Selected Order for KOT (Kitchen Order Ticket) Print Modal
  const [kotOrder, setKotOrder] = useState(null);

  // Menu CRUD states
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'bread',
    price: '',
    description: '',
    tags: '',
    image: '/images/image4.jpg'
  });

  const prevOrdersCountRef = useRef(0);
  const prevReservationsCountRef = useRef(0);

  // Load all admin data
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [ordersRes, resRes, menuRes, statsRes] = await Promise.all([
        bakeryApi.getOrders(),
        bakeryApi.getReservations(),
        bakeryApi.getMenu(),
        bakeryApi.getStats()
      ]);

      if (ordersRes.success) {
        // Detect if new orders arrived
        if (prevOrdersCountRef.current > 0 && ordersRes.data.length > prevOrdersCountRef.current) {
          const diff = ordersRes.data.length - prevOrdersCountRef.current;
          showToast(`🔔 ${diff} new order${diff > 1 ? 's' : ''} received!`, 'success');
          if (soundEnabled) playArtisanChime('order');
        }
        prevOrdersCountRef.current = ordersRes.data.length;
        setOrders(ordersRes.data);
      }

      if (resRes.success) {
        if (prevReservationsCountRef.current > 0 && resRes.data.length > prevReservationsCountRef.current) {
          showToast(`📅 New table reservation received!`, 'info');
          if (soundEnabled) playArtisanChime('bell');
        }
        prevReservationsCountRef.current = resRes.data.length;
        setReservations(resRes.data);
      }

      if (menuRes.success) setMenuItems(menuRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      if (!silent) showToast('Could not sync with bakery server', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isAdminOpen && isAuthenticated) {
      loadData();
    }
  }, [isAdminOpen, isAuthenticated]);

  // Auto-polling interval
  useEffect(() => {
    if (!isAdminOpen || !isAuthenticated || !autoRefresh) return;

    const timer = setInterval(() => {
      setRefreshCountdown(prev => {
        if (prev <= 1) {
          loadData(true);
          return 8;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAdminOpen, isAuthenticated, autoRefresh, soundEnabled]);

  // Handle Admin PIN verification
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await bakeryApi.verifyAdminPin(adminPin, adminRole);
      if (res.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('hg_admin_auth', 'true');
        sessionStorage.setItem('hg_admin_role', adminRole);
        showToast(`Welcome, ${adminRole}! Backstage unlocked.`, 'success');
        if (soundEnabled) playArtisanChime('bell');
        loadData();
      }
    } catch (err) {
      setAuthError(err.message || 'Incorrect PIN. Default master PIN is 1892.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('hg_admin_auth');
    sessionStorage.removeItem('hg_admin_role');
    setAdminPin('');
    setAuthError('');
    showToast('Backstage portal locked.', 'info');
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('hg_sound_enabled', String(next));
    if (next) {
      playArtisanChime('bell');
      showToast('🔊 Audio Chimes Enabled', 'info');
    } else {
      showToast('🔇 Audio Chimes Muted', 'info');
    }
  };

  // Order status transitions
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await bakeryApi.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        showToast(`Order #${orderId} marked as "${newStatus}"`, 'success');
        if (soundEnabled) playArtisanChime('bell');
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        bakeryApi.getStats().then(s => s.success && setStats(s.data));
      }
    } catch (err) {
      showToast(err.message || 'Error updating status', 'error');
    }
  };

  // Menu Stock Toggle
  const handleToggleStock = async (item) => {
    try {
      const updatedStock = !item.inStock;
      const res = await bakeryApi.updateMenuItem(item.id, { inStock: updatedStock });
      if (res.success) {
        showToast(`"${item.name}" is now ${updatedStock ? 'In Stock' : 'Sold Out'}`, 'info');
        setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, inStock: updatedStock } : m));
        bakeryApi.getStats().then(s => s.success && setStats(s.data));
      }
    } catch (err) {
      showToast('Error updating inventory stock', 'error');
    }
  };

  // Menu Item Create
  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    try {
      const res = await bakeryApi.createMenuItem({
        name: newItem.name.trim(),
        category: newItem.category,
        price: Number(newItem.price),
        description: newItem.description.trim(),
        tags: newItem.tags ? newItem.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
        image: newItem.image || (newItem.category === 'coffee' ? '/images/image5.jpg' : newItem.category === 'pastry' ? '/images/image3.jpg' : '/images/image4.jpg')
      });

      if (res.success) {
        showToast(`✨ Added "${res.data.name}" to the artisan menu!`, 'success');
        if (soundEnabled) playArtisanChime('bell');
        setMenuItems(prev => [...prev, res.data]);
        setNewItem({ name: '', category: 'bread', price: '', description: '', tags: '', image: '/images/image4.jpg' });
        setShowAddForm(false);
        bakeryApi.getStats().then(s => s.success && setStats(s.data));
      }
    } catch (err) {
      showToast('Failed to add menu item', 'error');
    }
  };

  // Menu Item Update (Edit modal)
  const handleSaveEditItem = async (e) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name || !editingItem.price) return;
    try {
      const res = await bakeryApi.updateMenuItem(editingItem.id, {
        name: editingItem.name.trim(),
        category: editingItem.category,
        price: Number(editingItem.price),
        description: editingItem.description.trim(),
        tags: Array.isArray(editingItem.tags) ? editingItem.tags : (editingItem.tags ? editingItem.tags.split(',').map(s => s.trim()).filter(Boolean) : []),
        image: editingItem.image
      });

      if (res.success) {
        showToast(`Updated "${res.data.name}" details!`, 'success');
        setMenuItems(prev => prev.map(m => m.id === editingItem.id ? res.data : m));
        setEditingItem(null);
      }
    } catch (err) {
      showToast('Failed to update menu item', 'error');
    }
  };

  // Menu Item Delete
  const handleDeleteMenuItem = async (id, name) => {
    try {
      const res = await bakeryApi.deleteMenuItem(id);
      if (res.success) {
        showToast(`Removed "${name}" from menu`, 'info');
        setMenuItems(prev => prev.filter(m => m.id !== id));
        setDeleteConfirmId(null);
        bakeryApi.getStats().then(s => s.success && setStats(s.data));
      }
    } catch (err) {
      showToast('Error removing menu item', 'error');
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const matchesFilter = orderFilter === 'all' || o.status.toLowerCase().includes(orderFilter.toLowerCase());
    const q = orderSearch.toLowerCase().trim();
    const matchesSearch = !q || (
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q)
    );
    return matchesFilter && matchesSearch;
  });

  // Filtered menu items
  const filteredMenuItems = menuItems.filter(m => {
    const matchesCategory = menuCategoryFilter === 'all' || m.category.toLowerCase() === menuCategoryFilter.toLowerCase();
    const q = menuSearch.toLowerCase().trim();
    const matchesSearch = !q || (
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      (m.tags && m.tags.some(t => t.toLowerCase().includes(q)))
    );
    return matchesCategory && matchesSearch;
  });

  if (!isAdminOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setIsAdminOpen(false)}>
      <div 
        className="modal-content admin-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
      >
        {/* ================= HEADER ================= */}
        <div className="modal-header admin-modal-header">
          <div className="admin-header-left">
            <span className="staff-pill">BAKERY BACKSTAGE</span>
            <h3>Kitchen &amp; Operations Portal</h3>
            {isAuthenticated && (
              <span className="admin-role-badge">👤 {sessionStorage.getItem('hg_admin_role') || adminRole}</span>
            )}
          </div>
          
          <div className="admin-header-actions">
            {isAuthenticated && (
              <>
                <button 
                  className={`button button-small sound-toggle-btn ${soundEnabled ? 'sound-on' : 'sound-off'}`}
                  onClick={toggleSound}
                  title={soundEnabled ? 'Mute Kitchen Chimes' : 'Enable Audio Chimes'}
                >
                  {soundEnabled ? '🔊 Chimes ON' : '🔇 Muted'}
                </button>
                <button 
                  className="button button-small" 
                  onClick={() => playArtisanChime('order')}
                  title="Test Chime Sound"
                >
                  🔔 Test Sound
                </button>
                <button 
                  className={`button button-small refresh-sync-btn ${autoRefresh ? 'sync-active' : ''}`}
                  onClick={() => loadData(false)} 
                  title="Refresh Live Data"
                >
                  ↻ Sync {autoRefresh && `(${refreshCountdown}s)`}
                </button>
                <button 
                  className="button button-small button-outline lock-btn"
                  onClick={handleLogout}
                  title="Lock Backstage Portal"
                >
                  🔒 Lock
                </button>
              </>
            )}
            <button 
              className="modal-close-btn"
              onClick={() => setIsAdminOpen(false)}
              aria-label="Close admin modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ================= LOCK / AUTH SCREEN ================= */}
        {!isAuthenticated ? (
          <div className="admin-auth-container">
            <div className="admin-lock-card">
              <div className="lock-icon-wrapper">
                <span className="lock-icon">🔐</span>
              </div>
              <h3>Artisan Staff Access</h3>
              <p className="auth-subtitle">Enter your 4-digit bakery master PIN to access live orders, menu control, and kitchen dispatch.</p>
              
              <form onSubmit={handlePinSubmit} className="admin-pin-form">
                <div className="form-group role-selector-group">
                  <label>Select Your Role</label>
                  <div className="role-pills">
                    {['Head Baker', 'Kitchen Staff', 'Store Manager'].map(r => (
                      <button
                        type="button"
                        key={r}
                        className={`role-pill-btn ${adminRole === r ? 'active' : ''}`}
                        onClick={() => setAdminRole(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="adminPin">Master PIN Code</label>
                  <input
                    id="adminPin"
                    type="password"
                    maxLength="6"
                    className="pin-input-field"
                    placeholder="••••"
                    value={adminPin}
                    onChange={e => setAdminPin(e.target.value)}
                    autoFocus
                    required
                  />
                  <small className="pin-hint">💡 Default Master Code: <strong>1892</strong> (or 0000)</small>
                </div>

                {authError && (
                  <div className="admin-auth-error">
                    ⚠️ {authError}
                  </div>
                )}

                <div className="pin-keypad-grid">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map(k => (
                    <button
                      type="button"
                      key={k}
                      className="keypad-btn"
                      onClick={() => {
                        if (k === 'C') setAdminPin('');
                        else if (k === '✓') handlePinSubmit(new Event('submit'));
                        else if (adminPin.length < 6) setAdminPin(prev => prev + k);
                      }}
                    >
                      {k}
                    </button>
                  ))}
                </div>

                <button 
                  type="submit" 
                  className="button button-primary auth-submit-btn"
                  disabled={authLoading || !adminPin}
                >
                  {authLoading ? 'Verifying...' : '🔓 Unlock Backstage'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ================= AUTHENTICATED PORTAL ================= */
          <>
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
                📊 Analytics &amp; Reports
              </button>
            </div>

            <div className="admin-tab-body">
              {/* ================= TAB 1: LIVE ORDERS ================= */}
              {activeTab === 'orders' && (
                <div className="admin-section">
                  <div className="orders-toolbar">
                    <div className="orders-filter-bar">
                      <span className="filter-label">Status:</span>
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'received', label: '📥 Received' },
                        { id: 'baking', label: '🔥 Baking' },
                        { id: 'ready', label: '🥖 Ready' },
                        { id: 'completed', label: '✅ Completed' }
                      ].map(f => (
                        <button
                          key={f.id}
                          className={`filter-btn ${orderFilter === f.id ? 'active' : ''}`}
                          onClick={() => setOrderFilter(f.id)}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <div className="orders-search-box">
                      <input 
                        type="text"
                        placeholder="🔍 Search Order ID, Name, Phone..."
                        value={orderSearch}
                        onChange={e => setOrderSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="admin-empty">
                      <p>No orders found matching this filter.</p>
                    </div>
                  ) : (
                    <div className="admin-orders-list">
                      {filteredOrders.map(order => (
                        <div key={order.id} className="admin-order-card">
                          <div className="order-top">
                            <div>
                              <strong className="order-id-tag">{order.id}</strong>
                              <span className="order-time">
                                🕒 {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <div className="order-top-right">
                              <button 
                                className="button button-small kot-print-btn"
                                onClick={() => setKotOrder(order)}
                                title="Open &amp; Print Kitchen Order Ticket (KOT)"
                              >
                                🖨️ KOT Slip
                              </button>
                              <div className={`status-pill ${order.status.toLowerCase().replace(/[\s\/]/g, '-')}`}>
                                {order.status}
                              </div>
                            </div>
                          </div>

                          <div className="order-customer-info">
                            <strong>{order.customerName}</strong> • <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a>
                            {order.fulfillmentType === 'delivery' ? (
                              <span className="badge-delivery">🚲 Delivery: {order.deliveryAddress}</span>
                            ) : (
                              <span className="badge-pickup">🏬 Counter Pickup: {order.pickupTime}</span>
                            )}
                          </div>

                          {order.notes && (
                            <div className="order-note-alert">
                              <strong>👨‍🍳 Baker Note:</strong> "{order.notes}"
                            </div>
                          )}

                          <div className="order-items-table">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="order-item-row">
                                <span><strong className="qty-tag">{it.quantity}x</strong> {it.name}</span>
                                <span>₹{it.price * it.quantity}</span>
                              </div>
                            ))}
                            <div className="order-item-total">
                              <span>Total ({order.paymentMethod.toUpperCase()}):</span>
                              <strong>₹{order.total}</strong>
                            </div>
                          </div>

                          <div className="order-status-actions">
                            <span className="actions-label">Pipeline Stepper:</span>
                            <div className="status-button-group">
                              <button 
                                className={`status-btn received ${order.status === 'Received' ? 'active-status' : ''}`}
                                onClick={() => handleUpdateOrderStatus(order.id, 'Received')}
                              >
                                📥 Received
                              </button>
                              <button 
                                className={`status-btn baking ${order.status.includes('Baking') ? 'active-status' : ''}`}
                                onClick={() => handleUpdateOrderStatus(order.id, 'In the Oven / Baking')}
                              >
                                🔥 In Oven
                              </button>
                              <button 
                                className={`status-btn ready ${order.status.includes('Ready') ? 'active-status' : ''}`}
                                onClick={() => handleUpdateOrderStatus(order.id, 'Ready for Pickup')}
                              >
                                🥖 Ready
                              </button>
                              <button 
                                className={`status-btn complete ${order.status === 'Completed' ? 'active-status' : ''}`}
                                onClick={() => handleUpdateOrderStatus(order.id, 'Completed')}
                              >
                                ✅ Complete
                              </button>
                              <button 
                                className={`status-btn cancel ${order.status === 'Cancelled' ? 'active-status' : ''}`}
                                onClick={() => handleUpdateOrderStatus(order.id, 'Cancelled')}
                              >
                                ✕ Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 2: TABLE RESERVATIONS ================= */}
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
                            <th>Guest Name</th>
                            <th>Date &amp; Time</th>
                            <th>Party</th>
                            <th>Occasion / Request</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservations.map(res => (
                            <tr key={res.id}>
                              <td><strong className="order-id-tag">{res.id}</strong></td>
                              <td>
                                <strong>{res.name}</strong><br />
                                <small>{res.phone}</small>
                              </td>
                              <td>
                                📅 {res.date}<br />
                                <strong>⏰ {res.time}</strong>
                              </td>
                              <td>👥 {res.guests} Guests</td>
                              <td>
                                <em>{res.occasion}</em>
                                {res.specialRequests && <><br /><small className="order-note-alert">"{res.specialRequests}"</small></>}
                              </td>
                              <td>
                                <span className="status-pill ready">{res.status || 'Confirmed'}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 3: MENU & INVENTORY (FULL CRUD) ================= */}
              {activeTab === 'menu' && (
                <div className="admin-section">
                  <div className="menu-admin-header">
                    <div className="menu-search-filter-bar">
                      <select 
                        value={menuCategoryFilter} 
                        onChange={e => setMenuCategoryFilter(e.target.value)}
                        className="category-filter-select"
                      >
                        <option value="all">All Categories</option>
                        <option value="bread">Breads</option>
                        <option value="pastry">Pastries</option>
                        <option value="coffee">Coffee &amp; Drinks</option>
                      </select>
                      <input 
                        type="text"
                        placeholder="🔍 Search items by name, ingredients..."
                        value={menuSearch}
                        onChange={e => setMenuSearch(e.target.value)}
                        className="menu-search-input"
                      />
                    </div>
                    <button 
                      className="button button-primary button-small"
                      onClick={() => { setShowAddForm(!showAddForm); setEditingItem(null); }}
                    >
                      {showAddForm ? '✕ Close Form' : '+ Add Artisan Item'}
                    </button>
                  </div>

                  {/* Add New Item Form */}
                  {showAddForm && (
                    <form onSubmit={handleCreateMenuItem} className="admin-add-item-form">
                      <h4>🥖 Add New Baked Good or Beverage</h4>
                      <div className="form-grid three-col">
                        <div className="form-group">
                          <label>Item Name *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="e.g. Cardamom Brioche Knot"
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
                            <option value="coffee">Coffee &amp; Beverages</option>
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
                      <div className="form-grid two-col">
                        <div className="form-group">
                          <label>Description</label>
                          <input 
                            type="text" 
                            placeholder="Artisan description (e.g. 24h cold fermented with ground Swedish cardamom)..."
                            value={newItem.description} 
                            onChange={e => setNewItem({ ...newItem, description: e.target.value })} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Tags (Comma separated)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Flaky, Spiced, Fresh Daily"
                            value={newItem.tags} 
                            onChange={e => setNewItem({ ...newItem, tags: e.target.value })} 
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Display Image</label>
                        <select 
                          value={newItem.image} 
                          onChange={e => setNewItem({ ...newItem, image: e.target.value })}
                        >
                          <option value="/images/image4.jpg">Rustic Loaf (Bread)</option>
                          <option value="/images/image1.jpg">Seeded Sourdough (Bread)</option>
                          <option value="/images/image3.jpg">Golden Croissant &amp; Pastry</option>
                          <option value="/images/image5.jpg">Artisan Coffee &amp; Espresso</option>
                        </select>
                      </div>
                      <div className="form-actions-row">
                        <button type="submit" className="button button-primary">Save to Live Menu</button>
                        <button type="button" className="button button-outline" onClick={() => setShowAddForm(false)}>Cancel</button>
                      </div>
                    </form>
                  )}

                  {/* Edit Item Modal / Inline Form */}
                  {editingItem && (
                    <form onSubmit={handleSaveEditItem} className="admin-add-item-form edit-mode">
                      <h4>✏️ Edit Menu Item: {editingItem.name}</h4>
                      <div className="form-grid three-col">
                        <div className="form-group">
                          <label>Name</label>
                          <input 
                            type="text" 
                            required 
                            value={editingItem.name}
                            onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Category</label>
                          <select 
                            value={editingItem.category} 
                            onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                          >
                            <option value="bread">Bread</option>
                            <option value="pastry">Pastry</option>
                            <option value="coffee">Coffee</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Price (₹)</label>
                          <input 
                            type="number" 
                            required 
                            value={editingItem.price}
                            onChange={e => setEditingItem({ ...editingItem, price: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <input 
                          type="text" 
                          value={editingItem.description}
                          onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                        />
                      </div>
                      <div className="form-actions-row">
                        <button type="submit" className="button button-primary">Save Changes</button>
                        <button type="button" className="button button-outline" onClick={() => setEditingItem(null)}>Cancel</button>
                      </div>
                    </form>
                  )}

                  {/* Menu Items List */}
                  <div className="admin-menu-list">
                    {filteredMenuItems.map(item => (
                      <div key={item.id} className={`admin-menu-row ${!item.inStock ? 'sold-out-row' : ''}`}>
                        <div className="item-thumbnail-preview">
                          <img src={item.image} alt={item.name} onError={(e) => { e.target.src = '/images/image4.jpg'; }} />
                        </div>
                        
                        <div className="item-info">
                          <div className="item-title-line">
                            <strong>{item.name}</strong>
                            <span className="category-tag">{item.category}</span>
                            <span className="price-tag-badge">₹{item.price}</span>
                          </div>
                          <p>{item.description}</p>
                          {item.tags && item.tags.length > 0 && (
                            <div className="item-tags-list">
                              {item.tags.map((t, idx) => (
                                <span key={idx} className="small-tag-pill">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="item-controls">
                          <button
                            className={`stock-toggle-btn ${item.inStock ? 'in-stock' : 'out-of-stock'}`}
                            onClick={() => handleToggleStock(item)}
                            title="Click to toggle In Stock vs Sold Out"
                          >
                            {item.inStock ? '✓ In Stock' : '✕ Sold Out'}
                          </button>

                          <button 
                            className="button button-small button-outline edit-item-btn"
                            onClick={() => { setEditingItem(item); setShowAddForm(false); }}
                            title="Edit Item Details"
                          >
                            ✏️ Edit
                          </button>

                          {deleteConfirmId === item.id ? (
                            <div className="delete-confirm-group">
                              <button 
                                className="button button-small button-danger"
                                onClick={() => handleDeleteMenuItem(item.id, item.name)}
                              >
                                Confirm
                              </button>
                              <button 
                                className="button button-small"
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button 
                              className="button button-small delete-item-btn"
                              onClick={() => setDeleteConfirmId(item.id)}
                              title="Delete Item"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= TAB 4: ANALYTICS & REPORTS ================= */}
              {activeTab === 'analytics' && stats && (
                <div className="admin-section analytics-section">
                  {/* Top KPI Cards */}
                  <div className="stats-dashboard-grid">
                    <div className="stat-card">
                      <span className="stat-icon">💰</span>
                      <div className="stat-val">₹{stats.totalRevenue.toLocaleString()}</div>
                      <div className="stat-title">Total Gross Revenue</div>
                      <small className="stat-sub">AOV: ₹{stats.avgOrderValue || 380}</small>
                    </div>
                    <div className="stat-card">
                      <span className="stat-icon">🧾</span>
                      <div className="stat-val">{stats.totalOrders}</div>
                      <div className="stat-title">Total Orders Received</div>
                      <small className="stat-sub">Completed: {stats.completedOrders || 0}</small>
                    </div>
                    <div className="stat-card">
                      <span className="stat-icon">🔥</span>
                      <div className="stat-val">{stats.activeOrders}</div>
                      <div className="stat-title">Active / In-Oven Orders</div>
                      <small className="stat-sub">Ready for Pickup: {stats.readyOrders || 0}</small>
                    </div>
                    <div className="stat-card">
                      <span className="stat-icon">📅</span>
                      <div className="stat-val">{stats.totalReservations}</div>
                      <div className="stat-title">Table Reservations</div>
                      <small className="stat-sub">Dine-in guests booked</small>
                    </div>
                  </div>

                  {/* Visual Analytics Charts Grid */}
                  <div className="analytics-charts-grid">
                    {/* 7-Day Revenue Trend Chart */}
                    <div className="chart-card">
                      <h4>📈 7-Day Revenue Trend</h4>
                      <p className="chart-sub">Daily revenue across all baking dispatches</p>
                      
                      <div className="bar-chart-container">
                        {(stats.last7Days || []).map((dayData, idx) => {
                          const maxRev = Math.max(...(stats.last7Days || []).map(d => d.revenue), 1000);
                          const heightPct = Math.max(15, Math.round((dayData.revenue / maxRev) * 100));
                          return (
                            <div key={idx} className="bar-column">
                              <div className="bar-tooltip">₹{dayData.revenue.toLocaleString()}<br />({dayData.ordersCount} orders)</div>
                              <div className="bar-fill" style={{ height: `${heightPct}%` }}>
                                <span className="bar-val-label">₹{dayData.revenue}</span>
                              </div>
                              <span className="bar-day-label">{dayData.day}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Top 5 Best-Selling Artisan Items */}
                    <div className="chart-card">
                      <h4>🥐 Top-Selling Artisan Items</h4>
                      <p className="chart-sub">Highest demand baked goods &amp; beverages</p>

                      <div className="top-items-list">
                        {(stats.topSellingItems && stats.topSellingItems.length > 0 ? stats.topSellingItems : [
                          { name: 'Country Sourdough', count: 18, revenue: 3240 },
                          { name: 'Butter Croissant', count: 15, revenue: 1800 },
                          { name: 'Almond Croissant', count: 12, revenue: 1920 },
                          { name: 'Oat Milk Flat White', count: 10, revenue: 1700 },
                          { name: 'Olive & Rosemary Focaccia', count: 8, revenue: 1680 }
                        ]).map((item, idx) => {
                          const maxCount = 20;
                          const widthPct = Math.min(100, Math.max(20, Math.round((item.count / maxCount) * 100)));
                          return (
                            <div key={idx} className="top-item-row">
                              <div className="top-item-meta">
                                <strong>#{idx + 1} {item.name}</strong>
                                <span>{item.count} sold • ₹{item.revenue}</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-bar-fill" style={{ width: `${widthPct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Peak Order Rush Hours */}
                    <div className="chart-card">
                      <h4>⏰ Peak Order Rush Hours</h4>
                      <p className="chart-sub">Busiest kitchen dispatch windows</p>

                      <div className="peak-hours-grid">
                        {Object.entries(stats.hourlyDistribution || {
                          'Morning (7am-11am)': 14,
                          'Midday (11am-2pm)': 8,
                          'Afternoon (2pm-5pm)': 4,
                          'Evening (5pm-9pm)': 6
                        }).map(([period, count], idx) => (
                          <div key={idx} className="peak-hour-box">
                            <span className="rush-period">{period}</span>
                            <strong className="rush-count">{count} Orders</strong>
                            <div className="rush-indicator" style={{ opacity: Math.max(0.3, count / 15) }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fulfillment Ratio Split */}
                    <div className="chart-card">
                      <h4>🚲 Fulfillment Ratio (Pickup vs Delivery)</h4>
                      <p className="chart-sub">Customer dining &amp; dispatch preferences</p>

                      <div className="fulfillment-split-container">
                        <div className="split-donut-summary">
                          <div className="split-stat pickup">
                            <span className="split-icon">🏬</span>
                            <strong>{stats.fulfillment?.pickupPercentage || 60}%</strong>
                            <span>Counter Pickup ({stats.fulfillment?.pickup || 0})</span>
                          </div>
                          <div className="split-stat delivery">
                            <span className="split-icon">🚲</span>
                            <strong>{stats.fulfillment?.deliveryPercentage || 40}%</strong>
                            <span>Bicycle Delivery ({stats.fulfillment?.delivery || 0})</span>
                          </div>
                        </div>
                        <div className="split-bar-track">
                          <div className="split-bar-pickup" style={{ width: `${stats.fulfillment?.pickupPercentage || 60}%` }} />
                          <div className="split-bar-delivery" style={{ width: `${stats.fulfillment?.deliveryPercentage || 40}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ================= KOT (KITCHEN ORDER TICKET) PRINT MODAL ================= */}
        {kotOrder && (
          <div className="kot-modal-backdrop" onClick={() => setKotOrder(null)}>
            <div className="kot-slip-card" onClick={e => e.stopPropagation()}>
              <div className="kot-slip-header">
                <h3>🥖 HEARTH &amp; GRAIN BAKERY</h3>
                <p className="kot-sub">*** KITCHEN ORDER TICKET (KOT) ***</p>
                <hr className="receipt-dash" />
              </div>

              <div className="kot-meta-grid">
                <div><strong>ORDER NO:</strong> {kotOrder.id}</div>
                <div><strong>TIME:</strong> {new Date(kotOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div><strong>CUSTOMER:</strong> {kotOrder.customerName}</div>
                <div><strong>TYPE:</strong> {kotOrder.fulfillmentType.toUpperCase()} ({kotOrder.pickupTime || kotOrder.deliveryAddress})</div>
              </div>

              <hr className="receipt-dash" />

              {kotOrder.notes && (
                <div className="kot-special-note">
                  ⚠️ <strong>SPECIAL INSTRUCTION:</strong><br />
                  "{kotOrder.notes}"
                </div>
              )}

              <div className="kot-items-checklist">
                <h4>ITEMS TO BAKE / PACK:</h4>
                {kotOrder.items.map((it, idx) => (
                  <div key={idx} className="kot-item-check-row">
                    <span className="kot-checkbox">[ ]</span>
                    <strong className="kot-qty">{it.quantity}x</strong>
                    <span className="kot-name">{it.name}</span>
                  </div>
                ))}
              </div>

              <hr className="receipt-dash" />

              <div className="kot-footer">
                <div>STATUS: <strong>{kotOrder.status.toUpperCase()}</strong></div>
                <div>TOTAL: ₹{kotOrder.total} ({kotOrder.paymentMethod.toUpperCase()})</div>
                <p className="kot-baked-with-love">Slow Fermented • Hearth Baked</p>
              </div>

              <div className="kot-modal-actions no-print">
                <button 
                  className="button button-primary"
                  onClick={() => window.print()}
                >
                  🖨️ Print KOT Slip
                </button>
                <button 
                  className="button button-outline"
                  onClick={() => setKotOrder(null)}
                >
                  Close Slip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
