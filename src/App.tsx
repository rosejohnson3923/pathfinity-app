import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/auth/Login';
// TenantSelector removed - not used in current routing architecture
import { AuthProvider } from './contexts/AuthContext';
import { ModeProvider } from './contexts/ModeContext';
import { DashboardViewProvider } from './contexts/DashboardViewContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardRouter } from './components/dashboards/DashboardRouter';
import { AdminControls } from './components/dashboards/AdminControls';
import { Unauthorized } from './components/auth/Unauthorized';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { SubjectDetailPage } from './pages/SubjectDetailPage';
import TeacherAnalyticsPage from './pages/TeacherAnalyticsPage';
import { CustomPathCreator } from './components/paths/CustomPathCreator';
import { initializeAuth } from './services/authService';
import { initializeDataService } from './services/dataService';
import { themeService } from './services/themeService';

// Import responsive fixes
import './styles/responsive-fixes.css';
import './styles/mobile-responsive-enhancements.css';
import './styles/touch-interactions.css';
import './styles/accessibility.css';

// Import root width fix
import { fixRootWidth } from './utils/fixRootWidth';

// Initialize theme service on app load
themeService.initialize();

// Fix root width issue
fixRootWidth();

// Application Pages
import { AdminImageGenerator } from './pages/AdminImageGenerator';
import { AdminDemoContentGenerator } from './pages/AdminDemoContentGenerator';

import './utils/debugFinnComponents'; // Load debug utilities in development

function App() {
  // Initialize authentication and data services
  React.useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing Pathfinity application...');
      
      try {
        // Initialize authentication system
        await initializeAuth();
        console.log('✅ Authentication system initialized');
        
        // Initialize data service for hybrid mock/real data
        const currentUser = localStorage.getItem('pathfinity_user');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          await initializeDataService(user.email, user.tenant_id);
          console.log('✅ Data service initialized for user:', user.email);
        }
        
      } catch (error) {
        console.error('❌ Failed to initialize app:', error);
      }
    };
    
    initializeApp();
  }, []);
  
  // Debug navigation and fix root width
  React.useEffect(() => {
    console.log('🔴 DEBUG: App component mounted/updated');
    console.log('🔴 DEBUG: Current location:', window.location.href);
    console.log('🔴 DEBUG: Current timestamp:', new Date().toISOString());
    
    // Apply root width fix after React renders
    fixRootWidth();
  });

  return (
    <ThemeProvider>
      <ModeProvider>
        <DashboardViewProvider>
          <AuthProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <Routes>
                  {/* Default route redirects to login */}
                  <Route path="/" element={<Navigate to="/app/login" replace />} />
                  
                  {/* Application Routes */}
                  <Route path="/app/login" element={<Login />} />
                  {/* Tenant selector bypassed for demo - goes directly to dashboard */}
                  <Route path="/app/dashboard" element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  } />
                  <Route path="/app/lesson/:id" element={
                    <ProtectedRoute>
                      <LessonDetailPage />
                    </ProtectedRoute>
                  } />
                  
                  
                  <Route path="/app/analytics" element={
                    <ProtectedRoute>
                      <TeacherAnalyticsPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/progress-report" element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  } />
                  <Route path="/app/activity-log" element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  } />
                  <Route path="/app/subjects/:id" element={
                    <ProtectedRoute>
                      <SubjectDetailPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/app/subscription" element={
                    <ProtectedRoute allowedRoles={['school_admin', 'district_admin', 'product_admin']}>
                      <SubscriptionPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/app/admin-controls" element={
                    <ProtectedRoute allowedRoles={['school_admin', 'district_admin', 'product_admin']}>
                      <AdminControls />
                    </ProtectedRoute>
                  } />
                  <Route path="/app/custom-paths" element={
                    <ProtectedRoute allowedRoles={['educator', 'parent', 'school_admin', 'district_admin', 'product_admin']}>
                      <CustomPathCreator />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/image-generator" element={
                    <ProtectedRoute allowedRoles={['district_admin', 'product_admin']}>
                      <AdminImageGenerator />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/demo-content" element={
                    <ProtectedRoute allowedRoles={['district_admin', 'product_admin']}>
                      <AdminDemoContentGenerator />
                    </ProtectedRoute>
                  } />
                  <Route path="/app/unauthorized" element={<Unauthorized />} />
                  
                  {/* Legacy redirect for existing users */}
                  <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="/login" element={<Navigate to="/app/login" replace />} />
                </Routes>
              </Router>
        </AuthProvider>
      </DashboardViewProvider>
    </ModeProvider>
    </ThemeProvider>
  );
}

export default App;