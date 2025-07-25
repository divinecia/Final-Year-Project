/**
 * Script to seed Firestore with services and locations data
 * Run this once to populate your Firestore database
 */

import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

// Services data structure
const servicesData = {
  categories: {
    // Core Household Services
    house_cleaning: {
      id: "house_cleaning",
      name: "House Cleaning",
      description: "General house cleaning and maintenance",
      icon: "🧹",
      basePrice: 3000, // RWF per hour
      category: "cleaning"
    },
    deep_cleaning: {
      id: "deep_cleaning",
      name: "Deep Cleaning",
      description: "Thorough deep cleaning service",
      icon: "🧽",
      basePrice: 4000,
      category: "cleaning"
    },
    carpet_cleaning: {
      id: "carpet_cleaning",
      name: "Carpet & Upholstery Cleaning",
      description: "Professional carpet and furniture cleaning",
      icon: "🛋️",
      basePrice: 5000,
      category: "cleaning"
    },
    window_cleaning: {
      id: "window_cleaning",
      name: "Window Cleaning",
      description: "Interior and exterior window cleaning",
      icon: "🪟",
      basePrice: 2500,
      category: "cleaning"
    },

    // Cooking & Kitchen Services
    cooking: {
      id: "cooking",
      name: "Cooking Services",
      description: "Meal preparation and cooking",
      icon: "👨‍🍳",
      basePrice: 4000,
      category: "culinary"
    },
    meal_prep: {
      id: "meal_prep",
      name: "Meal Preparation",
      description: "Weekly meal prep and planning",
      icon: "🥘",
      basePrice: 3500,
      category: "culinary"
    },
    catering: {
      id: "catering",
      name: "Event Catering",
      description: "Catering for events and parties",
      icon: "🍽️",
      basePrice: 8000,
      category: "culinary"
    },
    baking: {
      id: "baking",
      name: "Baking Services",
      description: "Professional baking and pastries",
      icon: "🧁",
      basePrice: 5000,
      category: "culinary"
    },

    // Care Services
    childcare: {
      id: "childcare",
      name: "Childcare",
      description: "Professional childcare services",
      icon: "👶",
      basePrice: 2500,
      category: "care"
    },
    elderly_care: {
      id: "elderly_care",
      name: "Elderly Care",
      description: "Care and assistance for elderly",
      icon: "👴",
      basePrice: 3000,
      category: "care"
    },
    pet_care: {
      id: "pet_care",
      name: "Pet Care",
      description: "Pet sitting and care services",
      icon: "🐕",
      basePrice: 2000,
      category: "care"
    },
    tutoring: {
      id: "tutoring",
      name: "Home Tutoring",
      description: "Educational support and tutoring",
      icon: "📚",
      basePrice: 4000,
      category: "care"
    },

    // Maintenance & Outdoor
    gardening: {
      id: "gardening",
      name: "Gardening",
      description: "Garden maintenance and landscaping",
      icon: "🌱",
      basePrice: 3000,
      category: "outdoor"
    },
    lawn_mowing: {
      id: "lawn_mowing",
      name: "Lawn Mowing",
      description: "Grass cutting and lawn maintenance",
      icon: "🌿",
      basePrice: 2500,
      category: "outdoor"
    },
    pool_cleaning: {
      id: "pool_cleaning",
      name: "Pool Maintenance",
      description: "Swimming pool cleaning and maintenance",
      icon: "🏊",
      basePrice: 6000,
      category: "outdoor"
    },
    security_guard: {
      id: "security_guard",
      name: "Security Services",
      description: "Home security and watchman services",
      icon: "🛡️",
      basePrice: 2000,
      category: "security"
    },

    // Laundry & Textile Care
    laundry_ironing: {
      id: "laundry_ironing",
      name: "Laundry & Ironing",
      description: "Washing, drying, and ironing clothes",
      icon: "👕",
      basePrice: 2000,
      category: "textile"
    },
    dry_cleaning: {
      id: "dry_cleaning",
      name: "Dry Cleaning Pickup",
      description: "Collection and delivery of dry cleaning",
      icon: "🧥",
      basePrice: 1500,
      category: "textile"
    },
    shoe_care: {
      id: "shoe_care",
      name: "Shoe Cleaning & Repair",
      description: "Professional shoe cleaning and repair",
      icon: "👞",
      basePrice: 1000,
      category: "textile"
    },

    // Specialized Services
    event_planning: {
      id: "event_planning",
      name: "Event Planning",
      description: "Home event planning and coordination",
      icon: "🎉",
      basePrice: 10000,
      category: "specialized"
    },
    interior_organization: {
      id: "interior_organization",
      name: "Home Organization",
      description: "Professional home and closet organization",
      icon: "📦",
      basePrice: 5000,
      category: "specialized"
    },
    personal_shopping: {
      id: "personal_shopping",
      name: "Personal Shopping",
      description: "Grocery and personal item shopping",
      icon: "🛒",
      basePrice: 2500,
      category: "specialized"
    },
    house_sitting: {
      id: "house_sitting",
      name: "House Sitting",
      description: "Home monitoring while away",
      icon: "🏠",
      basePrice: 3000,
      category: "specialized"
    },
    driver_services: {
      id: "driver_services",
      name: "Personal Driver",
      description: "Personal transportation services",
      icon: "🚗",
      basePrice: 4000,
      category: "specialized"
    }
  },
  lastUpdated: new Date().toISOString()
};

// Locations data structure
const locationsData = {
  districts: {
    // Kigali City
    gasabo: {
      name: "Gasabo",
      province: "Kigali City",
      code: "11",
      sectors: {
        bumbogo: { name: "Bumbogo", code: "1101" },
        gatsata: { name: "Gatsata", code: "1102" },
        gikomero: { name: "Gikomero", code: "1103" },
        gisozi: { name: "Gisozi", code: "1104" },
        jabana: { name: "Jabana", code: "1105" },
        jali: { name: "Jali", code: "1106" },
        kacyiru: { name: "Kacyiru", code: "1107" },
        kimihurura: { name: "Kimihurura", code: "1108" },
        kimironko: { name: "Kimironko", code: "1109" },
        kinyinya: { name: "Kinyinya", code: "1110" },
        ndera: { name: "Ndera", code: "1111" },
        nduba: { name: "Nduba", code: "1112" },
        remera: { name: "Remera", code: "1113" },
        rusororo: { name: "Rusororo", code: "1114" },
        rutunga: { name: "Rutunga", code: "1115" }
      }
    },
    kicukiro: {
      name: "Kicukiro",
      province: "Kigali City",
      code: "12",
      sectors: {
        gahanga: { name: "Gahanga", code: "1201" },
        gatenga: { name: "Gatenga", code: "1202" },
        gikondo: { name: "Gikondo", code: "1203" },
        kagarama: { name: "Kagarama", code: "1204" },
        kanombe: { name: "Kanombe", code: "1205" },
        kicukiro: { name: "Kicukiro", code: "1206" },
        masaka: { name: "Masaka", code: "1207" },
        niboye: { name: "Niboye", code: "1208" },
        nyarugunga: { name: "Nyarugunga", code: "1209" },
        rwebitaba: { name: "Rwebitaba", code: "1210" }
      }
    },
    nyarugenge: {
      name: "Nyarugenge",
      province: "Kigali City",
      code: "13",
      sectors: {
        gitega: { name: "Gitega", code: "1301" },
        kimisagara: { name: "Kimisagara", code: "1302" },
        kugirema: { name: "Kugirema", code: "1303" },
        mageragere: { name: "Mageragere", code: "1304" },
        muhima: { name: "Muhima", code: "1305" },
        nyakabanda: { name: "Nyakabanda", code: "1306" },
        nyamirambo: { name: "Nyamirambo", code: "1307" },
        nyarugenge: { name: "Nyarugenge", code: "1308" },
        rwezamenyo: { name: "Rwezamenyo", code: "1309" }
      }
    },

    // Southern Province
    muhanga: {
      name: "Muhanga",
      province: "Southern Province",
      code: "22",
      sectors: {
        cyeza: { name: "Cyeza", code: "2201" },
        kabacuzi: { name: "Kabacuzi", code: "2202" },
        kibangu: { name: "Kibangu", code: "2203" },
        kiyumba: { name: "Kiyumba", code: "2204" },
        muhanga: { name: "Muhanga", code: "2205" },
        mukura: { name: "Mukura", code: "2206" },
        mushishiro: { name: "Mushishiro", code: "2207" },
        nyabindu: { name: "Nyabindu", code: "2208" },
        nyamabuye: { name: "Nyamabuye", code: "2209" },
        nyarubaka: { name: "Nyarubaka", code: "2210" },
        rongi: { name: "Rongi", code: "2211" },
        rugendabari: { name: "Rugendabari", code: "2212" }
      }
    },

    // Western Province
    karongi: {
      name: "Karongi",
      province: "Western Province",
      code: "31",
      sectors: {
        bwishyura: { name: "Bwishyura", code: "3101" },
        gashari: { name: "Gashari", code: "3102" },
        gitesi: { name: "Gitesi", code: "3103" },
        kivumu: { name: "Kivumu", code: "3104" },
        mutuntu: { name: "Mutuntu", code: "3105" },
        rugabano: { name: "Rugabano", code: "3106" },
        ruganda: { name: "Ruganda", code: "3107" },
        murambi: { name: "Murambi", code: "3108" },
        gishyita: { name: "Gishyita", code: "3109" },
        twumba: { name: "Twumba", code: "3110" }
      }
    },

    // Northern Province
    musanze: {
      name: "Musanze",
      province: "Northern Province",
      code: "41",
      sectors: {
        busogo: { name: "Busogo", code: "4101" },
        cyuve: { name: "Cyuve", code: "4102" },
        gacaca: { name: "Gacaca", code: "4103" },
        gashaki: { name: "Gashaki", code: "4104" },
        gataraga: { name: "Gataraga", code: "4105" },
        kimonyi: { name: "Kimonyi", code: "4106" },
        kinigi: { name: "Kinigi", code: "4107" },
        muhoza: { name: "Muhoza", code: "4108" },
        muko: { name: "Muko", code: "4109" },
        musanze: { name: "Musanze", code: "4110" },
        nkotsi: { name: "Nkotsi", code: "4111" },
        nyange: { name: "Nyange", code: "4112" },
        remera: { name: "Remera", code: "4113" },
        rwaza: { name: "Rwaza", code: "4114" },
        shingiro: { name: "Shingiro", code: "4115" }
      }
    },

    // Eastern Province
    rwamagana: {
      name: "Rwamagana",
      province: "Eastern Province",
      code: "51",
      sectors: {
        fumbwe: { name: "Fumbwe", code: "5101" },
        gahengeri: { name: "Gahengeri", code: "5102" },
        gishari: { name: "Gishari", code: "5103" },
        karenge: { name: "Karenge", code: "5104" },
        kigabiro: { name: "Kigabiro", code: "5105" },
        muhazi: { name: "Muhazi", code: "5106" },
        munyaga: { name: "Munyaga", code: "5107" },
        munyiginya: { name: "Munyiginya", code: "5108" },
        musha: { name: "Musha", code: "5109" },
        muyumbu: { name: "Muyumbu", code: "5110" },
        nyakaliro: { name: "Nyakaliro", code: "5111" },
        nzige: { name: "Nzige", code: "5112" },
        rubona: { name: "Rubona", code: "5113" },
        rukira: { name: "Rukira", code: "5114" }
      }
    }
  },
  lastUpdated: new Date().toISOString()
};

// System configuration data
const systemConfigData = {
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

/**
 * Seed Firestore with services and locations data
 */
export async function seedFirestore() {
  try {
    console.log('🌱 Starting Firestore seeding...');

    // Seed services
    await setDoc(doc(db, 'services', 'services'), servicesData);
    console.log('✅ Services data seeded successfully');

    // Seed locations
    await setDoc(doc(db, 'locations', 'locations'), locationsData);
    console.log('✅ Locations data seeded successfully');

    // Seed system configuration
    await setDoc(doc(db, 'system', 'config'), systemConfigData);
    console.log('✅ System configuration data seeded successfully');

    console.log('🎉 Firestore seeding completed!');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    return { success: false, error };
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedFirestore()
    .then(result => {
      if (result.success) {
        console.log('Database seeded successfully');
        process.exit(0);
      } else {
        console.error('Seeding failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
