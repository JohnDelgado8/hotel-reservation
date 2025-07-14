// src/app/dashboard/front-office/actions.ts
"use server";

import { auth } from "@/auth";
import { PrismaClient, RoomStatus, PaymentStatus, BookingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// ACTION 1: CREATE A NEW BOOKING
export async function createBookingAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // --- Guest Details ---
  const guestName = formData.get('guestName') as string;
  const guestEmail = formData.get('guestEmail') as string;
  const guestPhone = formData.get('guestPhone') as string;
  
  // --- Booking Details ---
  const roomId = formData.get('roomId') as string;
  const checkInDate = new Date(formData.get('checkInDate') as string);
  const checkOutDate = new Date(formData.get('checkOutDate') as string);
  const totalAmount = parseFloat(formData.get('totalAmount') as string);
  
  // --- Validation ---
  if (!guestName || !guestEmail || !roomId || !checkInDate || !checkOutDate || isNaN(totalAmount)) {
    return { error: "Missing required fields." };
  }

  try {
    // This is a transaction. Both operations must succeed or neither will.
    // This prevents booking a room without making it OCCUPIED.
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Find or Create the Guest
      let guest = await tx.guest.findUnique({ where: { email: guestEmail } });
      if (!guest) {
        guest = await tx.guest.create({
          data: { name: guestName, email: guestEmail, phone: guestPhone },
        });
      }

      // Step 2: Create the Booking
      const booking = await tx.booking.create({
        data: {
          guestId: guest.id,
          roomId,
          checkInDate,
          checkOutDate,
          totalAmount,
          status: BookingStatus.CHECKED_IN, // Guest is checked in immediately
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      // Step 3: Update the Room Status to OCCUPIED
      await tx.room.update({
        where: { id: roomId },
        data: { status: RoomStatus.OCCUPIED },
      });

      return booking;
    });
    
    revalidatePath('/dashboard/front-office');
    revalidatePath('/dashboard/housekeeping');
    revalidatePath('/'); // Public page
    return { success: `Booking created successfully for ${result.id}` };

  } catch (error) {
    console.error("Booking Creation Error:", error);
    return { error: "Failed to create booking." };
  }
}

// ACTION 2: HANDLE CHECK-OUT
export async function checkOutAction(bookingId: string, roomId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  
  try {
    // Transaction: Update booking and room status together
    await prisma.$transaction(async (tx) => {
      // Step 1: Update Booking status to CHECKED_OUT
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CHECKED_OUT },
      });

      // Step 2: Update Room status to DIRTY for housekeeping
      await tx.room.update({
        where: { id: roomId },
        data: { status: RoomStatus.DIRTY },
      });
    });

    revalidatePath('/dashboard/front-office');
    revalidatePath('/dashboard/housekeeping');
    return { success: "Check-out successful. Room marked for cleaning." };

  } catch (error) {
    console.error("Check-out Error:", error);
    return { error: "Failed to process check-out." };
  }
}

// ACTION 3: UPDATE PAYMENT STATUS
export async function updatePaymentStatusAction(bookingId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        await prisma.booking.update({
            where: { id: bookingId },
            data: { paymentStatus: PaymentStatus.PAID }
        });
        revalidatePath('/dashboard/front-office');
        return { success: "Payment status updated to PAID." };
    } catch (error) {
        return { error: "Failed to update payment status." };
    }
}