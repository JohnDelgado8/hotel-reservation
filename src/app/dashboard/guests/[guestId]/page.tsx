import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Globe, Calendar, DollarSign } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

// ==================================================================
// THE DEFINITIVE FIX:
// We define a clear type for the props that this specific page receives.
// This is the most direct way to type a dynamic route page in Next.js.
// ==================================================================
type GuestProfilePageProps = {
  params: {
    guestId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

// Helper component for info items
function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex items-start justify-between gap-4 py-2 border-b">
            <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
            </div>
            <span className="text-sm text-right font-semibold">{value}</span>
        </div>
    );
}

// The page component now uses our new, explicit type.
export default async function GuestProfilePage({ params }: GuestProfilePageProps) {
    const { guestId } = params;

    const guest = await prisma.guest.findUnique({
        where: { id: guestId },
        include: {
            bookings: {
                include: { room: true },
                orderBy: { checkInDate: 'desc' }
            }
        }
    });

    if (!guest) {
        notFound();
    }
    
    const totalSpent = guest.bookings
        .filter(b => b.paymentStatus === 'PAID')
        .reduce((sum, b) => sum + b.totalAmount, 0);

    const guestFullName = `${guest.firstName} ${guest.lastName}`;

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div>
                <Link href="/dashboard/guests" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    ← Back to Guests
                </Link>
                <div className="flex items-center gap-4 mt-4">
                    <div className="bg-muted rounded-full h-16 w-16 flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{guestFullName}</h1>
                        <p className="text-muted-foreground">{guest.email}</p>
                    </div>
                </div>
            </div>

            {/* Details & Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                    <CardContent>
                        <dl>
                           <InfoItem icon={User} label="Full Name" value={`${guest.title || ''} ${guestFullName}`} />
                           <InfoItem icon={Mail} label="Email" value={guest.email} />
                           <InfoItem icon={Phone} label="Phone" value={guest.phone} />
                           <InfoItem icon={Globe} label="Nationality" value={guest.nationality} />
                        </dl>
                    </CardContent>
                </Card>
                <Card className="md:col-span-1">
                    <CardHeader><CardTitle>Guest Statistics</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center">
                           <Calendar className="h-6 w-6 text-blue-500 mr-4"/>
                           <div>
                                <p className="text-2xl font-bold">{guest.bookings.length}</p>
                                <p className="text-xs text-muted-foreground">Total Bookings</p>
                           </div>
                        </div>
                         <div className="flex items-center">
                           <DollarSign className="h-6 w-6 text-green-500 mr-4"/>
                           <div>
                                <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">Total Lifetime Value (Paid)</p>
                           </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Booking History Table */}
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
                                    <TableCell>{new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{booking.status}</TableCell>
                                    <TableCell className="text-right">${booking.totalAmount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}