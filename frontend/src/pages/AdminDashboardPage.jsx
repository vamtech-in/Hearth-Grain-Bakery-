import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { bakeryApi } from '../services/api';
import '../styles/admin-dashboard.css';

const REFRESH_SECONDS = 8;

function playArtisanChime(type = 'order') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const now = ctx.currentTime;

    if (type === 'order') {
      const notes = [
        { frequency: 659.25, start: 0, duration: 0.6, volume: 0.28 },
        { frequency: 830.6, start: 0.18, duration: 0.82, volume: 0.3 },
      ];

      notes.forEach(({ frequency, start, duration, volume }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, now + start);

        gain.gain.setValueAtTime(volume, now + start);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          now + start + duration
        );

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + duration);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1046.5, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    }

    setTimeout(() => {
      try {
        ctx.close();
      } catch {
        // Ignore AudioContext cleanup errors.
      }
    }, 1200);
  } catch (error) {
    console.warn('Audio chime playback error:', error);
  }
}

function formatCurrency(value = 0) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function formatTime(date) {
  if (!date) return '--';

  try {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--';
  }
}

function formatDate(date) {
  if (!date) return '--';

  try {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '--';
  }
}

function getStatusClass(status = '') {
  return status
    .toLowerCase()
    .replace(/[\s/]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function isActiveOrder(status = '') {
  return !['completed', 'cancelled'].includes(status.toLowerCase());
}

export default function AdminDashboardPage() {
  const { showToast } = useCart();

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('hg_admin_auth') === 'true'
  );

  const [adminPin, setAdminPin] = useState('');
  const [adminRole, setAdminRole] = useState(
    () => sessionStorage.getItem('hg_admin_role') || 'Head Baker'
  );
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('orders');
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem('hg_sound_enabled') !== 'false'
  );
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(REFRESH_SECONDS);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');

  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [stats, setStats] = useState(null);

  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  const [reservationSearch, setReservationSearch] = useState('');

  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const [kotOrder, setKotOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [newMasterPin, setNewMasterPin] = useState('');

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hg_audit_logs') || '[]');
    } catch {
      return [];
    }
  });

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'bread',
    price: '',
    description: '',
    tags: '',
    image: '/favicon.jpg',
  });

  const prevOrdersCountRef = useRef(0);
  const prevReservationsCountRef = useRef(0);
  const firstOrdersLoadRef = useRef(true);
  const firstReservationsLoadRef = useRef(true);

  const currentRole =
    sessionStorage.getItem('hg_admin_role') || adminRole;

  const logAction = useCallback((actionText) => {
    const newLog = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      time: new Date().toLocaleString('en-IN'),
      role: sessionStorage.getItem('hg_admin_role') || adminRole,
      action: actionText,
    };

    setAuditLogs((previous) => {
      const updated = [newLog, ...previous].slice(0, 100);

      try {
        localStorage.setItem(
          'hg_audit_logs',
          JSON.stringify(updated)
        );
      } catch {
        // Ignore localStorage quota errors.
      }

      return updated;
    });
  }, [adminRole]);

  const loadData = useCallback(
    async (silent = false) => {
      if (!isAuthenticated) return;

      if (!silent) setSyncing(true);

      try {
        const [ordersRes, reservationsRes, menuRes, statsRes] =
          await Promise.all([
            bakeryApi.getOrders(),
            bakeryApi.getReservations(),
            bakeryApi.getMenu(),
            bakeryApi.getStats(),
          ]);

        let successfulRequests = 0;

        if (ordersRes?.success) {
          successfulRequests++;

          const incomingOrders = Array.isArray(ordersRes.data)
            ? ordersRes.data
            : [];

          if (
            !firstOrdersLoadRef.current &&
            prevOrdersCountRef.current > 0 &&
            incomingOrders.length > prevOrdersCountRef.current
          ) {
            const diff =
              incomingOrders.length - prevOrdersCountRef.current;

            showToast(
              `🔔 ${diff} new order${diff > 1 ? 's' : ''} received!`,
              'success'
            );

            if (soundEnabled) {
              playArtisanChime('order');
            }

            logAction(`Received ${diff} new order(s)`);
          }

          prevOrdersCountRef.current = incomingOrders.length;
          firstOrdersLoadRef.current = false;

          setOrders(incomingOrders);
        }

        if (reservationsRes?.success) {
          successfulRequests++;

          const incomingReservations = Array.isArray(
            reservationsRes.data
          )
            ? reservationsRes.data
            : [];

          if (
            !firstReservationsLoadRef.current &&
            prevReservationsCountRef.current > 0 &&
            incomingReservations.length >
              prevReservationsCountRef.current
          ) {
            showToast(
              '📅 New table reservation received!',
              'info'
            );

            if (soundEnabled) {
              playArtisanChime('bell');
            }

            logAction('New table reservation received');
          }

          prevReservationsCountRef.current =
            incomingReservations.length;

          firstReservationsLoadRef.current = false;

          setReservations(incomingReservations);
        }

        if (menuRes?.success) {
          successfulRequests++;
          setMenuItems(
            Array.isArray(menuRes.data) ? menuRes.data : []
          );
        }

        if (statsRes?.success) {
          successfulRequests++;
          setStats(statsRes.data);
        }

        setServerStatus(
          successfulRequests === 4 ? 'online' : 'partial'
        );
        setLastSyncedAt(new Date());
        setRefreshCountdown(REFRESH_SECONDS);
      } catch (error) {
        console.error('Error fetching admin data:', error);

        setServerStatus('offline');

        if (!silent) {
          showToast(
            'Could not sync with bakery server',
            'error'
          );
        }
      } finally {
        setSyncing(false);
      }
    },
    [
      isAuthenticated,
      soundEnabled,
      showToast,
      logAction,
    ]
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    loadData(false);
  }, [isAuthenticated, loadData]);

  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;

    const timer = setInterval(() => {
      setRefreshCountdown((previous) => {
        if (previous <= 1) {
          loadData(true);
          return REFRESH_SECONDS;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated, autoRefresh, loadData]);

  const handlePinSubmit = async (event) => {
    event.preventDefault();

    if (!adminPin.trim()) {
      setAuthError('Please enter your master PIN.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');

    try {
      const response = await bakeryApi.verifyAdminPin(
        adminPin,
        adminRole
      );

      if (response?.success) {
        setIsAuthenticated(true);

        sessionStorage.setItem('hg_admin_auth', 'true');
        sessionStorage.setItem('hg_admin_role', adminRole);

        showToast(
          `Welcome, ${adminRole}! Backstage unlocked.`,
          'success'
        );

        if (soundEnabled) {
          playArtisanChime('bell');
        }

        logAction(`Logged in as ${adminRole}`);

        setAdminPin('');
      } else {
        setAuthError(
          response?.message || 'Incorrect PIN.'
        );
      }
    } catch (error) {
      setAuthError(
        error?.message ||
          'Incorrect PIN. Check your bakery admin credentials.'
      );
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

    showToast(
      'Backstage portal locked.',
      'info'
    );
  };

  const handleUpdateMasterPin = (event) => {
    event.preventDefault();

    const pin = newMasterPin.trim();

    if (!/^\d{4,6}$/.test(pin)) {
      showToast(
        'PIN must contain 4 to 6 digits.',
        'error'
      );
      return;
    }

    /*
     * Preserved from the existing application.
     * For real production security, PIN changes should be
     * persisted and verified by the backend instead of
     * relying on localStorage.
     */
    localStorage.setItem(
      'hg_custom_master_pin',
      pin
    );

    showToast(
      '🔒 Master PIN updated locally.',
      'success'
    );

    logAction('Updated Master PIN code');

    setShowSecurityModal(false);
    setNewMasterPin('');
  };

  const exportOrdersCSV = () => {
    if (!orders.length) {
      showToast(
        'No orders to export.',
        'info'
      );
      return;
    }

    const headers = [
      'Order ID',
      'Customer Name',
      'Phone',
      'Total (INR)',
      'Status',
      'Date',
    ];

    const escapeCsv = (value) => {
      const stringValue = String(value ?? '');
      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const rows = orders.map((order) => [
      escapeCsv(order.id),
      escapeCsv(order.customerName),
      escapeCsv(order.customerPhone),
      escapeCsv(order.total),
      escapeCsv(order.status),
      escapeCsv(
        new Date(order.createdAt).toLocaleString('en-IN')
      ),
    ]);

    const csvContent = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `hearth_grain_orders_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast(
      '📥 Orders exported successfully.',
      'success'
    );

    logAction('Exported orders to CSV');
  };

  const toggleSound = () => {
    const next = !soundEnabled;

    setSoundEnabled(next);

    localStorage.setItem(
      'hg_sound_enabled',
      String(next)
    );

    if (next) {
      playArtisanChime('bell');

      showToast(
        '🔊 Audio chimes enabled.',
        'info'
      );
    } else {
      showToast(
        '🔇 Audio chimes muted.',
        'info'
      );
    }
  };

  const handleUpdateOrderStatus = async (
    orderId,
    newStatus
  ) => {
    try {
      const response =
        await bakeryApi.updateOrderStatus(
          orderId,
          newStatus
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            'Unable to update order.'
        );
      }

      setOrders((previous) =>
        previous.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );

      setSelectedOrder((previous) =>
        previous?.id === orderId
          ? {
              ...previous,
              status: newStatus,
            }
          : previous
      );

      showToast(
        `Order #${orderId} marked as "${newStatus}".`,
        'success'
      );

      if (soundEnabled) {
        playArtisanChime('bell');
      }

      logAction(
        `Updated Order #${orderId} status to ${newStatus}`
      );

      const statsResponse =
        await bakeryApi.getStats();

      if (statsResponse?.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      showToast(
        error?.message ||
          'Error updating order status.',
        'error'
      );
    }
  };

  const handleToggleStock = async (item) => {
    try {
      const updatedStock = !item.inStock;

      const response =
        await bakeryApi.updateMenuItem(
          item.id,
          {
            inStock: updatedStock,
          }
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            'Unable to update stock.'
        );
      }

      setMenuItems((previous) =>
        previous.map((menuItem) =>
          menuItem.id === item.id
            ? {
                ...menuItem,
                inStock: updatedStock,
              }
            : menuItem
        )
      );

      showToast(
        `"${item.name}" is now ${
          updatedStock
            ? 'In Stock'
            : 'Sold Out'
        }.`,
        'info'
      );

      logAction(
        `Toggled stock for ${item.name} → ${
          updatedStock
            ? 'In Stock'
            : 'Sold Out'
        }`
      );
    } catch (error) {
      showToast(
        error?.message ||
          'Error updating inventory stock.',
        'error'
      );
    }
  };

  const handleCreateMenuItem = async (event) => {
    event.preventDefault();

    const name = newItem.name.trim();
    const price = Number(newItem.price);

    if (!name) {
      showToast(
        'Item name is required.',
        'error'
      );
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      showToast(
        'Enter a valid price.',
        'error'
      );
      return;
    }

    try {
      const response =
        await bakeryApi.createMenuItem({
          name,
          category: newItem.category,
          price,
          description:
            newItem.description.trim(),
          tags: newItem.tags
            ? newItem.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
            : [],
          image:
            newItem.image.trim() ||
            '/favicon.jpg',
        });

      if (!response?.success) {
        throw new Error(
          response?.message ||
            'Unable to create menu item.'
        );
      }

      setMenuItems((previous) => [
        ...previous,
        response.data,
      ]);

      showToast(
        `✨ Added "${response.data.name}" to menu.`,
        'success'
      );

      if (soundEnabled) {
        playArtisanChime('bell');
      }

      logAction(
        `Added new menu item: ${response.data.name}`
      );

      setNewItem({
        name: '',
        category: 'bread',
        price: '',
        description: '',
        tags: '',
        image: '/favicon.jpg',
      });

      setShowAddForm(false);
    } catch (error) {
      showToast(
        error?.message ||
          'Failed to add menu item.',
        'error'
      );
    }
  };

  const handleDeleteMenuItem = async (
    id,
    name
  ) => {
    const confirmed = window.confirm(
      `Remove "${name}" from the live menu?`
    );

    if (!confirmed) return;

    try {
      const response =
        await bakeryApi.deleteMenuItem(id);

      if (!response?.success) {
        throw new Error(
          response?.message ||
            'Unable to remove menu item.'
        );
      }

      setMenuItems((previous) =>
        previous.filter(
          (item) => item.id !== id
        )
      );

      showToast(
        `Removed "${name}" from menu.`,
        'info'
      );

      logAction(
        `Deleted menu item: ${name}`
      );
    } catch (error) {
      showToast(
        error?.message ||
          'Error removing menu item.',
        'error'
      );
    }
  };

  const filteredOrders = useMemo(() => {
    const query = orderSearch
      .toLowerCase()
      .trim();

    return orders.filter((order) => {
      const status =
        String(order.status || '')
          .toLowerCase();

      const matchesFilter =
        orderFilter === 'all' ||
        status.includes(
          orderFilter.toLowerCase()
        );

      const matchesSearch =
        !query ||
        String(order.id || '')
          .toLowerCase()
          .includes(query) ||
        String(order.customerName || '')
          .toLowerCase()
          .includes(query) ||
        String(order.customerPhone || '')
          .includes(query);

      return (
        matchesFilter &&
        matchesSearch
      );
    });
  }, [
    orders,
    orderFilter,
    orderSearch,
  ]);

  const filteredReservations = useMemo(() => {
    const query =
      reservationSearch
        .toLowerCase()
        .trim();

    if (!query) return reservations;

    return reservations.filter(
      (reservation) =>
        String(reservation.id || '')
          .toLowerCase()
          .includes(query) ||
        String(reservation.name || '')
          .toLowerCase()
          .includes(query) ||
        String(reservation.phone || '')
          .includes(query) ||
        String(reservation.date || '')
          .toLowerCase()
          .includes(query)
    );
  }, [
    reservations,
    reservationSearch,
  ]);

  const filteredMenuItems = useMemo(() => {
    const query =
      menuSearch.toLowerCase().trim();

    return menuItems.filter((item) => {
      const matchesCategory =
        menuCategoryFilter === 'all' ||
        String(item.category || '')
          .toLowerCase() ===
          menuCategoryFilter.toLowerCase();

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in-stock'
          ? item.inStock
          : !item.inStock);

      const matchesSearch =
        !query ||
        String(item.name || '')
          .toLowerCase()
          .includes(query) ||
        String(item.description || '')
          .toLowerCase()
          .includes(query);

      return (
        matchesCategory &&
        matchesStock &&
        matchesSearch
      );
    });
  }, [
    menuItems,
    menuSearch,
    menuCategoryFilter,
    stockFilter,
  ]);

  const activeOrders = useMemo(
    () =>
      orders.filter((order) =>
        isActiveOrder(order.status)
      ),
    [orders]
  );

  const readyOrders = useMemo(
    () =>
      orders.filter((order) =>
        String(order.status || '')
          .toLowerCase()
          .includes('ready')
      ),
    [orders]
  );

  const soldOutCount = useMemo(
    () =>
      menuItems.filter(
        (item) => !item.inStock
      ).length,
    [menuItems]
  );

  const resetAddForm = () => {
    setNewItem({
      name: '',
      category: 'bread',
      price: '',
      description: '',
      tags: '',
      image: '/favicon.jpg',
    });
  };

  const renderServerStatus = () => {
    const statusMap = {
      online: {
        label: 'Online',
        className: 'online',
      },
      partial: {
        label: 'Partial Sync',
        className: 'partial',
      },
      offline: {
        label: 'Offline',
        className: 'offline',
      },
      checking: {
        label: 'Checking...',
        className: 'checking',
      },
    };

    const current =
      statusMap[serverStatus] ||
      statusMap.checking;

    return (
      <span
        className={`connection-status ${current.className}`}
      >
        <span className="status-dot" />
        {current.label}
      </span>
    );
  };

  return (
    <div className="admin-page-wrapper">
      <div className="admin-page-card">

        {/* HEADER */}
        <header className="admin-header">
          <div className="admin-brand">
            <div className="admin-logo-wrap">
              <img
                src="/favicon.jpg"
                alt="Hearth & Grain"
                className="admin-brand-logo"
              />
            </div>

            <div className="admin-brand-copy">
              <span className="staff-pill">
                KITCHEN & OPERATIONS
              </span>

              <h1>
                Hearth & Grain
                <span> Bakery</span>
              </h1>

              <p>
                Backstage control center
              </p>
            </div>

            {isAuthenticated && (
              <div className="admin-role-badge">
                <span>👤</span>
                {currentRole}
              </div>
            )}
          </div>

          <div className="admin-header-actions">
            {isAuthenticated && (
              <>
                {renderServerStatus()}

                <button
                  className={`header-action ${
                    soundEnabled
                      ? 'active'
                      : ''
                  }`}
                  onClick={toggleSound}
                  title="Toggle notification sounds"
                >
                  {soundEnabled
                    ? '🔊'
                    : '🔇'}
                  <span>
                    {soundEnabled
                      ? 'Sound'
                      : 'Muted'}
                  </span>
                </button>

                <button
                  className="header-action"
                  onClick={() =>
                    setShowSecurityModal(true)
                  }
                >
                  🔑
                  <span>Security</span>
                </button>

                {/* <button
                  className={`header-action ${
                    autoRefresh
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setAutoRefresh(
                      (value) => !value
                    )
                  }
                  title="Toggle automatic synchronization"
                >
                  {autoRefresh
                    ? '⟳'
                    : '⏸'}
                  <span>
                    {autoRefresh
                      ? `${refreshCountdown}s`
                      : 'Paused'}
                  </span>
                </button> */}

                <button
                  className="header-action sync-button"
                  onClick={() =>
                    loadData(false)
                  }
                  disabled={syncing}
                >
                  {syncing ? '⟳' : '↻'}
                  <span>
                    {syncing
                      ? 'Syncing'
                      : 'Sync'}
                  </span>
                </button>

                <button
                  className="header-action lock-action"
                  onClick={handleLogout}
                >
                  🔒
                  <span>Lock</span>
                </button>
              </>
            )}

            <button
              className="header-close"
              onClick={() => {
                try {
                  window.close();
                } catch {
                  // Ignore.
                }

                setTimeout(() => {
                  window.location.href = '/';
                }, 100);
              }}
              title="Return to bakery"
            >
              ✕
              <span>Close</span>
            </button>
          </div>
        </header>

        {/* AUTH */}
        {!isAuthenticated ? (
          <main className="admin-auth-container">
            <div className="admin-lock-card">
              <div className="lock-icon-wrapper">
                <span>🔐</span>
              </div>

              <div className="auth-heading">
                <span className="eyebrow">
                  STAFF ONLY
                </span>

                <h2>
                  Artisan Staff Access
                </h2>

                <p>
                  Unlock the bakery operations
                  portal to manage live orders,
                  reservations and inventory.
                </p>
              </div>

              <form
                onSubmit={handlePinSubmit}
                className="admin-pin-form"
              >
                <div className="form-group">
                  <label>
                    Staff Role
                  </label>

                  <div className="role-pills">
                    {[
                      'Head Baker',
                      'Kitchen Staff',
                      'Store Manager',
                    ].map((role) => (
                      <button
                        type="button"
                        key={role}
                        className={`role-pill-btn ${
                          adminRole === role
                            ? 'active'
                            : ''
                        }`}
                        onClick={() =>
                          setAdminRole(role)
                        }
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <div className="label-row">
                    <label htmlFor="adminPin">
                      Master PIN
                    </label>

                    <span>
                      4–6 digits
                    </span>
                  </div>

                  <input
                    id="adminPin"
                    type="password"
                    inputMode="numeric"
                    autoComplete="current-password"
                    maxLength={6}
                    className="pin-input-field"
                    placeholder="••••"
                    value={adminPin}
                    onChange={(event) => {
                      const value =
                        event.target.value.replace(
                          /\D/g,
                          ''
                        );

                      setAdminPin(value);
                      setAuthError('');
                    }}
                    autoFocus
                    required
                  />
                </div>

                {authError && (
                  <div className="admin-auth-error">
                    ⚠️ {authError}
                  </div>
                )}

                <div className="pin-keypad-grid">
                  {[
                    '1',
                    '2',
                    '3',
                    '4',
                    '5',
                    '6',
                    '7',
                    '8',
                    '9',
                    'C',
                    '0',
                    '✓',
                  ].map((key) => (
                    <button
                      type="button"
                      key={key}
                      className={`keypad-btn ${
                        key === 'C'
                          ? 'clear-key'
                          : key === '✓'
                          ? 'confirm-key'
                          : ''
                      }`}
                      onClick={() => {
                        if (key === 'C') {
                          setAdminPin('');
                          setAuthError('');
                        } else if (
                          key === '✓'
                        ) {
                          handlePinSubmit(
                            new Event('submit')
                          );
                        } else if (
                          adminPin.length < 6
                        ) {
                          setAdminPin(
                            (previous) =>
                              previous + key
                          );
                        }
                      }}
                    >
                      {key}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={
                    authLoading ||
                    adminPin.length < 4
                  }
                >
                  {authLoading ? (
                    <>
                      <span className="spinner" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      🔓 Unlock Backstage
                    </>
                  )}
                </button>
              </form>

              <div className="auth-security-note">
                <span>🛡️</span>
                <div>
                  <strong>
                    Secure staff access
                  </strong>
                  <small>
                    Your session is stored only
                    for this browser session.
                  </small>
                </div>
              </div>
            </div>
          </main>
        ) : (
          <>
            {/* QUICK STATS */}
            <section className="quick-stats">
              <div className="quick-stat-card">
                <div className="quick-stat-icon orders">
                  🥖
                </div>
                <div>
                  <span>
                    Active Orders
                  </span>
                  <strong>
                    {activeOrders.length}
                  </strong>
                  <small>
                    Currently in pipeline
                  </small>
                </div>
              </div>

              <div className="quick-stat-card">
                <div className="quick-stat-icon ready">
                  🔔
                </div>
                <div>
                  <span>
                    Ready for Pickup
                  </span>
                  <strong>
                    {readyOrders.length}
                  </strong>
                  <small>
                    Awaiting customers
                  </small>
                </div>
              </div>

              <div className="quick-stat-card">
                <div className="quick-stat-icon bookings">
                  📅
                </div>
                <div>
                  <span>
                    Table Bookings
                  </span>
                  <strong>
                    {reservations.length}
                  </strong>
                  <small>
                    Current reservations
                  </small>
                </div>
              </div>

              <div className="quick-stat-card">
                <div className="quick-stat-icon stock">
                  📦
                </div>
                <div>
                  <span>
                    Sold Out Items
                  </span>
                  <strong>
                    {soldOutCount}
                  </strong>
                  <small>
                    Need restocking
                  </small>
                </div>
              </div>
            </section>

            {/* NAVIGATION */}
            <nav className="admin-nav-tabs">
              <button
                className={`admin-tab ${
                  activeTab === 'orders'
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setActiveTab('orders')
                }
              >
                <span>🥖</span>
                <div>
                  <strong>
                    Live Orders
                  </strong>
                  <small>
                    {activeOrders.length}{' '}
                    active
                  </small>
                </div>
              </button>

              <button
                className={`admin-tab ${
                  activeTab ===
                  'reservations'
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setActiveTab(
                    'reservations'
                  )
                }
              >
                <span>📅</span>
                <div>
                  <strong>
                    Reservations
                  </strong>
                  <small>
                    {reservations.length}{' '}
                    bookings
                  </small>
                </div>
              </button>

              <button
                className={`admin-tab ${
                  activeTab === 'menu'
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setActiveTab('menu')
                }
              >
                <span>🥐</span>
                <div>
                  <strong>
                    Menu & Stock
                  </strong>
                  <small>
                    {menuItems.length} items
                  </small>
                </div>
              </button>

              <button
                className={`admin-tab ${
                  activeTab ===
                  'analytics'
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setActiveTab(
                    'analytics'
                  )
                }
              >
                <span>📊</span>
                <div>
                  <strong>
                    Analytics
                  </strong>
                  <small>
                    Business overview
                  </small>
                </div>
              </button>

              <button
                className={`admin-tab ${
                  activeTab === 'logs'
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setActiveTab('logs')
                }
              >
                <span>📋</span>
                <div>
                  <strong>
                    Audit Logs
                  </strong>
                  <small>
                    Staff activity
                  </small>
                </div>
              </button>
            </nav>

            <main className="admin-tab-body">

              {/* ORDERS */}
              {activeTab === 'orders' && (
                <section className="admin-section">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        KITCHEN PIPELINE
                      </span>
                      <h2>
                        Live Orders
                      </h2>
                      <p>
                        Track every bakery
                        order from receipt
                        to pickup.
                      </p>
                    </div>

                    <div className="section-heading-actions">
                      {lastSyncedAt && (
                        <span className="last-sync">
                          Last sync:{' '}
                          {formatTime(
                            lastSyncedAt
                          )}
                        </span>
                      )}

                      <button
                        className="outline-button"
                        onClick={
                          exportOrdersCSV
                        }
                      >
                        📥 Export CSV
                      </button>
                    </div>
                  </div>

                  <div className="orders-toolbar">
                    <div className="filter-group">
                      <span className="filter-label">
                        STATUS
                      </span>

                      {[
                        {
                          id: 'all',
                          label: 'All',
                        },
                        {
                          id: 'received',
                          label: '📥 Received',
                        },
                        {
                          id: 'baking',
                          label: '🔥 Baking',
                        },
                        {
                          id: 'ready',
                          label: '🥖 Ready',
                        },
                        {
                          id: 'completed',
                          label: '✓ Completed',
                        },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          className={`filter-btn ${
                            orderFilter ===
                            filter.id
                              ? 'active'
                              : ''
                          }`}
                          onClick={() =>
                            setOrderFilter(
                              filter.id
                            )
                          }
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>

                    <div className="search-box">
                      <span>⌕</span>
                      <input
                        type="search"
                        placeholder="Search order, customer or phone..."
                        value={
                          orderSearch
                        }
                        onChange={(event) =>
                          setOrderSearch(
                            event.target
                              .value
                          )
                        }
                      />
                      {orderSearch && (
                        <button
                          onClick={() =>
                            setOrderSearch(
                              ''
                            )
                          }
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  {filteredOrders.length ===
                  0 ? (
                    <div className="empty-state">
                      <div>🥖</div>
                      <h3>
                        No orders found
                      </h3>
                      <p>
                        There are no orders
                        matching your current
                        filter or search.
                      </p>
                    </div>
                  ) : (
                    <div className="admin-orders-list">
                      {filteredOrders.map(
                        (order) => (
                          <article
                            key={order.id}
                            className="admin-order-card"
                          >
                            <div className="order-card-top">
                              <div className="order-identity">
                                <span className="order-id-tag">
                                  #{order.id}
                                </span>

                                <span className="order-date">
                                  {formatDate(
                                    order.createdAt
                                  )}{' '}
                                  ·{' '}
                                  {formatTime(
                                    order.createdAt
                                  )}
                                </span>
                              </div>

                              <div className="order-top-actions">
                                <span
                                  className={`status-pill ${getStatusClass(
                                    order.status
                                  )}`}
                                >
                                  {order.status}
                                </span>

                                <button
                                  className="icon-button"
                                  title="View order"
                                  onClick={() =>
                                    setSelectedOrder(
                                      order
                                    )
                                  }
                                >
                                  👁
                                </button>

                                <button
                                  className="kot-button"
                                  onClick={() =>
                                    setKotOrder(
                                      order
                                    )
                                  }
                                >
                                  🖨️ KOT
                                </button>
                              </div>
                            </div>

                            <div className="order-customer">
                              <div className="customer-avatar">
                                {String(
                                  order.customerName ||
                                    'C'
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <strong>
                                  {
                                    order.customerName
                                  }
                                </strong>

                                <a
                                  href={`tel:${order.customerPhone}`}
                                >
                                  📞{' '}
                                  {
                                    order.customerPhone
                                  }
                                </a>
                              </div>
                            </div>

                            <div className="order-items">
                              {order.items?.map(
                                (
                                  item,
                                  index
                                ) => (
                                  <div
                                    key={
                                      index
                                    }
                                    className="order-item"
                                  >
                                    <span>
                                      <strong>
                                        {
                                          item.quantity
                                        }
                                        ×
                                      </strong>{' '}
                                      {
                                        item.name
                                      }
                                    </span>

                                    <strong>
                                      {formatCurrency(
                                        Number(
                                          item.price ||
                                            0
                                        ) *
                                          Number(
                                            item.quantity ||
                                              0
                                          )
                                      )}
                                    </strong>
                                  </div>
                                )
                              )}

                              <div className="order-total">
                                <span>
                                  Order Total
                                </span>

                                <strong>
                                  {formatCurrency(
                                    order.total
                                  )}
                                </strong>
                              </div>
                            </div>

                            <div className="pipeline">
                              <div className="pipeline-label">
                                <span>
                                  ORDER PIPELINE
                                </span>

                                <strong>
                                  {order.status}
                                </strong>
                              </div>

                              <div className="pipeline-buttons">
                                <button
                                  className={
                                    order.status ===
                                    'Received'
                                      ? 'current'
                                      : ''
                                  }
                                  onClick={() =>
                                    handleUpdateOrderStatus(
                                      order.id,
                                      'Received'
                                    )
                                  }
                                >
                                  <span>
                                    📥
                                  </span>
                                  Received
                                </button>

                                <button
                                  className={
                                    order.status
                                      ?.toLowerCase()
                                      .includes(
                                        'baking'
                                      )
                                      ? 'current'
                                      : ''
                                  }
                                  onClick={() =>
                                    handleUpdateOrderStatus(
                                      order.id,
                                      'In the Oven / Baking'
                                    )
                                  }
                                >
                                  <span>
                                    🔥
                                  </span>
                                  Baking
                                </button>

                                <button
                                  className={
                                    order.status
                                      ?.toLowerCase()
                                      .includes(
                                        'ready'
                                      )
                                      ? 'current'
                                      : ''
                                  }
                                  onClick={() =>
                                    handleUpdateOrderStatus(
                                      order.id,
                                      'Ready for Pickup'
                                    )
                                  }
                                >
                                  <span>
                                    🥖
                                  </span>
                                  Ready
                                </button>

                                <button
                                  className={
                                    order.status ===
                                    'Completed'
                                      ? 'current'
                                      : ''
                                  }
                                  onClick={() =>
                                    handleUpdateOrderStatus(
                                      order.id,
                                      'Completed'
                                    )
                                  }
                                >
                                  <span>
                                    ✓
                                  </span>
                                  Complete
                                </button>
                              </div>
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* RESERVATIONS */}
              {activeTab ===
                'reservations' && (
                <section className="admin-section">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        FRONT OF HOUSE
                      </span>

                      <h2>
                        Table Reservations
                      </h2>

                      <p>
                        Keep track of upcoming
                        bakery table bookings.
                      </p>
                    </div>

                    <div className="search-box compact">
                      <span>⌕</span>
                      <input
                        type="search"
                        placeholder="Search guest or booking..."
                        value={
                          reservationSearch
                        }
                        onChange={(event) =>
                          setReservationSearch(
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>

                  {filteredReservations.length ===
                  0 ? (
                    <div className="empty-state">
                      <div>📅</div>
                      <h3>
                        No reservations
                      </h3>
                      <p>
                        No table bookings match
                        your search.
                      </p>
                    </div>
                  ) : (
                    <div className="reservation-grid">
                      {filteredReservations.map(
                        (reservation) => (
                          <article
                            className="reservation-card"
                            key={
                              reservation.id
                            }
                          >
                            <div className="reservation-card-top">
                              <span className="booking-code">
                                {
                                  reservation.id
                                }
                              </span>

                              <span className="status-pill ready">
                                {reservation.status ||
                                  'Confirmed'}
                              </span>
                            </div>

                            <div className="reservation-main">
                              <div className="reservation-avatar">
                                {String(
                                  reservation.name ||
                                    'G'
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <h3>
                                  {
                                    reservation.name
                                  }
                                </h3>

                                <a
                                  href={`tel:${reservation.phone}`}
                                >
                                  📞{' '}
                                  {
                                    reservation.phone
                                  }
                                </a>
                              </div>
                            </div>

                            <div className="reservation-details">
                              <div>
                                <span>
                                  DATE
                                </span>
                                <strong>
                                  📅{' '}
                                  {
                                    reservation.date
                                  }
                                </strong>
                              </div>

                              <div>
                                <span>
                                  TIME
                                </span>
                                <strong>
                                  ⏰{' '}
                                  {
                                    reservation.time
                                  }
                                </strong>
                              </div>

                              <div>
                                <span>
                                  PARTY
                                </span>
                                <strong>
                                  👥{' '}
                                  {
                                    reservation.guests
                                  }{' '}
                                  guests
                                </strong>
                              </div>
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* MENU */}
              {activeTab === 'menu' && (
                <section className="admin-section">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        INVENTORY CONTROL
                      </span>

                      <h2>
                        Menu & Stock
                      </h2>

                      <p>
                        Manage your live bakery
                        catalogue and availability.
                      </p>
                    </div>

                    <button
                      className="primary-button"
                      onClick={() => {
                        setShowAddForm(
                          (value) =>
                            !value
                        );
                      }}
                    >
                      {showAddForm
                        ? '× Close Form'
                        : '+ Add Item'}
                    </button>
                  </div>

                  <div className="menu-toolbar">
                    <div className="toolbar-selects">
                      <select
                        value={
                          menuCategoryFilter
                        }
                        onChange={(event) =>
                          setMenuCategoryFilter(
                            event.target
                              .value
                          )
                        }
                      >
                        <option value="all">
                          All Categories
                        </option>
                        <option value="bread">
                          Breads
                        </option>
                        <option value="pastry">
                          Pastries
                        </option>
                        <option value="coffee">
                          Coffee
                        </option>
                      </select>

                      <select
                        value={stockFilter}
                        onChange={(event) =>
                          setStockFilter(
                            event.target
                              .value
                          )
                        }
                      >
                        <option value="all">
                          All Stock
                        </option>
                        <option value="in-stock">
                          In Stock
                        </option>
                        <option value="sold-out">
                          Sold Out
                        </option>
                      </select>
                    </div>

                    <div className="search-box">
                      <span>⌕</span>
                      <input
                        type="search"
                        placeholder="Search menu..."
                        value={menuSearch}
                        onChange={(event) =>
                          setMenuSearch(
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>

                  {showAddForm && (
                    <form
                      onSubmit={
                        handleCreateMenuItem
                      }
                      className="admin-add-item-form"
                    >
                      <div className="form-header">
                        <div>
                          <span className="eyebrow">
                            NEW PRODUCT
                          </span>

                          <h3>
                            Add Artisan Item
                          </h3>
                        </div>

                        <span className="form-icon">
                          🥖
                        </span>
                      </div>

                      <div className="form-grid">
                        <div className="form-group">
                          <label>
                            Item Name *
                          </label>

                          <input
                            type="text"
                            required
                            placeholder="e.g. Sourdough Loaf"
                            value={
                              newItem.name
                            }
                            onChange={(event) =>
                              setNewItem({
                                ...newItem,
                                name: event
                                  .target
                                  .value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Category *
                          </label>

                          <select
                            value={
                              newItem.category
                            }
                            onChange={(event) =>
                              setNewItem({
                                ...newItem,
                                category:
                                  event
                                    .target
                                    .value,
                              })
                            }
                          >
                            <option value="bread">
                              Bread
                            </option>
                            <option value="pastry">
                              Pastry
                            </option>
                            <option value="coffee">
                              Coffee
                            </option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>
                            Price (₹) *
                          </label>

                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            required
                            placeholder="250"
                            value={
                              newItem.price
                            }
                            onChange={(event) =>
                              setNewItem({
                                ...newItem,
                                price:
                                  event
                                    .target
                                    .value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group full">
                          <label>
                            Description
                          </label>

                          <textarea
                            rows="3"
                            placeholder="Describe this bakery item..."
                            value={
                              newItem.description
                            }
                            onChange={(event) =>
                              setNewItem({
                                ...newItem,
                                description:
                                  event
                                    .target
                                    .value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Tags
                          </label>

                          <input
                            type="text"
                            placeholder="fresh, vegan, bestseller"
                            value={
                              newItem.tags
                            }
                            onChange={(event) =>
                              setNewItem({
                                ...newItem,
                                tags: event
                                  .target
                                  .value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Image URL
                          </label>

                          <input
                            type="text"
                            placeholder="/images/item.jpg"
                            value={
                              newItem.image
                            }
                            onChange={(event) =>
                              setNewItem({
                                ...newItem,
                                image:
                                  event
                                    .target
                                    .value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="form-actions">
                        <button
                          type="button"
                          className="outline-button"
                          onClick={() => {
                            resetAddForm();
                            setShowAddForm(
                              false
                            );
                          }}
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="primary-button"
                        >
                          ✓ Save to Live Menu
                        </button>
                      </div>
                    </form>
                  )}

                  {filteredMenuItems.length ===
                  0 ? (
                    <div className="empty-state">
                      <div>🥐</div>
                      <h3>
                        No menu items
                      </h3>
                      <p>
                        Try changing your
                        filters or add a new
                        item.
                      </p>
                    </div>
                  ) : (
                    <div className="menu-admin-list">
                      {filteredMenuItems.map(
                        (item) => (
                          <article
                            key={item.id}
                            className={`menu-admin-card ${
                              !item.inStock
                                ? 'sold-out'
                                : ''
                            }`}
                          >
                            <div className="menu-image-wrap">
                              <img
                                src={
                                  item.image ||
                                  '/favicon.jpg'
                                }
                                alt={
                                  item.name
                                }
                                onError={(
                                  event
                                ) => {
                                  event.currentTarget.src =
                                    '/favicon.jpg';
                                }}
                              />

                              <span
                                className={`stock-badge ${
                                  item.inStock
                                    ? 'available'
                                    : 'unavailable'
                                }`}
                              >
                                {item.inStock
                                  ? '● Available'
                                  : '● Sold Out'}
                              </span>
                            </div>

                            <div className="menu-item-content">
                              <div className="menu-item-title">
                                <div>
                                  <span className="category-tag">
                                    {
                                      item.category
                                    }
                                  </span>

                                  <h3>
                                    {
                                      item.name
                                    }
                                  </h3>
                                </div>

                                <strong className="menu-price">
                                  {formatCurrency(
                                    item.price
                                  )}
                                </strong>
                              </div>

                              <p>
                                {item.description ||
                                  'No description available.'}
                              </p>

                              {item.tags
                                ?.length >
                                0 && (
                                <div className="tag-list">
                                  {item.tags.map(
                                    (
                                      tag
                                    ) => (
                                      <span
                                        key={
                                          tag
                                        }
                                      >
                                        #
                                        {tag}
                                      </span>
                                    )
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="menu-item-actions">
                              <button
                                className={`stock-toggle ${
                                  item.inStock
                                    ? 'in-stock'
                                    : 'out-stock'
                                }`}
                                onClick={() =>
                                  handleToggleStock(
                                    item
                                  )
                                }
                              >
                                {item.inStock
                                  ? '✓ In Stock'
                                  : '× Sold Out'}
                              </button>

                              <button
                                className="delete-button"
                                onClick={() =>
                                  handleDeleteMenuItem(
                                    item.id,
                                    item.name
                                  )
                                }
                                title="Delete item"
                              >
                                🗑
                              </button>
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* ANALYTICS */}
              {activeTab ===
                'analytics' && (
                <section className="admin-section">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        BUSINESS OVERVIEW
                      </span>

                      <h2>
                        Analytics & Reports
                      </h2>

                      <p>
                        Current operational
                        metrics from your bakery
                        system.
                      </p>
                    </div>
                  </div>

                  {stats ? (
                    <div className="analytics-dashboard">
                      <div className="analytics-card revenue">
                        <div className="analytics-card-icon">
                          ₹
                        </div>

                        <div>
                          <span>
                            Total Revenue
                          </span>

                          <strong>
                            {formatCurrency(
                              stats.totalRevenue
                            )}
                          </strong>

                          <small>
                            Recorded revenue
                          </small>
                        </div>
                      </div>

                      <div className="analytics-card">
                        <div className="analytics-card-icon">
                          🧾
                        </div>

                        <div>
                          <span>
                            Total Orders
                          </span>

                          <strong>
                            {
                              stats.totalOrders
                            }
                          </strong>

                          <small>
                            All-time orders
                          </small>
                        </div>
                      </div>

                      <div className="analytics-card">
                        <div className="analytics-card-icon">
                          🔥
                        </div>

                        <div>
                          <span>
                            Active Orders
                          </span>

                          <strong>
                            {
                              stats.activeOrders
                            }
                          </strong>

                          <small>
                            Currently processing
                          </small>
                        </div>
                      </div>

                      <div className="analytics-card">
                        <div className="analytics-card-icon">
                          📅
                        </div>

                        <div>
                          <span>
                            Reservations
                          </span>

                          <strong>
                            {
                              stats.totalReservations
                            }
                          </strong>

                          <small>
                            Table bookings
                          </small>
                        </div>
                      </div>

                      <div className="analytics-summary">
                        <div>
                          <span>
                            Operational Snapshot
                          </span>

                          <h3>
                            Bakery floor
                            status
                          </h3>
                        </div>

                        <div className="summary-grid">
                          <div>
                            <strong>
                              {
                                activeOrders.length
                              }
                            </strong>
                            <span>
                              Active orders
                            </span>
                          </div>

                          <div>
                            <strong>
                              {
                                readyOrders.length
                              }
                            </strong>
                            <span>
                              Ready
                            </span>
                          </div>

                          <div>
                            <strong>
                              {
                                menuItems.length
                              }
                            </strong>
                            <span>
                              Menu items
                            </span>
                          </div>

                          <div>
                            <strong>
                              {soldOutCount}
                            </strong>
                            <span>
                              Sold out
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div>📊</div>
                      <h3>
                        Analytics unavailable
                      </h3>
                      <p>
                        Sync with the bakery
                        server to load analytics.
                      </p>
                    </div>
                  )}
                </section>
              )}

              {/* LOGS */}
              {activeTab === 'logs' && (
                <section className="admin-section">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        ACCOUNTABILITY
                      </span>

                      <h2>
                        Staff Audit Logs
                      </h2>

                      <p>
                        Recent actions performed
                        in this browser session.
                      </p>
                    </div>

                    <button
                      className="outline-button danger-outline"
                      onClick={() => {
                        if (
                          !window.confirm(
                            'Clear all local audit logs?'
                          )
                        ) {
                          return;
                        }

                        setAuditLogs([]);
                        localStorage.removeItem(
                          'hg_audit_logs'
                        );

                        showToast(
                          'Audit logs cleared.',
                          'info'
                        );
                      }}
                    >
                      🗑 Clear Logs
                    </button>
                  </div>

                  {auditLogs.length ===
                  0 ? (
                    <div className="empty-state">
                      <div>📋</div>
                      <h3>
                        No activity yet
                      </h3>
                      <p>
                        Staff actions will
                        appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="audit-list">
                      {auditLogs.map(
                        (log) => (
                          <div
                            className="audit-row"
                            key={log.id}
                          >
                            <div className="audit-time">
                              <span>
                                🕒
                              </span>

                              <small>
                                {log.time}
                              </small>
                            </div>

                            <div className="audit-role">
                              {log.role}
                            </div>

                            <div className="audit-action">
                              {log.action}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </section>
              )}
            </main>

            <footer className="admin-footer">
              <span>
                Hearth & Grain Bakery ·
                Kitchen Operations
              </span>

              <span>
                {lastSyncedAt
                  ? `Synced ${formatTime(
                      lastSyncedAt
                    )}`
                  : 'Waiting for sync'}
              </span>
            </footer>
          </>
        )}

        {/* SECURITY MODAL */}
        {showSecurityModal && (
          <div
            className="admin-modal-backdrop"
            onClick={() =>
              setShowSecurityModal(false)
            }
          >
            <div
              className="admin-modal security-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="modal-icon">
                🔐
              </div>

              <div className="modal-heading">
                <span className="eyebrow">
                  SECURITY
                </span>

                <h2>
                  Update Master PIN
                </h2>

                <p>
                  Change the local bakery
                  access PIN configuration.
                </p>
              </div>

              <form
                onSubmit={
                  handleUpdateMasterPin
                }
              >
                <div className="form-group">
                  <label>
                    New PIN
                  </label>

                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    minLength={4}
                    pattern="[0-9]{4,6}"
                    required
                    autoFocus
                    className="pin-input-field"
                    placeholder="••••"
                    value={
                      newMasterPin
                    }
                    onChange={(event) =>
                      setNewMasterPin(
                        event.target.value.replace(
                          /\D/g,
                          ''
                        )
                      )
                    }
                  />
                </div>

                <div className="modal-warning">
                  <span>⚠️</span>
                  <p>
                    PIN changes stored only in
                    browser storage are not a
                    replacement for backend
                    authentication.
                  </p>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="outline-button"
                    onClick={() => {
                      setShowSecurityModal(
                        false
                      );
                      setNewMasterPin('');
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    🔒 Save PIN
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ORDER DETAILS MODAL */}
        {selectedOrder && (
          <div
            className="admin-modal-backdrop"
            onClick={() =>
              setSelectedOrder(null)
            }
          >
            <div
              className="admin-modal order-details-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="modal-header-row">
                <div>
                  <span className="eyebrow">
                    ORDER DETAILS
                  </span>

                  <h2>
                    #{selectedOrder.id}
                  </h2>
                </div>

                <button
                  className="modal-close"
                  onClick={() =>
                    setSelectedOrder(
                      null
                    )
                  }
                >
                  ×
                </button>
              </div>

              <div className="details-status-row">
                <span
                  className={`status-pill ${getStatusClass(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>

                <span>
                  {formatDate(
                    selectedOrder.createdAt
                  )}{' '}
                  ·{' '}
                  {formatTime(
                    selectedOrder.createdAt
                  )}
                </span>
              </div>

              <div className="details-customer">
                <div className="customer-avatar large">
                  {String(
                    selectedOrder.customerName ||
                      'C'
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {
                      selectedOrder.customerName
                    }
                  </strong>

                  <a
                    href={`tel:${selectedOrder.customerPhone}`}
                  >
                    {
                      selectedOrder.customerPhone
                    }
                  </a>
                </div>
              </div>

              <div className="details-items">
                {selectedOrder.items?.map(
                  (item, index) => (
                    <div
                      className="details-item"
                      key={index}
                    >
                      <div>
                        <strong>
                          {item.quantity}×{' '}
                          {item.name}
                        </strong>

                        <span>
                          {formatCurrency(
                            item.price
                          )}{' '}
                          each
                        </span>
                      </div>

                      <strong>
                        {formatCurrency(
                          Number(
                            item.price || 0
                          ) *
                            Number(
                              item.quantity ||
                                0
                            )
                        )}
                      </strong>
                    </div>
                  )
                )}
              </div>

              <div className="details-total">
                <span>
                  Total
                </span>

                <strong>
                  {formatCurrency(
                    selectedOrder.total
                  )}
                </strong>
              </div>

              <div className="modal-actions">
                <button
                  className="outline-button"
                  onClick={() => {
                    setKotOrder(
                      selectedOrder
                    );
                    setSelectedOrder(null);
                  }}
                >
                  🖨️ KOT Slip
                </button>

                <button
                  className="primary-button"
                  onClick={() =>
                    setSelectedOrder(null)
                  }
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KOT MODAL */}
        {kotOrder && (
          <div
            className="kot-modal-backdrop"
            onClick={() =>
              setKotOrder(null)
            }
          >
            <div
              className="kot-slip-card"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="kot-slip-header">
                <div className="kot-logo">
                  🥖
                </div>

                <h2>
                  HEARTH & GRAIN
                </h2>

                <p>
                  BAKERY
                </p>

                <span>
                  KITCHEN ORDER TICKET
                </span>
              </div>

              <div className="kot-meta">
                <div>
                  <span>
                    ORDER
                  </span>
                  <strong>
                    #{kotOrder.id}
                  </strong>
                </div>

                <div>
                  <span>
                    CUSTOMER
                  </span>
                  <strong>
                    {
                      kotOrder.customerName
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    TIME
                  </span>
                  <strong>
                    {formatTime(
                      kotOrder.createdAt
                    )}
                  </strong>
                </div>
              </div>

              <div className="kot-divider" />

              <div className="kot-items">
                <h3>
                  ITEMS TO BAKE / PACK
                </h3>

                {kotOrder.items?.map(
                  (item, index) => (
                    <div
                      className="kot-item"
                      key={index}
                    >
                      <span className="kot-checkbox">
                        □
                      </span>

                      <strong>
                        {item.quantity}×
                      </strong>

                      <span>
                        {item.name}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="kot-divider" />

              <div className="kot-total">
                <span>
                  ORDER TOTAL
                </span>

                <strong>
                  {formatCurrency(
                    kotOrder.total
                  )}
                </strong>
              </div>

              <div className="kot-actions no-print">
                <button
                  className="primary-button"
                  onClick={() =>
                    window.print()
                  }
                >
                  🖨️ Print KOT
                </button>

                <button
                  className="outline-button"
                  onClick={() =>
                    setKotOrder(null)
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}