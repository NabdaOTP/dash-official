import { Suspense } from "react";
import { AcceptInvitationPage } from "@/features/invitations/components/accept-invitation-page";

export default function AcceptInvitationRoute() {
    return (
        <Suspense>
            <AcceptInvitationPage />
        </Suspense>
    );
}