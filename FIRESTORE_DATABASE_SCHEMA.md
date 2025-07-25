# HouseHelp Firestore Database Schema

## Overview
This document outlines the complete Firestore database schema for the HouseHelp application, including all collections, documents, fields, types, validation rules, and relationships.

## Collections Structure

### 1. Workers Collection (`workers`)
**Purpose:** Store worker profiles and related information

```typescript
interface Worker {
  // Required fields
  id: string;                    // Document ID (Firebase Auth UID)
  fullName: string;              // Worker's full name
  email: string;                 // Worker's email (unique)
  phone: string;                 // Worker's phone number
  services: string[];            // Array of service types offered
  experience: string;            // Years of experience
  location: string;              // Worker's location/city
  
  // Optional fields
  bio?: string;                  // Worker's biography/description
  hourlyRate: number;            // Hourly rate in RWF (default: 1500)
  isAvailable: boolean;          // Current availability status
  rating: number;                // Average rating (0-5)
  totalJobs: number;             // Total completed jobs
  languages: string[];           // Spoken languages
  nationalId: string;            // National ID number
  profileImage?: string;         // Profile image URL
  
  // Job preferences
  oneTimeJobs: boolean;          // Accepts one-time jobs
  recurringJobs: boolean;        // Accepts recurring jobs
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActive?: Date;
}
```

**Indexes:**
- `location + isAvailable + rating`
- `services (array) + location + hourlyRate`
- `isAvailable + createdAt`

### 2. Households Collection (`households`)
**Purpose:** Store household user profiles

```typescript
interface Household {
  // Required fields
  id: string;                    // Document ID (Firebase Auth UID)
  fullName: string;              // Household head's name
  email: string;                 // Email address (unique)
  phone: string;                 // Phone number
  location: string;              // Location/address
  
  // Optional fields
  profileImage?: string;         // Profile image URL
  totalBookings: number;         // Total bookings made
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActive?: Date;
}
```

### 3. Admins Collection (`admins`)
**Purpose:** Store admin user profiles

```typescript
interface Admin {
  id: string;                    // Document ID (Firebase Auth UID)
  fullName: string;              // Admin's full name
  email: string;                 // Email address
  role: 'super_admin' | 'admin'; // Admin role level
  permissions: string[];         // Array of permissions
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActive?: Date;
}
```

### 4. Jobs Collection (`jobs`)
**Purpose:** Store job postings from households

```typescript
interface Job {
  id: string;                    // Auto-generated document ID
  
  // Basic job information
  title: string;                 // Job title
  description: string;           // Detailed job description
  serviceType: string;           // Type of service needed
  
  // Relationships
  householdId: string;           // Reference to household document
  workerId?: string;             // Assigned worker ID (null if unassigned)
  
  // Job details
  location: string;              // Job location
  budget: number;                // Budget in RWF
  duration: number;              // Estimated duration in hours
  
  // Scheduling
  scheduledDate: Date;           // Preferred job date
  scheduledTime: string;         // Preferred job time (HH:MM format)
  
  // Status and metadata
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  
  // Application tracking
  applicants: string[];          // Array of worker IDs who applied
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

**Indexes:**
- `status + serviceType + createdAt`
- `householdId + status + createdAt`
- `workerId + status + scheduledDate`
- `location + serviceType + status`

### 5. Bookings Collection (`bookings`)
**Purpose:** Store confirmed bookings between households and workers

```typescript
interface Booking {
  id: string;                    // Auto-generated document ID
  
  // Relationships
  jobId: string;                 // Reference to job document
  householdId: string;           // Reference to household document
  workerId: string;              // Reference to worker document
  
  // Booking details
  serviceType: string;           // Type of service
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  
  // Scheduling
  scheduledDate: Date;           // Confirmed date
  scheduledTime: string;         // Confirmed time
  duration: number;              // Duration in hours
  
  // Financial
  amount: number;                // Total amount in RWF
  
  // Location and notes
  location: string;              // Service location
  notes?: string;                // Additional notes
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}
```

**Indexes:**
- `householdId + status + scheduledDate`
- `workerId + status + scheduledDate`
- `status + scheduledDate`

### 6. Conversations Collection (`conversations`)
**Purpose:** Store messaging conversations between users

```typescript
interface Conversation {
  id: string;                    // Auto-generated document ID
  
  // Participants
  participants: string[];        // Array of user IDs (exactly 2)
  
  // Last message info
  lastMessage: string;           // Content of last message
  lastMessageTimestamp: Date;    // Timestamp of last message
  lastMessageSenderId: string;   // ID of last message sender
  
  // Unread counts per participant
  unreadCount: {
    [userId: string]: number;    // Unread message count for each participant
  };
  
  // Metadata
  type: 'job_inquiry' | 'booking' | 'general';
  relatedJobId?: string;         // Related job ID if applicable
  relatedBookingId?: string;     // Related booking ID if applicable
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `participants (array) + lastMessageTimestamp`

### 7. Messages Collection (`messages`)
**Purpose:** Store individual messages within conversations

```typescript
interface Message {
  id: string;                    // Auto-generated document ID
  
  // Relationships
  conversationId: string;        // Reference to conversation document
  senderId: string;              // Sender's user ID
  senderType: 'worker' | 'household' | 'admin';
  
  // Message content
  content: string;               // Message text content
  type: 'text' | 'image' | 'file' | 'system';
  
  // Attachments (if any)
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
    size: number;
  }[];
  
  // Status
  read: boolean;                 // Whether message has been read
  
  // Timestamps
  timestamp: Date;               // When message was sent
  readAt?: Date;                 // When message was read
}
```

**Indexes:**
- `conversationId + timestamp`
- `conversationId + read + timestamp`

### 8. Reviews Collection (`reviews`)
**Purpose:** Store reviews and ratings for completed jobs

```typescript
interface Review {
  id: string;                    // Auto-generated document ID
  
  // Relationships
  bookingId: string;             // Reference to booking document
  householdId: string;           // Reviewer (household) ID
  workerId: string;              // Reviewee (worker) ID
  
  // Review content
  rating: number;                // Rating from 1-5
  comment: string;               // Written review
  
  // Optional fields
  wouldRecommend: boolean;       // Would recommend this worker
  categories?: {                 // Category-specific ratings
    punctuality: number;
    quality: number;
    communication: number;
    value: number;
  };
  
  // Timestamps
  createdAt: Date;
}
```

**Indexes:**
- `workerId + rating + createdAt`
- `householdId + createdAt`

### 9. Payments Collection (`payments`)
**Purpose:** Store payment records and transaction history

```typescript
interface Payment {
  id: string;                    // Auto-generated document ID
  
  // Relationships
  bookingId: string;             // Reference to booking document
  householdId: string;           // Payer ID
  workerId: string;              // Payee ID
  
  // Payment details
  amount: number;                // Payment amount in RWF
  method: 'card' | 'mobile_money' | 'bank_transfer' | 'cash';
  
  // Status tracking
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  
  // External payment data
  transactionId?: string;        // External transaction ID
  paymentGateway?: string;       // Payment gateway used
  phoneNumber?: string;          // Mobile money phone number
  
  // Fees and breakdown
  platformFee: number;           // Platform commission
  workerAmount: number;          // Amount worker receives
  
  // Timestamps
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  refundedAt?: Date;
}
```

**Indexes:**
- `householdId + status + createdAt`
- `workerId + status + createdAt`
- `status + createdAt`

### 10. Notifications Collection (`notifications`)
**Purpose:** Store user notifications

```typescript
interface Notification {
  id: string;                    // Auto-generated document ID
  
  // Target user
  userId: string;                // Recipient user ID
  userType: 'worker' | 'household' | 'admin';
  
  // Notification content
  title: string;                 // Notification title
  message: string;               // Notification message
  type: 'job_application' | 'booking_confirmed' | 'payment_received' | 
        'message_received' | 'review_received' | 'system';
  
  // Status
  read: boolean;                 // Whether notification has been read
  
  // Related data
  relatedId?: string;            // Related document ID
  relatedType?: string;          // Related document type
  
  // Actions
  actionUrl?: string;            // URL to navigate to
  
  // Timestamps
  createdAt: Date;
  readAt?: Date;
}
```

**Indexes:**
- `userId + read + createdAt`
- `userId + type + createdAt`

## Data Relationships

### Primary Relationships
1. **Worker ←→ Jobs**: One worker can be assigned to many jobs
2. **Household ←→ Jobs**: One household can create many jobs
3. **Worker ←→ Bookings**: One worker can have many bookings
4. **Household ←→ Bookings**: One household can have many bookings
5. **Job → Booking**: One job can have one booking (1:1)
6. **Booking → Review**: One booking can have one review (1:1)
7. **Booking → Payment**: One booking can have multiple payments (1:many)

### Secondary Relationships
1. **Users ←→ Conversations**: Users participate in many conversations
2. **Conversation ←→ Messages**: One conversation has many messages
3. **Users ←→ Notifications**: Users receive many notifications

## Security Rules Summary

### Authentication Requirements
- All collections require authenticated users
- Users can only access their own data or data they're authorized to see
- Admins have elevated access across all collections

### Data Validation
- Email format validation
- Phone number format validation
- Required field validation
- Data type validation
- Business logic validation (e.g., rating 1-5)

### Access Control
- **Workers**: Can read all worker profiles, manage their own profile
- **Households**: Can read all worker profiles, manage their own data
- **Admins**: Full access to all collections
- **Cross-user access**: Limited to shared resources (conversations, bookings)

## Performance Optimization

### Indexing Strategy
- Composite indexes for common query patterns
- Array-contains indexes for array fields
- Descending indexes for timestamp-based queries

### Query Patterns
- Paginated queries for large result sets
- Cached queries for frequently accessed data
- Real-time listeners for messaging and notifications

## Data Integrity

### Referential Integrity
- Foreign key relationships maintained through application logic
- Orphaned record prevention through proper deletion cascades
- Data consistency checks in business logic

### Backup and Recovery
- Automated daily backups
- Point-in-time recovery capability
- Data export functionality for compliance

## Monitoring and Analytics

### Performance Metrics
- Query performance monitoring
- Index usage analysis
- Data growth tracking

### Business Metrics
- User engagement tracking
- Feature usage analytics
- Revenue and transaction monitoring

This schema ensures scalability, data integrity, and optimal performance for the HouseHelp application while maintaining security and compliance with best practices.
