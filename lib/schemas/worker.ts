import * as z from 'zod';

export const WorkerSettingsSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address.").optional().or(z.literal("")),
  bio: z.string().optional(),
  services: z.array(z.string()).min(1, "Select at least one service."),
  languages: z.array(z.string()).min(1, "Select at least one language."),
  oneTimeJobs: z.boolean().default(false),
  recurringJobs: z.boolean().default(false),
  hourlyRate: z.array(z.number()).default([1500]),
});

export type WorkerSettingsData = z.infer<typeof WorkerSettingsSchema>;

export type WorkerProfile = WorkerSettingsData & {
  id: string;
  phone: string;
};
