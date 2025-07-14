// src/app/dashboard/housekeeping/_components/RoomStatusCard.tsx
"use client";
// import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Room, RoomStatus } from "@prisma/client";
import { updateRoomStatusAction } from "../actions";
import toast from "react-hot-toast";

interface RoomStatusCardProps {
    room: Room;
}

export function RoomStatusCard({ room }: RoomStatusCardProps) {

    async function handleStatusChange(status: RoomStatus) {
        const result = await updateRoomStatusAction(room.id, status);
        if(result.error) {
            toast.error(result.error);
        } else {
            toast.success(`Room ${room.roomNumber} status updated!`);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Room {room.roomNumber}</CardTitle>
                <CardDescription>Type: {room.type}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Current Status: <span className="font-bold">{room.status}</span></p>
            </CardContent>
            <CardFooter>
                <Select onValueChange={(value) => handleStatusChange(value as RoomStatus)} defaultValue={room.status}>
                    <SelectTrigger>
                        <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                         {Object.values(RoomStatus).map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                         ))}
                    </SelectContent>
                </Select>
            </CardFooter>
        </Card>
    );
}