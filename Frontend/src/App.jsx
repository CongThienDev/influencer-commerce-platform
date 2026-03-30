import { Spin } from 'antd'
import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { getMe } from './api'

const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const InfluencersPage = lazy(() => import('./pages/admin/InfluencersPage'))
const CouponsPage = lazy(() => import('./pages/admin/CouponsPage'))
const OrdersPage = lazy(() => import('./pages/admin/OrdersPage'))
const CommissionsPage = lazy(() => import('./pages/admin/CommissionsPage'))

function RouteLoading() {
  return (
    <div className="center-screen">
      <Spin size="large" />
    </div>
  )
}

function withSuspense(node) {
  return <Suspense fallback={<RouteLoading />}>{node}</Suspense>
}

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
        <Route path="/login" element={withSuspense(<LoginPage />)} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              {withSuspense(<AdminLayout />)}
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={withSuspense(<DashboardPage />)} />
          <Route path="influencers" element={withSuspense(<InfluencersPage />)} />
          <Route path="coupons" element={withSuspense(<CouponsPage />)} />
          <Route path="orders" element={withSuspense(<OrdersPage />)} />
          <Route path="commissions" element={withSuspense(<CommissionsPage />)} />
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
