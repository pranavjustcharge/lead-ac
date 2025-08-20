import { Router, Request, Response } from 'express';
import { AuthClient } from '../services/microservices/authClient';
import { authenticate, requireRole, UserRole, requireManager, requireSuperAdmin } from '../middleware/auth';
import { sendResponse } from '../utils/response';

const router = Router();
const authClient = new AuthClient();

// Public routes (no authentication required)
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendResponse(res, 400, false, 'Email and password are required');
        }

        const result = await authClient.login({ email, password });

        if (result.success && result.data) {
            return sendResponse(res, 200, true, 'Login successful', result.data);
        } else {
            return sendResponse(res, 401, false, result.message || 'Login failed');
        }
    } catch (error: any) {
        console.error('Login error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

router.post('/refresh-token', async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return sendResponse(res, 400, false, 'Refresh token is required');
        }

        const result = await authClient.refreshToken(refreshToken);

        if (result.success && result.data) {
            return sendResponse(res, 200, true, 'Token refreshed successfully', result.data);
        } else {
            return sendResponse(res, 401, false, result.message || 'Token refresh failed');
        }
    } catch (error: any) {
        console.error('Token refresh error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Protected routes (authentication required)
router.post('/logout', authenticate, async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);

        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        const result = await authClient.logout(token);

        if (result.success) {
            return sendResponse(res, 200, true, 'Logout successful');
        } else {
            return sendResponse(res, 400, false, result.message || 'Logout failed');
        }
    } catch (error: any) {
        console.error('Logout error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);

        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        const result = await authClient.getCurrentUser(token);

        if (result.success && result.data) {
            return sendResponse(res, 200, true, 'User profile retrieved successfully', result.data);
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to retrieve user profile');
        }
    } catch (error: any) {
        console.error('Get profile error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// User management routes (Manager+ access required)
router.get('/users', authenticate, requireManager, async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);

        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        const result = await authClient.getUsers(token);

        if (result.success && result.data) {
            return sendResponse(res, 200, true, 'Users retrieved successfully', result.data);
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to retrieve users');
        }
    } catch (error: any) {
        console.error('Get users error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

router.post('/users', authenticate, requireManager, async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);

        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        const { name, email, password, role, managerId } = req.body;

        if (!name || !email || !password || !role) {
            return sendResponse(res, 400, false, 'Name, email, password, and role are required');
        }

        // Validate role is one of the AutoCredits allowed roles
        if (!Object.values(UserRole).includes(role)) {
            return sendResponse(res, 400, false, 'Invalid role. Allowed roles: superadmin, manager, leadexpert');
        }

        const result = await authClient.createUser({ name, email, password, role, managerId }, token);

        if (result.success && result.data) {
            return sendResponse(res, 201, true, 'User created successfully', result.data);
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to create user');
        }
    } catch (error: any) {
        console.error('Create user error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

router.put('/users/:userId', authenticate, requireManager, async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        const { userId } = req.params;

        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        if (!userId) {
            return sendResponse(res, 400, false, 'User ID is required');
        }

        const updateData = req.body;

        // If role is being updated, validate it
        if (updateData.role && !Object.values(UserRole).includes(updateData.role)) {
            return sendResponse(res, 400, false, 'Invalid role. Allowed roles: superadmin, manager, leadexpert');
        }

        const result = await authClient.updateUser(userId, updateData, token);

        if (result.success && result.data) {
            return sendResponse(res, 200, true, 'User updated successfully', result.data);
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to update user');
        }
    } catch (error: any) {
        console.error('Update user error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

router.delete('/users/:userId', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.substring(7);
        const { userId } = req.params;

        if (!token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        if (!userId) {
            return sendResponse(res, 400, false, 'User ID is required');
        }

        const result = await authClient.deleteUser(userId, token);

        if (result.success) {
            return sendResponse(res, 200, true, 'User deleted successfully');
        } else {
            return sendResponse(res, 400, false, result.message || 'Failed to delete user');
        }
    } catch (error: any) {
        console.error('Delete user error:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
});

// Role-specific routes
router.get('/roles', (req: Request, res: Response) => {
    return sendResponse(res, 200, true, 'Available roles', {
        roles: [
            {
                value: UserRole.SUPER_ADMIN,
                label: 'Super Admin',
                description: 'Full system access and user management'
            },
            {
                value: UserRole.MANAGER,
                label: 'Manager',
                description: 'Team management and lead oversight'
            },
            {
                value: UserRole.LEAD_EXPERT,
                label: 'Lead Expert',
                description: 'Lead management and customer interaction'
            }
        ]
    });
});

// Health check route
router.get('/health', (req: Request, res: Response) => {
    return sendResponse(res, 200, true, 'Auth service is healthy');
});

export default router;
