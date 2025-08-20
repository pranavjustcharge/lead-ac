import axios, { AxiosResponse } from 'axios';
import { getServiceUrl, getTenantHeaders } from '../../config/microservices';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
      tenantId: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  managerId?: string;
}

export class AuthClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getServiceUrl('auth');
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    token?: string
  ): Promise<T> {
    try {
      const headers = {
        ...getTenantHeaders(),
        ...(token && { Authorization: `Bearer ${token}` })
      };

      const response: AxiosResponse<T> = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        data,
        headers
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Authentication service error');
      }
      throw new Error('Failed to connect to authentication service');
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('POST', '/auth/login', credentials);
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('POST', '/auth/refresh-token', { refreshToken });
  }

  async logout(token: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>('POST', '/auth/logout', {}, token);
  }

  async getCurrentUser(token: string): Promise<{ success: boolean; data?: User; message: string }> {
    // For getting current user, don't send tenant header - let the token speak for itself
    try {
      const response: AxiosResponse<{ success: boolean; data?: User; message: string }> = await axios({
        method: 'GET',
        url: `${this.baseUrl}/auth/me`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Authentication service error');
      }
      throw new Error('Failed to connect to authentication service');
    }
  }
  
  async createUser(userData: CreateUserRequest, token: string): Promise<{ success: boolean; data?: User; message: string }> {
    return this.makeRequest<{ success: boolean; data?: User; message: string }>('POST', '/auth/users', userData, token);
  }

  async getUsers(token: string): Promise<{ success: boolean; data?: User[]; message: string }> {
    return this.makeRequest<{ success: boolean; data?: User[]; message: string }>('GET', '/auth/users', undefined, token);
  }

  async updateUser(userId: string, userData: Partial<CreateUserRequest>, token: string): Promise<{ success: boolean; data?: User; message: string }> {
    return this.makeRequest<{ success: boolean; data?: User; message: string }>('PUT', `/auth/users/${userId}`, userData, token);
  }

  async deleteUser(userId: string, token: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>('DELETE', `/auth/users/${userId}`, undefined, token);
  }

  async validateToken(token: string): Promise<{ success: boolean; data?: User; message: string }> {
    // For token validation, don't send tenant header - let the token speak for itself
    try {
      const response: AxiosResponse<{ success: boolean; data?: User; message: string }> = await axios({
        method: 'GET',
        url: `${this.baseUrl}/auth/me`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Authentication service error');
      }
      throw new Error('Failed to connect to authentication service');
    }
  }
}
