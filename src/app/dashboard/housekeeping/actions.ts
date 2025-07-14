// src/app/dashboard/housekeeping/actions.ts
"use server";

import { auth } from "@/auth";
import { PrismaClient, RoomStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function updateRoomStatusAction(roomId: string, status: RoomStatus) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    // Security check: Student can only update their own rooms
    if (session.user.role === 'STUDENT') {
        const room = await prisma.room.findFirst({
            where: { id: roomId, createdById: session.user.id }
        });
        if (!room) {
            return { error: "Room not found or you don't have permission." };
        }
    }

    await prisma.room.update({
      where: { id: roomId },
      data: { status },
    });

    revalidatePath("/dashboard/housekeeping");
    revalidatePath("/"); // Revalidate public page as availability might change
    return { success: true };
  } catch (error) {
    return { error: "Failed to update room status." };
  }
}