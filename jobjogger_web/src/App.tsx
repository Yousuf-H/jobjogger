import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { PostHogPageView } from '@/components/PostHogPageView'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import ActivityPage from '@/pages/ActivityPage'
import AdminPage from '@/pages/AdminPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import ContactDetailPage from '@/pages/ContactDetailPage'
import ContactsPage from '@/pages/ContactsPage'
import InterviewPrepPage from '@/pages/InterviewPrepPage'
import ResumePage from '@/pages/ResumePage'
import ResumeDetailPage from '@/pages/ResumeDetailPage'
import DashboardPage from '@/pages/DashboardPage'
import JobDetailPage from '@/pages/JobDetailPage'
import JobsPage from '@/pages/JobsPage'
import OrganisationDetailPage from '@/pages/OrganisationDetailPage'
import OrganisationsPage from '@/pages/OrganisationsPage'
import SettingsPage from '@/pages/SettingsPage'
import ProfilePage from '@/pages/ProfilePage'
import SigninPage from '@/pages/SigninPage'
import SignupPage from '@/pages/SignupPage'
import OAuthCallbackPage from '@/pages/OAuthCallbackPage'
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage'
import TermsPage from '@/pages/TermsPage'

function ThemeSync() {
  const { user } = useAuth()
  const { setTheme } = useTheme()
  useEffect(() => {
    if (user?.theme) setTheme(user.theme)
  }, [user?.theme, setTheme])
  return null
}

function App() {
  return (
    <BrowserRouter>
      <ThemeSync />
      <PostHogPageView />
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/organisations" element={<OrganisationsPage />} />
          <Route path="/organisations/:id" element={<OrganisationDetailPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/contacts/:id" element={<ContactDetailPage />} />
          <Route path="/interview-prep" element={<InterviewPrepPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/resume/:id" element={<ResumeDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
