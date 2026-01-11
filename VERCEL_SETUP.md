# Vercel Environment Variables Setup

This guide explains how to configure your Vercel project with the necessary environment variables for POSRMS to work correctly.

## Required Environment Variables

The following environment variables **must be set in your Vercel project** for the application to function properly:

### Core Supabase Configuration

| Variable Name               | Value                                                                                                                                                                                                                         | Description                                |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `VITE_SUPABASE_URL`         | `https://gxqwtdafwtlbfsaaxhpb.supabase.co`                                                                                                                                                                                    | Your Supabase project URL                  |
| `VITE_SUPABASE_ANON_KEY`    | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4cXd0ZGFmd3RsYmZzYWF4aHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDY0OTYsImV4cCI6MjA4MzcyMjQ5Nn0.BtIOvlWs1fjiOZesmqiadcAirQKv2g5z1LV75DyPHZs`            | Supabase anonymous key for frontend        |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4cXd0ZGFmd3RsYmZzYWF4aHBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE0NjQ5NiwiZXhwIjoyMDgzNzIyNDk2fQ.8W1pDZ6KkYoWSCXvfPn43ZifbXKCNUCumbJYXRdZL4Y` | Supabase service role key for backend APIs |

### JWT Authentication

| Variable Name    | Suggested Value                                       | Description                                                       |
| ---------------- | ----------------------------------------------------- | ----------------------------------------------------------------- |
| `JWT_SECRET`     | `your-super-secret-jwt-key-change-this-in-production` | Secret key for signing JWT tokens - **MUST CHANGE IN PRODUCTION** |
| `JWT_EXPIRES_IN` | `24h`                                                 | JWT token expiration time                                         |

### Environment

| Variable Name | Suggested Value | Description      |
| ------------- | --------------- | ---------------- |
| `NODE_ENV`    | `production`    | Node environment |

---

## How to Add Variables in Vercel

### Step-by-Step Instructions:

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Select your POSRMS project

2. **Navigate to Settings**
   - Click the **Settings** tab at the top
   - Select **Environment Variables** from the left sidebar

3. **Add Each Variable**
   - Click **Add New** button
   - Enter the variable name
   - Paste the value
   - Select scope: **Production, Preview, Development** (recommended: all)
   - Click **Save**

4. **Repeat for All Variables**
   - Add all 5-6 variables listed above

5. **Redeploy Your Project**
   - Go to **Deployments** tab
   - Find your latest deployment
   - Click the **...** menu
   - Select **Redeploy**
   - Wait for the build to complete

---

## Security Best Practices

### ⚠️ Important Security Notes

**NEVER commit sensitive values to your repository:**

- ❌ Don't add `SUPABASE_SERVICE_ROLE_KEY` to `.env` files
- ❌ Don't add `JWT_SECRET` to code or version control
- ✅ **Only use Vercel's Environment Variables UI**

**For `JWT_SECRET` in Production:**

- Generate a strong random secret
- Example command: `openssl rand -hex 32`
- Store it ONLY in Vercel, never in code
- Rotate periodically for security

### Variables That Are Safe in Code

These variables can be safely committed to your repository (they're public):

- `VITE_SUPABASE_URL` - Project URL (public)
- `VITE_SUPABASE_ANON_KEY` - Anon key (public by design)

Sensitive variables should ONLY be in Vercel:

- `SUPABASE_SERVICE_ROLE_KEY` - Backend only
- `JWT_SECRET` - Authentication secret

---

## Verification Checklist

After setting up environment variables:

- [ ] Added `VITE_SUPABASE_URL`
- [ ] Added `VITE_SUPABASE_ANON_KEY`
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Added `JWT_SECRET` (and changed the value)
- [ ] Added `JWT_EXPIRES_IN`
- [ ] Set all variables to **Production** scope (at minimum)
- [ ] Redeployed the project
- [ ] Verified deployment status shows "Ready"

---

## Testing Your Setup

After deployment:

1. **Check Build Logs**
   - Go to Deployments → Latest Deployment
   - Click "View Build Logs"
   - Verify no environment variable errors

2. **Test API Endpoints**
   - Try logging in: `POST /api/auth/login`
   - Check health: `GET /api/health`

3. **Monitor Errors**
   - Check Supabase dashboard for any connection issues
   - Review Vercel function logs for errors

---

## Troubleshooting

### Build Fails with "Missing Supabase credentials"

- **Solution**: Verify all three Supabase variables are set correctly
- Check for typos in variable names
- Ensure values don't have extra spaces

### API Returns "Unauthorized"

- **Solution**: Check `JWT_SECRET` is set
- Verify the JWT value hasn't been truncated

### Database Connection Errors

- **Solution**:
  - Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
  - Check Supabase project is active
  - Review Supabase logs for connection issues

### "Cannot find module" errors

- **Solution**: All dependencies were removed correctly (no `better-sqlite3` or `mongodb`)
- These caused issues in serverless environments

---

## Environment Variables Summary

```yaml
# Supabase Configuration
VITE_SUPABASE_URL: https://gxqwtdafwtlbfsaaxhpb.supabase.co
VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Configuration
JWT_SECRET: your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN: 24h

# Environment
NODE_ENV: production
```

---

## Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/projects/environment-variables)
- [Supabase API Keys](https://supabase.com/docs/guides/api/keys)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review Supabase dashboard error logs
3. Verify all environment variables are set correctly
4. Ensure no extra spaces or characters in values
5. Try a fresh redeploy after updating variables
