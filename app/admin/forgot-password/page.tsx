import React, { useState } from 'react';

export default function AdminForgotPasswordPage() {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Basic validation for email and phone
  const validateInput = () => {
    if (method === 'email') {
      // Simple email regex
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    } else {
      // Simple phone regex (10-15 digits)
      return /^\d{10,15}$/.test(value.replace(/\D/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateInput()) {
      setError(method === 'email' ? 'Please enter a valid email address.' : 'Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [method]: value }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Password reset instructions sent.');
        setValue('');
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
      <h1 className="text-2xl font-bold mb-4 text-center">Admin Forgot Password</h1>
      <div className="flex mb-4 space-x-2">
        <button
          type="button"
          className={`flex-1 py-2 rounded transition-colors duration-150 ${method === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => { setMethod('email'); setValue(''); setError(''); setMessage(''); }}
          aria-pressed={method === 'email'}
        >
          Email
        </button>
        <button
          type="button"
          className={`flex-1 py-2 rounded transition-colors duration-150 ${method === 'phone' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => { setMethod('phone'); setValue(''); setError(''); setMessage(''); }}
          aria-pressed={method === 'phone'}
        >
          Phone
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <label className="block">
          <span className="block mb-1 font-medium">
            {method === 'email' ? 'Admin Email' : 'Admin Phone'}
          </span>
          <input
            type={method === 'email' ? 'email' : 'tel'}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder={method === 'email' ? 'Enter your admin email' : 'Enter your admin phone'}
            value={value}
            onChange={e => setValue(e.target.value)}
            required
            autoFocus
            inputMode={method === 'email' ? 'email' : 'tel'}
            pattern={method === 'email' ? undefined : '\\d{10,15}'}
            disabled={loading}
          />
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50 transition-colors duration-150"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Instructions'}
        </button>
      </form>
      {message && <p className="text-green-600 mt-4 text-center">{message}</p>}
      {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
    </div>
  );
}
