import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GuestSearch } from "./_components/GuestSearch";
import Link from "next/link";
// import { buttonVariants } from "@/components/ui/button";

export default async function GuestsPage({ searchParams }: { searchParams?: { query?: string } }) {
    const query = searchParams?.query || '';
    
    // THE FIX IS IN THIS 'where' CLAUSE
    const guests = await prisma.guest.findMany({
        where: {
            // We search across multiple fields to get the best results
            OR: [
                // Search if the query appears in the first name
                { firstName: { contains: query, mode: 'insensitive' } },
                // Search if the query appears in the last name
                { lastName: { contains: query, mode: 'insensitive' } },
                // Search if the query appears in the email
                { email: { contains: query, mode: 'insensitive' } },
                // A more advanced (but slower) search for full name would require raw SQL or a dedicated search service.
                // This OR approach is very effective for most use cases.
            ],
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
                            <TableHead>Member Since</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {guests.length > 0 ? (
                            guests.map((guest) => (
                                <TableRow key={guest.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/dashboard/guests/${guest.id}`} className="hover:underline">
                                            {/* We construct the full name for display */}
                                            {guest.firstName} {guest.lastName}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{guest.email}</TableCell>
                                    <TableCell>{guest.phone || 'N/A'}</TableCell>
                                    <TableCell>{new Date(guest.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
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