// src/app/dashboard/admin/all-rooms/page.tsx
import { PrismaClient } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const prisma = new PrismaClient();

async function getAllRooms() {
    return prisma.room.findMany({ 
        orderBy: { roomNumber: 'asc' },
        include: { createdBy: { select: { name: true }}} // Include who created it
    });
}

export default async function AdminAllRoomsPage() {
    const rooms = await getAllRooms();
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">All Hotel Rooms</h1>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Room Number</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rooms.map(room => (
                            <TableRow key={room.id}>
                                <TableCell>{room.roomNumber}</TableCell>
                                <TableCell>{room.type}</TableCell>
                                <TableCell>{room.status}</TableCell>
                                <TableCell>{room.createdBy.name}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}