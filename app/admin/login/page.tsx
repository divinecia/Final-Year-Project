
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email("Official email is required."),
  password: z.string().min(1, "Password is required."),
  twoFactorCode: z.string().optional(),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        email: "",
        password: "",
        twoFactorCode: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
        title: "Logging In...",
        description: "Authenticating administrator.",
    });

    try {
      // Sign in with Firebase Auth (client-side)
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const userId = userCredential.user.uid;

      // Verify admin status in Firestore
      const adminDoc = await getDoc(doc(db, 'admins', userId));
      
      if (!adminDoc.exists()) {
        // Sign out if not an admin
        await auth.signOut();
        toast({
          title: "Access Denied",
          description: "You do not have administrator privileges.",
          variant: "destructive",
        });
        return;
      }

      const adminData = adminDoc.data();
      
      if (!adminData.isActive) {
        await auth.signOut();
        toast({
          title: "Account Suspended",
          description: "Your admin account has been suspended. Contact system administrator.",
          variant: "destructive",
        });
        return;
      }

      // Update last login timestamp
      await updateDoc(doc(db, 'admins', userId), {
        lastLogin: new Date(),
        updatedAt: new Date()
      });

      toast({
        title: "Login Successful",
        description: `Welcome back, ${adminData.fullName || 'Administrator'}!`,
      });

      // Redirect to admin dashboard
      router.push('/admin/dashboard');

    } catch (error: any) {
      console.error('Admin login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-muted/40">
        <div className="w-full max-w-md space-y-4">
            <Card className="w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4"><Logo className="h-16 w-16"/></div>
                    <CardTitle>Admin Portal Access</CardTitle>
                    <CardDescription>Enter your credentials to continue</CardDescription>
                </CardHeader>
                <CardContent>
                {/* Default Admin Credentials Alert */}
                <Alert className="mb-6 border-blue-200 bg-blue-50">
                  <AlertDescription className="text-sm">
                    <strong>Default Admin Account:</strong><br />
                    Name: Iradukunda Divine<br />
                    Email: ciairadukunda@gmail.com<br />
                    Phone: 0780452019<br />
                    Password: IRAcia12@<br />
                    Location: Lausanne, Switzerland
                  </AlertDescription>
                </Alert>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Official Email / Employee ID</FormLabel>
                            <FormControl><Input placeholder="Your official email" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="twoFactorCode"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Two-Factor Code (if enabled)</FormLabel>
                            <FormControl><Input placeholder="6-digit code" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <div className="text-right">
                         <Button variant="link" asChild className="p-0 h-auto">
                             <Link href="/forgot-password">Forgot Password?</Link>
                         </Button>
                    </div>

                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Logging In..." : "Secure Login"}
                    </Button>
                    </form>
                </Form>
                </CardContent>
            </Card>
             <div className="mt-4 text-center text-sm text-muted-foreground">
                For assistance, please{" "}
                <Link href="/support" className="font-semibold text-primary hover:underline">
                Contact IT Support
                </Link>
            </div>
        </div>
    </main>
  );
}
