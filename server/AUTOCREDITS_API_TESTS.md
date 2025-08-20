# 🚀 AutoCredits Backend - Complete API Test Suite

## 📋 **Prerequisites**
- AutoCredits Backend running on `http://localhost:2002`
- Auth Microservice running on `http://localhost:3001`
- MongoDB connected and running

## 🗄️ **Step 0: MongoDB Setup & Initial Superadmin Creation**

### **0.1 Fresh MongoDB Installation Setup**

If you're setting up AutoCredits on a new MongoDB instance, follow these steps:

#### **Install MongoDB:**
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Verify MongoDB is running
mongo --eval "db.runCommand('ping')"
```

#### **Create Database and Initial Superadmin:**
```bash
# Connect to MongoDB
mongo

# Create and use AutoCredits database
use JustTechnology

# Create initial superadmin user
db.users.insertOne({
  name: "AutoCredits Super Admin",
  email: "superadmin@autocredits.local",
  password: "$2b$10$YourHashedPasswordHere", // Will be created by seed script
  role: "superadmin",
  tenantId: "autocredits",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "system",
  updatedBy: "system"
})

# Create autocredits tenant
db.tenants.insertOne({
  tenantId: "autocredits",
  name: "AutoCredits",
  domain: "autocredits.local",
  settings: {},
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "system",
  updatedBy: "system"
})

# Exit MongoDB
exit
```


```bash
# Navigate to UserManagement-refactor-all-services
cd UserManagement-refactor-all-services

# Run the seed script to create all initial data
npm run seed
```

```bash
# From AutoCredits_BE-main directory
./setup_new_installation.sh
```

**This will automatically:**
- ✅ Install MongoDB (if not present)
- ✅ Start MongoDB service
- ✅ Create database and collections
- ✅ Run seed script to create initial users
- ✅ Create .env file with template values
- ✅ Start AutoCredits backend and Auth microservice
- ✅ Verify everything is working

**This will automatically create:**
- ✅ Super Admin: `superadmin@autocredits.local` / `AutoCreditsSuperAdmin123!`
- ✅ Manager: `manager@autocredits.local` / `AutoCreditsManager123!`
- ✅ Lead Expert: `alex@autocredits.local` / `AutoCreditsLeadExpert123!`
- ✅ AutoCredits tenant configuration

#### **0.2 Environment Variables for New Setup**

Create a `.env` file in `AutoCredits_BE-main/`:
```bash
PORT=2002
DB_URL=mongodb://localhost:27017/JustTechnology
JWT_SECRET=YOUR_CUSTOM_JWT_SECRET_KEY_HERE
JWT_RESET_SECRET=YOUR_CUSTOM_RESET_SECRET_HERE
TENANT_ID=autocredits
TENANT_NAME=AutoCredits
AUTH_SERVICE_URL=http://localhost:3001
FILE_SERVICE_URL=http://localhost:3002
EXPORT_SERVICE_URL=http://localhost:3005
```

#### **0.3 Verify Initial Setup:**
```bash
# Check if MongoDB has the data
mongo JustTechnology --eval "db.users.find({role: 'superadmin'})"

# Check if tenant exists
mongo JustTechnology --eval "db.tenants.find({tenantId: 'autocredits'})"
```

---

## 🔐 **Step 1: Get Authentication Token**

### **Login as Super Admin:**
```bash
curl -X POST http://localhost:2002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@autocredits.local",
    "password": "AutoCreditsSuperAdmin123!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "USER_ID",
      "name": "AutoCredits Super Admin",
      "email": "superadmin@autocredits.local",
      "role": "superadmin",
      "tenantId": "autocredits"
    },
    "accessToken": "JWT_TOKEN_HERE",
    "refreshToken": "REFRESH_TOKEN_HERE",
    "expiresIn": "1h"
  }
}
```

**Save the `accessToken` for use in subsequent requests!**

---

## 👥 **Step 2: User Management APIs**

### **2.1 Get Available Roles**
```bash
curl http://localhost:2002/api/auth/roles
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Available roles",
  "data": {
    "roles": [
      {
        "value": "superadmin",
        "label": "Super Admin",
        "description": "Full system access and user management"
      },
      {
        "value": "manager",
        "label": "Manager",
        "description": "Team management and lead oversight"
      },
      {
        "value": "leadexpert",
        "label": "Lead Expert",
        "description": "Lead management and customer interaction"
      }
    ]
  }
}
```

### **2.2 List All Users**
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:2002/api/auth/users
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "USER_ID",
      "name": "AutoCredits Super Admin",
      "email": "superadmin@autocredits.local",
      "role": "superadmin",
      "lastLoginAt": "2025-08-14T09:45:06.832Z",
      "createdAt": "2025-08-14T09:41:54.810Z"
    }
  ]
}
```

### **2.3 Create New Super Admin**
```bash
curl -X POST http://localhost:2002/api/auth/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "New Super Admin",
    "email": "newsuperadmin@autocredits.local",
    "password": "NewSuperAdmin123!",
    "role": "superadmin"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "NEW_USER_ID",
    "name": "New Super Admin",
    "email": "newsuperadmin@autocredits.local",
    "role": "superadmin",
    "tenantId": "autocredits",
    "createdAt": "2025-08-14T09:45:35.760Z"
  }
}
```

### **2.4 Create New Manager**
```bash
curl -X POST http://localhost:2002/api/auth/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "New Manager",
    "email": "newmanager@autocredits.local",
    "password": "NewManager123!",
    "role": "manager"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "NEW_MANAGER_ID",
    "name": "New Manager",
    "email": "newmanager@autocredits.local",
    "role": "manager",
    "tenantId": "autocredits",
    "createdAt": "2025-08-14T09:45:45.934Z"
  }
}
```

### **2.5 Create New Lead Expert**
```bash
curl -X POST http://localhost:2002/api/auth/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "New Lead Expert",
    "email": "newleadexpert@autocredits.local",
    "password": "NewLeadExpert123!",
    "role": "leadexpert",
    "managerId": "MANAGER_USER_ID_HERE"
  }'
```

**Note:** Replace `MANAGER_USER_ID_HERE` with the actual ID of a manager user.

### **2.6 Update User**
```bash
curl -X PUT http://localhost:2002/api/auth/users/USER_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Updated User Name",
    "role": "manager"
  }'
```

### **2.7 Delete User**
```bash
curl -X DELETE http://localhost:2002/api/auth/users/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔄 **Step 3: Authentication APIs**

### **3.1 Login as Manager**
```bash
curl -X POST http://localhost:2002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@autocredits.local",
    "password": "AutoCreditsManager123!"
  }'
```

### **3.2 Login as Lead Expert**
```bash
curl -X POST http://localhost:2002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@autocredits.local",
    "password": "AutoCreditsLeadExpert123!"
  }'
```

### **3.3 Refresh Token**
```bash
curl -X POST http://localhost:2002/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

### **3.4 Logout**
```bash
curl -X POST http://localhost:2002/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📁 **Step 4: File Management APIs**

### **4.1 Get File Statistics**
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:2002/api/files/stats
```

### **4.2 Upload File**
```bash
curl -X POST http://localhost:2002/api/files/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/your/file.pdf" \
  -F "description=Test file upload"
```

### **4.3 List Files**
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:2002/api/files
```

---

## 📊 **Step 5: Export APIs**

### **5.1 Get Export Statistics**
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:2002/api/export/stats
```

### **5.2 Create Export Job**
```bash
curl -X POST http://localhost:2002/api/export \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "type": "csv",
    "filters": {
      "dateRange": "last30days"
    }
  }'
```

---


## 📚 **API Reference Summary**

| Endpoint | Method | Description | Access Level |
|----------|--------|-------------|--------------|
| `/api/auth/roles` | GET | Get available roles | Public |
| `/api/auth/login` | POST | User authentication | Public |
| `/api/auth/users` | GET | List all users | Manager+ |
| `/api/auth/users` | POST | Create new user | Manager+ |
| `/api/auth/users/:id` | PUT | Update user | Manager+ |
| `/api/auth/users/:id` | DELETE | Delete user | Super Admin |
| `/api/files/stats` | GET | File statistics | Manager+ |
| `/api/export/stats` | GET | Export statistics | Manager+ |

---

## 🎯 **Test Users Available**

| Email | Password | Role | Status |
|-------|----------|------|--------|
| `superadmin@autocredits.local` | `AutoCreditsSuperAdmin123!` | Super Admin | ✅ Working |
| `manager@autocredits.local` | `AutoCreditsManager123!` | Manager | ✅ Working |
| `alex@autocredits.local` | `AutoCreditsLeadExpert123!` | Lead Expert | ✅ Working |

---

## ✅ **Quick Setup Verification**

### **5-Minute Setup Check:**
```bash
# 1. Check if MongoDB is running
brew services list | grep mongodb

# 2. Check if database exists
mongo JustTechnology --eval "db.getCollectionNames()"

# 3. Check if users exist
mongo JustTechnology --eval "db.users.find({role: 'superadmin'})"

# 4. Check if AutoCredits backend is running
curl http://localhost:2002/

# 5. Check if Auth microservice is running
curl http://localhost:3001/auth/health

# 6. Test login
curl -X POST http://localhost:2002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@autocredits.local","password":"AutoCreditsSuperAdmin123!"}'
```

### **Expected Results:**
- ✅ MongoDB: `started` status
- ✅ Database: `["users", "tenants"]` collections
- ✅ Users: At least one superadmin user
- ✅ AutoCredits: `{"success":true,"message":"Server running sucessfully!"}`
- ✅ Auth Service: `{"success":true,"message":"Auth service is healthy"}`
- ✅ Login: `{"success":true,"message":"Login successful"}`

**🎉 Your AutoCredits backend is fully integrated with microservices and custom role system!**
