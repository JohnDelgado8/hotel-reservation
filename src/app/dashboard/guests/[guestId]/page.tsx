import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { GuestProfileClient } from "./_components/GuestProfileClient";
import { Prisma } from "@prisma/client";

// We define and export this type so our client component can import it for type safety.
export type GuestWithBookings = Prisma.GuestGetPayload<{
    include: {
        bookings: {
            include: {
                room: true;
                bookedBy: true;
            };
        };
    };
}>;

// ==================================================================
// THE DEFINITIVE FIX
// This is the canonical way to type a dynamic route page in Next.js
// that satisfies both TypeScript and ESLint.
// ==================================================================
interface PageProps {
    params: {
        guestId: string;
    };
}

// The component receives props of type PageProps.
export default async function GuestProfilePage({ params }: PageProps) {
    
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

    if (!guest) {
        notFound();
    }
    
    return <GuestProfileClient guest={guest} />;
}