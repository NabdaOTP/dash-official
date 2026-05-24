"use client";

import { useState } from "react";
import { MembersList } from "@/features/team/components/members-list";
import { InvitationsList } from "@/features/team/components/invitations-list";

export default function TeamPage() {
    // Used to force-refresh the invitations list when a new invite is sent
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">Team Members</h1>
                <p className="text-sm text-muted-foreground">
                    Manage who has access to this project
                </p>
            </div>

            <MembersList onMembersChange={() => setRefreshKey((k) => k + 1)} />

            <InvitationsList key={refreshKey} />
        </div>
    );
}