import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface GroupAdminDisplayProps {
    groupName: string;
    groupMembers: User[];
    groupId: string
}

interface User {
    name: string,
    id: string,
}

interface FormState {
    groupName: string,
    groupMembers: string[]
}

export default function GroupAdminDisplay({ groupName, groupMembers, groupId }: GroupAdminDisplayProps) {

    const [users, setUsers] = useState<User[]>([])
    const router = useRouter()

    const [form, setForm] = useState<FormState>({
        groupMembers: [],
        groupName: groupName,
    }) // store all of our form data here

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch(`/api/proxy/api/users`);
            const msg = await res.json();
            if (res.ok) {
                let userDetails: any = msg
                setUsers(userDetails)
            } else {
                throw new Error(msg.error || 'Failed to fetch users.');
            }
        };
        fetchUsers()
    }, [])

    useEffect(() => {
        if (users.length > 0 && groupMembers.length > 0) {
            setForm((prev) => ({
                ...prev,
                groupMembers: groupMembers.map(u => u.id)
            }))
        }
    }, [users])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        const selected = Array.from(e.target.selectedOptions, (option) => option.value);
        setForm((prev) => ({ ...prev, [name]: selected }));
    };

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!form.groupMembers || !form.groupName) {
            return;
        }

        const formToSend = {
            ...form,
            groupId: groupId
        }

        const response = await fetch("/api/proxy/api/edit_group", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formToSend),
        });

        if (!response.ok) {
            const error = await response.json();
        }

        // redirect back to group page
        router.push(`/../dashboard`);
    }

    return (
        <div>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 text-red bg-white rounded space-y-4">
                <input
                    type="text"
                    name="groupName"
                    placeholder="Group Name"
                    value={form.groupName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded text-black"
                    required
                />
                <select
                    name="groupMembers"
                    multiple
                    value={form.groupMembers}
                    onChange={handleGroupChange}
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
                    {groupName == "" ? "Create Group" : "Edit Group"}
                </button>
            </form>
        </div>
    )
}