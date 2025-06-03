"use client";

import { use } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '../../lib/auth';
import ExpensesTableDisplay from "../../components/ExpensesTable";
import BalancesTableDisplay from '@/app/components/BalancesTable';
import Navbar from '@/app/components/Navbar';

interface User {
    name: string,
    id: number,
}

export default function GroupPage({ params }: { params: Promise<{ name: string }> }) {
    const groupName = decodeURIComponent(use(params).name)
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState(null);
    const [balances, setBalances] = useState(null);

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

        const fetchExpenses = async () => {
            const res = await fetch(`/api/proxy/api/expenses?groupName=${groupName}`);

            const msg = await res.json();

            if (res.ok) {
                setExpenses(msg)
            } else {
                throw new Error(msg.error || 'Failed to fetch expenses.');
            }
        };

        const fetchBalances = async () => {
            const res = await fetch(`/api/proxy/api/balances?groupName=${groupName}&userID=${user.id}`);
            const msg = await res.json();
            if (res.ok) {
                setBalances(msg)
            } else {
                throw new Error(msg.error || 'Failed to fetch balances.');
            }
        }

        fetchExpenses()
        fetchBalances()

    }, [user])

    // with the user and the group name that should be enough to find all the expenses via a query

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-center">{groupName}</h1>
                <div className="bg-white shadow-md rounded-lg p-6 text-black ml-20 mr-20">
                    {balances ? <BalancesTableDisplay balances={balances} groupName={groupName} /> : <p>No balances in this group</p>}
                </div>
                <div className="bg-white shadow-md rounded-lg p-6 text-black mt-5 ml-20 mr-20">
                    {expenses ? <ExpensesTableDisplay expenses={expenses} groupName={groupName} /> : <p>No expenses in this group</p>}
                </div>
            </div>
        </div>
    );
}