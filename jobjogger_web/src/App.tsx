import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import JobDetailPage from './pages/JobDetailPage'
import JobEditPage from './pages/JobEditPage'
import Layout from './components/Layout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/jobs/:id/edit" element={<JobEditPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App