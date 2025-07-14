import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

// This function fetches all bookings scheduled to arrive today
async function getTodaysArrivals(userId: string | null, role: 'ADMIN' | 'STUDENT') {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    // The role-based filter to ensure students only see arrivals for their rooms
    const roomFilter = role === 'STUDENT' ? { room: { createdById: userId! } } : {};

    return prisma.booking.findMany({
        where: {
            checkInDate: {
                gte: startOfToday,
                lte: endOfToday,
            },
            // We only want to see guests who are not yet checked in
            status: BookingStatus.CONFIRMED, 
            ...roomFilter,
        },
        include: {
            guest: true,
            room: true,
        },
        orderBy: {
            guest: {
                lastName: 'asc',
            },
        },
    });
}

export default async function ArrivalsListPage() {
    const session = await auth();
    const todaysArrivals = await getTodaysArrivals(session!.user.id, session!.user.role);

    return (
        <div className="space-y-6">
            <div>
                <Link href="/dashboard/front-office" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    ← Back to Front Office
                </Link>
                <h1 className="text-3xl font-bold mt-4">Today's Arrival List</h1>
                <p className="text-muted-foreground">
                    Guests scheduled to check in on {new Date().toLocaleDateString()}.
                </p>
            </div>
            
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Guest Name</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead>Nights</TableHead>
                            <TableHead>Adults/Kids</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {todaysArrivals.length > 0 ? (
                            todaysArrivals.map((booking) => {
                                const nights = Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24));
                                return (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">
                                            <Link href={`/dashboard/guests/${booking.guestId}`} className="hover:underline">
                                                {booking.guest.firstName} {booking.guest.lastName}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {booking.room ? `${booking.room.roomNumber} (${booking.room.type})` : 'Unassigned'}
                                        </TableCell>
                                        <TableCell>{nights}</TableCell>
                                        <TableCell>{booking.adults} / {booking.kids}</TableCell>
                                        <TableCell>
                                            <span className="font-semibold text-orange-600">{booking.status}</span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No more arrivals for today.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}