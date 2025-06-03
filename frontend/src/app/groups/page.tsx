"use client";
import Navbar from "../components/Navbar";
import { useEffect, useState } from 'react';

interface User {
    name: string,
    id: number,
}

export default function CreateGroupPage() {

    const [users, setUsers] = useState<User[] | null>(null)

    const [form, setForm] = useState({
        name: "",
        amount: 0,
        payer: [],
        payee: [],
        groupName: "",
    }) // store all of our form data here

    const handleChange = () => {
        console.log("Handling change")
    }

    const handleSubmit = () => {
        console.log("Handle Submit")
    }

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl text-red font-bold mb-6 text-center">Create group</h1>
            </div>
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
                    name="payee"
                    multiple
                    value={form.payee}
                    onChange={handleChange}
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