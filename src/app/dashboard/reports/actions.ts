// src/app/dashboard/reports/actions.ts
"use server";

import { auth } from "@/auth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma"; // Let's use a shared prisma instance

// This is the most accurate way to type a booking with its relations
export type BookingWithDetails = Prisma.BookingGetPayload<{
  include: { guest: true; room: true };
}>;

// Helper function to get date boundaries
const getDateBoundaries = () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return { startOfDay, startOfMonth };
};

// ACTION 1: Get detailed list of TODAY's bookings
export async function getDailyBookingsDetail(): Promise<BookingWithDetails[]> {
  const session = await auth();
  const userId = session?.user.role === 'STUDENT' ? session.user.id : null;
  const { startOfDay } = getDateBoundaries();

  const roomFilter = userId ? { room: { createdById: userId } } : {};

  return prisma.booking.findMany({
    where: {
      createdAt: { gte: startOfDay },
      ...roomFilter,
    },
    include: {
      guest: true,
      room: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// ACTION 2: Get detailed list of THIS MONTH's bookings
export async function getMonthlyBookingsDetail(): Promise<BookingWithDetails[]> {
  const session = await auth();
  const userId = session?.user.role === 'STUDENT' ? session.user.id : null;
  const { startOfMonth } = getDateBoundaries();

  const roomFilter = userId ? { room: { createdById: userId } } : {};

  return prisma.booking.findMany({
    where: {
      createdAt: { gte: startOfMonth },
      ...roomFilter,
    },
    include: {
      guest: true,
      room: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}