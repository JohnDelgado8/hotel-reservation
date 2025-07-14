"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoomType } from "@prisma/client";
import { useState } from "react";
import toast from "react-hot-toast";

// **THE FIX IS HERE:**
// We are now importing the correctly named function from the actions file.
import { createStudentRoomAction } from "../actions";

export function AddRoomButton() {
    const [open, setOpen] = useState(false);

    async function handleAddRoom(formData: FormData) {
        // **AND THE FIX IS HERE:**
        // We are now calling the correctly named function.
        const result = await createStudentRoomAction(formData);

        if(result.error) {
            toast.error(result.error);
        } else {
            toast.success("Room added successfully!");
            setOpen(false); // Close dialog on success
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add New Room</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a New Room</DialogTitle>
                </DialogHeader>
                <form action={handleAddRoom} className="space-y-4">
                    <div>
                        <Label htmlFor="roomNumber">Room Number</Label>
                        <Input id="roomNumber" name="roomNumber" required />
                    </div>
                    <div>
                        <Label htmlFor="type">Room Type</Label>
                        <Select name="type" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(RoomType).map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="price">Price per night</Label>
                        <Input id="price" name="price" type="number" step="0.01" required />
                    </div>
                     <div>
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" name="description" required />
                    </div>
                    <div>
                        <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                        <Input id="imageUrl" name="imageUrl" placeholder="https://example.com/image.png" />
                    </div>
                    <Button type="submit" className="w-full">Add Room</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}