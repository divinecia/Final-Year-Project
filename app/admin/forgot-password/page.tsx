import React, { useState } from 'react';

export default function AdminForgotPasswordPage() {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [method]: value }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Password reset instructions sent.');
      } else {
        setError(data.error || 'Failed to send reset instructions.');
      }
    } catch {
      setError('Failed to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Admin Forgot Password</h1>
      <div className="flex mb-4 space-x-2">
        <button
          type="button"
          className={`flex-1 py-2 rounded ${method === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => { setMethod('email'); setValue(''); }}
        >
          Email
        </button>
        <button
          type="button"
          className={`flex-1 py-2 rounded ${method === 'phone' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => { setMethod('phone'); setValue(''); }}
        >
          Phone
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type={method === 'email' ? 'email' : 'tel'}
          className="w-full border p-2 rounded"
          placeholder={method === 'email' ? 'Enter your admin email' : 'Enter your admin phone'}
          value={value}
          onChange={e => setValue(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Instructions'}
        </button>
      </form>
      {message && <p className="text-green-600 mt-4">{message}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
