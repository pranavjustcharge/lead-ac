# 🔗 Microservices Integration Guide for AutoCredits Backend

This document explains how to use the integrated microservices (Auth, File System, and Export) in your AutoCredits backend application.

## 🏗️ Architecture Overview

Your AutoCredits backend now integrates with three microservices:

```
AutoCredits Backend (Port 2000)
├── Auth Service Integration (Port 3001)
├── File System Service Integration (Port 3002)
└── Export Service Integration (Port 3005)
```

## 🚀 Getting Started

### 1. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Database Configuration
DB_URL=mongodb://localhost:27017/autocredits_db

# Server Configuration
PORT=2000

# Microservices Configuration
AUTH_SERVICE_URL=http://localhost:3001
AUTH_SERVICE_PORT=3001
FILE_SERVICE_URL=http://localhost:3002
FILE_SERVICE_PORT=3002
EXPORT_SERVICE_URL=http://localhost:3005
EXPORT_SERVICE_PORT=3005

# Tenant Configuration
TENANT_ID=autocredits
TENANT_NAME=AutoCredits
JWT_SECRET=AUTOCREDITS_JWT_SECRET_KEY
```

### 2. Start Microservices

Make sure your microservices are running:

```bash
# In UserManagement-refactor-all-services directory
npm run dev:auth      # Auth service on port 3001
npm run dev:file      # File system service on port 3002
npm run dev:export    # Export service on port 3005
```

### 3. Start AutoCredits Backend

```bash
# In AutoCredits_BE-main directory
./start-integration.sh
# or manually:
npm run dev           # Your backend on port 2000
```

## 🔐 Authentication & Authorization

### AutoCredits Role System

The system supports three specific roles designed for AutoCredits business needs:

- **Super Admin** (`superadmin`): Full system access and user management
- **Manager** (`manager`): Team management and lead oversight
- **Lead Expert** (`leadexpert`): Lead management and customer interaction

### Role Hierarchy

```
Super Admin (Level 3) → Manager (Level 2) → Lead Expert (Level 1)
```

- **Super Admin** can access everything
- **Manager** can access Manager and Lead Expert level features
- **Lead Expert** can access basic features and lead management

### Login Flow

```typescript
// POST /api/auth/login
const loginData = {
  email: "user@autocredits.com",
  password: "password123"
};

const response = await fetch('http://localhost:2000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(loginData)
});

const { data } = await response.json();
const { accessToken, refreshToken, user } = data;
```

### Using Authentication in Requests

```typescript
// Include the access token in all authenticated requests
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};

// Example: Get user profile
const profileResponse = await fetch('http://localhost:2000/api/auth/me', {
  headers
});
```

### Role-Based Access Control

Routes automatically check permissions based on user role:

```typescript
// No additional configuration needed - middleware handles role checking
// Super Admin: Full access
// Manager: Manager + Lead Expert access
// Lead Expert: Basic access only
```

## 📁 File Management

### Upload Files

```typescript
// POST /api/files/upload
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('description', 'Insurance document');
formData.append('category', 'insurance');
formData.append('tags', 'policy,auto');

const uploadResponse = await fetch('http://localhost:2000/api/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

### Get Files

```typescript
// GET /api/files
const filesResponse = await fetch('http://localhost:2000/api/files?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// With filtering
const filteredResponse = await fetch('http://localhost:2000/api/files?mimetype=application/pdf&uploadedBy=userId', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Download Files

```typescript
// GET /api/files/{fileId}/download
const downloadResponse = await fetch(`http://localhost:2000/api/files/${fileId}/download`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Handle file download
const blob = await downloadResponse.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'filename.pdf';
a.click();
```

### Search Files

```typescript
// GET /api/files/search
const searchResponse = await fetch('http://localhost:2000/api/files/search?query=insurance&mimetype=application/pdf', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

## 📊 Data Export

### Export to CSV

```typescript
// POST /api/export/csv
const exportData = {
  data: [
    { name: 'John Doe', email: 'john@example.com', status: 'active' },
    { name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' }
  ],
  filename: 'users_report.csv',
  options: {
    columns: ['name', 'email', 'status'],
    sortBy: 'name',
    sortOrder: 'asc'
  }
};

const csvResponse = await fetch('http://localhost:2000/api/export/csv', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(exportData)
});
```

### Export to Excel

```typescript
// POST /api/export/excel
const excelExportData = {
  data: leadData, // Your lead data array
  filename: 'leads_report.xlsx',
  options: {
    columns: ['name', 'phone', 'email', 'status', 'createdAt'],
    filters: { status: 'active' }
  }
};

const excelResponse = await fetch('http://localhost:2000/api/export/excel', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(excelExportData)
});
```

### Export to PDF

```typescript
// POST /api/export/pdf
const pdfExportData = {
  data: customerData, // Your customer data array
  filename: 'customers_report.pdf',
  template: 'customer_report', // Optional template
  options: {
    columns: ['name', 'email', 'phone', 'address'],
    sortBy: 'name'
  }
};

const pdfResponse = await fetch('http://localhost:2000/api/export/pdf', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(pdfExportData)
});
```

### Check Export Status

```typescript
// GET /api/export/{exportId}/status
const statusResponse = await fetch(`http://localhost:2000/api/export/${exportId}/status`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const { data: statusData } = await statusResponse.json();
if (statusData.status === 'completed') {
  // Download the export
  const downloadResponse = await fetch(`http://localhost:2000/api/export/${exportId}/download`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
}
```

## 🔧 Integration with Existing AutoCredits Features

### Adding Authentication to Existing Routes

You can now protect your existing AutoCredits routes with authentication:

```typescript
// In your existing route files
import { authenticate, requireManager, requireSuperAdmin, UserRole } from '../middleware/auth';

// Protect a route with authentication
router.get('/leads', authenticate, async (req, res) => {
  // req.user contains the authenticated user information
  // req.tenantId contains the tenant ID
  // Your existing logic here
});

// Protect with role-based access
router.post('/leads', authenticate, requireManager, async (req, res) => {
  // Only managers and super admins can create leads
  // Your existing logic here
});

// Super admin only route
router.delete('/system/config', authenticate, requireSuperAdmin, async (req, res) => {
  // Only super admins can access this
  // Your existing logic here
});
```

### File Attachments for Leads

```typescript
// Add file upload to your lead creation
router.post('/leads', authenticate, upload.single('attachment'), async (req, res) => {
  try {
    // Create lead first
    const lead = await Lead.create({
      ...req.body,
      createdBy: req.user._id,
      tenantId: req.user.tenantId
    });

    // If file is uploaded, save it via file service
    if (req.file) {
      const fileResult = await fileSystemClient.uploadFile(req.file, req.headers.authorization?.substring(7) || '', {
        uploadedBy: req.user._id,
        description: `Attachment for lead: ${lead._id}`,
        category: 'lead_attachment'
      });

      // Update lead with file reference
      await Lead.findByIdAndUpdate(lead._id, {
        attachmentFileId: fileResult.data?._id
      });
    }

    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

### Export Lead Reports

```typescript
// Add export functionality to your leads route
router.get('/leads/export', authenticate, async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    
    // Get leads data
    const leads = await Lead.find({ tenantId: req.user.tenantId });
    
    // Export data
    const exportData = {
      data: leads,
      format: format as string,
      filename: `leads_report_${Date.now()}.${format}`,
      options: {
        columns: ['name', 'phone', 'email', 'status', 'createdAt'],
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
    };

    const exportResult = await exportClient.createExport(exportData, req.headers.authorization?.substring(7) || '');
    
    res.json({
      success: true,
      message: 'Export created successfully',
      data: exportResult.data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

## 🧪 Testing the Integration

### 1. Test Authentication

```bash
# Test login
curl -X POST http://localhost:2000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@autocredits.com","password":"password123"}'
```

### 2. Test File Upload

```bash
# Test file upload (replace TOKEN with actual token)
curl -X POST http://localhost:2000/api/files/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@test.pdf" \
  -F "description=Test document"
```

### 3. Test Export

```bash
# Test CSV export (replace TOKEN with actual token)
curl -X POST http://localhost:2000/api/export/csv \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":[{"name":"Test","email":"test@example.com"}],"filename":"test.csv"}'
```

### 4. Test Role-Based Access

```bash
# Test role information
curl -X GET http://localhost:2000/api/auth/roles

# Test user creation (Manager+ access required)
curl -X POST http://localhost:2000/api/auth/users \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"newuser@autocredits.com","password":"password123","role":"leadexpert"}'
```

## 🚨 Troubleshooting

### Common Issues

1. **Microservices not running**
   - Ensure all microservices are started
   - Check ports 3001, 3002, and 3005 are available

2. **Authentication errors**
   - Verify JWT_SECRET matches between services
   - Check tenant configuration

3. **File upload failures**
   - Ensure file size is under 10MB
   - Check file type is supported
   - Verify storage paths exist

4. **Export failures**
   - Check export service is running
   - Verify data format is correct
   - Check temporary directory permissions

5. **Role permission errors**
   - Verify user has the correct role assigned
   - Check role hierarchy in the system
   - Ensure role names match exactly: `superadmin`, `manager`, `leadexpert`

### Health Checks

```bash
# Check auth service
curl http://localhost:3001/auth/health

# Check file service
curl http://localhost:3002/files/health

# Check export service
curl http://localhost:3005/export/health

# Check AutoCredits backend
curl http://localhost:2000/

# Check available roles
curl http://localhost:2000/api/auth/roles
```

## 📚 Additional Resources

- [Microservices Architecture Documentation](../UserManagement-refactor-all-services/MICROSERVICES_INTEGRATION.md)
- [API Reference](../UserManagement-refactor-all-services/README.md)
- [Tenant Configuration](../UserManagement-refactor-all-services/config/tenants/autocredits.json)

## 🤝 Support

For issues or questions about the microservices integration:

1. Check the health endpoints
2. Review the logs in each service
3. Verify environment configuration
4. Check tenant configuration files
5. Verify user roles are correctly assigned

The integration provides a robust foundation for scaling your AutoCredits application with enterprise-grade authentication, file management, and data export capabilities, specifically tailored to your business roles and requirements.

## 🔐 AutoCredits Role Summary

| Role | Access Level | Description | Use Cases |
|------|--------------|-------------|-----------|
| **Super Admin** | Full System | Complete system access and user management | System configuration, user management, all features |
| **Manager** | Team Level | Team management and lead oversight | Lead management, file operations, export capabilities |
| **Lead Expert** | Basic Level | Lead management and customer interaction | Lead creation, file uploads, basic exports |

### Role Permissions Matrix

| Feature | Super Admin | Manager | Lead Expert |
|---------|-------------|---------|-------------|
| User Management | ✅ Full | ✅ Create/Update | ❌ None |
| File Management | ✅ Full | ✅ Full | ✅ Upload/Download |
| Export Features | ✅ Full | ✅ Full | ✅ Basic Export |
| System Config | ✅ Full | ❌ None | ❌ None |
| Lead Management | ✅ Full | ✅ Full | ✅ Full |
| Analytics | ✅ Full | ✅ Full | ❌ Limited |
