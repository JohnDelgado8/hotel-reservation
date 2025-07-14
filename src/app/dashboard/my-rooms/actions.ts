"use server";

import { auth } from "@/auth";
// IMPORTANT: Add 'Prisma' to the import from @prisma/client
import { Prisma, PrismaClient, RoomType } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createStudentRoomAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized: You must be logged in." };
  }
  
  if (session.user.role !== 'STUDENT') {
    return { error: "Forbidden: Only users with the Student role can add rooms this way." };
  }

  const roomNumber = formData.get('roomNumber') as string;
  const type = formData.get('type') as RoomType;
  const priceStr = formData.get('price') as string;
  const description = formData.get('description') as string;
  const imageUrl = formData.get('imageUrl') as string;
  
  if (!roomNumber || !type || !priceStr || !description) {
    return { error: "Room Number, Type, Price, and Description are required." };
  }
  const price = parseFloat(priceStr);
  if (isNaN(price) || price <= 0) {
      return { error: "Invalid price. Must be a positive number." };
  }

  try {
    await prisma.room.create({
      data: {
        roomNumber,
        type,
        price,
        description,
        imageUrl,
        createdById: session.user.id,
      },
    });

    revalidatePath("/dashboard/my-rooms");
    revalidatePath("/dashboard/housekeeping");
    revalidatePath("/");

    return { success: true };
  } catch (error) { // <-- REMOVED the ': any' annotation
    // THE FIX IS HERE: We check if the error is a known Prisma error.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 is the unique constraint violation code (e.g., duplicate roomNumber)
      if (error.code === 'P2002') {
        return { error: "A room with this number already exists." };
      }
    }
    // If it's not a known Prisma error or a different kind of error,
    // we log it for debugging and return a generic failure message.
    console.error("Error creating room:", error);
    return { error: "Database error: Failed to create the room." };
  }
}