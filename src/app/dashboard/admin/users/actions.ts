// src/app/dashboard/admin/users/actions.ts
"use server";

import { auth } from "@/auth";
import { PrismaClient, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs"; // Use bcryptjs as it's safe for all server environments

const prisma = new PrismaClient();

export async function createUserAction(formData: FormData) {
  // Security Check 1: Ensure the person making the request is logged in and is an ADMIN.
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { error: "Unauthorized: Only admins can create users." };
  }

  // Get all the data from the form
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as UserRole;

  // Validation: Make sure all required fields are present.
  if (!name || !email || !password || !role) {
    return { error: "All fields are required." };
  }

  try {
    // Check if a user with that email already exists to prevent duplicates.
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "A user with this email already exists." };
    }

    // Security Check 2: NEVER store plain text passwords. Always hash them.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user in the database.
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Automatically refresh the user list on the page for a seamless experience.
    revalidatePath("/dashboard/admin/users");
    return { success: "User created successfully!" };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Database error: Failed to create user." };
  }
}