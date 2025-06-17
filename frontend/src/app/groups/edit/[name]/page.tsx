"use client";
import React from "react"
import Navbar from "../../../components/Navbar";
import GroupAdminDisplay from "../../../components/GroupAdmin";
import { use } from 'react';
import { useEffect, useState } from 'react';

interface User {
    name: string,
    id: string,
}

export default function EditGroupPage({ params }: { params: Promise<{ name: string }> }) {
    const groupName = decodeURIComponent(use(params).name)
    const [users, setUsers] = useState<User[]>([])
    const [groupId, setGroupId] = useState("")

    // grab members based on group name
    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch(`/api/proxy/api/users?groupName=${groupName}`);
            const msg = await res.json();
            if (res.ok) {
                let userDetails: any = msg[0].expand?.users_in_group

                // need to grab just the names 
                //let userNames: string[] = userDetails.map((user: User) => user.name)

                setUsers(userDetails)
            } else {
                throw new Error(msg.error || 'Failed to fetch users.');
            }
        };

        const fetchGroupId = async () => {
            const res = await fetch(`/api/proxy/api/groups_by_id?groupName=${groupName}`);
            const msg = await res.json();
            if (res.ok) {
                let groupId: any = msg

                setGroupId(groupId)
            } else {
                throw new Error(msg.error || 'Failed to fetch groupID.');
            }
        };

        fetchGroupId()
        fetchUsers()
    }, [])


    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl text-red font-bold mb-6 text-center">Edit group</h1>
            </div>
            <GroupAdminDisplay groupName={groupName} groupMembers={users} groupId={groupId} />
        </div>
    )
}