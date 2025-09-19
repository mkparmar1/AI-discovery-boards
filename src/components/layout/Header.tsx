'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'


interface HeaderProps {
  onMenuToggle?: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {

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
          {/* Notifications - Hidden */}
          {/* <button
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button> */}

          {/* Theme toggle */}
          <ThemeToggle variant="ghost" size="md" />

          {/* User menu - Hidden */}
          {/* <button
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="User menu"
          >
            <User className="h-5 w-5" />
          </button> */}
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