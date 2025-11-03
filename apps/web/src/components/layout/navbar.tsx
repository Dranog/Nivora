'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Search, Menu, Moon, Sun, User, Settings, LogOut, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { User as UserType } from '@/types/user'
import { useTheme } from 'next-themes'

interface NavbarProps {
  user?: UserType
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

// Mock notifications
const mockNotifications = [
  { id: '1', text: 'New subscriber', time: '2m ago', unread: true },
  { id: '2', text: 'Payment received', time: '1h ago', unread: true },
  { id: '3', text: 'New message', time: '3h ago', unread: false }
]

export function Navbar({ user, onToggleSidebar, sidebarOpen }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const { theme, setTheme } = useTheme()

  const unreadCount = mockNotifications.filter(n => n.unread).length

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-smooth focus-ring"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary focus-ring rounded-lg">
          OLIVER
        </Link>

        {/* Search bar (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search... (Cmd+K)"
              className="w-full h-10 pl-10 pr-4 bg-muted border-0 rounded-lg text-sm focus-ring transition-smooth"
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 md:hidden" />

        {/* Mobile search button */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-smooth focus-ring"
          aria-label="Toggle search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 hover:bg-muted rounded-lg transition-smooth focus-ring"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-muted rounded-lg transition-smooth focus-ring"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {mockNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 border-b border-border hover:bg-muted transition-smooth cursor-pointer',
                        notification.unread && 'bg-primary/5'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="text-sm">{notification.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                        {notification.unread && (
                          <div className="h-2 w-2 bg-primary rounded-full mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-smooth focus-ring"
              aria-label="User menu"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span className="text-sm">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium flex items-center gap-1">
                  {user.name}
                  {user.verified && <CheckCircle className="h-3 w-3 text-primary" />}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-border">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-smooth"
                    >
                      <User className="h-4 w-4" />
                      <span className="text-sm">Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-smooth"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="text-sm">Settings</span>
                    </Link>
                  </div>
                  <div className="p-1 border-t border-border">
                    <button className="flex items-center gap-2 p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-smooth w-full">
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile search (expanded) */}
      {showSearch && (
        <div className="md:hidden p-4 border-t border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full h-10 pl-10 pr-4 bg-muted border-0 rounded-lg text-sm focus-ring"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  )
}
