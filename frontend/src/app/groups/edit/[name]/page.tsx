"use client";
import React from "react"
import Navbar from "../../../components/Navbar";
import GroupAdminDisplay from "../../../components/GroupAdmin";

export default function EditGroupPage() {
    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl text-red font-bold mb-6 text-center">Create group</h1>
            </div>
            <GroupAdminDisplay groupName="" groupMembers={[]} />
        </div>
    )
}