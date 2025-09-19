'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Wrench,
  FileText,
  GraduationCap,
  TrendingUp,
  MapPin,
  Users,
  ChevronDown,
  ChevronRight,
  Bot,
  Brain,
  Eye,
  MessageSquare,
  Database,
  Cloud,
  Zap,
  BookOpen,
  Video,
  Award,
  Briefcase,
  Code,
  Microscope
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
  isOpen?: boolean
  onClose?: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    title: 'Home',
    href: '/',
    icon: Home
  },
  {
    title: 'AI Tools',
    href: '/tools',
    icon: Wrench
  },
  {
    title: 'AI Prompts',
    href: '/prompts',
    icon: MessageSquare
  },
  {
    title: 'Blogs',
    href: '/blogs',
    icon: FileText
  },
  {
    title: 'Research Papers',
    href: '/research',
    icon: Microscope
  }
]

const Sidebar: React.FC<SidebarProps> = ({ className, isOpen = true, onClose }) => {
  const pathname = usePathname()
  // Removed expandable menu logic since we only have simple menu items

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  // Removed expandable menu logic since we only have simple menu items

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 bg-sidebar border-r border-border h-[calc(100vh-4rem)] overflow-y-auto",
          "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
          "fixed left-0 top-16 z-50 transform transition-transform duration-300 ease-in-out md:fixed md:top-16 md:z-auto md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map((item) => {
            const isItemActive = isActive(item.href)
            
            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isItemActive && 'bg-accent text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
        

      </aside>
    </>
  )
}

export default Sidebar