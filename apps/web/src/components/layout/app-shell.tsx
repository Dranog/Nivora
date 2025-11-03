'use client'

import { useState } from 'react'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'
import { User } from '@/types/user'

interface AppShellProps {
  children: React.ReactNode
}

// Mock user data for demo (F1)
// In production, this would come from auth context
const mockUser: User = {
  id: '1',
  name: 'Sarah Chen',
  email: 'sarah.chen@example.com',
  avatar: undefined,
  role: 'creator',
  verified: true
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar
        user={mockUser}
        onToggleSidebar={handleToggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      {/* Main layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onClose={handleCloseSidebar}
          userRole={mockUser.role}
        />

        {/* Main content area */}
        <main className="flex-1 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}
