'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, User, LogOut, Settings, UserCircle } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onMenuToggle?: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  // Authentication state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Check for user authentication on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthenticated(true)
        console.log('✅ User authenticated from localStorage:', parsedUser.email)
      } catch (error) {
        console.error('❌ Error parsing user data from localStorage:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleLogout = () => {
    console.log('🚪 User logging out')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    setShowProfileDropdown(false)
    window.location.href = '/'
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section - Logo and mobile menu */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">AI</span>
            </div>
            <span className="hidden font-bold sm:inline-block">
              AI Discovery Boards
            </span>
          </Link>
        </div>

        {/* Center section - Empty space */}
        <div className="flex flex-1 items-center justify-center px-4">
          {/* Search functionality hidden */}
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle variant="ghost" size="md" />

          {/* Sign In button - redirects to login page */}
          {!isAuthenticated && (
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="mr-2"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          )}

          {/* Authentication section */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="User menu"
              >
                <UserCircle className="h-6 w-6" />
              </button>

              {/* Profile dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover p-1 shadow-md z-50">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={handleLogout}
                      className="flex w-full items-center px-3 py-2 text-sm hover:bg-accent rounded-sm text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile search bar - Hidden */}
      {/* <div className="border-t bg-background px-4 py-3 md:hidden">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search AI tools, papers, courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        </form>
      </div> */}
    </header>
  )
}

export default Header