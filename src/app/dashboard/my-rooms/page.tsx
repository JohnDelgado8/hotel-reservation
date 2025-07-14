import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddRoomButton } from "./_components/AddRoomButton";

const prisma = new PrismaClient();

async function getStudentRooms(userId: string) {
    return prisma.room.findMany({
        // **THE SECURITY FILTER**
        where: { createdById: userId },
        orderBy: { roomNumber: 'asc' }
    });
}

export default async function MyRoomsPage() {
    const session = await auth();
    // We can be sure session and user.id exist because of the middleware.
    const rooms = await getStudentRooms(session!.user.id);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Rooms</h1>
                <AddRoomButton />
            </div>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Room Number</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rooms.length > 0 ? (
                            rooms.map((room) => (
                                <TableRow key={room.id}>
                                    <TableCell>{room.roomNumber}</TableCell>
                                    <TableCell>{room.type}</TableCell>
                                    <TableCell>${room.price.toFixed(2)}</TableCell>
                                    <TableCell>{room.status}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    You havent added any rooms yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}