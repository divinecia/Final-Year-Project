
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
import { useToast } from "@/hooks/use-toast";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { app } from "@/lib/firebase";
import ForgotPasswordForm from "@/components/forgot-password-form";

const formSchema = z.object({
  contactInfo: z.string().min(1, "Please enter your phone number."),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSending, setIsSending] = React.useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactInfo: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSending(true);
    toast({
        title: "Sending Reset Code...",
        description: `Attempting to send a reset code to ${values.contactInfo}.`
    });

    try {
        const auth = getAuth(app);
        const formattedPhone = `+25${values.contactInfo.replace(/\s/g, '')}`;
        
        // This must be a global window object for Firebase to find it.
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
            });
        }
        
        const appVerifier = (window as any).recaptchaVerifier;
        const verificationId = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      
        toast({
            title: "Code Sent!",
            description: `A password reset code has been sent to ${values.contactInfo}.`
        });

        router.push(`/forgot-password/verify?contact=${encodeURIComponent(values.contactInfo)}&verificationId=${verificationId}`);

    } catch (error: any) {
        console.error("Firebase phone auth error:", error);
        toast({
            variant: "destructive",
            title: "Failed to Send Code",
            description: error.message || "An unknown error occurred. Make sure you have entered a valid phone number.",
        });
        setIsSending(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gray-50">
      <div id="recaptcha-container"></div>
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Reset Your Password</CardTitle>
            <CardDescription>Enter your registered phone number or email to receive a reset code or link.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Phone reset form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="contactInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type='tel'
                          placeholder='07...'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSending}>
                  {isSending ? "Sending..." : "Send Reset Code"}
                </Button>
              </form>
            </Form>
            <div className="my-4 text-center text-xs text-gray-400">OR</div>
            {/* Email reset form */}
            <ForgotPasswordForm />
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm">
          <Button variant="link" asChild>
            <Link href="/worker/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
