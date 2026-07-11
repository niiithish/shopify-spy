"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconFlame,
  IconHeart,
  IconLayoutDashboard,
  IconRocket,
  IconSearch,
  IconTags,
} from "@tabler/icons-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { href: "/", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/trending", label: "Trending", icon: IconFlame },
  { href: "/opportunities", label: "Opportunities", icon: IconRocket },
  { href: "/apps", label: "All Apps", icon: IconSearch },
  { href: "/keywords", label: "Keywords", icon: IconTags },
  { href: "/favorites", label: "Favorites", icon: IconHeart },
]

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/" />}
              tooltip="Shopify Spy"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="Shopify Spy"
                width={32}
                height={32}
                className="size-8 shrink-0"
              />
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Shopify Spy</span>
                <span className="truncate text-xs text-muted-foreground">
                  App intelligence
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Discover</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActivePath(pathname, item.href)}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-5 md:px-8">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col px-5 py-8 md:px-8 md:py-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
