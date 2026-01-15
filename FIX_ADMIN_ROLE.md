# Fix Admin Role Not Showing

## Quick Fix: Log Out and Log Back In

1. Go to http://localhost:3000/profile
2. Click "Logout" in the header dropdown
3. Go to http://localhost:3000/login
4. Log in with:
   - Email: `mkparmar.131@gmail.com`
   - Your password
5. The admin role should now be loaded correctly

## Alternative: Update localStorage Manually

Open browser console (F12) and run:

```javascript
// Get current user from localStorage
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Update with admin role
user.role = 'admin';

// Save back to localStorage
localStorage.setItem('user', JSON.stringify(user));

// Reload the page
window.location.reload();
```

## What I've Added

1. **New API endpoint**: `/api/auth/me` - Fetches fresh user data from database
2. **Auto-refresh**: Profile page automatically refreshes user data if role is missing
3. **Manual refresh button**: "Refresh Role" button appears if you're not showing as admin

## Verify Your Role in Database

Your user in the database has:
- Email: `mkparmar.131@gmail.com`
- Role: `admin` ✅
- ID: `6968f9fae01f19b0b802efc0`

The issue is that the role wasn't saved to localStorage when you logged in. Logging out and back in will fix this permanently.
