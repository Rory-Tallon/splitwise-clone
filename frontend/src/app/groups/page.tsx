"use client";
import Navbar from "../components/Navbar";
import GroupAdminDisplay from "../components/GroupAdmin";
import { use } from 'react';

export default function CreateGroupPage() {
    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl text-red font-bold mb-6 text-center">Create group</h1>
            </div>
            <GroupAdminDisplay groupName="" groupMembers={[]} groupId=""/>
        </div>
    )
}