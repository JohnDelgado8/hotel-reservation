"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

// ACTION 1: Get data for the UI summary cards (for today's view)
export async function getPreAuditData() {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const endOfToday = new Date(today.setHours(23, 59, 59, 999));

  const [expectedArrivals, expectedDepartures, stayOvers, noShowCandidates] = await Promise.all([
    prisma.booking.count({ where: { checkInDate: { gte: startOfToday, lte: endOfToday } } }),
    prisma.booking.count({ where: { checkOutDate: { gte: startOfToday, lte: endOfToday } } }),
    prisma.booking.count({ where: { status: BookingStatus.CHECKED_IN, checkOutDate: { gt: endOfToday } } }),
    prisma.booking.count({ where: { checkInDate: { lte: endOfToday }, status: BookingStatus.CONFIRMED } })
  ]);
  
  return { expectedArrivals, expectedDepartures, stayOvers, noShowCandidates };
}

// ACTION 2: The actual audit logic, usable by both manual and cron runs
async function executeAuditForDate(businessDate: Date, runByUserId: string) {
  const startOfBusinessDate = new Date(businessDate.setHours(0, 0, 0, 0));
  const endOfBusinessDate = new Date(businessDate.setHours(23, 59, 59, 999));
  
  const existingAudit = await prisma.auditLog.findUnique({ where: { businessDate: startOfBusinessDate } });
  if (existingAudit) {
    return { error: `Audit for ${startOfBusinessDate.toLocaleDateString()} has already been run.` };
  }

  const result = await prisma.$transaction(async (tx) => {
    const noShowBookings = await tx.booking.findMany({
      where: { checkInDate: { lte: endOfBusinessDate }, status: BookingStatus.CONFIRMED },
    });
    
    if (noShowBookings.length > 0) {
      await tx.booking.updateMany({
        where: { id: { in: noShowBookings.map((b) => b.id) } },
        data: { status: BookingStatus.NO_SHOW },
      });
    }

    const summary = { processedNoShows: noShowBookings.length, noShowBookingIds: noShowBookings.map((b) => b.id) };
    await tx.auditLog.create({
      data: { runByUserId, businessDate: startOfBusinessDate, summary },
    });
    return summary;
  });

  revalidatePath("/dashboard/admin/night-audit");
  revalidatePath("/dashboard/front-office");
  return { success: `Night Audit for ${startOfBusinessDate.toLocaleDateString()} complete! Processed ${result.processedNoShows} no-shows.` };
}

// ACTION 3: For the MANUAL button click (runs for TODAY)
export async function runManualNightAuditAction() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: "Unauthorized." };
  }
  return executeAuditForDate(new Date(), session.user.id);
}

// ACTION 4: For the AUTOMATED cron job (runs for YESTERDAY)
export async function runNightAuditActionForCron() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  // The cron job needs a user to associate the log with. We'll find the first admin.
  const adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN }});
  if (!adminUser) {
    return { error: "No admin user found to run the automated audit." };
  }
  
  return executeAuditForDate(yesterday, adminUser.id);
}