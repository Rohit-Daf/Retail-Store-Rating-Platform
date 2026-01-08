import { useState } from 'react'

import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Store from './pages/Store'
import Admin from './pages/Admin'
import Owner from './pages/Owner'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/store"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <Store />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner"
        element={
          <ProtectedRoute allowedRoles={['STORE_OWNER']}>
            <Owner />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
