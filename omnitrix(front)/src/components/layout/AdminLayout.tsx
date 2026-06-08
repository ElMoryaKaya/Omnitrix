import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen" style={{ background: '#03111e' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto min-w-0" style={{ background: '#062035' }}>
        <Outlet />
      </main>
    </div>
  )
}
