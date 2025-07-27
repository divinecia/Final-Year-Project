/**
 * Script to seed Firestore with services and locations data.
 * Run this once to populate your Firestore database.
 */

import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

// --- Type Definitions ---
type ServiceCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  category: string;
};

type ServicesData = {
  categories: Record<string, ServiceCategory>;
  lastUpdated: string;
};

type Sector = { name: string; code: string };
type District = {
  name: string;
  province: string;
  code: string;
  sectors: Record<string, Sector>;
};
type LocationsData = {
  districts: Record<string, District>;
  lastUpdated: string;
};

type SystemConfigData = {
  payFrequencies: Record<string, any>;
  jobStatuses: Record<string, any>;
  userRoles: Record<string, any>;
  paymentStatuses: Record<string, any>;
  lastUpdated: string;
};

// --- Data ---
const now = new Date().toISOString();

const servicesData: ServicesData = {
  categories: {
    // ... (same as before)
    // [Omitted for brevity, copy your categories here]
    house_cleaning: {
      id: "house_cleaning",
      name: "House Cleaning",
      description: "General house cleaning and maintenance",
      icon: "🧹",
      basePrice: 3000,
      category: "cleaning"
    },
    // ... (rest of categories)
    driver_services: {
      id: "driver_services",
      name: "Personal Driver",
      description: "Personal transportation services",
      icon: "🚗",
      basePrice: 4000,
      category: "specialized"
    }
  },
  lastUpdated: now
};

const locationsData: LocationsData = {
  districts: {
    // ... (same as before)
    gasabo: {
      name: "Gasabo",
      province: "Kigali City",
      code: "11",
      sectors: {
        bumbogo: { name: "Bumbogo", code: "1101" },
        // ... (rest of sectors)
        rutunga: { name: "Rutunga", code: "1115" }
      }
    },
    // ... (rest of districts)
    rwamagana: {
      name: "Rwamagana",
      province: "Eastern Province",
      code: "51",
      sectors: {
        fumbwe: { name: "Fumbwe", code: "5101" },
        // ... (rest of sectors)
        rukira: { name: "Rukira", code: "5114" }
      }
    }
  },
  lastUpdated: now
};

const systemConfigData: SystemConfigData = {
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
  lastUpdated: now
};

// --- Seeding Function ---
export async function seedFirestore() {
  try {
    console.log('🌱 Starting Firestore seeding...');

    await setDoc(doc(db, 'services', 'services'), servicesData);
    console.log('✅ Services data seeded successfully');

    await setDoc(doc(db, 'locations', 'locations'), locationsData);
    console.log('✅ Locations data seeded successfully');

    await setDoc(doc(db, 'system', 'config'), systemConfigData);
    console.log('✅ System configuration data seeded successfully');

    console.log('🎉 Firestore seeding completed!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error instanceof Error ? error.message : error);
    return { success: false, error };
  }
}

// --- Run if executed directly ---
const isMain = require.main === module;
if (isMain) {
  (async () => {
    const result = await seedFirestore();
    if (result.success) {
      console.log('Database seeded successfully');
      process.exit(0);
    } else {
      console.error('Seeding failed:', result.error);
      process.exit(1);
    }
  })();
}
