# Firestore Database Schema for Househelp Platform

This document provides the complete database structure for the Househelp platform, including all collections, documents, and field specifications based on the codebase analysis.

## Database Collections Overview

The Househelp platform uses the following main collections:
- `household` - Household user profiles and data
- `worker` - Worker profiles and registration data
- `admins` - Administrative user accounts
- `jobs` - Job postings and assignments
- `servicePayments` - Payment records
- `notifications` - User notifications
- `reviews` - Service reviews and ratings
- `conversations` - Messaging data
- `messages` - Individual messages

---

## Collection: `household`

**Purpose**: Stores household user profiles and registration information

### Document Structure
```typescript
{
  // Document ID: Firebase Auth UID
  uid: string;                    // Firebase Auth UID (matches document ID)
  fullName: string;               // e.g., "Jane Doe"
  phone: string;                  // e.g., "0781234567" (10 digits)
  email: string;                  // e.g., "jane.doe@example.com"
  
  // Address Information
  address: {
    district: string;             // "gasabo" | "kicukiro" | "nyarugenge"
    sector: string;               // e.g., "kimihurura", "kacyiru", "remera"
    line1: string;                // Detailed address/street
  };
  
  // Property Details
  property: {
    type: string;                 // "house" | "apartment" | "villa"
    rooms: number;                // Number of rooms (min: 1)
    garden: boolean;              // Has garden or not
  };
  
  // Family Composition
  family: {
    adults: number;               // Number of adults (min: 1)
    children: number;             // Number of children (min: 0)
    pets: boolean;                // Has pets
    petInfo?: string;             // Pet details if pets=true
  };
  
  // Service Requirements
  services: {
    primary: string[];            // Array of service IDs
    frequency: string;            // "One-time" | "Weekly" | "Bi-weekly" | "Monthly"
  };
  
  // System Fields
  dateJoined: Timestamp;          // Registration date
  status: string;                 // "active" | "suspended"
}
```

### Service IDs for `services.primary`
- `house_cleaning` - House Cleaning
- `cooking` - Cooking
- `childcare` - Childcare
- `elderly_care` - Elderly Care
- `gardening` - Gardening
- `laundry_ironing` - Laundry & Ironing

### Example Document
```json
{
  "uid": "abc123def456",
  "fullName": "Jane Doe",
  "phone": "0781234567",
  "email": "jane.doe@example.com",
  "address": {
    "district": "gasabo",
    "sector": "kimihurura",
    "line1": "KG 123 St, House #45"
  },
  "property": {
    "type": "house",
    "rooms": 4,
    "garden": true
  },
  "family": {
    "adults": 2,
    "children": 1,
    "pets": true,
    "petInfo": "1 small dog"
  },
  "services": {
    "primary": ["house_cleaning", "cooking"],
    "frequency": "Weekly"
  },
  "dateJoined": "2024-01-15T10:30:00Z",
  "status": "active"
}
```

---

## Collection: `worker`

**Purpose**: Stores worker profiles, skills, and availability

### Document Structure
```typescript
{
  // Document ID: Firebase Auth UID
  uid: string;                    // Firebase Auth UID
  fullName: string;               // Full name
  phone: string;                  // 10-digit phone number
  email?: string;                 // Optional email
  
  // Personal Information
  dob: Timestamp;                 // Date of birth
  gender: string;                 // "male" | "female" | "other"
  nationalId: string;             // 16-digit national ID
  
  // Address
  district: string;               // District
  sector: string;                 // Sector
  address: string;                // Detailed address
  
  // Emergency Contact
  emergencyContact: {
    name: string;                 // Contact person name
    phone: string;                // Contact phone (10 digits)
    relationship: string;         // Relationship to worker
  };
  
  // Professional Information
  experienceYears: number;        // Years of experience
  bio?: string;                   // Professional bio (max 500 chars)
  skills: string[];               // Array of service skill IDs
  languages: string[];            // Spoken languages
  previousEmployers?: string;     // Previous work history
  
  // Availability & Preferences
  availableDays: string[];        // ["Monday", "Tuesday", ...]
  preferredHours: string;         // e.g., "9am - 5pm"
  flexibility: string;            // "full-time" | "part-time"
  oneTimeJobs: boolean;           // Accepts one-time jobs
  recurringJobs: boolean;         // Accepts recurring jobs
  emergencyServices: boolean;     // Available for emergency calls
  travelDistance: number[];       // [maxKm] - willing to travel
  hourlyRate: number[];           // [minRate, maxRate] in RWF
  
  // Profile & Media
  profilePictureUrl?: string;     // Profile photo URL
  certificatesUrl?: string;       // Certificates/documents URL
  idFrontUrl?: string;           // ID front photo URL
  idBackUrl?: string;            // ID back photo URL
  selfieUrl?: string;            // Selfie with ID URL
  
  // Performance Metrics
  rating: number;                 // Average rating (0-5)
  reviewsCount: number;           // Total number of reviews
  jobsCompleted: number;          // Total completed jobs
  
  // System Fields
  dateJoined: Timestamp;          // Registration date
  status: string;                 // "active" | "pending" | "suspended"
  verificationStatus: string;     // "pending" | "verified" | "rejected"
}
```

### Skill IDs for `skills` array
- `general_cleaning` - General Cleaning
- `deep_cleaning` - Deep Cleaning
- `house_cleaning` - House Cleaning
- `cooking` - Cooking
- `childcare` - Childcare
- `elderly_care` - Elderly Care
- `gardening` - Gardening
- `laundry` - Laundry
- `laundry_ironing` - Laundry & Ironing
- `general_housework` - General Housework

### Language IDs for `languages` array
- `kinyarwanda` - Kinyarwanda
- `english` - English
- `french` - French
- `swahili` - Swahili

### Example Document
```json
{
  "uid": "worker123abc",
  "fullName": "Aline Uwamahoro",
  "phone": "0781234567",
  "email": "aline.uwamahoro@example.com",
  "dob": "1995-03-12T00:00:00Z",
  "gender": "female",
  "nationalId": "1199580012345678",
  "district": "gasabo",
  "sector": "kimihurura",
  "address": "KG 680 St",
  "emergencyContact": {
    "name": "Jean Paul Mugisha",
    "phone": "0788765432",
    "relationship": "Brother"
  },
  "experienceYears": 5,
  "bio": "Experienced and reliable worker with a passion for creating clean and organized homes.",
  "skills": ["general_cleaning", "deep_cleaning", "laundry", "gardening"],
  "languages": ["kinyarwanda", "english"],
  "availableDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "preferredHours": "8am - 6pm",
  "flexibility": "full-time",
  "oneTimeJobs": true,
  "recurringJobs": true,
  "emergencyServices": false,
  "travelDistance": [15],
  "hourlyRate": [2000, 3500],
  "profilePictureUrl": "https://firebasestorage.googleapis.com/...",
  "rating": 4.8,
  "reviewsCount": 24,
  "jobsCompleted": 32,
  "dateJoined": "2024-01-10T09:00:00Z",
  "status": "active",
  "verificationStatus": "verified"
}
```

---

## Collection: `admins`

**Purpose**: Administrative user accounts and permissions

### Document Structure
```typescript
{
  // Document ID: Firebase Auth UID
  uid: string;                    // Firebase Auth UID
  fullName: string;               // Admin full name
  email: string;                  // Official admin email
  phone: string;                  // Contact phone
  employeeId: string;             // Unique employee identifier
  
  // Role & Permissions
  role: string;                   // "super_admin" | "admin" | "support_agent"
  department: string;             // "operations" | "customer_service" | "finance"
  roleLevel: string;              // "senior" | "junior" | "manager"
  
  // System Fields
  dateJoined: Timestamp;          // When admin was created
  status: string;                 // "active" | "suspended"
  lastLogin?: Timestamp;          // Last login timestamp
}
```

### Example Document
```json
{
  "uid": "admin456def",
  "fullName": "John Admin",
  "email": "john.admin@househelp.com",
  "phone": "0781234567",
  "employeeId": "EMP001",
  "role": "admin",
  "department": "operations",
  "roleLevel": "senior",
  "dateJoined": "2024-01-01T08:00:00Z",
  "status": "active",
  "lastLogin": "2024-07-22T14:30:00Z"
}
```

---

## Collection: `jobs`

**Purpose**: Job postings, applications, and assignments

### Document Structure
```typescript
{
  // Document ID: Auto-generated by Firestore
  
  // Job Details
  jobTitle: string;               // Job title (min 5 chars)
  serviceType: string;            // Service category ID
  jobDescription: string;         // Detailed description (min 20 chars)
  schedule: string;               // Schedule details
  salary: number;                 // Salary amount in RWF
  payFrequency: string;           // "hourly" | "daily" | "weekly" | "monthly"
  
  // Benefits
  benefits: {
    accommodation: boolean;       // Provides accommodation
    meals: boolean;               // Provides meals
    transportation: boolean;      // Provides transportation
  };
  
  // Household Information
  householdId: string;            // Reference to household document
  householdName: string;          // Household owner name
  householdLocation: string;      // Location string (sector, district)
  
  // Worker Assignment
  workerId?: string;              // Assigned worker ID (null if unassigned)
  workerName?: string;            // Assigned worker name
  
  // Applications
  applications: Array<{
    workerId: string;             // Applicant worker ID
    workerName: string;           // Applicant name
    coverLetter?: string;         // Application cover letter
    proposedRate?: number;        // Worker's proposed rate
    appliedAt: Timestamp;         // Application timestamp
  }>;
  
  // Status & Timestamps
  status: string;                 // "open" | "assigned" | "in_progress" | "completed" | "cancelled"
  createdAt: Timestamp;           // Job creation time
  assignedAt?: Timestamp;         // When worker was assigned
  completedAt?: Timestamp;        // When job was completed
}
```

### Job Status Values
- `open` - Job posted, accepting applications
- `assigned` - Worker assigned to job
- `in_progress` - Work has started
- `completed` - Job finished successfully
- `cancelled` - Job cancelled

### Example Document
```json
{
  "jobTitle": "Weekly House Cleaning",
  "serviceType": "house_cleaning",
  "jobDescription": "Need someone to clean a 4-bedroom house weekly. Includes kitchen, bathrooms, and general cleaning.",
  "schedule": "Every Saturday morning, 8am-12pm",
  "salary": 15000,
  "payFrequency": "weekly",
  "benefits": {
    "accommodation": false,
    "meals": true,
    "transportation": false
  },
  "householdId": "abc123def456",
  "householdName": "Jane Doe",
  "householdLocation": "Kimihurura, Gasabo",
  "workerId": "worker123abc",
  "workerName": "Aline Uwamahoro",
  "applications": [
    {
      "workerId": "worker123abc",
      "workerName": "Aline Uwamahoro",
      "coverLetter": "I have 5 years of experience in house cleaning...",
      "proposedRate": 3000,
      "appliedAt": "2024-07-20T10:00:00Z"
    }
  ],
  "status": "assigned",
  "createdAt": "2024-07-18T14:30:00Z",
  "assignedAt": "2024-07-20T11:00:00Z"
}
```

---

## Collection: `servicePayments`

**Purpose**: Payment records and transaction history

### Document Structure
```typescript
{
  // Document ID: Auto-generated by Firestore
  
  // Payment Details
  amount: number;                 // Payment amount in RWF
  currency: string;               // "RWF"
  paymentMethod: string;          // "mobile_money" | "card" | "cash"
  
  // Transaction References
  jobId: string;                  // Related job ID
  householdId: string;            // Paying household
  workerId: string;               // Receiving worker
  
  // Paypack Integration
  paypackTransactionId?: string;  // Paypack transaction reference
  paypackStatus?: string;         // Paypack payment status
  
  // Payment Status
  status: string;                 // "pending" | "completed" | "failed" | "refunded"
  
  // Breakdown
  serviceAmount: number;          // Base service cost
  platformFee: number;            // Platform commission
  netAmount: number;              // Amount to worker (serviceAmount - platformFee)
  
  // Timestamps
  initiatedAt: Timestamp;         // Payment initiated
  completedAt?: Timestamp;        // Payment completed
  createdAt: Timestamp;           // Record created
}
```

### Payment Status Values
- `pending` - Payment initiated but not completed
- `completed` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded

### Example Document
```json
{
  "amount": 15000,
  "currency": "RWF",
  "paymentMethod": "mobile_money",
  "jobId": "job789xyz",
  "householdId": "abc123def456",
  "workerId": "worker123abc",
  "paypackTransactionId": "PP_123456789",
  "paypackStatus": "completed",
  "status": "completed",
  "serviceAmount": 15000,
  "platformFee": 1500,
  "netAmount": 13500,
  "initiatedAt": "2024-07-22T10:00:00Z",
  "completedAt": "2024-07-22T10:05:00Z",
  "createdAt": "2024-07-22T10:00:00Z"
}
```

---

## Collection: `notifications`

**Purpose**: User notifications and alerts

### Document Structure
```typescript
{
  // Document ID: Auto-generated by Firestore
  
  // Notification Content
  title: string;                  // Notification title
  description: string;            // Notification message
  type: string;                   // "info" | "success" | "warning" | "error"
  
  // Targeting
  userId: string;                 // Recipient user ID
  userType: string;               // "household" | "worker" | "admin"
  
  // Related Data
  jobId?: string;                 // Related job (if applicable)
  paymentId?: string;             // Related payment (if applicable)
  
  // Status
  read: boolean;                  // Whether notification was read
  
  // Timestamps
  createdAt: Timestamp;           // When notification was created
  readAt?: Timestamp;             // When notification was read
}
```

### Notification Types
- `info` - General information
- `success` - Success messages (job completed, payment received)
- `warning` - Warnings (job deadline approaching)
- `error` - Error messages (payment failed)

### Example Document
```json
{
  "title": "Job Application Received",
  "description": "Aline Uwamahoro has applied for your house cleaning job.",
  "type": "info",
  "userId": "abc123def456",
  "userType": "household",
  "jobId": "job789xyz",
  "read": false,
  "createdAt": "2024-07-20T10:00:00Z"
}
```

---

## Collection: `reviews`

**Purpose**: Service reviews and ratings

### Document Structure
```typescript
{
  // Document ID: Auto-generated by Firestore
  
  // Review Details
  rating: number;                 // Rating (1-5)
  comment: string;                // Review comment (10-500 chars)
  
  // Relationships
  jobId: string;                  // Related job
  householdId: string;            // Reviewing household
  workerId: string;               // Reviewed worker
  
  // Additional Info
  workerName: string;             // Worker name for display
  jobTitle: string;               // Job title for context
  serviceDate: string;            // When service was performed
  
  // Timestamps
  createdAt: Timestamp;           // Review creation time
}
```

### Example Document
```json
{
  "rating": 5,
  "comment": "Excellent work! Aline was very professional and thorough. Highly recommend!",
  "jobId": "job789xyz",
  "householdId": "abc123def456",
  "workerId": "worker123abc",
  "workerName": "Aline Uwamahoro",
  "jobTitle": "Weekly House Cleaning",
  "serviceDate": "2024-07-22",
  "createdAt": "2024-07-22T18:00:00Z"
}
```

---

## Collection: `conversations`

**Purpose**: Message conversations between users

### Document Structure
```typescript
{
  // Document ID: Auto-generated by Firestore
  
  // Participants
  participants: string[];         // Array of user IDs in conversation
  participantTypes: string[];     // ["household", "worker"] or ["admin", "household"]
  
  // Conversation Info
  jobId?: string;                 // Related job (if applicable)
  jobTitle?: string;              // Job title for context
  
  // Last Message Info
  lastMessage: string;            // Preview of last message
  lastMessageTime: Timestamp;     // When last message was sent
  lastMessageSender: string;      // Who sent last message
  
  // Status
  unreadCount: {                  // Unread message count per participant
    [userId: string]: number;
  };
  
  // Timestamps
  createdAt: Timestamp;           // Conversation created
  updatedAt: Timestamp;           // Last activity
}
```

### Example Document
```json
{
  "participants": ["abc123def456", "worker123abc"],
  "participantTypes": ["household", "worker"],
  "jobId": "job789xyz",
  "jobTitle": "Weekly House Cleaning",
  "lastMessage": "What time should I arrive on Saturday?",
  "lastMessageTime": "2024-07-22T16:30:00Z",
  "lastMessageSender": "worker123abc",
  "unreadCount": {
    "abc123def456": 1,
    "worker123abc": 0
  },
  "createdAt": "2024-07-20T12:00:00Z",
  "updatedAt": "2024-07-22T16:30:00Z"
}
```

---

## Collection: `messages`

**Purpose**: Individual messages within conversations

### Document Structure
```typescript
{
  // Document ID: Auto-generated by Firestore
  
  // Message Content
  text: string;                   // Message text
  type: string;                   // "text" | "image" | "file" | "system"
  
  // Relationships
  conversationId: string;         // Parent conversation
  senderId: string;               // Message sender
  senderName: string;             // Sender display name
  senderType: string;             // "household" | "worker" | "admin"
  
  // Media (if applicable)
  imageUrl?: string;              // Image attachment URL
  fileName?: string;              // File attachment name
  fileUrl?: string;               // File attachment URL
  
  // Status
  read: boolean;                  // Whether message was read
  
  // Timestamps
  sentAt: Timestamp;              // When message was sent
  readAt?: Timestamp;             // When message was read
}
```

### Message Types
- `text` - Regular text message
- `image` - Image attachment
- `file` - File attachment
- `system` - System-generated message (job updates, etc.)

### Example Document
```json
{
  "text": "What time should I arrive on Saturday?",
  "type": "text",
  "conversationId": "conv123abc",
  "senderId": "worker123abc",
  "senderName": "Aline Uwamahoro",
  "senderType": "worker",
  "read": false,
  "sentAt": "2024-07-22T16:30:00Z"
}
```

---

## Database Indexes

### Recommended Composite Indexes

1. **jobs collection**:
   - `householdId` + `status` + `createdAt` (desc)
   - `workerId` + `status` + `createdAt` (desc)
   - `status` + `createdAt` (desc)

2. **worker collection**:
   - `status` + `rating` (desc)
   - `status` + `fullName` (asc)
   - `skills` (array) + `status`

3. **notifications collection**:
   - `userId` + `userType` + `createdAt` (desc)
   - `userId` + `read` + `createdAt` (desc)

4. **servicePayments collection**:
   - `householdId` + `status` + `createdAt` (desc)
   - `workerId` + `status` + `createdAt` (desc)
   - `jobId` + `status`

5. **messages collection**:
   - `conversationId` + `sentAt` (desc)
   - `senderId` + `sentAt` (desc)

6. **reviews collection**:
   - `workerId` + `createdAt` (desc)
   - `householdId` + `createdAt` (desc)

---

## Security Rules Considerations

1. **User Data Access**: Users should only access their own documents
2. **Job Applications**: Workers can apply to open jobs, households can view applications on their jobs
3. **Messages**: Only conversation participants can read/write messages
4. **Admin Access**: Admins have broader read access for management purposes
5. **Public Data**: Worker profiles (limited fields) can be read by households for discovery

---

## Data Relationships

### Key Relationships
- `household.uid` ↔ Firebase Auth UID
- `worker.uid` ↔ Firebase Auth UID  
- `jobs.householdId` → `household.uid`
- `jobs.workerId` → `worker.uid`
- `servicePayments.jobId` → `jobs.id`
- `reviews.jobId` → `jobs.id`
- `conversations.participants` → user UIDs
- `messages.conversationId` → `conversations.id`

This schema supports all the features identified in your Househelp platform including user management, job posting and matching, payments, messaging, reviews, and administrative functions.
