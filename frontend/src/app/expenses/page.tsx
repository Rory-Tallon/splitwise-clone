// creating an expense page 
"use client";

import { useEffect, useState } from 'react';

export default function CreateExepensePage() {
    const [form, setForm] = useState({
        name: "",
        amount: 0,
        payer: [],
        payee: [],
    }) // store all of our form data here

    const [users, setUsers] = useState(["george", "paul"])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePayeesChange = (e) => {
        const selected = Array.from(e.target.selectedOptions, (option) => option.value);
        setForm((prev) => ({ ...prev, payees: selected }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form); // You can call a backend endpoint or mutate state here
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl text-red font-bold mb-6 text-center">Create expense</h1>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 text-red bg-white rounded shadow space-y-4">
                <h2 className="text-xl font-bold text-center">Add Expense</h2>

                <input
                    type="text"
                    name="name"
                    placeholder="Expense Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded"
                    required
                />

                <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded"
                    required
                />

                <select
                    name="payer"
                    value={form.payer}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded"
                    required
                >
                    <option value="">Select Payer</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name}
                        </option>
                    ))}
                </select>

                <select
                    name="payees"
                    multiple
                    value={form.payees}
                    onChange={handlePayeesChange}
                    className="w-full px-4 py-2 border rounded h-32"
                >
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
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