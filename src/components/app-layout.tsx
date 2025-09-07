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
import { usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'
import Header from './header'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { LoadingProvider, useLoading } from '@/contexts/loading-context'
import { PageLoadingOverlay } from './loading-spinner'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tools', label: 'Tools', icon: Bot },
  { href: '/blog', label: 'Blog', icon: Newspaper },
  { href: '/research', label: 'Research', icon: Book },
  { href: '/updates', label: 'Updates', icon: History },
]

function NavigationLink({ href, children, isActive, ...props }: {
  href: string
  children: React.ReactNode
  isActive: boolean
  [key: string]: any
}) {
  const { setIsLoading } = useLoading()
  const router = useRouter()
  const pathname = usePathname()

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (pathname !== href) {
      setIsLoading(true)
      router.push(href)
    }
  }, [pathname, href, setIsLoading, router])

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoading } = useLoading()
  const pathname = usePathname()

  return (
    <>
      {isLoading && <PageLoadingOverlay />}
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar className="border-r sticky top-0 h-screen">
            <SidebarContent className="flex flex-col">
              <SidebarHeader className="p-4">
                <NavigationLink
                  href="/"
                  isActive={pathname === '/'}
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <CircuitBoard className="w-7 h-7 text-primary" />
                  <span className="group-data-[collapsible=icon]:hidden font-headline">AIDiscoveryBoard</span>
                </NavigationLink>
              </SidebarHeader>
              <SidebarMenu className="flex-1 p-4">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={{ children: item.label, side: 'right' }}
                    >
                      <NavigationLink href={item.href} isActive={pathname === item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </NavigationLink>
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
              <div className="p-4 md:p-6 lg:p-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LoadingProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </LoadingProvider>
  )
}
