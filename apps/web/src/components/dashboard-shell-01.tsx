// Adapted from Shadcn Space dashboard-shell-01 (Copyright 2026 Shadcn Space).
// See THIRD_PARTY_NOTICES.md for the free license and adaptation details.
import { useState, type ReactNode, type CSSProperties } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import {
  type LucideIcon,
  Search,
  Mail,
  LogOut,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import type { StaffSession } from '@jomeca/shared';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/sidebar-tooltip';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sidebar-sheet';
import { StaffNotifications } from '@/components/staff-notifications';
import { StaffClock } from '@/components/staff-clock';
type Destination = {
  to: string;
  label: string;
  icon: LucideIcon;
  parent?: string;
};
export function DashboardShell01({
  session,
  title,
  destinations,
  busy,
  signOut,
  children,
}: {
  session: StaffSession;
  title: string;
  destinations: Destination[];
  busy: boolean;
  signOut: () => void;
  children: ReactNode;
}) {
  const [search, setSearch] = useState('');
  const { pathname } = useLocation();
  const initials = session.user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return (
    <TooltipProvider>
      <SidebarProvider
        className="dashboard-shell-01 jomeca-workspace"
        style={
          {
            '--sidebar-width': '16rem',
            '--sidebar-width-icon': '4rem',
          } as CSSProperties
        }
      >
        <WorkspaceSidebar
          destinations={destinations}
          name={session.user.name}
          initials={initials}
          busy={busy}
          signOut={signOut}
        />
        <SidebarInset className="staff-stage">
          <header className="staff-topbar">
            <div className="shell-header-start">
              <SidebarTrigger
                className="shell-icon-button"
                title="Toggle sidebar (Ctrl+B / ⌘B)"
              />
              <Dialog>
                <DialogTrigger
                  className="shell-search-trigger"
                  aria-label="Find a workspace page"
                >
                  <Search size={17} />
                  <span>Find a workspace page</span>
                </DialogTrigger>
                <DialogContent className="staff-mobile-dialog shell-search-dialog">
                  <DialogTitle>Find a workspace page</DialogTitle>
                  <DialogDescription>
                    Search the sections available to your account.
                  </DialogDescription>
                  <label className="staff-search">
                    <Search size={18} />
                    <input
                      autoFocus
                      aria-label="Search workspace pages"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Reservations, settings…"
                    />
                  </label>
                  <nav aria-label="Search results">
                    {destinations
                      .filter((item) =>
                        item.label.toLowerCase().includes(search.toLowerCase()),
                      )
                      .map((item) => (
                        <DialogClose asChild key={item.to}>
                          <Link to={item.to}>
                            {item.label}
                            <ChevronRight size={16} />
                          </Link>
                        </DialogClose>
                      ))}
                    {!destinations.some((item) =>
                      item.label.toLowerCase().includes(search.toLowerCase()),
                    ) && <p>No matching pages.</p>}
                  </nav>
                </DialogContent>
              </Dialog>
            </div>
            <div className="staff-topbar-right">
              <StaffClock />
              <StaffNotifications session={session} />
              <Sheet>
                <SheetTrigger
                  render={
                    <button
                      className="shell-account-trigger"
                      aria-label="Open staff account"
                    />
                  }
                >
                  <span className="staff-avatar">{initials}</span>
                </SheetTrigger>
                <SheetContent side="right" className="staff-profile-drawer">
                  <SheetHeader className="staff-profile-header">
                    <span className="staff-avatar staff-profile-avatar">
                      {initials}
                    </span>
                    <SheetTitle>{session.user.name}</SheetTitle>
                    <SheetDescription>
                      <Mail size={15} aria-hidden="true" />
                      {session.user.email}
                    </SheetDescription>
                  </SheetHeader>
                  <nav
                    className="staff-profile-links"
                    aria-label="Account navigation"
                  >
                    {destinations.map(({ to, label, icon: Icon }) => (
                      <SheetClose
                        key={to}
                        nativeButton={false}
                        render={<Link to={to} />}
                        aria-current={pathname === to ? 'page' : undefined}
                      >
                        <Icon size={19} aria-hidden="true" />
                        <span>{label}</span>
                        <ChevronRight size={15} aria-hidden="true" />
                      </SheetClose>
                    ))}
                    <SheetClose
                      nativeButton={false}
                      render={<Link to="https://jomecacentercom-33lf.vercel.app/" target="_blank" rel="noreferrer" />}
                    >
                      <ArrowUpRight size={19} aria-hidden="true" />
                      <span>View website</span>
                    </SheetClose>
                  </nav>
                  <SheetFooter className="staff-profile-footer">
                    <Button disabled={busy} onClick={signOut}>
                      Sign out <LogOut size={16} />
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </header>
          <span className="sr-only">{title}</span>
          {children}
          <footer className="staff-footer">
            <span>© {new Date().getFullYear()} Jomeca Center</span>
            <span>All schedules shown in Philippine time</span>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
function WorkspaceSidebar({
  destinations,
  name,
  initials,
  busy,
  signOut,
}: {
  destinations: Destination[];
  name: string;
  initials: string;
  busy: boolean;
  signOut: () => void;
}) {
  const { setOpenMobile } = useSidebar();
  const { pathname } = useLocation();
  return (
    <Sidebar
      collapsible="icon"
      className="jomeca-sidebar"
      aria-label="Staff workspace"
    >
      <SidebarHeader className="jomeca-sidebar-header">
        <Link
          to="/staff"
          className="jomeca-sidebar-brand"
          aria-label="Jomeca overview"
          onClick={() => setOpenMobile(false)}
        >
          <BrandLogo />
          <span className="jomeca-sidebar-caption">Staff workspace</span>
        </Link>
        <div className="jomeca-sidebar-person">
          <span className="staff-avatar">{initials}</span>
          <div>
            <strong>{name}</strong>
            <span>Jomeca Center</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {destinations
              .filter((item) => !item.parent)
              .map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    render={<NavLink to={to} end={to === '/staff'} />}
                    isActive={
                      pathname === to ||
                      destinations.some(
                        (item) => item.parent === to && item.to === pathname,
                      )
                    }
                    tooltip={label}
                    onClick={() => setOpenMobile(false)}
                  >
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                  {destinations.some((item) => item.parent === to) && (
                    <SidebarMenuSub>
                      {destinations
                        .filter((item) => item.parent === to)
                        .map(
                          ({
                            to: childTo,
                            label: childLabel,
                            icon: ChildIcon,
                          }) => (
                            <SidebarMenuSubItem key={childTo}>
                              <SidebarMenuSubButton
                                render={<NavLink to={childTo} />}
                                isActive={pathname === childTo}
                                onClick={() => setOpenMobile(false)}
                              >
                                <ChildIcon aria-hidden="true" />
                                <span>{childLabel}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ),
                        )}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Quick links</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link to="https://jomecacentercom-33lf.vercel.app/" target="_blank" rel="noreferrer" />}
                tooltip="View website"
              >
                <ArrowUpRight aria-hidden="true" />
                <span>View website</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="jomeca-sidebar-footer">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              disabled={busy}
              tooltip="Sign out"
            >
              <LogOut aria-hidden="true" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
