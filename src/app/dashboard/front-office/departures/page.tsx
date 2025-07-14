import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BookingActions } from "../_components/BookingActions";

// This function fetches all bookings scheduled to depart today
async function getTodaysDepartures(userId: string | null, role: 'ADMIN' | 'STUDENT') {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    // Role-based filter for students
    const roomFilter = role === 'STUDENT' ? { room: { createdById: userId! } } : {};

    return prisma.booking.findMany({
        where: {
            checkOutDate: {
                gte: startOfToday,
                lte: endOfToday,
            },
            // We only want to see guests who are currently checked in
            status: BookingStatus.CHECKED_IN,
            ...roomFilter,
        },
        include: {
            guest: true,
            room: true,
        },
        orderBy: {
            room: {
                roomNumber: 'asc',
            },
        },
    });
}

export default async function DeparturesListPage() {
    const session = await auth();
    const todaysDepartures = await getTodaysDepartures(session!.user.id, session!.user.role);

    return (
        <div className="space-y-6">
            <div>
                <Link href="/dashboard/front-office" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    ← Back to Front Office
                </Link>
                <h1 className="text-3xl font-bold mt-4">Todays Departure List</h1>
                <p className="text-muted-foreground">
                    Guests scheduled to check out on {new Date().toLocaleDateString()}.
                </p>
            </div>
            
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Guest Name</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead>Payment Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {todaysDepartures.length > 0 ? (
                            todaysDepartures.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/dashboard/guests/${booking.guestId}`} className="hover:underline">
                                            {booking.guest.firstName} {booking.guest.lastName}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {/* Since these are departures, a room MUST be assigned */}
                                        <div className="font-medium">Room {booking.room!.roomNumber}</div>
                                        <div className="text-sm text-muted-foreground">{booking.room!.type}</div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`font-semibold ${booking.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>
                                            {booking.paymentStatus}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {/* We can reuse the BookingActions component to handle check-out */}
                                        <BookingActions booking={booking} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No more departures for today.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}