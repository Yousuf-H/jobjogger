import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import JobDetailPage from './pages/JobDetailPage/JobDetailPage'
import JobEditPage from './pages/JobEditPage/JobEditPage'
import Layout from './components/layout/Layout'
import JobsPage from './pages/JobsPage/JobsPage'
import { SigninPage } from './pages/SigninPage/SigninPage'
import { SignupPage } from './pages/SignupPage/SignupPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/jobs/:id/edit" element={<JobEditPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
