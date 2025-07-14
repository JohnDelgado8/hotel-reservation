import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { RoomStatusCard } from "./_components/RoomStatusCard";

const prisma = new PrismaClient();

export default async function HousekeepingPage() {
    const session = await auth();

    // **ROLE-BASED DATA FETCHING**
    const rooms = await prisma.room.findMany({
        where: {
            // This is a dynamic 'where' clause.
            // If the user is a student, it adds the filter.
            // If the user is an admin, the condition is false and no filter is added.
            ...(session?.user?.role === 'STUDENT' && { createdById: session.user.id })
        },
        orderBy: { roomNumber: 'asc' }
    });

    return (
        <div>
             <h1 className="text-3xl font-bold mb-6">Housekeeping Status</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {rooms.length > 0 ? (
                    rooms.map(room => (
                        <RoomStatusCard key={room.id} room={room} />
                    ))
                ) : (
                    <p>No rooms to display.</p>
                )}
             </div>
        </div>
    )
}