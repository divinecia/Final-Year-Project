
'use server';

import { db } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { z } from 'zod';
import { signUpWithEmailAndPassword } from '@/lib/auth';

const AdminRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  employeeId: z.string().min(1, "Employee ID is required."),
  email: z.string().email("A valid official email is required."),
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
  department: z.string({ required_error: "Department is required." }),
  roleLevel: z.string({ required_error: "Role level is required." }),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type AdminRegistrationData = z.infer<typeof AdminRegistrationSchema>;

export async function registerAdmin(formData: AdminRegistrationData) {
  if (!formData.email) {
      return { success: false, error: "Email is required for registration." };
  }

  // 1. Create the user in Firebase Authentication
  // In a real scenario, you might want to invite admins instead of creating passwords directly.
  const authResult = await signUpWithEmailAndPassword(formData.email, formData.password, 'admin');
  if (!authResult.success || !authResult.uid) {
    // A common error is that the email already exists
    if (authResult.error?.includes('email-already-in-use')) {
        return { success: false, error: "An account with this email already exists."};
    }
    return { success: false, error: authResult.error || "Failed to create user account." };
  }
  
  const userId = authResult.uid;

  try {
    const adminData = {
        uid: userId,
        fullName: formData.fullName,
        employeeId: formData.employeeId,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        role: formData.roleLevel,
        dateJoined: Timestamp.now(),
        status: 'active' as const,
    };

    // 2. Create the admin document in a separate 'admins' collection
    const adminDocRef = doc(db, 'admins', userId);
    await setDoc(adminDocRef, adminData);

    console.log("Admin document written for user ID: ", userId);
    return { success: true, id: userId };
  } catch (error) {
    console.error("Error adding admin document: ", error);
    // If Firestore write fails, we should ideally delete the created auth user
    // to avoid leaving orphaned accounts. This is a more advanced topic.
    throw new Error("Failed to save admin profile to database.");
  }
}
