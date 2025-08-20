// AutoCredits User Management Script
// This script provides functions to manage users in the MongoDB database

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Configuration
const config = {
    url: 'mongodb://localhost:27017',
    dbName: 'JustTechnology'
};

// User roles and permissions
const ROLES = {
    superadmin: {
        name: 'Super Admin',
        permissions: [
            'user.create', 'user.read', 'user.update', 'user.delete',
            'role.manage', 'tenant.manage', 'system.admin',
            'file.manage', 'export.manage', 'audit.view'
        ]
    },
    manager: {
        name: 'Manager',
        permissions: [
            'user.create', 'user.read', 'user.update',
            'team.manage', 'lead.manage', 'report.view',
            'file.manage', 'export.create'
        ]
    },
    leadexpert: {
        name: 'Lead Expert',
        permissions: [
            'lead.manage', 'customer.interact', 'report.view',
            'file.upload', 'file.download'
        ]
    }
};

class UserManager {
    constructor() {
        this.client = null;
        this.db = null;
        this.usersCollection = null;
        this.tenantsCollection = null;
    }

    async connect() {
        try {
            this.client = new MongoClient(config.url);
            await this.client.connect();
            this.db = this.client.db(config.dbName);
            this.usersCollection = this.db.collection('users');
            this.tenantsCollection = this.db.collection('tenants');
            console.log('✅ Connected to MongoDB');
        } catch (error) {
            console.error('❌ Failed to connect to MongoDB:', error.message);
            throw error;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log('🔌 MongoDB connection closed');
        }
    }

    async createUser(userData) {
        try {
            // Validate required fields
            if (!userData.name || !userData.email || !userData.password || !userData.role) {
                throw new Error('Name, email, password, and role are required');
            }

            // Validate role
            if (!ROLES[userData.role]) {
                throw new Error(`Invalid role. Allowed roles: ${Object.keys(ROLES).join(', ')}`);
            }

            // Check if user already exists
            const existingUser = await this.usersCollection.findOne({ email: userData.email });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            // Create user object
            const newUser = {
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                role: userData.role,
                tenantId: userData.tenantId || 'autocredits',
                permissions: ROLES[userData.role].permissions,
                isActive: true,
                lastLoginAt: null,
                loginAttempts: 0,
                lockedUntil: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: userData.createdBy || 'system',
                updatedBy: userData.updatedBy || 'system'
            };

            // Add managerId if role is leadexpert
            if (userData.role === 'leadexpert' && userData.managerId) {
                newUser.managerId = userData.managerId;
            }

            const result = await this.usersCollection.insertOne(newUser);
            console.log(`✅ User created successfully: ${userData.name} (${userData.email})`);
            return { success: true, userId: result.insertedId, user: { ...newUser, _id: result.insertedId } };
        } catch (error) {
            console.error(`❌ Failed to create user: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async updateUser(userId, updateData) {
        try {
            // Remove sensitive fields from update
            delete updateData.password;
            delete updateData.email; // Email should not be changed easily

            // Add updated timestamp
            updateData.updatedAt = new Date();
            updateData.updatedBy = updateData.updatedBy || 'system';

            // Update user
            const result = await this.usersCollection.updateOne(
                { _id: userId },
                { $set: updateData }
            );

            if (result.matchedCount === 0) {
                throw new Error('User not found');
            }

            console.log(`✅ User updated successfully: ${userId}`);
            return { success: true, modifiedCount: result.modifiedCount };
        } catch (error) {
            console.error(`❌ Failed to update user: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async deleteUser(userId) {
        try {
            const result = await this.usersCollection.deleteOne({ _id: userId });

            if (result.deletedCount === 0) {
                throw new Error('User not found');
            }

            console.log(`✅ User deleted successfully: ${userId}`);
            return { success: true, deletedCount: result.deletedCount };
        } catch (error) {
            console.error(`❌ Failed to delete user: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async getUser(userId) {
        try {
            const user = await this.usersCollection.findOne(
                { _id: userId },
                { projection: { password: 0 } }
            );

            if (!user) {
                throw new Error('User not found');
            }

            return { success: true, user };
        } catch (error) {
            console.error(`❌ Failed to get user: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async listUsers(filters = {}) {
        try {
            const query = {};

            if (filters.role) query.role = filters.role;
            if (filters.tenantId) query.tenantId = filters.tenantId;
            if (filters.isActive !== undefined) query.isActive = filters.isActive;

            const users = await this.usersCollection.find(
                query,
                { projection: { password: 0 } }
            ).toArray();

            return { success: true, users, count: users.length };
        } catch (error) {
            console.error(`❌ Failed to list users: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async changePassword(userId, newPassword) {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            const result = await this.usersCollection.updateOne(
                { _id: userId },
                {
                    $set: {
                        password: hashedPassword,
                        updatedAt: new Date(),
                        updatedBy: 'system'
                    }
                }
            );

            if (result.matchedCount === 0) {
                throw new Error('User not found');
            }

            console.log(`✅ Password changed successfully for user: ${userId}`);
            return { success: true };
        } catch (error) {
            console.error(`❌ Failed to change password: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async deactivateUser(userId) {
        return this.updateUser(userId, { isActive: false });
    }

    async activateUser(userId) {
        return this.updateUser(userId, { isActive: true });
    }

    async getUsersByRole(role) {
        return this.listUsers({ role });
    }

    async getUsersByTenant(tenantId) {
        return this.listUsers({ tenantId });
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.log('Usage: node user_management.js <command> [options]');
        console.log('');
        console.log('Commands:');
        console.log('  create <name> <email> <password> <role> [tenantId] - Create new user');
        console.log('  list [role] [tenantId] - List users');
        console.log('  get <userId> - Get user details');
        console.log('  update <userId> <field> <value> - Update user field');
        console.log('  delete <userId> - Delete user');
        console.log('  password <userId> <newPassword> - Change user password');
        console.log('  deactivate <userId> - Deactivate user');
        console.log('  activate <userId> - Activate user');
        console.log('');
        console.log('Examples:');
        console.log('  node user_management.js create "John Doe" "john@example.com" "password123" manager');
        console.log('  node user_management.js list manager');
        console.log('  node user_management.js get 507f1f77bcf86cd799439011');
        return;
    }

    const userManager = new UserManager();

    try {
        await userManager.connect();

        switch (command) {
            case 'create':
                if (args.length < 5) {
                    console.log('❌ Usage: create <name> <email> <password> <role> [tenantId]');
                    return;
                }
                const [, , name, email, password, role, tenantId] = args;
                const result = await userManager.createUser({ name, email, password, role, tenantId });
                if (result.success) {
                    console.log('✅ User created successfully');
                }
                break;

            case 'list':
                const filters = {};
                if (args[1]) filters.role = args[1];
                if (args[2]) filters.tenantId = args[2];
                const listResult = await userManager.listUsers(filters);
                if (listResult.success) {
                    console.log(`📋 Found ${listResult.count} users:`);
                    listResult.users.forEach(user => {
                        console.log(`  - ${user.name} (${user.email}) - Role: ${user.role} - Active: ${user.isActive}`);
                    });
                }
                break;

            case 'get':
                if (args.length < 2) {
                    console.log('❌ Usage: get <userId>');
                    return;
                }
                const getResult = await userManager.getUser(args[1]);
                if (getResult.success) {
                    console.log('👤 User details:', JSON.stringify(getResult.user, null, 2));
                }
                break;

            case 'update':
                if (args.length < 4) {
                    console.log('❌ Usage: update <userId> <field> <value>');
                    return;
                }
                const updateData = { [args[2]]: args[3] };
                const updateResult = await userManager.updateUser(args[1], updateData);
                if (updateResult.success) {
                    console.log('✅ User updated successfully');
                }
                break;

            case 'delete':
                if (args.length < 2) {
                    console.log('❌ Usage: delete <userId>');
                    return;
                }
                const deleteResult = await userManager.deleteUser(args[1]);
                if (deleteResult.success) {
                    console.log('✅ User deleted successfully');
                }
                break;

            case 'password':
                if (args.length < 3) {
                    console.log('❌ Usage: password <userId> <newPassword>');
                    return;
                }
                const passwordResult = await userManager.changePassword(args[1], args[2]);
                if (passwordResult.success) {
                    console.log('✅ Password changed successfully');
                }
                break;

            case 'deactivate':
                if (args.length < 2) {
                    console.log('❌ Usage: deactivate <userId>');
                    return;
                }
                const deactivateResult = await userManager.deactivateUser(args[1]);
                if (deactivateResult.success) {
                    console.log('✅ User deactivated successfully');
                }
                break;

            case 'activate':
                if (args.length < 2) {
                    console.log('❌ Usage: activate <userId>');
                    return;
                }
                const activateResult = await userManager.activateUser(args[1]);
                if (activateResult.success) {
                    console.log('✅ User activated successfully');
                }
                break;

            default:
                console.log(`❌ Unknown command: ${command}`);
                break;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await userManager.disconnect();
    }
}

// Run CLI if this file is executed directly
if (require.main === module) {
    main();
}

module.exports = { UserManager, ROLES };
