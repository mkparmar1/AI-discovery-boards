# MongoDB Atlas Connection Setup Guide

## Step 1: Get Your Connection String from MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Log in to your account
3. Select your project: **"ai discovery boards"**
4. Click **"Connect"** button on your cluster (Cluster0)
5. Choose **"Connect your application"**
6. Select **"Node.js"** as the driver
7. Copy the connection string (it will look like):
   ```
   mongodb+srv://<username>:<password>@cluster0.hpoplru.mongodb.net/?appName=Cluster0
   ```

## Step 2: Update Your .env.local File

1. Replace `<username>` with your actual username: `mkparmar131_db_user`
2. Replace `<password>` with your actual password
3. Add your database name: `ai-discovery-boards`
4. Final format should be:
   ```
   MONGODB_URI=mongodb+srv://mkparmar131_db_user:YOUR_PASSWORD@cluster0.hpoplru.mongodb.net/ai-discovery-boards?appName=Cluster0
   ```

## Step 3: If Password Has Special Characters

If your password contains special characters, you MUST URL-encode them:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `/` → `%2F`
- `=` → `%3D`
- `?` → `%3F`
- Space → `%20`

## Step 4: Verify Database User Permissions

1. Go to **"Database Access"** in MongoDB Atlas
2. Find user: `mkparmar131_db_user`
3. Ensure it has **"Read and write to any database"** or at least access to `ai-discovery-boards`
4. If needed, click **"Edit"** → **"Edit Password"** → **"Reset Password"**

## Step 5: Check Network Access

1. Go to **"Network Access"** in MongoDB Atlas
2. Ensure your IP address is whitelisted
3. For development, you can temporarily allow all IPs: `0.0.0.0/0` (not recommended for production)

## Step 6: Restart Your Dev Server

After updating `.env.local`:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

## Troubleshooting

### Error: "authentication failed"
- Verify the password is correct
- Check if password needs URL encoding
- Verify user has proper database permissions
- Try resetting the password in MongoDB Atlas

### Error: "IP not whitelisted"
- Add your IP address in Network Access
- Or temporarily allow `0.0.0.0/0` for testing

### Error: "database not found"
- Ensure database name is correct: `ai-discovery-boards`
- Database will be created automatically on first connection if user has permissions
