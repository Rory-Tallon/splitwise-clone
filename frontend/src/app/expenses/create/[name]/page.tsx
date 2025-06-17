// creating an expense page 
"use client";

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '../../../lib/auth';

interface User {
    name: string,
    id: number,
}

export default function CreateExpensePage({ params }: { params: Promise<{ name: string }> }) {
    const groupName = decodeURIComponent(use(params).name)
    const router = useRouter()
    const [user, setUser] = useState(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check authentication status
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        } else {
            setUser(getCurrentUser());
        }

    }, []);

    const [form, setForm] = useState({
        name: "",
        amount: 0,
        payer: [],
        payee: [],
        groupName: "",
    }) // store all of our form data here

    const [users, setUsers] = useState<User[] | null>(null)

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch(`/api/proxy/api/users?groupName=${groupName}`);
            const msg = await res.json();
            if (res.ok) {
                let userDetails: any = msg[0].expand?.users_in_group
                // userNames: User[] = userDetails.map(user => {user.name)
                setUsers(userDetails)
            } else {
                throw new Error(msg.error || 'Failed to fetch users.');
            }
        };
        fetchUsers()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        const selected = Array.from(e.target.selectedOptions, (option) => option.value);
        setForm((prev) => ({ ...prev, [name]: selected }));
    };

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formToSend = {
            ...form,
            groupName: groupName
        }

        if (!formToSend.payer || !formToSend.name || !formToSend.payee || !formToSend.amount || formToSend.groupName === "") {
            return;
        }
        (formToSend)

        try {

            const response = await fetch("/api/proxy/api/add_expense", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formToSend),
            });

            if (!response.ok) {
                const error = await response.json();
                setError("Error submitting form. Please try again.");
            }


            // redirect back to group page
            router.push(`/../../groups/${groupName}`);
        } catch (err) {
            setError("Error submitting form. Please try again.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl text-red font-bold mb-6 text-center">Create expense for {groupName}</h1>
            {error ? <h2>{error}</h2> : ""}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 text-red bg-white rounded space-y-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Expense Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded text-black"
                    required
                />

                <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded text-black"
                    required
                />

                <select
                    name="payer"
                    value={form.payer}
                    onChange={handlePayChange}
                    className="w-full px-4 py-2 border rounded text-black"
                    required
                >
                    <option value="">Select Payer</option>
                    {users?.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name}
                        </option>
                    ))}
                </select>

                <select
                    name="payee"
                    multiple
                    value={form.payee}
                    onChange={handlePayChange}
                    className="w-full px-4 py-2 border rounded h-32 text-black"
                >
                    {users?.map((user) => (
                        <option key={user?.id} value={user?.id}>
                            {user.name}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    Add Expense
                </button>
            </form>
        </div>
    )
}