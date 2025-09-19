'use client'

import React, { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        onMenuToggle={toggleMobileMenu}
      />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
        />
        
        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 min-h-[calc(100vh-4rem)]",
            "md:ml-64", // Add margin for sidebar width on desktop
            className
          )}
        >
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout