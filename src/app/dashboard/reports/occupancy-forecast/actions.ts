"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus, RoomStatus } from "@prisma/client";

// Define the structure of our daily forecast data
export interface DailyForecast {
  date: string;
  dayOfWeek: string;
  occupied: number;
  arrivals: number;
  departures: number;
  outOfService: number;
  occupancyPercent: number;
}

export async function getOccupancyForecastAction(
  startDate: Date,
  endDate: Date
): Promise<{ forecastData: DailyForecast[], totalRooms: number }> {
  const session = await auth();
  const userRole = session?.user.role;
  const userId = session?.user.id;

  // Role-based filter for all queries
  const studentRoomFilter = userRole === 'STUDENT' ? { createdById: userId } : {};

  // 1. Fetch total rooms once (filtered by role)
  const totalRooms = await prisma.room.count({ where: studentRoomFilter });
  if (totalRooms === 0) return { forecastData: [], totalRooms: 0 };

  // 2. Fetch all relevant bookings and rooms in the date range
  const bookingsInRange = await prisma.booking.findMany({
    where: {
      room: studentRoomFilter,
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
      checkInDate: { lt: endDate },
      checkOutDate: { gt: startDate },
    },
  });

  const outOfServiceRooms = await prisma.room.findMany({
    where: { status: RoomStatus.MAINTENANCE, ...studentRoomFilter }
  });

  // 3. Process the data day-by-day
  const forecastData: DailyForecast[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

    // Calculate stats for the current day
    const arrivals = bookingsInRange.filter(
      b => new Date(b.checkInDate) >= startOfDay && new Date(b.checkInDate) <= endOfDay
    ).length;

    const departures = bookingsInRange.filter(
      b => new Date(b.checkOutDate) >= startOfDay && new Date(b.checkOutDate) <= endOfDay
    ).length;
    
    // A room is occupied on a given day if the guest has checked in on or before that day
    // AND is checking out after that day.
    const occupied = bookingsInRange.filter(
        b => new Date(b.checkInDate) <= endOfDay && new Date(b.checkOutDate) > startOfDay
    ).length;

    const outOfServiceCount = outOfServiceRooms.length; // Assuming OOS rooms are for the whole period for simplicity

    const occupancyPercent = (occupied / totalRooms) * 100;

    forecastData.push({
      date: startOfDay.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit'}),
      dayOfWeek: startOfDay.toLocaleDateString(undefined, { weekday: 'short' }),
      occupied,
      arrivals,
      departures,
      outOfService: outOfServiceCount,
      occupancyPercent,
    });

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { forecastData, totalRooms };
}