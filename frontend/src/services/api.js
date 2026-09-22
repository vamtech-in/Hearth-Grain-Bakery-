// Hearth & Grain Bakery - API Client Service

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error! status: ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API request failed for ${endpoint}:`, err);
    throw err;
  }
}

export const bakeryApi = {
  // Menu
  getMenu: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.inStock) query.append('inStock', params.inStock);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/menu${qs}`);
  },
  createMenuItem: (item) => request('/menu', { method: 'POST', body: JSON.stringify(item) }),
  updateMenuItem: (id, updates) => request(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteMenuItem: (id) => request(`/menu/${id}`, { method: 'DELETE' }),

  // Orders
  createOrder: (orderData) => request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getOrders: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/orders${qs}`);
  },
  getOrderById: (id) => request(`/orders/${encodeURIComponent(id)}`),
  updateOrderStatus: (id, status) => request(`/orders/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  // Reservations
  bookReservation: (reservationData) => request('/reservations', {
    method: 'POST',
    body: JSON.stringify(reservationData)
  }),
  getReservations: () => request('/reservations'),
  updateReservationStatus: (id, status) => request(`/reservations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  // Schedule & Interactions
  getSchedule: () => request('/schedule'),
  getReviews: () => request('/reviews'),
  submitReview: (reviewData) => request('/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),
  submitContact: (contactData) => request('/contact', { method: 'POST', body: JSON.stringify(contactData) }),
  subscribeNewsletter: (email) => request('/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),

  // Admin Auth & Stats
  verifyAdminPin: (pin, role) => request('/admin/verify', {
    method: 'POST',
    body: JSON.stringify({ pin, role })
  }),
  getStats: () => request('/stats'),
  checkHealth: () => request('/health')
};
