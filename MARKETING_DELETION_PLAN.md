# Pathfinity App - Marketing Deletion Plan

## Goal
Remove all marketing-related components to create a pure application codebase.

## Items to Delete

### 1. Marketing Pages Directory
- **src/pages/marketing/** - Entire folder with all marketing pages:
  - Homepage.tsx
  - HowItWorks.tsx
  - AboutUs.tsx
  - Contact.tsx
  - ForStudents.tsx
  - ForParents.tsx
  - ForTeachers.tsx
  - ForAdministrators.tsx
  - ESAInfo.tsx
  - ESACalculator.tsx
  - JoinWaitlist.tsx
  - PrivacyPolicy.tsx
  - ResearchResults.tsx

### 2. Marketing Components
- **src/components/marketing/** - Marketing layout and components
  - MarketingLayout.tsx
  - Any other marketing-specific components

### 3. Marketing Routes (Will Need Editing)
- **src/App.tsx** - Remove marketing routes, keep only app routes:
  - Remove all routes to /for-students, /for-parents, etc.
  - Remove homepage route (/)
  - Keep /app/* routes
  - Set default route to login or dashboard

### 4. Marketing Assets (Optional)
- **public/images/** - Review and remove marketing-specific images
- Keep only app-related assets (companions, icons, etc.)

### 5. Marketing-Related Styles (Optional)
- Review styles specific to marketing pages
- Keep app-specific styles

## Items to Keep

### Essential App Components
- All AI containers and engines
- Authentication components
- Dashboard components
- Learning modules
- Skills and progression systems
- Finn and companion systems
- All services and utilities
- Database configurations
- Security components (ProtectedApp, etc.)

## Process

1. **Delete marketing pages folder**
2. **Delete marketing components**
3. **Edit App.tsx to remove marketing routes**
4. **Set app entry point (login/dashboard)**
5. **Install dependencies and build**
6. **Test application functionality**

## Expected Outcome
- Pure application codebase
- No marketing content
- App starts directly at login/dashboard
- All learning functionality intact
- Ready for application development