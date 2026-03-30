import { Spin } from 'antd'
import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { getMe } from './api'
import AdminLayout from './layouts/AdminLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import InfluencersPage from './pages/admin/InfluencersPage'
import CouponsPage from './pages/admin/CouponsPage'
import OrdersPage from './pages/admin/OrdersPage'
import CommissionsPage from './pages/admin/CommissionsPage'

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    let mounted = true
    getMe()
      .then(() => {
        if (mounted) setIsAuthed(true)
      })
      .catch(() => {
        if (mounted) setIsAuthed(false)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="center-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (!isAuthed) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="influencers" element={<InfluencersPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="commissions" element={<CommissionsPage />} />
        </Route>
        <Route
          path="/"
          element={<Navigate to="/admin/dashboard" replace />}
        />
        <Route
          path="*"
          element={
            <Navigate to="/admin/dashboard" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
