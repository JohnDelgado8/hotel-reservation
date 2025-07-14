import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Home, BedDouble, BellRing, UtensilsCrossed, Users, LogOut, UserCheck, BarChart3, Moon, FilePlus, Telescope } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link className="flex items-center gap-2 font-semibold" href="/dashboard"><BedDouble className="h-6 w-6" /><span>Hotel Dashboard</span></Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-primary" href="/dashboard"><Home className="h-4 w-4" />Overview</Link>
              
              {/* Reports Section with Sub-links */}
              <div className="px-3 pt-2 text-xs font-semibold uppercase text-gray-400">Reports</div>
              <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-primary" href="/dashboard/reports"><BarChart3 className="h-4 w-4" />Daily & Monthly</Link>
              <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-primary" href="/dashboard/reports/occupancy-forecast"><Telescope className="h-4 w-4" />Occupancy Forecast</Link>

              <div className="px-3 pt-2 text-xs font-semibold uppercase text-gray-400">Operations</div>
              <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-primary" href="/dashboard/my-rooms"><BedDouble className="h-4 w-4" />My Rooms</Link>
              <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-primary" href="/dashboard/front-office"><BellRing className="h-4 w-4" />Front Office</Link>
              <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-primary" href="/dashboard/guests"><UserCheck className="h-4 w-4" />Guests</Link>
              <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-primary" href="/dashboard/housekeeping"><UtensilsCrossed className="h-4 w-4" />Housekeeping</Link>
              
              {isAdmin && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold uppercase text-gray-400">Admin</div>
                  <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-primary" href="/dashboard/admin/new-reservation"><FilePlus className="h-4 w-4" />New Reservation</Link>
                  <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-primary" href="/dashboard/admin/all-rooms"><BedDouble className="h-4 w-4" />All Rooms</Link>
                  <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-primary" href="/dashboard/admin/users"><Users className="h-4 w-4" />Manage Users</Link>
                  <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-primary" href="/dashboard/admin/night-audit"><Moon className="h-4 w-4" />Night Audit</Link>
                </>
              )}
            </nav>
          </div>
          <div className="mt-auto p-4 border-t">
            <form action={async () => { "use server"; await signOut({redirectTo: '/'}); }}><Button variant="ghost" className="w-full justify-start"><LogOut className="mr-2 h-4 w-4" />Logout</Button></form>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
          <div className="flex-1"><h1 className="font-semibold text-lg">{session.user.name} ({session.user.role})</h1></div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}