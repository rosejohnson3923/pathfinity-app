import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/auth/Login';
import { ChatOverlay } from './components/chat/ChatOverlay';
// TenantSelector removed - not used in current routing architecture
import { AuthProvider } from './contexts/AuthContext';
import { ModeProvider } from './contexts/ModeContext';
import { DashboardViewProvider } from './contexts/DashboardViewContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NarrativeProvider } from './contexts/NarrativeContext';
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
import './styles/global-ai-responsive.css'; // Global responsive system for AI-generated content
import './styles/dashboard-greeting-fix.css'; // Critical fix for dashboard greeting vertical text

// Import root width fix
import { fixRootWidth } from './utils/fixRootWidth';
import { initializeAIResponsive } from './utils/aiContentResponsive';

// Initialize theme service on app load
themeService.initialize();

// Fix root width issue
fixRootWidth();

// Initialize AI content responsive system
initializeAIResponsive();

// Application Pages
import { AdminImageGenerator } from './pages/AdminImageGenerator';
import { AdminDemoContentGenerator } from './pages/AdminDemoContentGenerator';
import { DesignSystemTest } from './design-system/test/DesignSystemTestSimple';
import { TestPage } from './pages/TestPage';
import YouTubeTest from './test-youtube';
import NarrativeTest from './test-narrative';
import LearnMicroTest from './test-learn-micro';
import FullSystemTest from './test-full-system';
import TestLearnContainer from './test-learn-container';
import TestBentoEnhanced from './test-bento-enhanced';
import TestAzureConfig from './test-azure-config';

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
  
  // Fix root width after React renders
  React.useEffect(() => {
    fixRootWidth();
  });

  return (
    <ThemeProvider>
      <ModeProvider>
        <DashboardViewProvider>
          <AuthProvider>
            <NarrativeProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                {/* Global Chat Overlay - only show when authenticated */}
                <ChatOverlay />

                <Routes>
                  {/* Test routes - no auth required */}
                  <Route path="/test" element={<TestPage />} />
                  <Route path="/test/design-system" element={<DesignSystemTest />} />
                  <Route path="/test/youtube" element={<YouTubeTest />} />
                  <Route path="/test/narrative" element={<NarrativeTest />} />
                  <Route path="/test/learn-micro" element={<LearnMicroTest />} />
                  <Route path="/test/full-system" element={<FullSystemTest />} />
                  <Route path="/test/learn-container" element={<TestLearnContainer />} />
                  <Route path="/test/bento-enhanced" element={<TestBentoEnhanced />} />
                  <Route path="/test/azure-config" element={<TestAzureConfig />} />

                  {/* Default route redirects to login - for development, go directly to login */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  
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
                  
                  {/* Development routes without /app prefix */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  } />
                  <Route path="/login" element={<Login />} />
                </Routes>
              </Router>
            </NarrativeProvider>
        </AuthProvider>
      </DashboardViewProvider>
    </ModeProvider>
    </ThemeProvider>
  );
}

export default App;