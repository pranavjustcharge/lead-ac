export interface MicroserviceConfig {
  auth: {
    baseUrl: string;
    port: number;
  };
  fileSystem: {
    baseUrl: string;
    port: number;
  };
  export: {
    baseUrl: string;
    port: number;
  };
  tenant: {
    id: string;
    name: string;
    jwtSecret: string;
  };
}

export const microserviceConfig: MicroserviceConfig = {
  auth: {
    baseUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    port: Number(process.env.AUTH_SERVICE_PORT) || 3001
  },
  fileSystem: {
    baseUrl: process.env.FILE_SERVICE_URL || 'http://localhost:3002',
    port: Number(process.env.FILE_SERVICE_PORT) || 3002
  },
  export: {
    baseUrl: process.env.EXPORT_SERVICE_URL || 'http://localhost:3005',
    port: Number(process.env.EXPORT_SERVICE_PORT) || 3005
  },
  tenant: {
    id: process.env.TENANT_ID || 'autocredits',
    name: process.env.TENANT_NAME || 'AutoCredits',
    jwtSecret: process.env.JWT_SECRET || 'AUTOCREDITS_JWT_SECRET_KEY'
  }
};

export const getServiceUrl = (service: keyof Omit<MicroserviceConfig, 'tenant'>): string => {
  return microserviceConfig[service].baseUrl;
};

export const getTenantHeaders = () => ({
  'X-Tenant-ID': microserviceConfig.tenant.id,
  'Content-Type': 'application/json'
});
