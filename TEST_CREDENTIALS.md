# Test Credentials for The Good Loose Coins

## 🧪 Testing Environment Setup

### Donor Accounts (Sign In via /signin)
- **Username:** `TestUser1` | **Passcode:** `123456` (Manila, Philippines)
- **Username:** `TestUser2` | **Passcode:** `654321` (Quezon City, Philippines)  
- **Username:** `TestUser3` | **Passcode:** `111111` (Cebu City, Philippines)

### Beneficiary Dashboards (Direct Access)
- **Test Beneficiary 1:** `/beneficiary/1`
- **Test Beneficiary 2:** `/beneficiary/2`

### Admin Dashboard (Hidden from public - Direct Access Only)
- **URL:** `/admin`
- **Note:** No authentication required in current version - production will have secure admin login

## 🎯 Testing Scenarios

### 1. Complete Donor Flow
1. Visit main dashboard at `/dashboard`
2. Make a pledge using the form
3. Sign in with test credentials: `TestUser1` / `123456`
4. View personal dashboard, mark donations as "sent"
5. Add payment details (e-wallet, bank transfer, etc.)

### 2. Beneficiary Confirmation
1. Visit `/beneficiary/1` or `/beneficiary/2`
2. View pledges from donors
3. Click "Received" button to confirm donations
4. Verify impact points are awarded

### 3. Admin Management (Internal Use Only)
1. Visit `/admin` (not linked anywhere on site)
2. Test user management, pledge editing
3. View audit logs and reports
4. Test data export functionality

## 🔄 Test Data Management

### Reset Data
- Use admin dashboard "Clear All Data" button
- Or use "Seed Test Data" to add sample data

### Real-time Synchronization
- All changes sync across tabs/windows instantly
- Test by opening multiple browser tabs

## 📊 Current Data Storage
- **Development:** localStorage (browser-based)
- **Production Ready:** Needs Supabase integration for:
  - User authentication
  - Persistent data storage
  - Real-time updates
  - Audit logging

## 🚀 Next Steps for Production
1. Supabase database setup
2. Replace localStorage with Supabase queries
3. Implement secure authentication
4. Add proper admin authentication
5. Enable real-time subscriptions