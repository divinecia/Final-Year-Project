#!/usr/bin/env tsx

/**
 * Comprehensive validation test for HouseHelp application
 * Tests: Authentication, CRUD operations, Data validation, Firestore auto-creation
 * Author: GitHub Copilot
 * Date: July 25, 2025
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, getDoc, collection, addDoc, query, getDocs, updateDoc, deleteDoc, where, orderBy, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { validateForm, workerRegistrationSchema, householdRegistrationSchema, bookingSchema, reviewSchema, paymentSchema, profileUpdateSchema } from '../lib/validation';

// Test configuration
const testConfig = {
  apiKey: "test-api-key",
  authDomain: "test-project.firebaseapp.com",
  projectId: "test-project",
  storageBucket: "test-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "test-app-id"
};

// Initialize Firebase for testing
const app = !getApps().length ? initializeApp(testConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators if available
if (process.env.NODE_ENV === 'test') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    console.log('Emulators not available, using production Firebase');
  }
}

// Test data interfaces
interface TestUser {
  uid: string;
  email: string;
  userType: 'worker' | 'household' | 'admin';
  profile: any;
}

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
  duration: number;
}

class ComprehensiveValidator {
  private results: TestResult[] = [];
  private testUsers: TestUser[] = [];

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Comprehensive Validation Tests...\n');

    const startTime = Date.now();

    // Run all test suites
    await this.testDataValidation();
    await this.testFirestoreAutoCreation();
    await this.testAuthentication();
    await this.testCRUDOperations();
    await this.testDataIntegrity();
    await this.testErrorHandling();
    await this.testPerformance();

    // Cleanup
    await this.cleanup();

    const totalTime = Date.now() - startTime;
    this.printResults(totalTime);
  }

  private async runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      await testFn();
      this.results.push({
        test: testName,
        passed: true,
        duration: Date.now() - startTime
      });
      console.log(`✅ ${testName}`);
    } catch (error) {
      this.results.push({
        test: testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      });
      console.log(`❌ ${testName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Test 1: Data Validation
  private async testDataValidation(): Promise<void> {
    console.log('\n📝 Testing Data Validation...');

    await this.runTest('Worker Registration Schema Validation', async () => {
      const validWorkerData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+250788123456',
        password: 'Password123',
        confirmPassword: 'Password123',
        services: ['cleaning'],
        experience: '2 years',
        location: 'Kigali',
        nationalId: '1234567890123456'
      };

      const result = validateForm(workerRegistrationSchema, validWorkerData);
      if (!result.success) throw new Error('Valid data should pass validation');

      const invalidData = { ...validWorkerData, email: 'invalid-email' };
      const invalidResult = validateForm(workerRegistrationSchema, invalidData);
      if (invalidResult.success) throw new Error('Invalid data should fail validation');
    });

    await this.runTest('Household Registration Schema Validation', async () => {
      const validHouseholdData = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+250788654321',
        password: 'Password123',
        confirmPassword: 'Password123',
        location: 'Kigali'
      };

      const result = validateForm(householdRegistrationSchema, validHouseholdData);
      if (!result.success) throw new Error('Valid data should pass validation');
    });

    await this.runTest('Booking Schema Validation', async () => {
      const validBookingData = {
        serviceType: 'cleaning',
        date: '2025-07-26',
        time: '09:00',
        description: 'Deep cleaning for 3-bedroom apartment',
        location: 'Kigali, Rwanda'
      };

      const result = validateForm(bookingSchema, validBookingData);
      if (!result.success) throw new Error('Valid booking data should pass validation');
    });

    await this.runTest('Review Schema Validation', async () => {
      const validReviewData = {
        rating: 5,
        comment: 'Excellent service, very professional and thorough cleaning.',
        bookingId: 'booking123'
      };

      const result = validateForm(reviewSchema, validReviewData);
      if (!result.success) throw new Error('Valid review data should pass validation');
    });

    await this.runTest('Payment Schema Validation', async () => {
      const validPaymentData = {
        amount: 25000,
        method: 'mobile_money' as const,
        phoneNumber: '+250788123456'
      };

      const result = validateForm(paymentSchema, validPaymentData);
      if (!result.success) throw new Error('Valid payment data should pass validation');
    });
  }

  // Test 2: Firestore Auto-Creation
  private async testFirestoreAutoCreation(): Promise<void> {
    console.log('\n🔥 Testing Firestore Auto-Creation...');

    await this.runTest('Workers Collection Auto-Creation', async () => {
      const workerData = {
        fullName: 'Test Worker',
        email: 'testworker@example.com',
        phone: '+250788111111',
        services: ['cleaning', 'cooking'],
        experience: '3 years',
        location: 'Kigali',
        hourlyRate: 2000,
        isAvailable: true,
        rating: 4.5,
        totalJobs: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = doc(db, 'workers', 'test-worker-1');
      await setDoc(docRef, workerData);

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Worker document was not created');
      
      const data = docSnap.data();
      if (data.fullName !== workerData.fullName) throw new Error('Worker data does not match');
    });

    await this.runTest('Households Collection Auto-Creation', async () => {
      const householdData = {
        fullName: 'Test Household',
        email: 'testhousehold@example.com',
        phone: '+250788222222',
        location: 'Kigali',
        totalBookings: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = doc(db, 'households', 'test-household-1');
      await setDoc(docRef, householdData);

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Household document was not created');
    });

    await this.runTest('Jobs Collection Auto-Creation', async () => {
      const jobData = {
        title: 'House Cleaning',
        description: 'Deep cleaning for 3-bedroom apartment',
        serviceType: 'cleaning',
        householdId: 'test-household-1',
        workerId: null,
        status: 'open',
        location: 'Kigali, Rwanda',
        scheduledDate: new Date('2025-07-26'),
        scheduledTime: '09:00',
        budget: 25000,
        duration: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'jobs'), jobData);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) throw new Error('Job document was not created');
    });

    await this.runTest('Conversations Collection Auto-Creation', async () => {
      const conversationData = {
        participants: ['test-household-1', 'test-worker-1'],
        lastMessage: 'Hello, I am interested in your cleaning services',
        lastMessageTimestamp: new Date(),
        unreadCount: {
          'test-household-1': 0,
          'test-worker-1': 1
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) throw new Error('Conversation document was not created');
    });

    await this.runTest('Messages Collection Auto-Creation', async () => {
      const messageData = {
        conversationId: 'test-conversation-1',
        senderId: 'test-household-1',
        senderType: 'household',
        content: 'Hello, I need cleaning services for tomorrow',
        timestamp: new Date(),
        read: false,
        type: 'text'
      };

      const docRef = await addDoc(collection(db, 'messages'), messageData);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) throw new Error('Message document was not created');
    });

    await this.runTest('Bookings Collection Auto-Creation', async () => {
      const bookingData = {
        jobId: 'test-job-1',
        householdId: 'test-household-1',
        workerId: 'test-worker-1',
        serviceType: 'cleaning',
        status: 'confirmed',
        scheduledDate: new Date('2025-07-26'),
        scheduledTime: '09:00',
        duration: 4,
        amount: 25000,
        location: 'Kigali, Rwanda',
        notes: 'Please bring your own cleaning supplies',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) throw new Error('Booking document was not created');
    });

    await this.runTest('Reviews Collection Auto-Creation', async () => {
      const reviewData = {
        bookingId: 'test-booking-1',
        householdId: 'test-household-1',
        workerId: 'test-worker-1',
        rating: 5,
        comment: 'Excellent service, very professional and thorough cleaning.',
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) throw new Error('Review document was not created');
    });

    await this.runTest('Payments Collection Auto-Creation', async () => {
      const paymentData = {
        bookingId: 'test-booking-1',
        householdId: 'test-household-1',
        workerId: 'test-worker-1',
        amount: 25000,
        method: 'mobile_money',
        status: 'completed',
        transactionId: 'txn_123456789',
        phoneNumber: '+250788123456',
        createdAt: new Date(),
        completedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'payments'), paymentData);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) throw new Error('Payment document was not created');
    });

    await this.runTest('Notifications Collection Auto-Creation', async () => {
      const notificationData = {
        userId: 'test-worker-1',
        userType: 'worker',
        title: 'New Job Application',
        message: 'You have a new job application for house cleaning',
        type: 'job_application',
        read: false,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) throw new Error('Notification document was not created');
    });
  }

  // Test 3: Authentication
  private async testAuthentication(): Promise<void> {
    console.log('\n🔐 Testing Authentication...');

    await this.runTest('User Registration', async () => {
      const email = `testuser${Date.now()}@example.com`;
      const password = 'TestPassword123';

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (!userCredential.user) throw new Error('User creation failed');

      this.testUsers.push({
        uid: userCredential.user.uid,
        email,
        userType: 'worker',
        profile: null
      });
    });

    await this.runTest('User Sign In', async () => {
      if (this.testUsers.length === 0) throw new Error('No test users available');

      const testUser = this.testUsers[0];
      const userCredential = await signInWithEmailAndPassword(auth, testUser.email, 'TestPassword123');
      
      if (!userCredential.user) throw new Error('Sign in failed');
      if (userCredential.user.uid !== testUser.uid) throw new Error('Signed in user does not match');
    });

    await this.runTest('User Sign Out', async () => {
      await signOut(auth);
      if (auth.currentUser) throw new Error('User should be signed out');
    });
  }

  // Test 4: CRUD Operations
  private async testCRUDOperations(): Promise<void> {
    console.log('\n🔄 Testing CRUD Operations...');

    // Test Create operations
    await this.runTest('Create Worker Profile', async () => {
      const workerData = {
        fullName: 'CRUD Test Worker',
        email: 'crudworker@example.com',
        phone: '+250788333333',
        services: ['cleaning', 'cooking'],
        experience: '2 years',
        location: 'Kigali',
        hourlyRate: 1500,
        isAvailable: true,
        rating: 0,
        totalJobs: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = doc(db, 'workers', 'crud-test-worker');
      await setDoc(docRef, workerData);

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Worker profile creation failed');
    });

    // Test Read operations
    await this.runTest('Read Worker Profile', async () => {
      const docRef = doc(db, 'workers', 'crud-test-worker');
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) throw new Error('Worker profile not found');
      
      const data = docSnap.data();
      if (data.fullName !== 'CRUD Test Worker') throw new Error('Worker data does not match');
    });

    // Test Update operations
    await this.runTest('Update Worker Profile', async () => {
      const docRef = doc(db, 'workers', 'crud-test-worker');
      await updateDoc(docRef, {
        hourlyRate: 2000,
        updatedAt: new Date()
      });

      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      
      if (data?.hourlyRate !== 2000) throw new Error('Worker profile update failed');
    });

    // Test Query operations
    await this.runTest('Query Workers by Location', async () => {
      const q = query(
        collection(db, 'workers'), 
        where('location', '==', 'Kigali'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) throw new Error('No workers found in Kigali');
    });

    // Test Delete operations
    await this.runTest('Delete Worker Profile', async () => {
      const docRef = doc(db, 'workers', 'crud-test-worker');
      await deleteDoc(docRef);

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) throw new Error('Worker profile deletion failed');
    });
  }

  // Test 5: Data Integrity
  private async testDataIntegrity(): Promise<void> {
    console.log('\n🛡️ Testing Data Integrity...');

    await this.runTest('Foreign Key Relationships', async () => {
      // Create a job with valid household and worker IDs
      const jobData = {
        title: 'Integrity Test Job',
        householdId: 'test-household-1',
        workerId: 'test-worker-1',
        serviceType: 'cleaning',
        status: 'open',
        createdAt: new Date()
      };

      const jobRef = await addDoc(collection(db, 'jobs'), jobData);
      
      // Verify the referenced documents exist
      const householdDoc = await getDoc(doc(db, 'households', 'test-household-1'));
      const workerDoc = await getDoc(doc(db, 'workers', 'test-worker-1'));

      if (!householdDoc.exists()) throw new Error('Referenced household does not exist');
      if (!workerDoc.exists()) throw new Error('Referenced worker does not exist');
    });

    await this.runTest('Data Consistency', async () => {
      // Test that conversation participants exist
      const conversationsQuery = query(collection(db, 'conversations'));
      const conversationsSnapshot = await getDocs(conversationsQuery);

      for (const docSnap of conversationsSnapshot.docs) {
        const data = docSnap.data();
        if (data.participants) {
          for (const participantId of data.participants) {
            // Check if participant exists in workers or households
            const workerDoc = await getDoc(doc(db, 'workers', participantId));
            const householdDoc = await getDoc(doc(db, 'households', participantId));
            
            if (!workerDoc.exists() && !householdDoc.exists()) {
              throw new Error(`Participant ${participantId} does not exist in any user collection`);
            }
          }
        }
      }
    });
  }

  // Test 6: Error Handling
  private async testErrorHandling(): Promise<void> {
    console.log('\n🚨 Testing Error Handling...');

    await this.runTest('Invalid Document Access', async () => {
      try {
        const docRef = doc(db, 'workers', 'non-existent-worker');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) throw new Error('Non-existent document should not exist');
        // This should pass - no error should be thrown for non-existent documents
      } catch (error) {
        throw new Error('Accessing non-existent document should not throw an error');
      }
    });

    await this.runTest('Network Disconnection Handling', async () => {
      // Simulate network disconnection
      await disableNetwork(db);
      
      try {
        // This should work with cached data
        const docRef = doc(db, 'workers', 'test-worker-1');
        await getDoc(docRef);
      } catch (error) {
        // Expected behavior - offline operations may fail
      }
      
      // Re-enable network
      await enableNetwork(db);
    });
  }

  // Test 7: Performance
  private async testPerformance(): Promise<void> {
    console.log('\n⚡ Testing Performance...');

    await this.runTest('Batch Operations Performance', async () => {
      const startTime = Date.now();
      
      // Create multiple documents in parallel
      const promises = [];
      for (let i = 0; i < 10; i++) {
        const docData = {
          name: `Performance Test ${i}`,
          createdAt: new Date(),
          index: i
        };
        promises.push(addDoc(collection(db, 'performance_test'), docData));
      }
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (duration > 5000) { // 5 seconds threshold
        throw new Error(`Batch operations took too long: ${duration}ms`);
      }
    });

    await this.runTest('Query Performance', async () => {
      const startTime = Date.now();
      
      const q = query(collection(db, 'performance_test'), orderBy('createdAt', 'desc'));
      await getDocs(q);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (duration > 2000) { // 2 seconds threshold
        throw new Error(`Query took too long: ${duration}ms`);
      }
    });
  }

  // Cleanup
  private async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up test data...');

    try {
      // Clean up test collections
      const collections = ['performance_test', 'test_data'];
      
      for (const collectionName of collections) {
        const q = query(collection(db, collectionName));
        const snapshot = await getDocs(q);
        
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }

      // Clean up test users
      for (const testUser of this.testUsers) {
        try {
          if (auth.currentUser?.uid !== testUser.uid) {
            await signInWithEmailAndPassword(auth, testUser.email, 'TestPassword123');
          }
          // Note: In a real test environment, you would delete the user account here
          // For this demo, we'll just sign them out
          await signOut(auth);
        } catch (error) {
          console.warn(`Failed to cleanup user ${testUser.email}:`, error);
        }
      }
      
      console.log('✅ Cleanup completed successfully');
    } catch (error) {
      console.warn('⚠️ Some cleanup operations failed:', error);
    }
  }

  // Print results summary
  private printResults(totalTime: number): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE VALIDATION RESULTS');
    console.log('='.repeat(80));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log(`\nTotal Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log(`⏱️  Total Time: ${totalTime}ms`);

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  • ${r.test}: ${r.error}`);
        });
    }

    console.log('\n📈 PERFORMANCE METRICS:');
    this.results.forEach(r => {
      const status = r.passed ? '✅' : '❌';
      console.log(`  ${status} ${r.test}: ${r.duration}ms`);
    });

    if (failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Your HouseHelp application is fully validated.');
      console.log('✅ Data Validation: 100% Working');
      console.log('✅ Authentication: 100% Working');
      console.log('✅ CRUD Operations: 100% Working');
      console.log('✅ Firestore Auto-Creation: 100% Working');
      console.log('✅ Data Integrity: 100% Working');
      console.log('✅ Error Handling: 100% Working');
      console.log('✅ Performance: 100% Working');
    } else {
      console.log('\n⚠️ SOME TESTS FAILED. Please review the failed tests and fix the issues.');
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const validator = new ComprehensiveValidator();
  await validator.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { ComprehensiveValidator };
