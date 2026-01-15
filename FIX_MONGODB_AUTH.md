# Fix MongoDB Authentication Error

## Current Issue
The password in your `.env.local` file appears to be incorrect, causing "bad auth : authentication failed" errors.

## Solution: Reset Password in MongoDB Atlas

### Step 1: Go to Database Access
1. Log in to https://cloud.mongodb.com
2. Select your project: **"ai discovery boards"**
3. Click **"Database Access"** in the left sidebar

### Step 2: Find and Edit Your User
1. Find the user: `mkparmar131_db_user`
2. Click the **"Edit"** button (pencil icon) next to the user

### Step 3: Reset Password
1. Click **"Edit Password"**
2. Click **"Reset Password"** or **"Autogenerate Secure Password"**
3. **COPY THE PASSWORD IMMEDIATELY** (you won't see it again!)
4. Click **"Update User"**

### Step 4: Update .env.local
1. Open `.env.local` in your project
2. Replace the password with the new one you just copied
3. **IMPORTANT**: If the password has special characters, URL-encode them:
   - Use: https://www.urlencoder.org/
   - Or manually encode:
     - `@` → `%40`
     - `#` → `%23`
     - `%` → `%25`
     - `&` → `%26`
     - `+` → `%2B`
     - `/` → `%2F`
     - `=` → `%3D`
     - `?` → `%3F`

### Step 5: Final Connection String Format
```env
MONGODB_URI=mongodb+srv://mkparmar131_db_user:YOUR_NEW_PASSWORD@cluster0.hpoplru.mongodb.net/ai-discovery-boards?appName=Cluster0
```

### Step 6: Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## Alternative: Create New Database User

If you prefer to create a new user:

1. Go to **"Database Access"** → **"Add New Database User"**
2. Choose **"Password"** authentication
3. Username: `admin_user` (or any name you prefer)
4. Password: Create a strong password (copy it!)
5. Database User Privileges: **"Read and write to any database"**
6. Click **"Add User"**
7. Update `.env.local` with the new username and password

---

## Verify Network Access

Also check that your IP is whitelisted:

1. Go to **"Network Access"** in MongoDB Atlas
2. Click **"Add IP Address"**
3. For development, you can temporarily add `0.0.0.0/0` (allows all IPs)
4. Click **"Confirm"**

**Note**: `0.0.0.0/0` is not secure for production. Use your specific IP address in production.
