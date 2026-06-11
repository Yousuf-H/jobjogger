import CreateJobDialog from '@/components/job/CreateJobDialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAuth } from '@/hooks/useAuth'
import {
  BarChart2,
  Brain,
  ChevronRight,
  FolderKanban,
  IdCard,
  Landmark,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Plus,
  Settings,
  Shield,
  UserCircle,
  Users,
} from 'lucide-react'
import { useSidebar } from '@/hooks/useSidebar'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const overflowNav = [
  { label: 'Organisations', url: '/organisations', icon: Landmark },
  { label: 'Contacts', url: '/contacts', icon: Users },
  { label: 'Interviews', url: '/interview-prep', icon: Brain },
  { label: 'Resumes', url: '/resume', icon: IdCard },
  { label: 'Profile', url: '/profile', icon: UserCircle },
  { label: 'Settings', url: '/settings', icon: Settings },
]

export default function BottomNav() {
  const location = useLocation()
  const { user, signout } = useAuth()
  const { isMobile } = useSidebar()
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    if (!isMobile) setMoreOpen(false)
  }, [isMobile])

  function isActive(url: string, exact = false) {
    return exact ? location.pathname === url : location.pathname.startsWith(url)
  }

  const overflowActive = overflowNav.some((item) =>
    location.pathname.startsWith(item.url)
  )

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center border-t border-[#E5E7EB] bg-white md:hidden">

        {/* Slot 1 — Dashboard */}
        <Link to="/" className="flex flex-1 flex-col items-center gap-0.5 py-1">
          <LayoutDashboard className={`h-5 w-5 ${isActive('/', true) ? 'text-[#2563EB]' : 'text-[#9CA3AF]'}`} />
          <span className={`text-[10px] font-medium ${isActive('/', true) ? 'text-[#2563EB]' : 'text-[#9CA3AF]'}`}>Dashboard</span>
        </Link>

        {/* Slot 2 — Jobs */}
        <Link to="/jobs" className="flex flex-1 flex-col items-center gap-0.5 py-1">
          <FolderKanban className={`h-5 w-5 ${isActive('/jobs') ? 'text-[#2563EB]' : 'text-[#9CA3AF]'}`} />
          <span className={`text-[10px] font-medium ${isActive('/jobs') ? 'text-[#2563EB]' : 'text-[#9CA3AF]'}`}>Jobs</span>
        </Link>

        {/* Slot 3 — New job (true centre) */}
        <div className="flex flex-1 flex-col items-center gap-0.5 py-1">
          <CreateJobDialog
            trigger={
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-sm transition-transform active:scale-95">
                <Plus className="h-5 w-5" />
              </button>
            }
          />
          <span className="text-[10px] font-medium text-[#9CA3AF]">New</span>
        </div>

        {/* Slot 4 — Analytics */}
        <Link to="/analytics" className="flex flex-1 flex-col items-center gap-0.5 py-1">
          <BarChart2 className={`h-5 w-5 ${isActive('/analytics') ? 'text-[#2563EB]' : 'text-[#9CA3AF]'}`} />
          <span className={`text-[10px] font-medium ${isActive('/analytics') ? 'text-[#2563EB]' : 'text-[#9CA3AF]'}`}>Analytics</span>
        </Link>

        {/* Slot 5 — More */}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center gap-0.5 py-1"
        >
          <MoreHorizontal className={`h-5 w-5 ${overflowActive ? 'text-[#2563EB]' : 'text-[#9CA3AF]'}`} />
          <span className={`text-[10px] font-medium ${overflowActive ? 'text-[#2563EB]' : 'text-[#9CA3AF]'}`}>More</span>
        </button>

      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] overflow-y-auto rounded-t-[16px] px-0 pb-10"
        >
          <SheetHeader className="px-5 pb-3">
            <SheetTitle className="text-left text-[15px] font-semibold text-[#111827]">
              More
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col">
            {[
              ...overflowNav,
              ...(user?.admin ? [{ label: 'Admin', url: '/admin', icon: Shield }] : []),
            ].map((item, i, arr) => {
              const active = location.pathname.startsWith(item.url)
              const isLast = i === arr.length - 1
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-4 px-5 py-3 ${
                    active ? 'bg-[#EFF6FF]' : 'hover:bg-[#F9FAFB]'
                  } ${isLast ? '' : 'border-b border-[#F3F4F6]'}`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${
                      active ? 'bg-[#DBEAFE]' : 'bg-[#F3F4F6]'
                    }`}
                  >
                    <item.icon
                      className={`h-[18px] w-[18px] ${active ? 'text-[#2563EB]' : 'text-[#6B7280]'}`}
                    />
                  </div>
                  <span
                    className={`flex-1 text-[14px] ${
                      active ? 'font-medium text-[#2563EB]' : 'text-[#374151]'
                    }`}
                  >
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
                </Link>
              )
            })}
          </nav>

          {/* Sign out — visually separated */}
          <div className="mt-2 border-t border-[#E5E7EB] px-5 pt-2">
            <button
              onClick={async () => {
                setMoreOpen(false)
                await signout()
              }}
              className="flex w-full items-center gap-4 rounded-[10px] py-3 hover:bg-[#FEF2F2]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-red-50">
                <LogOut className="h-[18px] w-[18px] text-red-500" />
              </div>
              <span className="flex-1 text-left text-[14px] text-red-500">Sign out</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
