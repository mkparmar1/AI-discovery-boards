'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { User, LogOut, UserCircle } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import NewBadge from '@/components/ui/NewBadge'

interface HeaderProps {
  onMenuToggle?: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  // Authentication state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

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

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))
  const linkClass = (href: string) =>
    isActive(href) ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section - Logo */}
        <div className="flex items-center gap-4">
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

        {/* Center section - Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className={linkClass('/')} aria-current={isActive('/') ? 'page' : undefined}>Home</Link>
          <Link href="/tools" className={`group inline-flex items-center ${linkClass('/tools')}`} aria-current={isActive('/tools') ? 'page' : undefined}>
            AI Tools
            <NewBadge />
          </Link>
          <Link href="/prompts" className={`group inline-flex items-center ${linkClass('/prompts')}`} aria-current={isActive('/prompts') ? 'page' : undefined}>
            AI Prompts
            <NewBadge />
          </Link>
          <Link href="/blogs" className={linkClass('/blogs')} aria-current={isActive('/blogs') ? 'page' : undefined}>Blogs</Link>
          <Link href="/research" className={linkClass('/research')} aria-current={isActive('/research') ? 'page' : undefined}>Research</Link>
          <Link href="/learn-ai" className={`group inline-flex items-center ${linkClass('/learn-ai')}`} aria-current={isActive('/learn-ai') ? 'page' : undefined}>
            Learn AI
            <NewBadge />
          </Link>
          <Link href="/contact" className={`inline-flex items-center ${linkClass('/contact')}`} aria-current={isActive('/contact') ? 'page' : undefined}>
            Contact & Feedback
          </Link>
        </nav>

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
    </header>
  )
}

export default Header