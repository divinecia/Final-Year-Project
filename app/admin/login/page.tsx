
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
import { signIn } from "@/lib/auth";

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

    const result = await signIn(values.email, values.password, 'admin');

    if (result.success) {
      router.push("/admin/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: result.error || "Please check your credentials and try again.",
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
