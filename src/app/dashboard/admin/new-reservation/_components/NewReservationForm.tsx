"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Room } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { createDetailedReservationAction } from "../actions";
import { Loader2 } from "lucide-react"; // Import the spinner icon

interface NewReservationFormProps {
  availableRooms: Room[];
}

export function NewReservationForm({ availableRooms }: NewReservationFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false); // State to manage loading
    const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true); // --- Set loading to true before the action ---

        const formData = new FormData(event.currentTarget);
        const result = await createDetailedReservationAction(formData);

        if(result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success!);
            (event.target as HTMLFormElement).reset();
            setCheckInDate(new Date().toISOString().split('T')[0]);
            router.push('/dashboard/front-office');
        }
        
        setIsLoading(false); // --- Set loading to false after the action completes ---
    };
    
    const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCheckInDate(e.target.value);
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">New Reservation</h1>
            <form onSubmit={handleFormSubmit} className="space-y-8">
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
                            <Label htmlFor="checkInDateAdmin">Arrival Date *</Label>
                            <Input id="checkInDateAdmin" name="checkInDate" type="date" required value={checkInDate} onChange={handleCheckInChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="checkOutDateAdmin">Departure Date *</Label>
                            <Input id="checkOutDateAdmin" name="checkOutDate" type="date" required min={checkInDate} />
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

                <fieldset className="grid grid-cols-1 gap-6 rounded-lg border p-4">
                    <legend className="-ml-1 px-1 text-sm font-medium">Booking Source</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Source</Label><Input name="source" placeholder="e.g., Walk-in, Website" /></div>
                        <div className="space-y-2"><Label>Agent</Label><Input name="agent" placeholder="e.g., Agoda, Expedia" /></div>
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
        </div>
    );
}