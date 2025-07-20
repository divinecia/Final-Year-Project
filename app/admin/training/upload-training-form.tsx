
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload } from "lucide-react"
import { trainingSchema, createTraining } from "./actions"

const formSchemaWithoutFiles = trainingSchema.omit({ 
  id: true, 
  status: true,
});

type UploadTrainingFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFormSubmit: () => void;
}

export function UploadTrainingForm({ open, onOpenChange, onFormSubmit }: UploadTrainingFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchemaWithoutFiles>>({
    resolver: zodResolver(formSchemaWithoutFiles),
    defaultValues: {
      title: "",
      category: undefined,
      duration: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchemaWithoutFiles>) {
    toast({
      title: "Uploading Training...",
      description: "The new training program is being added to the system.",
    });

    const result = await createTraining({
      ...values,
      status: 'active' as const
    });
    
    if (result.success) {
        toast({
            title: "Success!",
            description: `Training "${values.title}" has been uploaded.`,
        });
        onFormSubmit();
        onOpenChange(false);
        form.reset();
    } else {
      toast({
          variant: "destructive",
          title: "Error",
          description: result.error || `Could not upload training.`,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload New Training Program</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new training course for workers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl><Input placeholder="e.g., Advanced Childcare Techniques" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="cleaning">House Cleaning</SelectItem>
                        <SelectItem value="cooking">Cooking & Nutrition</SelectItem>
                        <SelectItem value="childcare">Childcare</SelectItem>
                        <SelectItem value="elderly_care">Elderly Care</SelectItem>
                        <SelectItem value="gardening">Gardening</SelectItem>
                        <SelectItem value="professionalism">Professionalism & Ethics</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl><Input placeholder="e.g., 2 Weeks, 8 Hours" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Description</FormLabel>
                  <FormControl><Textarea placeholder="Provide a detailed overview of the course content, objectives, and target audience." rows={5} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Course Materials (PDF, Video, etc.)</FormLabel>
              <FormControl>
                  <div className="relative">
                      <Input
                          type="file"
                          multiple
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled // Disabled until backend file storage is implemented
                      />
                      <div className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-md bg-muted/50">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="ml-2 text-sm text-muted-foreground">File upload not yet implemented</span>
                      </div>
                  </div>
              </FormControl>
              <FormMessage />
            </FormItem>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Uploading...' : 'Upload Training'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
