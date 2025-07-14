"use server";

import { auth } from "@/auth";
import { PrismaClient, RoomType } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createStudentRoomAction(formData: FormData) {
  const session = await auth();

  // Security Check 1: User must be logged in.
  if (!session?.user?.id) {
    return { error: "Unauthorized: You must be logged in to add a room." };
  }
  
  // (Optional but good) Security Check 2: Ensure the user is not an admin, as admins might have a different workflow.
  if (session.user.role !== 'STUDENT') {
    return { error: "Forbidden: Only users with the Student role can add rooms this way." };
  }

  // --- Form data processing ---
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
        //
        // **THIS IS THE CRITICAL LINE THAT ASSIGNS OWNERSHIP**
        // It connects the new room to the ID of the currently logged-in student.
        //
        createdById: session.user.id, 
      },
    });

    revalidatePath("/dashboard/my-rooms");
    revalidatePath("/dashboard/housekeeping");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('roomNumber')) {
      return { error: "A room with this number already exists." };
    }
    console.error("Error creating room:", error);
    return { error: "Database error: Failed to create the room." };
  }
}