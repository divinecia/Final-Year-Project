import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

// System Configuration Types
export interface PayFrequency {
  id: string;
  label: string;
  description: string;
  multiplier: number; // For calculating from hourly rate
}

export interface JobStatus {
  id: string;
  label: string;
  description: string;
  color: string;
}

export interface UserRole {
  id: string;
  label: string;
  description: string;
  permissions: string[];
}

export interface PaymentStatus {
  id: string;
  label: string;
  description: string;
  color: string;
}

export interface SystemConfig {
  payFrequencies: { [key: string]: PayFrequency };
  jobStatuses: { [key: string]: JobStatus };
  userRoles: { [key: string]: UserRole };
  paymentStatuses: { [key: string]: PaymentStatus };
  lastUpdated: string;
}

// Cache for system configuration
let systemConfigCache: SystemConfig | null = null;
let configCacheTime = 0;
const CONFIG_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Get system configuration from Firestore
 */
export async function getSystemConfig(): Promise<SystemConfig> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (systemConfigCache && (now - configCacheTime) < CONFIG_CACHE_DURATION) {
    return systemConfigCache;
  }

  try {
    const configDoc = await getDoc(doc(db, 'system', 'config'));
    
    if (configDoc.exists()) {
      const data = configDoc.data() as SystemConfig;
      systemConfigCache = data;
      configCacheTime = now;
      return data;
    } else {
      throw new Error('System config document not found');
    }
  } catch (error) {
    console.error('Error fetching system config:', error);
    
    // Return fallback data if Firestore fails
    return getFallbackSystemConfig();
  }
}

/**
 * Get pay frequency options for dropdowns
 */
export async function getPayFrequencyOptions(): Promise<Array<{ id: string; label: string; description: string }>> {
  const config = await getSystemConfig();
  
  return Object.values(config.payFrequencies).map(freq => ({
    id: freq.id,
    label: freq.label,
    description: freq.description
  }));
}

/**
 * Get job status options for dropdowns
 */
export async function getJobStatusOptions(): Promise<Array<{ id: string; label: string; color: string }>> {
  const config = await getSystemConfig();
  
  return Object.values(config.jobStatuses).map(status => ({
    id: status.id,
    label: status.label,
    color: status.color
  }));
}

/**
 * Get user role options for dropdowns
 */
export async function getUserRoleOptions(): Promise<Array<{ id: string; label: string; description: string }>> {
  const config = await getSystemConfig();
  
  return Object.values(config.userRoles).map(role => ({
    id: role.id,
    label: role.label,
    description: role.description
  }));
}

/**
 * Get payment status options for dropdowns
 */
export async function getPaymentStatusOptions(): Promise<Array<{ id: string; label: string; color: string }>> {
  const config = await getSystemConfig();
  
  return Object.values(config.paymentStatuses).map(status => ({
    id: status.id,
    label: status.label,
    color: status.color
  }));
}

/**
 * Calculate salary based on pay frequency
 */
export async function calculateSalary(baseHourlyRate: number, payFrequencyId: string): Promise<number> {
  const config = await getSystemConfig();
  const frequency = config.payFrequencies[payFrequencyId];
  
  if (!frequency) {
    return baseHourlyRate;
  }
  
  return baseHourlyRate * frequency.multiplier;
}

/**
 * Fallback system configuration (offline/error fallback)
 */
function getFallbackSystemConfig(): SystemConfig {
  return {
    payFrequencies: {
      per_hour: {
        id: "per_hour",
        label: "Per Hour",
        description: "Hourly rate payment",
        multiplier: 1
      },
      per_day: {
        id: "per_day",
        label: "Per Day",
        description: "Daily rate (8 hours)",
        multiplier: 8
      },
      per_week: {
        id: "per_week",
        label: "Per Week",
        description: "Weekly rate (40 hours)",
        multiplier: 40
      },
      per_month: {
        id: "per_month",
        label: "Per Month",
        description: "Monthly salary (160 hours)",
        multiplier: 160
      }
    },
    jobStatuses: {
      open: {
        id: "open",
        label: "Open",
        description: "Job is available for applications",
        color: "blue"
      },
      assigned: {
        id: "assigned",
        label: "Assigned",
        description: "Worker has been assigned to the job",
        color: "yellow"
      },
      in_progress: {
        id: "in_progress",
        label: "In Progress",
        description: "Job is currently being worked on",
        color: "orange"
      },
      completed: {
        id: "completed",
        label: "Completed",
        description: "Job has been completed successfully",
        color: "green"
      },
      cancelled: {
        id: "cancelled",
        label: "Cancelled",
        description: "Job was cancelled",
        color: "red"
      }
    },
    userRoles: {
      worker: {
        id: "worker",
        label: "Worker",
        description: "Service provider",
        permissions: ["apply_jobs", "view_earnings", "update_profile"]
      },
      household: {
        id: "household",
        label: "Household",
        description: "Service requester",
        permissions: ["post_jobs", "hire_workers", "make_payments"]
      },
      admin: {
        id: "admin",
        label: "Administrator",
        description: "Platform administrator",
        permissions: ["manage_users", "manage_jobs", "view_analytics", "manage_payments"]
      }
    },
    paymentStatuses: {
      pending: {
        id: "pending",
        label: "Pending",
        description: "Payment is being processed",
        color: "yellow"
      },
      completed: {
        id: "completed",
        label: "Completed",
        description: "Payment was successful",
        color: "green"
      },
      failed: {
        id: "failed",
        label: "Failed",
        description: "Payment failed",
        color: "red"
      },
      cancelled: {
        id: "cancelled",
        label: "Cancelled",
        description: "Payment was cancelled",
        color: "gray"
      },
      refunded: {
        id: "refunded",
        label: "Refunded",
        description: "Payment was refunded",
        color: "purple"
      }
    },
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Clear configuration cache (useful for testing or forced refresh)
 */
export function clearSystemConfigCache(): void {
  systemConfigCache = null;
  configCacheTime = 0;
}
