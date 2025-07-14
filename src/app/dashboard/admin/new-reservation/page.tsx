import { prisma } from "@/lib/prisma";
import { RoomStatus } from "@prisma/client";
import { NewReservationForm } from "./_components/NewReservationForm";

// This is the main page, a Server Component that fetches data
export default async function NewReservationPage() {
  const availableRooms = await prisma.room.findMany({
    where: { status: RoomStatus.AVAILABLE },
    orderBy: { roomNumber: 'asc' }
  });

  // It passes the data down to the client component form
  return <NewReservationForm availableRooms={availableRooms} />;
}