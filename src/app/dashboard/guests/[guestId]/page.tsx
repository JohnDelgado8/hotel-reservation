import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { GuestProfileClient } from "./_components/GuestProfileClient";
import { Prisma } from "@prisma/client";

// We define and export this type so our client component can import it for type safety.
// This uses Prisma's advanced GetPayload utility to create a perfect type from our query.
export type GuestWithBookings = Prisma.GuestGetPayload<{
    include: {
        bookings: {
            include: {
                room: true;
                bookedBy: true; // Also include who booked it for the folio
            };
        };
    };
}>;

// The page component is now very simple. Its props type is clear and correct for Next.js.
export default async function GuestProfilePage({ params }: { params: { guestId: string } }) {
    
    // 1. Fetch all the data in the Server Component.
    const guest = await prisma.guest.findUnique({
        where: { id: params.guestId },
        include: {
            bookings: {
                include: {
                    room: true,
                    bookedBy: true,
                },
                orderBy: {
                    checkInDate: 'desc',
                }
            }
        }
    });

    // Handle case where guest is not found.
    if (!guest) {
        notFound();
    }
    
    // 2. Pass the fetched data as a prop to the dedicated rendering component.
    return <GuestProfileClient guest={guest} />;
}