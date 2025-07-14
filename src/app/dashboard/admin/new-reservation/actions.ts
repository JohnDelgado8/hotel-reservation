"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus, PaymentStatus, RoomStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createDetailedReservationAction(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: "Unauthorized. Only admins can create detailed reservations." };
  }

  // --- Parse all form data ---
  const guestData = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    middleName: formData.get('middleName') as string || undefined,
    title: formData.get('title') as string || undefined,
    nationality: formData.get('nationality') as string || undefined,
    phone: formData.get('phone') as string || undefined,
  };
  
  // THE FIX IS HERE: Check for our 'unassigned' keyword
  const rawRoomId = formData.get('roomId') as string | undefined;
  const roomId = (rawRoomId && rawRoomId !== 'unassigned') ? rawRoomId : undefined;

  const bookingData = {
    checkInDate: new Date(formData.get('checkInDate') as string),
    checkOutDate: new Date(formData.get('checkOutDate') as string),
    adults: parseInt(formData.get('adults') as string, 10),
    kids: parseInt(formData.get('kids') as string, 10) || 0,
    roomId: roomId, // Use our cleaned-up roomId
    rate: parseFloat(formData.get('rate') as string),
    source: formData.get('source') as string || undefined,
    agent: formData.get('agent') as string || undefined,
    reservationType: formData.get('reservationType') as string || "Guaranteed",
    rateCode: formData.get('rateCode') as string || "RACK",
  };

  // --- Validation ---
  if (!guestData.firstName || !guestData.lastName || !guestData.email || !bookingData.checkInDate || !bookingData.checkOutDate || !bookingData.adults || isNaN(bookingData.rate)) {
    return { error: "Missing required fields in Guest or Booking details." };
  }
  if (bookingData.checkOutDate <= bookingData.checkInDate) {
    return { error: "Check-out date must be after check-in date." };
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const guest = await tx.guest.upsert({
        where: { email: guestData.email },
        update: { ...guestData, phone: guestData.phone },
        create: guestData,
      });

      const newBooking = await tx.booking.create({
        data: {
          guestId: guest.id,
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
          adults: bookingData.adults,
          kids: bookingData.kids,
          source: bookingData.source,
          agent: bookingData.agent,
          reservationType: bookingData.reservationType,
          rateCode: bookingData.rateCode,
          roomId: bookingData.roomId, // Already cleaned
          totalAmount: bookingData.rate,
          bookedById: session.user.id,
          status: bookingData.roomId ? BookingStatus.CHECKED_IN : BookingStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      if (bookingData.roomId) {
        await tx.room.update({
          where: { id: bookingData.roomId },
          data: { status: RoomStatus.OCCUPIED },
        });
      }
      
      return newBooking;
    });

    revalidatePath("/dashboard/front-office");
    return { success: `Reservation created successfully! Booking ID: ${booking.id}` };
  } catch (error) {
    console.error("Reservation creation failed:", error);
    return { error: "A database error occurred. The assigned room might be unavailable." };
  }
}