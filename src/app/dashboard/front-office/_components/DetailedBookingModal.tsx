"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Room } from "@prisma/client";
import { useState } from "react";
import toast from "react-hot-toast";
import { createDetailedReservationAction } from "@/app/dashboard/admin/new-reservation/actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react"; // Import the spinner icon

interface DetailedBookingModalProps {
  availableRooms: Room[];
}

export function DetailedBookingModal({ availableRooms }: DetailedBookingModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State to manage loading
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const router = useRouter();

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true); // --- Set loading to true before the action ---
    
    const formData = new FormData(event.currentTarget);
    const result = await createDetailedReservationAction(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success!);
      setOpen(false);
      (event.target as HTMLFormElement).reset();
      setCheckInDate(new Date().toISOString().split('T')[0]);
      router.refresh();
    }
    setIsLoading(false); // --- Set loading to false after the action completes ---
  };

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckInDate(e.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Booking / Check-in</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Reservation</DialogTitle>
          <DialogDescription>
            Create a detailed reservation. Assigning a room will check the guest in immediately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-6 pt-4">
          <fieldset className="grid grid-cols-1 gap-6 rounded-lg border p-4">
            <legend className="-ml-1 px-1 text-sm font-medium">Guest Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Title</Label><Input name="title" placeholder="e.g., Mr, Mrs" /></div>
              <div className="space-y-2"><Label>First Name *</Label><Input name="firstName" required /></div>
              <div className="space-y-2"><Label>Last Name *</Label><Input name="lastName" required /></div>
              <div className="space-y-2"><Label>Email *</Label><Input name="email" type="email" required /></div>
              <div className="space-y-2"><Label>Phone</Label><Input name="phone" type="tel" /></div>
              <div className="space-y-2"><Label>Nationality</Label><Input name="nationality" /></div>
            </div>
          </fieldset>

          <fieldset className="grid grid-cols-1 gap-6 rounded-lg border p-4">
            <legend className="-ml-1 px-1 text-sm font-medium">Room & Rate Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInDate">Arrival Date *</Label>
                <Input id="checkInDate" name="checkInDate" type="date" required value={checkInDate} onChange={handleCheckInChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOutDate">Departure Date *</Label>
                <Input id="checkOutDate" name="checkOutDate" type="date" required min={checkInDate} />
              </div>
              <div className="space-y-2"><Label>Adults *</Label><Input name="adults" type="number" required min="1" defaultValue="1" /></div>
              <div className="space-y-2"><Label>Kids</Label><Input name="kids" type="number" defaultValue="0" /></div>
              <div className="space-y-2 md:col-span-2"><Label>Assign Room (Optional)</Label>
                <Select name="roomId">
                  <SelectTrigger><SelectValue placeholder="Assign later or select now" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Assign Later</SelectItem>
                    {availableRooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>Room {room.roomNumber} ({room.type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Rate Code</Label><Input name="rateCode" placeholder="e.g., RACK, CORP" /></div>
              <div className="space-y-2"><Label>Total Rate *</Label><Input name="rate" type="number" step="0.01" required placeholder="Total booking rate" /></div>
            </div>
          </fieldset>
          
          <div className="flex justify-end pt-4">
            {/* The updated button with loading state */}
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Creating...' : 'Create Reservation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}