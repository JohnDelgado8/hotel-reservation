"use client";

import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { checkOutAction, updatePaymentStatusAction } from "../actions";
import { Booking, PaymentStatus } from "@prisma/client";
import { Printer } from "lucide-react";
import Link from "next/link";

interface BookingActionsProps {
  booking: Booking;
}

export function BookingActions({ booking }: BookingActionsProps) {
  const handleCheckOut = async () => {
    if (!confirm("Are you sure you want to check out this guest? This will mark the room as DIRTY.")) return;
    const result = await checkOutAction(booking.id, booking.roomId!); // Add non-null assertion if check-out requires a room
    if (result.error) toast.error(result.error);
    else toast.success(result.success!);
  };

  const handlePayment = async () => {
    const result = await updatePaymentStatusAction(booking.id);
    if (result.error) toast.error(result.error);
    else toast.success(result.success!);
  };

  return (
    <div className="flex justify-end items-center space-x-2">
      <Link href={`/dashboard/print-folio/${booking.id}`} target="_blank">
        <Button variant="ghost" size="sm">
          <Printer className="h-4 w-4" />
        </Button>
      </Link>
      {booking.paymentStatus !== PaymentStatus.PAID && (
        <Button variant="outline" size="sm" onClick={handlePayment}>
          Mark Paid
        </Button>
      )}
      {booking.roomId && ( // Only show check-out if a room is assigned
        <Button variant="destructive" size="sm" onClick={handleCheckOut}>
          Check-out
        </Button>
      )}
    </div>
  );
}