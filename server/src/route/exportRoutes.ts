import { Router, Response } from 'express';
import { ExportClient } from '../services/microservices/exportClient';
import { authenticate, requireRole, UserRole, requireManager, requireSuperAdmin, AuthenticatedRequest } from '../middleware/auth';
import { sendResponse } from '../utils/response';

const router = Router();
const exportClient = new ExportClient();

// Create export
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        const { data, format, filename, template, options } = req.body;

        if (!data || !Array.isArray(data) || data.length === 0) {
            return sendResponse(res, 400, false, 'Data array is required and must not be empty');
        }

        if (!format || !['csv', 'excel', 'pdf'].includes(format)) {
            return sendResponse(res, 400, false, 'Valid format is required (csv, excel, or pdf)');
        }

        const exportRequest = {
            data,
            format,
            filename: filename || `export_${Date.now()}.${format}`,
            template,
            options
        };

        const result = await exportClient.createExport(exportRequest, token);

        if (result.success && result.data) {
            return sendResponse(res, 201, true, 'Export created successfully', result.data);
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to create export');
        }
    } catch (error: any) {
        console.error('Create export error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Get export status
router.get('/:exportId/status', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        const { exportId } = req.params;

        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        if (!exportId) {
            return sendResponse(res, 400, false, 'Export ID is required');
        }

        const result = await exportClient.getExportStatus(exportId, token);

        if (result.success && result.data) {
            return sendResponse(res, 200, true, 'Export status retrieved successfully', result.data);
        } else {
            return sendResponse(res, 404, false, result.message || 'Export not found');
        }
    } catch (error: any) {
        console.error('Get export status error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Get all exports
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        const { page, limit, status, format } = req.query;

        const params = {
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 10,
            status: status as string,
            format: format as string
        };

        const result = await exportClient.getExports(token, params);

        if (result.success && result.data) {
            return sendResponse(res, 200, true, 'Exports retrieved successfully', result.data);
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to retrieve exports');
        }
    } catch (error: any) {
        console.error('Get exports error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Download export
router.get('/:exportId/download', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        const { exportId } = req.params;

        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        if (!exportId) {
            return sendResponse(res, 400, false, 'Export ID is required');
        }

        // First check export status to ensure it's completed
        const statusResult = await exportClient.getExportStatus(exportId, token);

        if (!statusResult.success || !statusResult.data) {
            return sendResponse(res, 404, false, 'Export not found');
        }

        if (statusResult.data.status !== 'completed') {
            return sendResponse(res, 400, false, `Export is not ready. Status: ${statusResult.data.status}`);
        }

        const fileBuffer = await exportClient.downloadExport(exportId, token);

        // Set appropriate headers for download
        const filename = statusResult.data.downloadUrl?.split('/').pop() || `export_${exportId}`;
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', fileBuffer.length);

        return res.send(fileBuffer);
    } catch (error: any) {
        console.error('Download export error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Delete export (Manager+ access required)
router.delete('/:exportId', authenticate, requireManager, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        const { exportId } = req.params;

        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        if (!exportId) {
            return sendResponse(res, 400, false, 'Export ID is required');
        }

        const result = await exportClient.deleteExport(exportId, token);

        if (result.success) {
            return sendResponse(res, 200, true, 'Export deleted successfully');
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to delete export');
        }
    } catch (error: any) {
        console.error('Delete export error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Get available templates
router.get('/templates', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        const result = await exportClient.getExportTemplates(token);

        if (result.success && result.data) {
            return sendResponse(res, 200, true, 'Templates retrieved successfully', result.data);
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to retrieve templates');
        }
    } catch (error: any) {
        console.error('Get templates error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Get available formats
router.get('/formats', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        const result = await exportClient.getExportFormats(token);

        if (result.success && result.data) {
            return sendResponse(res, 200, true, 'Formats retrieved successfully', result.data);
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to retrieve formats');
        }
    } catch (error: any) {
        console.error('Get formats error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Get export statistics (Manager+ access required)
router.get('/stats', authenticate, requireManager, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        const result = await exportClient.getExportStats(token);

        if (result.success && result.data) {
            return sendResponse(res, 200, true, 'Export statistics retrieved successfully', result.data);
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to retrieve export statistics');
        }
    } catch (error: any) {
        console.error('Get export stats error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Convenience routes for common export types
router.post('/csv', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        const { data, filename, options } = req.body;

        if (!data || !Array.isArray(data) || data.length === 0) {
            return sendResponse(res, 400, false, 'Data array is required and must not be empty');
        }

        const result = await exportClient.exportToCSV(data, filename, options, token);

        if (result.success && result.data) {
            return sendResponse(res, 201, true, 'CSV export created successfully', result.data);
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to create CSV export');
        }
    } catch (error: any) {
        console.error('CSV export error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

router.post('/excel', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        const { data, filename, options } = req.body;

        if (!data || !Array.isArray(data) || data.length === 0) {
            return sendResponse(res, 400, false, 'Data array is required and must not be empty');
        }

        const result = await exportClient.exportToExcel(data, filename, options, token);

        if (result.success && result.data) {
            return sendResponse(res, 201, true, 'Excel export created successfully', result.data);
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to create Excel export');
        }
    } catch (error: any) {
        console.error('Excel export error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

router.post('/pdf', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        const { data, filename, template, options } = req.body;

        if (!data || !Array.isArray(data) || data.length === 0) {
            return sendResponse(res, 400, false, 'Data array is required and must not be empty');
        }

        const result = await exportClient.exportToPDF(data, filename, template, options, token);

        if (result.success && result.data) {
            return sendResponse(res, 201, true, 'PDF export created successfully', result.data);
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to create PDF export');
        }
    } catch (error: any) {
        console.error('PDF export error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Health check route
router.get('/health', (req: AuthenticatedRequest, res: Response) => {
    return sendResponse(res, 200, true, 'Export service is healthy');
});

export default router;
