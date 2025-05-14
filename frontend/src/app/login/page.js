"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import LoginForm from '../components/LoginForm';

export default function Login() {
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Show message if redirected after registration
    if (searchParams.get('registered') === 'true') {
      setMessage('Account created successfully! Please log in.');
    }
  }, [searchParams]);
  
  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {message && (
          <div className="max-w-md mx-auto mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}
        <LoginForm />
      </div>
    </main>
  );
}