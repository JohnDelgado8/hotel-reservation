import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "./actions";
import { BedDouble, Building, CalendarCheck, CalendarX,Percent, Users, DoorOpen } from "lucide-react";

// A reusable component for our stat cards to keep the code clean
function StatCard({ title, value, icon: Icon, color, description }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-4xl font-bold ${color}`}>
          {value}
        </div>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

// The main dashboard page component
export default async function DashboardOverviewPage() {
    const session = await auth();
    const stats = await getDashboardStats();
    const today = new Date();

    return (
        <div className="space-y-8">
          {/* Header Section */}
          <div>
            <h1 className="text-3xl font-bold">House Status Overview</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name}! Heres a live look at the hotels activity.
            </p>
          </div>
          
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Today's Date Card */}
              <div className="sm:col-span-1 lg:col-span-1 bg-primary text-primary-foreground rounded-lg p-6 flex flex-col items-center justify-center">
                  <div className="text-xl font-medium uppercase tracking-wider">{today.toLocaleString('default', { month: 'short' })}</div>
                  <div className="text-6xl font-bold">{today.getDate()}</div>
                  <div className="text-lg">{today.getFullYear()}</div>
              </div>
              
              {/* KPI Cards */}
              <div className="sm:col-span-1 lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-6">
                <StatCard 
                  title="In-House Guests" 
                  value={stats.inHouseGuests} 
                  icon={Users} 
                  color="text-blue-600"
                  description="Total adults & kids currently checked in."
                />
                <StatCard 
                  title="Today's Arrivals" 
                  value={stats.arrivals} 
                  icon={CalendarCheck} 
                  color="text-green-600"
                  description="Guests scheduled to arrive today."
                />
                <StatCard 
                  title="Today's Departures" 
                  value={stats.departures} 
                  icon={CalendarX} 
                  color="text-orange-600"
                  description="Guests scheduled to depart today."
                />
                <StatCard 
                  title="Occupancy" 
                  value={`${stats.occupancy.toFixed(2)}%`} 
                  icon={Percent} 
                  color="text-fuchsia-600"
                  description="Percentage of rooms occupied."
                />
                <StatCard 
                  title="Available Rooms" 
                  value={stats.availableRooms} 
                  icon={DoorOpen} 
                  color="text-teal-600"
                  description="Rooms ready for new guests."
                />
                <StatCard 
                  title="Out of Service" 
                  value={stats.outOfServiceRooms} 
                  icon={BedDouble} 
                  color="text-red-600"
                  description="Rooms under maintenance."
                />
              </div>
          </div>
          
          {/* Total Rooms Summary */}
          <div className="pt-4">
              <Card className="sm:max-w-xs">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRooms}</div>
                  <p className="text-xs text-muted-foreground">
                    {session?.user?.role === 'ADMIN' ? 'Total rooms in the hotel.' : 'Total rooms you manage.'}
                  </p>
                </CardContent>
              </Card>
          </div>
        </div>
    );
}