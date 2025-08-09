"use client"

import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  Home,
  Bot,
  Newspaper,
  Book,
  History,
  CircuitBoard,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Header from './header'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tools', label: 'Tools', icon: Bot },
  { href: '/blog', label: 'Blog', icon: Newspaper },
  { href: '/research', label: 'Research', icon: Book },
  { href: '/updates', label: 'Updates', icon: History },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="border-r sticky top-0 h-screen">
          <SidebarContent className="flex flex-col">
            <SidebarHeader className="p-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <CircuitBoard className="w-7 h-7 text-primary" />
                <span className="group-data-[collapsible=icon]:hidden font-headline">AIDiscoveryBoard</span>
              </Link>
            </SidebarHeader>
            <SidebarMenu className="flex-1 p-4">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side: 'right' }}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <SidebarFooter className="p-4">
               
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col h-screen">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 lg:p-8 h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
