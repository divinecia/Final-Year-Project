'use client';

import { useEffect, useState } from 'react';

export default function DebugEnvPage() {
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    // Only check client-side environment variables (NEXT_PUBLIC_*)
    const clientEnvVars = {
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    
    setEnvVars(clientEnvVars);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔍 Environment Variables Debug
          </h1>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                Firebase Configuration
              </h2>
              
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm text-gray-700">{key}:</span>
                    <span className={`font-mono text-sm px-2 py-1 rounded ${
                      value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {value ? `${String(value).substring(0, 20)}...` : 'NOT SET'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                ⚠️ Important Notes:
              </h3>
              <ul className="list-disc list-inside text-yellow-800 space-y-1">
                <li>Only NEXT_PUBLIC_* variables are visible on the client-side</li>
                <li>Server-side variables won't show here for security</li>
                <li>Restart your dev server after changing .env files</li>
                <li>Vercel deployment uses environment variables from dashboard</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🔧 Debug Steps:
              </h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-1">
                <li>Check if all Firebase variables show values above</li>
                <li>If "NOT SET", verify your .env file has NEXT_PUBLIC_ prefix</li>
                <li>Restart your development server completely</li>
                <li>For production, check Vercel environment variables</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
