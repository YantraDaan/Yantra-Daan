import { config } from '../config/env';

const API_BASE_URL = config.apiUrl;
const API_BASE_PATH = config.apiBasePath;

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('authToken');
      const url = `${this.baseURL}${endpoint}`;
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
  }

  // Device Requests
  async getDeviceRequests(params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/api/device-requests/admin/all${queryString}`);
  }

  async updateRequestStatus(requestId: string, status: string, notes?: string, rejectionReason?: string) {
    return this.request(`/api/device-requests/admin/${requestId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        adminNotes: notes,
        rejectionReason
      })
    });
  }

  async createDeviceRequest(deviceId: string, message: string) {
    return this.request('/api/device-requests', {
      method: 'POST',
      body: JSON.stringify({ deviceId, message })
    });
  }

  async getUserRequests() {
    return this.request('/api/device-requests/my');
  }

  async cancelRequest(requestId: string) {
    return this.request(`/api/device-requests/my/${requestId}`, {
      method: 'DELETE'
    });
  }

  async getDeviceRequestsForDevice(deviceId: string) {
    return this.request(`/api/device-requests/device/${deviceId}`);
  }

  // Devices
  async getDevices(params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/api/devices/approved${queryString}`);
  }

  async getDeviceById(deviceId: string) {
    return this.request(`/api/devices/${deviceId}`);
  }

  async createDevice(deviceData: any) {
    return this.request('/api/devices', {
      method: 'POST',
      body: JSON.stringify(deviceData)
    });
  }

  async updateDevice(deviceId: string, deviceData: any) {
    return this.request(`/api/devices/${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify(deviceData)
    });
  }

  async deleteDevice(deviceId: string) {
    return this.request(`/api/devices/${deviceId}`, {
      method: 'DELETE'
    });
  }

  // Admin Device Management
  async getAdminDevices(params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/api/devices/admin/all${queryString}`);
  }

  async getPendingDevices() {
    return this.request('/api/devices/pending');
  }

  async updateDeviceStatus(deviceId: string, status: string, rejectionReason?: string, adminNotes?: string) {
    return this.request(`/api/devices/${deviceId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        rejectionReason,
        adminNotes
      })
    });
  }

  // Users
  async getUsers(params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/api/users${queryString}`);
  }

  async updateUserRole(userId: string, userRole: string) {
    return this.request(`/api/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ userRole })
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/api/users/${userId}`, {
      method: 'DELETE'
    });
  }

  // Auth
  async login(credentials: { email: string; password: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async signup(userData: any) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async forgotPassword(email: string) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password })
    });
  }

  // Profile
  async getUserProfile() {
    return this.request('/api/users/me');
  }

  async updateProfile(profileData: any) {
    return this.request('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Statistics
  async getDashboardStats() {
    return this.request('/api/device-donations/stats');
  }

  async getRequestStats() {
    return this.request('/api/device-requests/admin/stats');
  }

  // Contact
  async submitContactMessage(messageData: any) {
    return this.request('/api/contacts', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;
