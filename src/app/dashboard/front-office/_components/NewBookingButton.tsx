// src/app/dashboard/front-office/_components/NewBookingButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Room } from "@prisma/client";
import { useState } from "react";
import toast from "react-hot-toast";
import { createBookingAction } from "../actions";

interface NewBookingButtonProps {
  availableRooms: Room[]; // Pass available rooms from the parent page
}

export function NewBookingButton({ availableRooms }: NewBookingButtonProps) {
  const [open, setOpen] = useState(false);

  const handleFormSubmit = async (formData: FormData) => {
    const result = await createBookingAction(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success!);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Booking / Check-in</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>
            Enter guest details and assign an available room. Creating a booking will automatically check the guest in.
          </DialogDescription>
        </DialogHeader>
        <form action={handleFormSubmit} className="space-y-4">
          <fieldset className="border p-4 rounded-md">
            <legend className="text-sm font-medium px-1">Guest Information</legend>
            <div className="space-y-2">
              <div>
                <Label htmlFor="guestName">Full Name</Label>
                <Input id="guestName" name="guestName" required />
              </div>
              <div>
                <Label htmlFor="guestEmail">Email</Label>
                <Input id="guestEmail" name="guestEmail" type="email" required />
                <p className="text-xs text-muted-foreground">An existing guest will be used if email matches.</p>
              </div>
              <div>
                <Label htmlFor="guestPhone">Phone (Optional)</Label>
                <Input id="guestPhone" name="guestPhone" />
              </div>
            </div>
          </fieldset>
          
          <fieldset className="border p-4 rounded-md">
            <legend className="text-sm font-medium px-1">Booking Details</legend>
            <div className="space-y-2">
                <div>
                  <Label htmlFor="roomId">Assign Room</Label>
                  <Select name="roomId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an available room" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map(room => (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.roomNumber} ({room.type}) - ${room.price}/night
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="checkInDate">Check-in Date</Label>
                      <Input id="checkInDate" name="checkInDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]}/>
                    </div>
                    <div>
                      <Label htmlFor="checkOutDate">Check-out Date</Label>
                      <Input id="checkOutDate" name="checkOutDate" type="date" required />
                    </div>
                </div>
                <div>
                  <Label htmlFor="totalAmount">Total Amount ($)</Label>
                  <Input id="totalAmount" name="totalAmount" type="number" step="0.01" required />
                </div>
            </div>
          </fieldset>

          <Button type="submit" className="w-full">Create Booking & Check-in</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}