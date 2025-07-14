// src/app/dashboard/reports/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma"; // Use the shared instance/ Use the shared instance
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, BookCheck } from "lucide-react";
import { getDailyBookingsDetail, getMonthlyBookingsDetail } from "./actions";
import { BookingReportModal } from "./_components/BookingReportModal";

// The summary data fetching logic can be kept here
async function getReportSummary(userId: string | null) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const roomFilter = userId ? { room: { createdById: userId } } : {};

  const [dailyBookings, dailyRevenue, monthlyBookings, monthlyRevenue] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: startOfDay }, ...roomFilter } }),
    prisma.booking.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: startOfDay }, paymentStatus: 'PAID', ...roomFilter } }),
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth }, ...roomFilter } }),
    prisma.booking.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: startOfMonth }, paymentStatus: 'PAID', ...roomFilter } }),
  ]);

  return {
    daily: {
      bookings: dailyBookings,
      revenue: dailyRevenue._sum.totalAmount ?? 0,
    },
    monthly: {
      bookings: monthlyBookings,
      revenue: monthlyRevenue._sum.totalAmount ?? 0,
    },
  };
}

export default async function ReportsPage() {
  const session = await auth();
  const userId = session!.user.role === 'STUDENT' ? session!.user.id : null;
  
  // Fetch both summary and detailed data in parallel for performance
  const [summaryData, dailyBookingDetails, monthlyBookingDetails] = await Promise.all([
    getReportSummary(userId),
    getDailyBookingsDetail(),
    getMonthlyBookingsDetail(),
  ]);

  const clickableCard = "cursor-pointer hover:ring-2 hover:ring-primary transition-all";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      <p className="text-muted-foreground mb-8">Click on a card to view detailed records.</p>
      
      <div className="grid gap-8">
        {/* --- DAILY REPORT SECTION --- */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Todays Report</h2>
          <div className="grid gap-4 md:grid-cols-2">
            
            <BookingReportModal title="Today's Detailed Revenue" bookings={dailyBookingDetails}>
              <Card className={clickableCard}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Todays Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${summaryData.daily.revenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">From {dailyBookingDetails.filter(b => b.paymentStatus === 'PAID').length} paid bookings today</p>
                </CardContent>
              </Card>
            </BookingReportModal>
            
            <BookingReportModal title="Today's Detailed Bookings" bookings={dailyBookingDetails}>
              <Card className={clickableCard}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Todays Bookings</CardTitle>
                  <BookCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summaryData.daily.bookings}</div>
                  <p className="text-xs text-muted-foreground">Total new bookings created today.</p>
                </CardContent>
              </Card>
            </BookingReportModal>

          </div>
        </div>

        {/* --- MONTHLY REPORT SECTION --- */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">This Months Report</h2>
          <div className="grid gap-4 md:grid-cols-2">

            <BookingReportModal title="This Month's Detailed Revenue" bookings={monthlyBookingDetails}>
              <Card className={clickableCard}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Months Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${summaryData.monthly.revenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">From {monthlyBookingDetails.filter(b => b.paymentStatus === 'PAID').length} paid bookings this month</p>
                </CardContent>
              </Card>
            </BookingReportModal>

            <BookingReportModal title="This Month's Detailed Bookings" bookings={monthlyBookingDetails}>
              <Card className={clickableCard}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Months Bookings</CardTitle>
                  <BookCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summaryData.monthly.bookings}</div>
                  <p className="text-xs text-muted-foreground">Total new bookings created this month.</p>
                </CardContent>
              </Card>
            </BookingReportModal>

          </div>
        </div>
      </div>
    </div>
  );
}