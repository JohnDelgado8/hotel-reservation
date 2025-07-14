import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPreAuditData } from "./actions";
import { RunNightAuditButton } from "./_components/RunNightAuditButton";

function StatCard({ title, value, description }: { title: string, value: number, description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export default async function NightAuditPage() {
  const { expectedArrivals, expectedDepartures, stayOvers, noShowCandidates } = await getPreAuditData();
  const today = new Date();
  const businessDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const lastAudit = await prisma.auditLog.findUnique({
    where: { businessDate: businessDate },
    include: { runBy: true },
  });

  const isAuditRunToday = !!lastAudit;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Night Audit</h1>
        <p className="text-muted-foreground">
          End-of-day process for business date: {businessDate.toLocaleDateString()}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Automation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The Night Audit is scheduled to run automatically every day at 5:00 AM UTC to close the previous days business. 
            You can run the audit manually for the current day if needed.
          </p>
        </CardContent>
      </Card>

      {isAuditRunToday ? (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Manual Audit for Today Complete</CardTitle>
            <CardDescription className="text-green-700">
              The manual audit for today was successfully run by {lastAudit.runBy.name} at {lastAudit.runAt.toLocaleTimeString()}.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <RunNightAuditButton noShowCount={noShowCandidates} />
      )}

      <div className="pt-4">
        <h2 className="text-2xl font-semibold mb-4">Todays Live Activity Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Expected Arrivals" value={expectedArrivals} description="Guests scheduled to check-in today." />
          <StatCard title="Expected Departures" value={expectedDepartures} description="Guests scheduled to check-out today." />
          <StatCard title="Stay-overs" value={stayOvers} description="Rooms that will remain occupied tonight." />
          <StatCard title="Potential No-Shows" value={noShowCandidates} description="Arrivals not yet checked-in." />
        </div>
      </div>
    </div>
  );
}