'use client';

import { useState } from 'react';
import { signUpWithEmailAndPassword, signInWithEmailAndPassword } from '@/lib/client-auth';
import { auth } from '@/lib/firebase';

export default function FirebaseTestPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword123');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSignup = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('🔥 Testing Firebase signup with client-auth...');
      console.log('Auth instance:', auth);
      console.log('Email:', email);
      
      const authResult = await signUpWithEmailAndPassword(email, password);
      console.log('✅ Signup result:', authResult);
      
      if (authResult.success) {
        setResult(`✅ SUCCESS: User created with UID: ${authResult.uid}`);
      } else {
        setResult(`❌ ERROR: ${authResult.error}`);
      }
    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      setResult(`❌ UNEXPECTED ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignin = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('🔥 Testing Firebase signin with client-auth...');
      
      const authResult = await signInWithEmailAndPassword(email, password);
      console.log('✅ Signin result:', authResult);
      
      if (authResult.success) {
        setResult(`✅ SUCCESS: Signed in with UID: ${authResult.uid}`);
      } else {
        setResult(`❌ ERROR: ${authResult.error}`);
      }
    } catch (error: any) {
      console.error('❌ Signin failed:', error);
      setResult(`❌ UNEXPECTED ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkFirebaseConfig = () => {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    console.log('🔧 Firebase Config:', config);
    console.log('🔧 Auth instance:', auth);
    
    const configStatus = Object.entries(config).map(([key, value]) => 
      `${key}: ${value ? '✅ SET' : '❌ NOT SET'}`
    ).join('\n');
    
    setResult(`🔧 FIREBASE CONFIG:\n${configStatus}\n\nAuth app: ${auth.app.name}\nAuth project: ${auth.app.options.projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🧪 Firebase SDK Direct Test
          </h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="test@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="At least 6 characters"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={checkFirebaseConfig}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                disabled={loading}
              >
                🔧 Check Config
              </button>
              
              <button
                onClick={testSignup}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? '⏳ Testing...' : '📝 Test Signup'}
              </button>
              
              <button
                onClick={testSignin}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? '⏳ Testing...' : '🔑 Test Signin'}
              </button>
            </div>

            {result && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Result:</h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {result}
                </pre>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📋 Testing Instructions:
              </h3>
              <ol className="list-decimal list-inside text-blue-800 space-y-1">
                <li>First click "Check Config" to verify Firebase setup</li>
                <li>Then click "Test Signup" to test user registration</li>
                <li>If signup works, try "Test Signin" with same credentials</li>
                <li>Check browser console for detailed logs</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
