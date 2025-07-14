import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RoomStatus, BookingStatus } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookingActions } from "./_components/BookingActions";
import { DetailedBookingModal } from "./_components/DetailedBookingModal";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function FrontOfficePage() {
    const session = await auth();
    const userId = session!.user.id;
    const userRole = session!.user.role;

    // Fetch active bookings (not checked-out, cancelled, or no-show)
    const bookings = await prisma.booking.findMany({
        where: {
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
            ...(userRole === 'STUDENT' && {
                room: { createdById: userId }
            })
        },
        include: { room: true, guest: true },
        orderBy: { createdAt: 'desc' }
    });

    // Fetch AVAILABLE rooms for the new booking form, filtered by student if applicable
    const availableRooms = await prisma.room.findMany({
        where: {
            status: RoomStatus.AVAILABLE,
            ...(userRole === 'STUDENT' && { createdById: userId })
        }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Front Office - Active Bookings</h1>
                <div className="flex items-center gap-2">
                    {/* LINK TO THE ARRIVAL LIST */}
                    <Link 
                        href="/dashboard/front-office/arrivals" 
                        className={buttonVariants({ variant: "outline" })}
                    >
                        Arrivals
                    </Link>
                    {/* THE NEW LINK TO THE DEPARTURE LIST */}
                    <Link 
                        href="/dashboard/front-office/departures" 
                        className={buttonVariants({ variant: "outline" })}
                    >
                        Departures
                    </Link>
                    <DetailedBookingModal availableRooms={availableRooms} />
                </div>
            </div>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Guest</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.length > 0 ? (
                            bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell>
                                        <div className="font-medium">{booking.guest.firstName} {booking.guest.lastName}</div>
                                        <div className="text-sm text-muted-foreground">{booking.guest.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div>{booking.room ? `Room ${booking.room.roomNumber}` : 'Unassigned'}</div>
                                        <div className="text-sm text-muted-foreground">{booking.room?.type || 'N/A'}</div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">${booking.totalAmount.toFixed(2)}</div>
                                        <div className={`text-sm font-semibold ${booking.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>
                                            {booking.paymentStatus}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <BookingActions booking={booking} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No active bookings found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}