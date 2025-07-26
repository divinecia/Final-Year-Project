import { db, auth } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

async function testFirebaseConnection() {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test Firestore connection
    const testDoc = await getDoc(doc(db, 'test', 'connection'));
    console.log('✅ Firestore connection successful');
    
    // Test Auth connection
    const currentUser = auth.currentUser;
    console.log('✅ Firebase Auth connection successful');
    console.log('🔐 Current user:', currentUser ? currentUser.email : 'No user signed in');
    
    console.log('🎉 Firebase is properly configured and connected!');
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ Firebase connection failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
testFirebaseConnection()
  .then((result) => {
    if (result.success) {
      console.log('✅ Firebase test completed successfully');
    } else {
      console.error('❌ Firebase test failed:', result.error);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
