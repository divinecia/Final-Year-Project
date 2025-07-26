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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFormContext } from "../form-provider";

const Step1Schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
  email: z.string().email("Please enter a valid email address."),
  district: z.string({ required_error: "Please select a district." }),
  sector: z.string({ required_error: "Please select a sector." }),
  address: z.string().min(5, "Please enter a detailed address."),
  propertyType: z.enum(["house", "apartment", "villa"], { required_error: "Please select a property type."}),
  numRooms: z.coerce.number().min(1, "Must have at least one room."),
  hasGarden: z.enum(["yes", "no"]),
});

export default function HouseholdRegisterStep1Page() {
  const router = useRouter();
  const { formData, setFormData } = useFormContext();

  const form = useForm<z.infer<typeof Step1Schema>>({
    resolver: zodResolver(Step1Schema),
    defaultValues: {
      ...formData,
      fullName: formData.fullName || "",
      phone: formData.phone || "",
      email: formData.email || "",
      district: formData.district || undefined,
      sector: formData.sector || undefined,
      address: formData.address || "",
      propertyType: formData.propertyType || "house",
      numRooms: formData.numRooms || 1,
      hasGarden: formData.hasGarden || "no",
    },
  });

  function onSubmit(values: z.infer<typeof Step1Schema>) {
    setFormData((prev: any) => ({ ...prev, ...values }));
    router.push("/household/register/step-2");
  }

  return (
    <>
      <Progress value={33} className="w-full mb-4" />
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Find Trusted Help for Your Home</CardTitle>
          <CardDescription>Step 1: Basic Information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Jane Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input placeholder="e.g. 078xxxxxxx" type="tel" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl><Input placeholder="e.g. jane.doe@example.com" type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                />

                <Separator />
                <h3 className="font-semibold text-md">Address Information</h3>
                
                <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                  <FormLabel>District</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select your district" /></SelectTrigger></FormControl>
                    <SelectContent>
                    <SelectItem value="gasabo">Gasabo</SelectItem>
                    <SelectItem value="kicukiro">Kicukiro</SelectItem>
                    <SelectItem value="nyarugenge">Nyarugenge</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                  <FormLabel>Sector (matched to district)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select your sector" /></SelectTrigger></FormControl>
                    <SelectContent>
                    {form.watch("district") === "gasabo" && (
                      <>
                      <SelectItem value="kimihurura">Kimihurura</SelectItem>
                      <SelectItem value="kacyiru">Kacyiru</SelectItem>
                      <SelectItem value="remera">Remera</SelectItem>
                      </>
                    )}
                    {form.watch("district") === "kicukiro" && (
                      <>
                      <SelectItem value="kagarama">Kagarama</SelectItem>
                      <SelectItem value="kanombe">Kanombe</SelectItem>
                      <SelectItem value="gatenga">Gatenga</SelectItem>
                      </>
                    )}
                    {form.watch("district") === "nyarugenge" && (
                      <>
                      <SelectItem value="nyamirambo">Nyamirambo</SelectItem>
                      <SelectItem value="nyakabanda">Nyakabanda</SelectItem>
                      <SelectItem value="gitega">Gitega</SelectItem>
                      </>
                    )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Address</FormLabel>
                    <FormControl><Textarea placeholder="Street, house number, or landmark" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />
              <h3 className="font-semibold text-md">Property Details</h3>

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numRooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Rooms</FormLabel>
                    <FormControl><Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasGarden"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Has Garden?</FormLabel>
                     <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                <span/>
                <Button type="submit">Next</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/household/login" className="font-semibold text-primary hover:underline">
          Login here
        </Link>
      </div>
    </>
  );
}
