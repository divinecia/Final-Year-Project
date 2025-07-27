import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

async function readAdmin() {
  try {
    const adminId = 'hrFI4hXDPZeTEVfxXs58';
    const adminDoc = await getDoc(doc(db, 'admins', adminId));
    if (adminDoc.exists()) {
      console.log('Admin user data:', adminDoc.data());
    } else {
      console.log('No such document!');
    }
  } catch (error) {
    console.error('Error reading admin user:', error);
  }
}

readAdmin();
