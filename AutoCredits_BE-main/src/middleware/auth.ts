import { Request, Response, NextFunction } from 'express';
import { AuthClient } from '../services/microservices/authClient';
import { sendResponse } from '../utils/response';

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
    isActive?: boolean;
  };
  tenantId?: string;
}

// AutoCredits specific role hierarchy
export enum UserRole {
  SUPER_ADMIN = 'superadmin',
  MANAGER = 'manager',
  LEAD_EXPERT = 'leadexpert'
}

export class AuthMiddleware {
  private authClient: AuthClient;

  constructor() {
    this.authClient = new AuthClient();
  }

  /**
   * Middleware to authenticate JWT token
   */
  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendResponse(res, 401, false, 'Access token is required');
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Validate token with auth service
      const validationResult = await this.authClient.validateToken(token);

      if (!validationResult.success || !validationResult.data) {
        sendResponse(res, 401, false, 'Invalid or expired token');
        return;
      }

      // Set user and tenant information in request
      req.user = validationResult.data;
      req.tenantId = validationResult.data.tenantId;

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      sendResponse(res, 401, false, 'Authentication failed');
    }
  };

  /**
   * Middleware to check if user has required role
   */
  requireRole = (requiredRoles: UserRole | UserRole[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        sendResponse(res, 401, false, 'Authentication required');
        return;
      }

      const userRole = req.user.role as UserRole;
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      // Check role hierarchy
      const hasAccess = this.checkRoleAccess(userRole, roles);

      if (!hasAccess) {
        sendResponse(res, 403, false, 'Insufficient permissions');
        return;
      }

      next();
    };
  };

  /**
   * Check if user role has access to required roles
   */
  private checkRoleAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    const roleHierarchy = {
      [UserRole.SUPER_ADMIN]: 3,
      [UserRole.MANAGER]: 2,
      [UserRole.LEAD_EXPERT]: 1
    };

    const userRoleLevel = roleHierarchy[userRole] || 0;

    // User can access if their role level is >= any required role level
    return requiredRoles.some(role => userRoleLevel >= (roleHierarchy[role] || 0));
  }

  /**
   * Middleware to check if user is owner or has higher role
   */
  requireOwnershipOrRole = (requiredRoles: UserRole | UserRole[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        sendResponse(res, 401, false, 'Authentication required');
        return;
      }

      const userRole = req.user.role as UserRole;
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      // Check if user has required role
      const hasRoleAccess = this.checkRoleAccess(userRole, roles);

      if (hasRoleAccess) {
        next();
        return;
      }

      // Check if user is the owner (assuming resource has userId field)
      const resourceUserId = req.params.userId || req.body.userId;
      if (resourceUserId && req.user._id === resourceUserId) {
        next();
        return;
      }

      sendResponse(res, 403, false, 'Insufficient permissions');
    };
  };

  /**
   * Middleware to check if user belongs to the same tenant
   */
  requireSameTenant = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendResponse(res, 401, false, 'Authentication required');
      return;
    }

    const resourceTenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;

    if (resourceTenantId && req.user.tenantId !== resourceTenantId) {
      sendResponse(res, 403, false, 'Access denied to different tenant');
      return;
    }

    next();
  };

  /**
   * Middleware to check if user is active
   */
  requireActiveUser = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendResponse(res, 401, false, 'Authentication required');
      return;
    }

    // Check if user is active (only if the property exists)
    if (req.user.isActive === false) {
      sendResponse(res, 403, false, 'User account is deactivated');
      return;
    }

    next();
  };

  /**
   * Optional authentication - sets user if token is valid, but doesn't fail if missing
   */
  optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const validationResult = await this.authClient.validateToken(token);

        if (validationResult.success && validationResult.data) {
          req.user = validationResult.data;
          req.tenantId = validationResult.data.tenantId;
        }
      }

      next();
    } catch (error) {
      // Don't fail on optional auth errors, just continue without user
      next();
    }
  };

  /**
   * AutoCredits specific role checks
   */
  requireSuperAdmin = this.requireRole(UserRole.SUPER_ADMIN);
  requireManager = this.requireRole([UserRole.MANAGER, UserRole.SUPER_ADMIN]);
  requireLeadExpert = this.requireRole([UserRole.LEAD_EXPERT, UserRole.MANAGER, UserRole.SUPER_ADMIN]);
}

// Export singleton instance
export const authMiddleware = new AuthMiddleware();

// Export convenience functions
export const authenticate = authMiddleware.authenticate;
export const requireRole = authMiddleware.requireRole;
export const requireOwnershipOrRole = authMiddleware.requireOwnershipOrRole;
export const requireSameTenant = authMiddleware.requireSameTenant;
export const requireActiveUser = authMiddleware.requireActiveUser;
export const optionalAuth = authMiddleware.optionalAuth;

// AutoCredits specific role requirements
export const requireSuperAdmin = authMiddleware.requireSuperAdmin;
export const requireManager = authMiddleware.requireManager;
export const requireLeadExpert = authMiddleware.requireLeadExpert;
