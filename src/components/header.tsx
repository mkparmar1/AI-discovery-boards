import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from './theme-toggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="hidden md:block">
        {/* Placeholder for breadcrumbs or page title */}
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  )
}
