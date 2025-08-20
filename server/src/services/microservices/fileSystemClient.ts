import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import { getServiceUrl, getTenantHeaders } from '../../config/microservices';

export interface FileMetadata {
  _id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url?: string;
  uploadedBy: string;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  data?: FileMetadata;
}

export interface FileListResponse {
  success: boolean;
  message: string;
  data?: FileMetadata[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface FileSearchParams {
  query?: string;
  mimetype?: string;
  uploadedBy?: string;
  page?: number;
  limit?: number;
}

export class FileSystemClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getServiceUrl('fileSystem');
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    token?: string,
    headers?: Record<string, string>
  ): Promise<T> {
    try {
      const requestHeaders = {
        ...getTenantHeaders(),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers
      };

      const response: AxiosResponse<T> = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        data,
        headers: requestHeaders
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'File system service error');
      }
      throw new Error('Failed to connect to file system service');
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    token: string,
    additionalData?: Record<string, any>
  ): Promise<FileUploadResponse> {
    try {
      // Create FormData instance
      const formData = new FormData();

      // Add the file
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });

      // Add additional data fields
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      // Get the headers from FormData
      const formHeaders = formData.getHeaders();

      const headers = {
        ...getTenantHeaders(),
        'Authorization': `Bearer ${token}`,
        ...formHeaders
      };

      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/files/upload`,
        data: formData,
        headers
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'File upload failed');
      }
      throw new Error('Failed to upload file');
    }
  }

  async getFiles(token: string, params?: FileSearchParams): Promise<FileListResponse> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    const endpoint = queryString ? `/files?${queryString}` : '/files';

    return this.makeRequest<FileListResponse>('GET', endpoint, undefined, token);
  }

  async getFileById(fileId: string, token: string): Promise<{ success: boolean; data?: FileMetadata; message: string }> {
    return this.makeRequest<{ success: boolean; data?: FileMetadata; message: string }>(
      'GET',
      `/files/${fileId}`,
      undefined,
      token
    );
  }

  async downloadFile(fileId: string, token: string): Promise<Buffer> {
    try {
      const headers = {
        ...getTenantHeaders(),
        Authorization: `Bearer ${token}`
      };

      const response = await axios({
        method: 'GET',
        url: `${this.baseUrl}/files/${fileId}/download`,
        headers,
        responseType: 'arraybuffer'
      });

      return Buffer.from(response.data);
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'File download failed');
      }
      throw new Error('Failed to download file');
    }
  }

  async deleteFile(fileId: string, token: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(
      'DELETE',
      `/files/${fileId}`,
      undefined,
      token
    );
  }

  async searchFiles(token: string, params: FileSearchParams): Promise<FileListResponse> {
    return this.makeRequest<FileListResponse>('GET', '/files/search', params, token);
  }

  async getFileStats(token: string): Promise<{ success: boolean; data?: any; message: string }> {
    return this.makeRequest<{ success: boolean; data?: any; message: string }>(
      'GET',
      '/files/stats',
      undefined,
      token
    );
  }

  async updateFileMetadata(
    fileId: string,
    metadata: Partial<Pick<FileMetadata, 'originalName'>>,
    token: string
  ): Promise<{ success: boolean; data?: FileMetadata; message: string }> {
    return this.makeRequest<{ success: boolean; data?: FileMetadata; message: string }>(
      'PUT',
      `/files/${fileId}`,
      metadata,
      token
    );
  }
}
