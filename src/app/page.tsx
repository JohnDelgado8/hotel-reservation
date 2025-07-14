// src/app/page.tsx
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PrismaClient, RoomStatus } from "@prisma/client"; // Import RoomStatus


const prisma = new PrismaClient();

// This is the function we need to modify.
async function getPubliclyAvailableRooms() {
  const rooms = await prisma.room.findMany({
    //
    // THIS IS THE CRITICAL CHANGE
    //
    // We are now explicitly telling the database: "Only give me rooms
    // where the 'status' column is exactly 'AVAILABLE'".
    // Any other status (OCCUPIED, MAINTENANCE, DIRTY, etc.) will be excluded.
    //
    where: {
      status: RoomStatus.AVAILABLE,
    },
    orderBy: {
      roomNumber: 'asc'
    }
  });
  return rooms;
}

export default async function HomePage() {
  // Call the updated function
  const rooms = await getPubliclyAvailableRooms();

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Our Available Rooms</h1>
        {rooms.length === 0 ? (
          <Card className="text-center p-10">
            <CardContent>
              <p className="text-lg text-muted-foreground">
                Sorry, no rooms are available for booking at the moment. Please check back later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card key={room.id} className="flex flex-col">
                <CardHeader className="p-0">
                  <div className="relative h-52 w-full">
                    {/* <Image
                      src={room.imageUrl || "https://via.placeholder.com/400x300"}
                      alt={`Image of Room ${room.roomNumber}`}
                      fill // Use 'fill' instead of 'layout="fill"' in new Next.js versions
                      style={{ objectFit: 'cover' }} // Use style object for objectFit with fill
                      className="rounded-t-lg"
                    /> */}
                  </div>
                </CardHeader>
                <CardContent className="pt-6 flex-grow">
                  <CardTitle>Room {room.roomNumber}</CardTitle>
                  <CardDescription>{room.type}</CardDescription>
                  <p className="mt-2 text-sm text-muted-foreground">{room.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <span className="text-xl font-bold">${room.price.toFixed(2)} / night</span>
                  {/* The status will always be AVAILABLE here, but it's good for confirmation */}
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    {room.status}
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}