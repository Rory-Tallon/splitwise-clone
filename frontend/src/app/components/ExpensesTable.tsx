
import React from "react";
import { useRouter } from 'next/navigation';



interface Expense {
    id: string;
    amount: number;
    payer: string;
    payee: string;
    created: string;
    expand: any;
}

interface ExpensesTableDisplayProps {
    expenses: Expense[]
    groupName: string
}

export default function ExpensesTableDisplay({ expenses, groupName }: ExpensesTableDisplayProps) {

    const router = useRouter()

    const handleRowClick = (id: string) => {
        router.push(`../expenses/${id}`)
    }

    const handleCreateExpense = () => {
        router.push(`../expenses/create/${groupName}`)
    }

    return (
        <div>
            <table className="min-w-full bg-white border rounded shadow">
                <thead className="bg-gray-100 border-b">
                    <tr>
                        <th className="text-left px-4 py-2">Amount</th>
                        <th className="text-left px-4 py-2">Payer</th>
                        <th className="text-left px-4 py-2">Payee</th>
                        <th className="text-left px-4 py-2">Date</th>
                        {/* Add more headers as needed */}
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((exp) => (
                        <tr key={exp.id} className="border-b hover:bg-yellow-100 cursor-pointer transition-colors" onClick={() => handleRowClick(exp.id)}>
                            <td className="px-4 py-2">${exp.amount}</td>
                            <td className="px-4 py-2">{exp.expand.payer[0].name}</td>
                            <td className="px-4 py-2">{exp.expand.payee[0].name}</td>
                            <td className="px-4 py-2">{new Date(exp.created).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-center">
                <button onClick={handleCreateExpense} className="m-6 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded">
                    Create expense
                </button>
            </div>

        </div>
    )
}