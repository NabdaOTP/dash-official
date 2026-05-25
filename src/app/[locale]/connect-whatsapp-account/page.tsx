"use client";

import { useEffect, useMemo } from "react";

function firstText(...values: Array<string | null>): string | undefined {
    for (const value of values) {
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed) return trimmed;
        }
    }
    return undefined;
}

export default function ConnectWhatsappAccountPage() {
    const search = useMemo(() => {
        if (typeof window === "undefined") return new URLSearchParams();
        return new URLSearchParams(window.location.search);
    }, []);

    useEffect(() => {
        const payload = {
            requiresCompletion: true,
            code: firstText(search.get("code")),
            state: firstText(search.get("state")),
            wabaId: firstText(search.get("wabaId"), search.get("waba_id")),
            phoneNumberId: firstText(
                search.get("phoneNumberId"),
                search.get("phone_number_id")
            ),
        };

        if (window.opener) {
            try {
                window.opener.postMessage(
                    {
                        type: "NABDA_WABA_CALLBACK",
                        payload,
                    },
                    "*"
                );
            } catch {
                // no-op
            }

            window.setTimeout(() => {
                try {
                    window.close();
                } catch {
                    // no-op
                }
            }, 150);
        }
    }, [search]);

    return (
        <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
            <h1 style={{ fontSize: 18, marginBottom: 8 }}>
                Finishing WhatsApp connection...
            </h1>
            <p style={{ margin: 0, color: "#4b5563", fontSize: 14 }}>
                You can close this window if it does not close automatically.
            </p>
        </main>
    );
}
