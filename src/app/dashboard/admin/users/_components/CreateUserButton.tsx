// src/app/dashboard/admin/users/_components/CreateUserButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@prisma/client";
import { useState } from "react";
import toast from "react-hot-toast";
import { createUserAction } from "../actions";

export function CreateUserButton() {
  // 'useState' controls whether the dialog is open or closed.
  const [open, setOpen] = useState(false);

  // This function runs when the admin submits the form.
  const handleFormSubmit = async (formData: FormData) => {
    // It calls our secure server action.
    const result = await createUserAction(formData);

    // Give the admin instant feedback on the result.
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success!);
      setOpen(false); // Close the dialog on success.
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New User</DialogTitle>
        </DialogHeader>
        <form action={handleFormSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name" className="text-right">Full Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="password" className="text-right">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <div>
            <Label htmlFor="role" className="text-right">Role</Label>
            <Select name="role" required defaultValue={UserRole.STUDENT}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {/* We can create both STUDENT and ADMIN roles from here */}
                {Object.values(UserRole).map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">Create User</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}