import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PrintButton } from "./_components/PrintButton";

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className="flex justify-between py-2 border-b">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="text-sm text-gray-900 text-right">{value}</dd>
        </div>
    );
}

export default async function PrintFolioPage({ params }: { params: { bookingId: string } }) {
    const booking = await prisma.booking.findUnique({
        where: { id: params.bookingId },
        include: { guest: true, room: true, bookedBy: true }
    });

    if (!booking) {
        notFound();
    }
    
    const nights = Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg print:shadow-none">
                <header className="flex justify-between items-start border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold">Guest Folio / Registration Card</h1>
                        <p className="text-gray-500">Hotel Reservation System</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold">Booking ID: <span className="font-mono">{booking.id}</span></p>
                        <p className="text-sm text-gray-500">Printed on: {new Date().toLocaleString()}</p>
                    </div>
                </header>

                <main className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <section>
                        <h2 className="text-lg font-semibold border-b pb-2 mb-2">Guest Information</h2>
                        <dl>
                            <DetailRow label="Full Name" value={`${booking.guest.title || ''} ${booking.guest.firstName} ${booking.guest.lastName}`} />
                            <DetailRow label="Email" value={booking.guest.email} />
                            <DetailRow label="Phone" value={booking.guest.phone} />
                            <DetailRow label="Nationality" value={booking.guest.nationality} />
                        </dl>
                    </section>
                    
                    <section>
                        <h2 className="text-lg font-semibold border-b pb-2 mb-2">Reservation Details</h2>
                        <dl>
                            <DetailRow label="Check-in" value={`${new Date(booking.checkInDate).toLocaleDateString()} ${new Date(booking.checkInDate).toLocaleTimeString()}`} />
                            <DetailRow label="Check-out" value={`${new Date(booking.checkOutDate).toLocaleDateString()} ${new Date(booking.checkOutDate).toLocaleTimeString()}`} />
                            <DetailRow label="Nights" value={nights} />
                            <DetailRow label="Room No." value={booking.room?.roomNumber || 'Not Assigned'} />
                            <DetailRow label="Room Type" value={booking.room?.type} />
                            <DetailRow label="Adults / Kids" value={`${booking.adults} / ${booking.kids}`} />
                        </dl>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold border-b pb-2 mb-2">Booking & Rate</h2>
                        <dl>
                            <DetailRow label="Rate Code" value={booking.rateCode} />
                            <DetailRow label="Reservation Type" value={booking.reservationType} />
                            <DetailRow label="Source / Agent" value={`${booking.source || ''} ${booking.agent ? `(${booking.agent})` : ''}`} />
                            <DetailRow label="Booking Ref." value={booking.bookingRef} />
                        </dl>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold border-b pb-2 mb-2">Financials</h2>
                        <dl>
                            <DetailRow label="Total Amount" value={`$${booking.totalAmount.toFixed(2)}`} />
                            <DetailRow label="Payment Status" value={booking.paymentStatus} />
                        </dl>
                    </section>
                </main>

                <div className="mt-12 border-t pt-8">
                    <h3 className="font-semibold">Guest Signature:</h3>
                    <div className="mt-8 border-b w-full"></div>
                </div>

                <footer className="mt-8 text-xs text-gray-500 text-center">
                    <p>Booked by: {booking.bookedBy.name} on {new Date(booking.createdAt).toLocaleDateString()}</p>
                    <p className="mt-4">Thank you for choosing our hotel. We wish you a pleasant stay.</p>
                </footer>
            </div>
            
            <div className="max-w-3xl mx-auto mt-4 text-center print:hidden">
                <PrintButton />
            </div>
        </div>
    );
}