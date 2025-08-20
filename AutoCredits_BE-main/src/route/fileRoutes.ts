import { Router, Response } from "express";
import { FileSystemClient } from '../services/microservices/fileSystemClient';
import { authenticate, requireRole, UserRole, requireManager, requireSuperAdmin, AuthenticatedRequest } from '../middleware/auth';
import { sendResponse } from '../utils/response';
import multer from 'multer';

const router = Router();
const fileSystemClient = new FileSystemClient();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow only specific file types
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// File upload route
router.post('/upload', authenticate, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file) {
            return sendResponse(res, 400, false, 'No file uploaded');
        }

        const token = req.headers.authorization?.substring(7);
        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        // Get additional metadata from request body
        const additionalData = {
            uploadedBy: req.user?._id || 'unknown',
            description: req.body.description,
            category: req.body.category,
            tags: req.body.tags
        };

        const result = await fileSystemClient.uploadFile(req.file, token, additionalData);

        if (result.success && result.data) {
            return sendResponse(res, 201, true, 'File uploaded successfully', result.data);
        } else {
            return sendResponse(res, 400, false, result.message || 'File upload failed');
        }
    } catch (error: any) {
        console.error('File upload error:', error);
        if (error.message === 'Invalid file type') {
            return sendResponse(res, 400, false, 'Invalid file type. Allowed types: JPEG, PNG, GIF, PDF, DOC, DOCX, TXT');
        }
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Get all files (with optional filtering)
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        const { query, mimetype, uploadedBy, page, limit } = req.query;

        const params = {
            query: query as string,
            mimetype: mimetype as string,
            uploadedBy: uploadedBy as string,
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 10
        };

        const result = await fileSystemClient.getFiles(token, params);

        if (result.success && result.data) {
            return sendResponse(res, 200, true, 'Files retrieved successfully', {
                files: result.data,
                meta: result.meta
            });
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to retrieve files');
        }
    } catch (error: any) {
        console.error('Get files error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Get file by ID
router.get('/:fileId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        const { fileId } = req.params;

        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        if (!fileId) {
            return sendResponse(res, 400, false, 'File ID is required');
        }

        const result = await fileSystemClient.getFileById(fileId, token);

        if (result.success && result.data) {
            return sendResponse(res, 200, true, 'File retrieved successfully', result.data);
        } else {
            return sendResponse(res, 404, false, result.message || 'File not found');
        }
    } catch (error: any) {
        console.error('Get file error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Download file
router.get('/:fileId/download', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        const { fileId } = req.params;

        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        if (!fileId) {
            return sendResponse(res, 400, false, 'File ID is required');
        }

        const fileBuffer = await fileSystemClient.downloadFile(fileId, token);

        // Get file metadata to set proper headers
        const fileInfo = await fileSystemClient.getFileById(fileId, token);

        if (fileInfo.success && fileInfo.data) {
            res.setHeader('Content-Type', fileInfo.data.mimetype);
            res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.data.originalName}"`);
            res.setHeader('Content-Length', fileInfo.data.size);

            return res.send(fileBuffer);
        } else {
            return sendResponse(res, 404, false, 'File not found');
        }
    } catch (error: any) {
        console.error('Download file error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Search files
router.get('/search', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        const { query, mimetype, uploadedBy, page, limit } = req.query;

        const params = {
            query: query as string,
            mimetype: mimetype as string,
            uploadedBy: uploadedBy as string,
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 10
        };

        const result = await fileSystemClient.searchFiles(token, params);

        if (result.success && result.data) {
            return sendResponse(res, 200, true, 'Search completed successfully', {
                files: result.data,
                meta: result.meta
            });
        } else {
            return sendResponse(res, 400, false, result.message || 'Search failed');
        }
    } catch (error: any) {
        console.error('Search files error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Update file metadata (Manager+ access required)
router.put('/:fileId', authenticate, requireManager, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        const { fileId } = req.params;

        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        if (!fileId) {
            return sendResponse(res, 400, false, 'File ID is required');
        }

        const { originalName } = req.body;
        const updateData = { originalName };

        const result = await fileSystemClient.updateFileMetadata(fileId, updateData, token);

        if (result.success && result.data) {
            return sendResponse(res, 200, true, 'File metadata updated successfully', result.data);
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to update file metadata');
        }
    } catch (error: any) {
        console.error('Update file error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Delete file (Manager+ access required)
router.delete('/:fileId', authenticate, requireManager, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        const { fileId } = req.params;

        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        if (!fileId) {
            return sendResponse(res, 400, false, 'File ID is required');
        }

        const result = await fileSystemClient.deleteFile(fileId, token);

        if (result.success) {
            return sendResponse(res, 200, true, 'File deleted successfully');
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to delete file');
        }
    } catch (error: any) {
        console.error('Delete file error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Get file statistics (Manager+ access required)
router.get('/stats', authenticate, requireManager, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        const result = await fileSystemClient.getFileStats(token);

        if (result.success && result.data) {
            return sendResponse(res, 200, true, 'File statistics retrieved successfully', result.data);
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to retrieve file statistics');
        }
    } catch (error: any) {
        console.error('Get file stats error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Health check route
router.get('/health', (req: AuthenticatedRequest, res: Response) => {
    return sendResponse(res, 200, true, 'File system service is healthy');
});

export default router;
