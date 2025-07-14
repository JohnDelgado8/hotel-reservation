// src/app/dashboard/admin/users/page.tsx
import { PrismaClient } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// IMPORT THE NEW BUTTON COMPONENT
import { CreateUserButton } from "./_components/CreateUserButton";

const prisma = new PrismaClient();

async function getAllUsers() {
    return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
}

export default async function AdminUsersPage() {
    const users = await getAllUsers();
    return (
        <div>
            {/* THIS IS THE NEW HEADER SECTION */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Users</h1>
                {/* ADD THE BUTTON HERE */}
                <CreateUserButton />
            </div>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}