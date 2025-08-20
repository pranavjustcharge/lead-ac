import axios, { AxiosResponse } from 'axios';
import { getServiceUrl, getTenantHeaders } from '../../config/microservices';

export interface ExportRequest {
  data: any[];
  format: 'csv' | 'excel' | 'pdf';
  filename?: string;
  template?: string;
  options?: {
    columns?: string[];
    filters?: Record<string, any>;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

export interface ExportResponse {
  success: boolean;
  message: string;
  data?: {
    exportId: string;
    filename: string;
    downloadUrl: string;
    status: 'processing' | 'completed' | 'failed';
    createdAt: Date;
  };
}

export interface ExportStatus {
  success: boolean;
  message: string;
  data?: {
    exportId: string;
    status: 'processing' | 'completed' | 'failed';
    progress?: number;
    downloadUrl?: string;
    error?: string;
    createdAt: Date;
    completedAt?: Date;
  };
}

export interface ExportListResponse {
  success: boolean;
  message: string;
  data?: {
    exports: Array<{
      exportId: string;
      filename: string;
      format: string;
      status: string;
      createdAt: Date;
      completedAt?: Date;
    }>;
    meta?: {
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
    };
  };
}

export class ExportClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getServiceUrl('export');
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
        throw new Error(error.response.data.message || 'Export service error');
      }
      throw new Error('Failed to connect to export service');
    }
  }

  async createExport(exportRequest: ExportRequest, token: string): Promise<ExportResponse> {
    return this.makeRequest<ExportResponse>('POST', '/export', exportRequest, token);
  }

  async getExportStatus(exportId: string, token: string): Promise<ExportStatus> {
    return this.makeRequest<ExportStatus>('GET', `/export/${exportId}/status`, undefined, token);
  }

  async getExports(token: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    format?: string;
  }): Promise<ExportListResponse> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    const endpoint = queryString ? `/export?${queryString}` : '/export';

    return this.makeRequest<ExportListResponse>('GET', endpoint, undefined, token);
  }

  async downloadExport(exportId: string, token: string): Promise<Buffer> {
    try {
      const headers = {
        ...getTenantHeaders(),
        Authorization: `Bearer ${token}`
      };

      const response = await axios({
        method: 'GET',
        url: `${this.baseUrl}/export/${exportId}/download`,
        headers,
        responseType: 'arraybuffer'
      });

      return Buffer.from(response.data);
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Export download failed');
      }
      throw new Error('Failed to download export');
    }
  }

  async deleteExport(exportId: string, token: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(
      'DELETE',
      `/export/${exportId}`,
      undefined,
      token
    );
  }

  async getExportTemplates(token: string): Promise<{ success: boolean; data?: string[]; message: string }> {
    return this.makeRequest<{ success: boolean; data?: string[]; message: string }>(
      'GET',
      '/export/templates',
      undefined,
      token
    );
  }

  async getExportFormats(token: string): Promise<{ success: boolean; data?: string[]; message: string }> {
    return this.makeRequest<{ success: boolean; data?: string[]; message: string }>(
      'GET',
      '/export/formats',
      undefined,
      token
    );
  }

  async getExportStats(token: string): Promise<{ success: boolean; data?: any; message: string }> {
    return this.makeRequest<{ success: boolean; data?: any; message: string }>(
      'GET',
      '/export/stats',
      undefined,
      token
    );
  }

  // Convenience methods for common export types
  async exportToCSV(data: any[], filename?: string, options?: ExportRequest['options'], token?: string): Promise<ExportResponse> {
    const exportRequest: ExportRequest = {
      data,
      format: 'csv',
      filename: filename || `export_${Date.now()}.csv`,
      options
    };
    return this.createExport(exportRequest, token || '');
  }

  async exportToExcel(data: any[], filename?: string, options?: ExportRequest['options'], token?: string): Promise<ExportResponse> {
    const exportRequest: ExportRequest = {
      data,
      format: 'excel',
      filename: filename || `export_${Date.now()}.xlsx`,
      options
    };
    return this.createExport(exportRequest, token || '');
  }

  async exportToPDF(data: any[], filename?: string, template?: string, options?: ExportRequest['options'], token?: string): Promise<ExportResponse> {
    const exportRequest: ExportRequest = {
      data,
      format: 'pdf',
      filename: filename || `export_${Date.now()}.pdf`,
      template,
      options
    };
    return this.createExport(exportRequest, token || '');
  }
}
