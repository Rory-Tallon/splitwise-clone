"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAuthenticated, logOut, getCurrentUser } from '../lib/auth';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [user, setUser] = useState(getCurrentUser);
    const router = useRouter();


    const handleLogout = () => {
        logOut();
        setUser(null);
        router.push('/');
    };

    return (
        <nav className="bg-[#1CC29F] text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">
                    Splitwise 2
                </h1>
                <div className="space-x-4">
                    {user ? (
                        <>
                            <Link href="/dashboard" className="hover:text-gray-300">
                                Dashboard
                            </Link>
                            <button onClick={handleLogout} className="hover:text-gray-300">
                                Logout
                            </button>
                            <span className="ml-4">Welcome, {user.name}</span>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="hover:text-gray-300">
                                Login
                            </Link>
                            <Link href="/signup" className="hover:text-gray-300">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}