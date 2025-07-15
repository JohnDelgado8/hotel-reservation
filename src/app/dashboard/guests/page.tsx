import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GuestSearch } from "./_components/GuestSearch";
import { ViewGuestModal } from "./_components/ViewGuestModal";
import { Prisma } from "@prisma/client";

// We define and export this type so our ViewGuestModal component can import it.
// This gives us perfect type safety.
export type GuestWithAllDetails = Prisma.GuestGetPayload<{
    include: {
        bookings: {
            include: {
                room: true
            }
        }
    }
}>;

export default async function GuestsPage({ searchParams }: { searchParams?: { query?: string } }) {
    const query = searchParams?.query || '';
    
    // The query now fetches all guests and their complete booking histories at once.
    const guests = await prisma.guest.findMany({
        where: {
            OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
            ],
        },
        include: {
            bookings: {
                include: { room: true },
                orderBy: { checkInDate: 'desc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Guest Profiles</h1>
                <GuestSearch />
            </div>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Total Bookings</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {guests.length > 0 ? (
                            guests.map((guest) => (
                                <TableRow key={guest.id}>
                                    <TableCell className="font-medium">
                                        {guest.firstName} {guest.lastName}
                                    </TableCell>
                                    <TableCell>{guest.email}</TableCell>
                                    <TableCell>{guest.phone || 'N/A'}</TableCell>
                                    <TableCell>{guest.bookings.length}</TableCell>
                                    <TableCell className="text-right">
                                        {/* Each guest row now has a modal button with all their data */}
                                        <ViewGuestModal guest={guest} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No guests found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}