"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '../lib/auth';
import Navbar from '../components/Navbar';
import { getPocketBase } from '../lib/pocketbase';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const pb = getPocketBase();

    const [groups, setGroups] = useState(null);

    const handleClick = (groupName) => {
        router.push(`/groups/${groupName}`);
    };


    useEffect(() => {

        // Check authentication status
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        } else {
            setUser(getCurrentUser());
            setLoading(false);
        }

    }, []);

    useEffect(() => {
        if (!user) return;

        console.log("User has been grabbed")

        const fetchData = async () => {
            const res = await fetch(`/api/proxy/api/groups/`, {
                method: 'GET',
                headers: {
                    "User-id": user.id
                }
            });

            const msg = await res.json();

            if (res.ok) {
                setGroups(msg);
            } else {
                throw new Error(msg.error || 'Failed to fetch');
            }
        };

        fetchData()

    }, [user])

    if (loading) {
        return (
            <main>
                {/* <Navbar /> */}
                <div className="container mx-auto px-4 py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </main>
        );
    }

    return (
        <main>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
                <div className="bg-white shadow-md rounded-lg p-6 text-black">
                    <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name || user?.email}!</h2>
                    <p className="mb-2">Your account details:</p>
                    <ul className="list-disc pl-6">
                        <li>Email: {user?.email}</li>
                        <li>User ID: {user?.id}</li>
                        <li>Created: {new Date(user?.created).toLocaleString()}</li>
                    </ul>
                </div>
                <div className="bg-white shadow-md rounded-lg p-6 text-black mt-5">
                    <h2 className="text-xl font-bold mb-2">Groups</h2>
                    {groups?.map((group) => (
                        <button
                            key={group}
                            onClick={() => handleClick(group)}
                            className="block p-2 m-2 bg-blue-500 text-white rounded"
                        >
                            {group}
                        </button>
                    ))}
                </div>
            </div>
        </main >
    );
}