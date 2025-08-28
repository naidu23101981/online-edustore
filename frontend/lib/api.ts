export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options && options.headers),
    },
    cache: 'no-store',
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: `Request failed: ${res.status}` }));
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  return res.json();
}

// Auth token management
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

export const AuthAPI = {
  async requestOtp(payload: { email?: string; phone?: string }) {
    if (!payload.email && !payload.phone) {
      throw new Error('Email or phone number is required');
    }
    
    return request<{ message: string; method: 'email' | 'sms' }>(`/api/auth/request-otp`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async verifyOtp(payload: { email?: string; phone?: string; code: string }) {
    if (!payload.code) {
      throw new Error('OTP code is required');
    }
    
    if (!payload.email && !payload.phone) {
      throw new Error('Email or phone number is required');
    }

    const response = await request<{ token: string; user: any }>(`/api/auth/verify-otp`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Store token on successful verification
    setAuthToken(response.token);
    return response;
  },

  async refreshToken() {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No token to refresh');
    }

    const response = await request<{ token: string }>(`/api/auth/refresh-token`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    setAuthToken(response.token);
    return response;
  },

  async getCurrentUser() {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    return request<{ user: any }>(`/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  logout() {
    removeAuthToken();
    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },

  isAuthenticated() {
    return !!getAuthToken();
  },

  getToken() {
    return getAuthToken();
  }
};

export const ExamAPI = {
  getAvailableExams() {
    return request<any[]>(`/api/exams/available`);
  },
  
  getExamQuestions(examId: string) {
    return request<any>(`/api/exams/${examId}/questions`);
  },
  
  submitExam(examId: string, answers: Record<number, string>) {
    return request<{ score: number; results: any[] }>(`/api/exams/${examId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },
  
  getExamResults(examId: string) {
    return request<any>(`/api/exams/${examId}/results`);
  },
  
  getUserAttempts() {
    return request<any[]>(`/api/exams/attempts`);
  },
};

export const ProductAPI = {
  getProducts(filters?: { category?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    
    return request<any[]>(`/api/products?${params.toString()}`);
  },
  
  getProduct(id: string) {
    return request<any>(`/api/products/${id}`);
  },
  
  purchaseProduct(productId: string) {
    return request<{ downloadId: string }>(`/api/products/${productId}/purchase`, {
      method: 'POST',
    });
  },
};

export const OrderAPI = {
  async createOrder(orderData: {
    items: Array<{
      id: string;
      title: string;
      category: string;
      price: number;
      quantity: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
  }) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return request<{ message: string; order: any }>(`/api/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
  },

  async getMyOrders(page = 1, limit = 10) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return request<{
      orders: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/api/orders/my-orders?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async getOrder(orderId: string) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return request<{ order: any }>(`/api/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async downloadProduct(downloadId: string) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return request<{ message: string; download: any }>(`/api/orders/download/${downloadId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async updateOrderStatus(orderId: string, status: string) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return request<{ message: string; order: any }>(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
  },

  async getOrderStats() {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return request<{ stats: any }>(`/api/orders/stats/overview`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};
