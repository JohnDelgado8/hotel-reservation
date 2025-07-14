import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Globe, Calendar, DollarSign } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

// A small helper component to display a piece of guest info
// FIX #1: Added 'label' to the function's parameter destructuring
function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className="flex items-start gap-4 py-2">
            <Icon className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="text-sm text-primary">{value}</p>
            </div>
        </div>
    );
}

export default async function GuestProfilePage({ params }: { params: { guestId: string } }) {
    const guest = await prisma.guest.findUnique({
        where: { id: params.guestId },
        include: {
            bookings: {
                include: {
                    room: true,
                },
                orderBy: {
                    checkInDate: 'desc',
                }
            }
        }
    });

    if (!guest) {
        notFound();
    }
    
    const totalSpent = guest.bookings
        .filter(b => b.paymentStatus === 'PAID')
        .reduce((sum, b) => sum + b.totalAmount, 0);

    return (
        <div className="space-y-8">
            <div>
                <Link href="/dashboard/guests" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    ← Back to Guests
                </Link>
                <div className="flex items-center gap-4 mt-4">
                    <div className="bg-muted rounded-full h-16 w-16 flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        {/* FIX #2: Use firstName and lastName instead of name */}
                        <h1 className="text-3xl font-bold">{guest.firstName} {guest.lastName}</h1>
                        <p className="text-muted-foreground">{guest.email}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {/* FIX #3: Use firstName and lastName here too */}
                        <InfoItem icon={User} label="Full Name" value={`${guest.title || ''} ${guest.firstName} ${guest.lastName}`} />
                        <InfoItem icon={Mail} label="Email Address" value={guest.email} />
                        <InfoItem icon={Phone} label="Phone Number" value={guest.phone} />
                        <InfoItem icon={Globe} label="Nationality" value={guest.nationality} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Guest Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="flex items-center p-4 bg-secondary/50 rounded-lg">
                           <Calendar className="h-8 w-8 text-blue-500 mr-4"/>
                           <div>
                                <p className="text-2xl font-bold">{guest.bookings.length}</p>
                                <p className="text-xs text-muted-foreground">Total Bookings</p>
                           </div>
                        </div>
                         <div className="flex items-center p-4 bg-secondary/50 rounded-lg">
                           <DollarSign className="h-8 w-8 text-green-500 mr-4"/>
                           <div>
                                <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">Lifetime Value (Paid)</p>
                           </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">Booking History</h2>
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Room</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {guest.bookings.map(booking => (
                                <TableRow key={booking.id}>
                                    <TableCell>
                                        <div className="font-medium">{booking.room?.roomNumber || 'N/A'}</div>
                                        <div className="text-sm text-muted-foreground">{booking.room?.type || ''}</div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{booking.status}</TableCell>
                                    <TableCell className="text-right">${booking.totalAmount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                             {guest.bookings.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No booking history found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}