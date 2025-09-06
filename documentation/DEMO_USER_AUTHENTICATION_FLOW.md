# Demo User Authentication Flow Documentation

## Overview
This document provides comprehensive documentation of the demo user authentication flow, tenant relationships, and logout behavior for the Pathfinity Revolutionary application. This information is critical for maintaining and debugging the demo user experience.

## Demo User Categories

### Students
- **Alex Davis** (1st Grade) - `alex.davis@sandview.plainviewisd.edu`
- **Sam Brown** (Kindergarten) - `sam.brown@sandview.plainviewisd.edu`
- **Jordan Smith** (7th Grade) - `jordan.smith@oceanview.plainviewisd.edu`
- **Taylor Johnson** (10th Grade) - `taylor.johnson@cityview.plainviewisd.edu`

### Teachers
- **Ms. Jenna Grain** (Elementary) - `jenna.grain@sandview.plainviewisd.edu`
- **Ms. Brenda Sea** (Middle School) - `brenda.sea@oceanview.plainviewisd.edu`
- **Mr. John Land** (High School Math) - `john.land@cityview.plainviewisd.edu`
- **Ms. Lisa Johnson** (Parent/Teacher) - `lisa.johnson@cityview.plainviewisd.edu`

### Administrators
- **Dr. Maria Rodriguez** (Principal) - `principal@plainviewisd.edu`
- **Dr. James Wilson** (Superintendent) - `superintendent@plainviewisd.edu`

### Parents (Family School Tenants)
- **Sarah Davis** (Alex's Mom) - `sarah.davis@family.pathfinity.edu`
- **Mike Brown** (Sam's Dad) - `mike.brown@family.pathfinity.edu`

## Authentication Flow Architecture

### 1. Login Process (`src/components/auth/Login.tsx`)

#### Demo User Detection
The login component automatically detects demo users through:
- **Email matching**: Checks against hardcoded demo user email list
- **URL parameter detection**: `?demo=true` parameter
- **User type mapping**: Maps demo URLs to specific user credentials

#### Demo User Mapping
```typescript
const demoUsers = {
  // Student users
  'alex-1st': { email: 'alex.davis@sandview.plainviewisd.edu', password: 'password123' },
  'sam-k': { email: 'sam.brown@sandview.plainviewisd.edu', password: 'password123' },
  'jordan-7th': { email: 'jordan.smith@oceanview.plainviewisd.edu', password: 'password123' },
  'taylor-10th': { email: 'taylor.johnson@cityview.plainviewisd.edu', password: 'password123' },
  
  // Teacher/Admin users
  'teacher-view': { email: 'jenna.grain@sandview.plainviewisd.edu', password: 'password123' },
  'admin-view': { email: 'principal@plainviewisd.edu', password: 'password123' },
  'district-view': { email: 'superintendent@plainviewisd.edu', password: 'password123' }
};
```

#### Authentication Success Logic
1. **Demo User Detection**: Checks if login email matches demo user list
2. **localStorage Flag Setting**: Sets `demo_mode: 'true'` for all demo users
3. **Navigation**: Redirects to `/app/dashboard` for all successful logins

### 2. Authentication Service (`src/services/authService.ts`)

#### Mock Authentication Flow
- **Primary**: Attempts Supabase authentication first
- **Fallback**: Uses mock authentication for demo users
- **Storage**: Stores user data in localStorage with key `pathfinity_user`
- **Token Generation**: Creates mock tokens for demo sessions

#### User Data Structure
```typescript
interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
}
```

### 3. Tenant Selection & Bypass (`src/components/auth/ProtectedRoute.tsx`)

#### Tenant Requirement Logic
- **Regular Users**: Must select a tenant before accessing protected routes
- **Demo Users**: Automatically bypass tenant selection requirement
- **Detection**: Uses `isDemoUser()` function to determine bypass eligibility

#### Demo User Bypass Flow
```typescript
if (requireTenant && !tenant && !isDemoUser(user)) {
  return <Navigate to="/select-tenant" state={{ from: location }} replace />;
}
```

### 4. Tenant Selector Timeout Handling (`src/components/auth/TenantSelector.tsx`)

#### Timeout Mechanism
- **Duration**: 3-second timeout for authentication loading
- **Purpose**: Prevents infinite loading states
- **Demo Context Detection**: Checks multiple sources for demo user status

#### Demo Detection Sources
1. **User Object**: Direct `isDemoUser(user)` check
2. **URL Parameters**: `?demo=true` in current URL
3. **localStorage**: `demo_mode: 'true'` flag
4. **Document Referrer**: Checks if came from `/demo` page

#### Timeout Resolution
- **Demo Users**: Redirect to `/demo` page
- **Regular Users**: Redirect to `/dashboard`

## Demo User Detection Utility (`src/utils/demoUserDetection.ts`)

### Core Detection Function
```typescript
export function isDemoUser(user: User | null | undefined): boolean {
  if (!user) return false;
  
  return (
    (user.email && DEMO_USER_EMAILS.includes(user.email)) ||
    (user.full_name && DEMO_USER_NAMES.includes(user.full_name)) ||
    (user.id && DEMO_USER_IDS.includes(user.id)) ||
    (user.id && user.id.includes('demo'))
  );
}
```

### Detection Arrays
- **DEMO_USER_EMAILS**: All demo user email addresses
- **DEMO_USER_NAMES**: Full names for backup detection
- **DEMO_USER_IDS**: UUID-based identification for students

## Logout Behavior by User Type

### Student Demo Users
- **Logout Trigger**: Dashboard logout button or Header logout
- **Detection**: Email-based matching against demo user list
- **Redirect**: Always redirects to `/demo` page
- **localStorage**: Maintains `demo_mode: 'true'` flag

### Teacher/Admin Demo Users
- **Logout Trigger**: Header logout menu or AdminMenu logout
- **Detection**: Same email-based matching system
- **Redirect**: Always redirects to `/demo` page
- **Context**: Preserves demo context for re-entry

### Parent Demo Users
- **Logout Trigger**: Header logout (family school context)
- **Detection**: Family domain email matching
- **Redirect**: Redirects to `/demo` page
- **Tenant**: Individual family school tenant

## Tenant Relationships

### School District Tenants
- **Sand View Elementary**: Students (Alex, Sam), Teacher (Jenna)
- **Ocean View Middle**: Student (Jordan), Teacher (Brenda)
- **City View High**: Student (Taylor), Teachers (John, Lisa)
- **District Level**: Admin access (Principal, Superintendent)

### Family School Tenants
- **Davis Family School**: Parent (Sarah), Student (Alex)
- **Brown Family School**: Parent (Mike), Student (Sam)

## Critical Implementation Details

### 1. Race Condition Prevention
- **Issue**: Multiple setTimeout calls creating racing timers
- **Solution**: Wrapped timeout in useEffect with proper cleanup
- **Location**: `TenantSelector.tsx:143-176`

### 2. Authentication State Management
- **Issue**: User object becoming null during auth transitions
- **Solution**: Enhanced demo user detection with multiple fallback methods
- **Impact**: Prevents false redirects during authentication

### 3. localStorage Management
- **Key**: `demo_mode` flag persistence
- **Timing**: Set during login success for demo users
- **Usage**: Fallback detection method during auth state transitions

### 4. Debug Logging
- **Purpose**: Comprehensive logging for troubleshooting
- **Function**: `logDemoUserDetection(user, context)`
- **Output**: User email, full_name, id, and demo status

## Common Issues & Solutions

### Issue: 3-Second Delay for Student Demo Users
- **Cause**: TenantSelector timeout mechanism
- **Solution**: Enhanced demo user detection with multiple checks
- **Prevention**: Proper useEffect cleanup and current state checking

### Issue: Demo User Detection Failing
- **Cause**: Incomplete detection arrays or timing issues
- **Solution**: Multiple detection methods (email, name, ID, localStorage)
- **Verification**: Console logs show detection results

### Issue: Incorrect Logout Redirects
- **Cause**: Demo user detection failing during logout
- **Solution**: Centralized detection utility used across all logout points
- **Components**: Header, Dashboard, AdminMenu, TenantSelector

## Testing Scenarios

### Student Demo User Flow
1. Access `/demo` page
2. Select student demo (Alex, Sam, Jordan, Taylor)
3. Redirect to login with pre-filled credentials
4. Automatic authentication and dashboard access
5. Logout redirects back to `/demo`

### Teacher Demo User Flow
1. Access `/demo` page
2. Select teacher-view option
3. Login as Jenna Grain
4. Access teacher dashboard features
5. Logout returns to `/demo`

### Admin Demo User Flow
1. Access `/demo` page
2. Select admin-view or district-view
3. Login as Principal or Superintendent
4. Access admin features
5. Logout returns to `/demo`

## File Locations

### Core Authentication Files
- `src/components/auth/Login.tsx` - Main login component
- `src/components/auth/ProtectedRoute.tsx` - Route protection
- `src/components/auth/TenantSelector.tsx` - Tenant selection logic
- `src/services/authService.ts` - Authentication service
- `src/hooks/useAuth.ts` - Authentication hook
- `src/contexts/AuthContext.tsx` - Authentication context

### Demo User Utilities
- `src/utils/demoUserDetection.ts` - Centralized demo user detection
- `src/data/mockAuthData.ts` - Mock user data and helpers

### Logout Implementation
- `src/components/Header.tsx` - Header logout menu
- `src/components/Dashboard.tsx` - Dashboard logout button
- `src/components/AdminMenu.tsx` - Admin logout functionality

## Critical Issues Resolved (2025-01-17)

### Logout Redirect Race Condition Issue
**Problem**: Demo users experiencing 3-second delays and page reloads during logout, with console clearing and ending up on wrong pages.

**Root Causes Identified**:
1. **Navigation Timing Race Condition**: `signOut()` was called before `navigate()`, causing:
   - User becomes `null` after signOut
   - ProtectedRoute immediately redirects to `/app/login`
   - Intended navigation to `/demo` never completes

2. **Multiple Logout Mechanisms**: Different user types used different logout buttons:
   - Students: Dashboard logout button
   - Teachers: Header logout button  
   - Admins: AdminMenu logout button
   - Each had different implementations and demo user detection

3. **Page Reload vs Client-Side Navigation**:
   - AdminMenu used `window.location.href = '/'` causing full page reload
   - Page reloads clear console and break SPA navigation
   - Should use React Router `navigate()` for client-side routing

4. **Inconsistent Demo User Lists**: 
   - Header component missing `superintendent@plainviewisd.edu` and other demo users
   - Different logout components had different demo user detection logic

5. **Supabase Client Instance Conflicts**:
   - Multiple Supabase client instances causing "Multiple GoTrueClient detected" errors
   - Three separate client files creating duplicate instances

**Solutions Implemented**:

#### 1. Fixed Navigation Order (Critical)
```typescript
// BEFORE (Race Condition)
await signOut();                    // User becomes null
navigate('/demo');                  // Never reached due to ProtectedRoute

// AFTER (Fixed Order)  
const redirectPath = isDemoUser ? '/demo' : '/';
navigate(redirectPath, { replace: true }); // Navigate while user exists
await signOut();                           // Then sign out
```

#### 2. Unified Client-Side Navigation
```typescript
// BEFORE (Page Reload)
window.location.href = '/';  // Causes full page reload + console clearing

// AFTER (Client-Side)
navigate(redirectPath, { replace: true }); // React Router navigation
```

#### 3. Consistent Demo User Detection
- Standardized demo user email lists across all components
- Added missing users: `principal@plainviewisd.edu`, `superintendent@plainviewisd.edu`
- Same detection logic in Dashboard, Header, and AdminMenu

#### 4. Supabase Client Singleton Pattern
```typescript
// BEFORE (Multiple Instances)
const supabase = createClient(url, key); // In each service file

// AFTER (Singleton)
let supabaseInstance: SupabaseClient | null = null;
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
})();
```

#### 5. Disabled Problematic Loading States
- AuthContext loading screen disabled to prevent logout delays
- TenantSelector timeout disabled to prevent interference
- Loading states were causing 3-second delays during logout

### Authentication System Architecture Improvements

#### Missing User in Mock Data
**Issue**: `principal@plainviewisd.edu` referenced in Login component but missing from `mockAuthData.ts`
**Solution**: Added Dr. Maria Rodriguez as Principal with proper school_admin role and tenant access

#### Redirect Path Inconsistencies  
**Issue**: Various redirects using `/login` instead of `/app/login` breaking routing
**Solution**: Updated ProtectedRoute and DashboardRouter to use consistent `/app/login` paths

#### Console Clearing Detection
**Key Insight**: Console clearing during logout indicates `window.location.href` usage (page reload)
**Diagnostic**: Console clearing = page reload, Console preserved = client-side navigation

### Testing Validation Results

All demo users now have smooth logout flows:
- **Jordan Smith** (Student): Dashboard → `/demo` ✅
- **Dr. Maria Rodriguez** (Principal): AdminMenu → `/demo` ✅  
- **Dr. James Wilson** (Superintendent): AdminMenu → `/demo` ✅
- **Alex Davis**, **Sam Brown** (Students): Dashboard → `/demo` ✅

**Success Indicators**:
- No console clearing during logout
- No 3-second delays
- Direct navigation to `/demo` page
- No intermediate stops at login page
- Consistent behavior across all logout mechanisms

### Critical Code Patterns Established

#### Safe Logout Pattern
```typescript
const handleLogout = async () => {
  // 1. Determine redirect path WHILE user still exists
  const isDemoUser = user?.email && DEMO_EMAILS.includes(user.email.toLowerCase());
  const redirectPath = isDemoUser ? '/demo' : '/';
  
  // 2. Navigate FIRST (before signOut)
  navigate(redirectPath, { replace: true });
  
  // 3. Then sign out (user becomes null safely after navigation)
  await signOut();
};
```

#### Demo User Detection Pattern
```typescript
const isDemoUser = user?.email && [
  'alex.davis@sandview.plainviewisd.edu',
  'sam.brown@sandview.plainviewisd.edu',
  'jordan.smith@oceanview.plainviewisd.edu',
  'principal@plainviewisd.edu',
  'superintendent@plainviewisd.edu',
  // ... complete list
].includes(user.email.toLowerCase());
```

## Maintenance Notes

### When Adding New Demo Users
1. Add email to `DEMO_USER_EMAILS` array
2. Add full name to `DEMO_USER_NAMES` array
3. Add ID to `DEMO_USER_IDS` array (if student)
4. Update demo user mapping in Login component
5. Add user data to `mockAuthData.ts`
6. **NEW**: Add email to all logout component demo user lists (Dashboard, Header, AdminMenu)

### When Modifying Authentication Flow
1. Ensure demo user detection works at all stages
2. Test all three user types (Student, Teacher, Admin)
3. Verify logout redirects work correctly
4. Check localStorage flag persistence
5. Test timeout scenarios
6. **NEW**: Always navigate BEFORE signOut to prevent race conditions
7. **NEW**: Use React Router navigate() instead of window.location.href
8. **NEW**: Test console behavior - clearing indicates page reload (bad)

### Critical Debugging Indicators
1. **Console Clearing**: Indicates page reload from `window.location.href` usage
2. **3-Second Delays**: Usually from loading screens or timeouts during logout
3. **Login Page Stops**: ProtectedRoute redirecting null user to login
4. **"Multiple GoTrueClient" Errors**: Multiple Supabase client instances
5. **Race Condition Signs**: Navigation happening after user becomes null

### Debugging Tips
1. Check browser console for demo user detection logs
2. Verify localStorage `demo_mode` flag
3. Check user object structure in console
4. Trace authentication flow through multiple components
5. Test with different demo user types
6. **NEW**: Monitor console clearing as page reload indicator
7. **NEW**: Test logout timing - user should exist during navigation
8. **NEW**: Verify all logout components use same demo user lists

---

*This documentation reflects the current state of the demo user authentication system as of the latest implementation. Any changes to the authentication flow should be reflected in this document.*