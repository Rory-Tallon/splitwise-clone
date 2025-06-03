
import React from "react";
import { useRouter } from 'next/navigation';


interface Balance {
    id: string;
    amount: number;
    payer: string;
    payee: string;
    created: string;
    expand: any;
}

interface BalanceTableDisplayProps {
    balances: Balance[]
    groupName: string
}

export default function BalancesTableDisplay({ balances, groupName }: BalanceTableDisplayProps) {

    const router = useRouter()

    return (
        <div>
            {balances.map((exp) => (
                <h3 key={exp.id} className="hover:bg-yellow-100 cursor-pointer transition-colors">
                    You {exp.amount > 0 ? "owe" : "are owed"} {Math.abs(exp.amount)} {exp.amount > 0 ? "to" : "from"} {exp.expand.payee.name}
                </h3>
            ))}
        </div>
    )
}