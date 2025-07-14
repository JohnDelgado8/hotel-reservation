"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus, RoomStatus } from "@prisma/client";

export async function getDashboardStats() {
  const session = await auth();
  const userRole = session?.user.role;
  const userId = session?.user.id;

  // This is the core filter. If user is a student, it applies. If admin, it's ignored.
  const studentRoomFilter = userRole === 'STUDENT' ? { createdById: userId } : {};

  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const endOfToday = new Date(today.setHours(23, 59, 59, 999));

  // Use Promise.all to fetch all stats in parallel for max performance
  const [
    totalRooms,
    availableRooms,
    outOfServiceRooms,
    inHouseGuests,
    arrivals,
    departures,
  ] = await Promise.all([
    // --- Room Stats ---
    prisma.room.count({ where: studentRoomFilter }),
    prisma.room.count({ where: { status: RoomStatus.AVAILABLE, ...studentRoomFilter } }),
    prisma.room.count({ where: { status: RoomStatus.MAINTENANCE, ...studentRoomFilter } }),

    // --- Guest & Booking Stats ---
    prisma.booking.aggregate({
      _sum: { adults: true, kids: true },
      where: { status: BookingStatus.CHECKED_IN, room: studentRoomFilter },
    }),
    prisma.booking.count({
      where: { checkInDate: { gte: startOfToday, lte: endOfToday }, room: studentRoomFilter },
    }),
    prisma.booking.count({
      where: { checkOutDate: { gte: startOfToday, lte: endOfToday }, room: studentRoomFilter },
    }),
  ]);

  const totalInHouseGuests = (inHouseGuests._sum.adults ?? 0) + (inHouseGuests._sum.kids ?? 0);
  const occupiedRooms = totalRooms - availableRooms - outOfServiceRooms;
  
  // Calculate occupancy. Avoid division by zero if there are no rooms.
  const occupancy = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  return {
    totalRooms,
    availableRooms,
    outOfServiceRooms,
    inHouseGuests: totalInHouseGuests,
    arrivals,
    departures,
    occupancy,
  };
}